from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta
import uuid
from app.core.database import get_db
from app.core.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    authenticate_user,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.models.user import User
from app.models.workout import Workout, WorkoutSession
from app.models.daily_tracker import DailyLog
from app.models.challenge import UserChallenge
from app.models.map_route import MapRoute

router = APIRouter(prefix="/auth", tags=["auth"])


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    username = data.username or data.email.split("@")[0]
    if db.query(User).filter(User.username == username).first():
        username = f"{username}_{str(uuid.uuid4())[:4]}"
    
    user = User(
        id=str(uuid.uuid4())[:8],
        email=data.email,
        username=username,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name or username
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name
        }
    }


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    if not user:
        # Fallback create user if demo login attempt
        if data.email == "demo@fitstream.app":
            user = db.query(User).filter(User.id == "1").first()
            if not user:
                user = User(
                    id="1",
                    email="demo@fitstream.app",
                    username="demo",
                    hashed_password=get_password_hash("demo1234"),
                    full_name="FitStream Athlete"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name
        }
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }


@router.delete("/account")
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = str(current_user.id)
    
    # Delete associated records
    db.query(Workout).filter(Workout.user_id == user_id).delete()
    db.query(DailyLog).filter(DailyLog.user_id == user_id).delete()
    db.query(UserChallenge).filter(UserChallenge.user_id == user_id).delete()
    db.query(MapRoute).filter(MapRoute.user_id == user_id).delete()
    
    # Delete user
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    
    return {"message": "Account and associated data deleted permanently."}
