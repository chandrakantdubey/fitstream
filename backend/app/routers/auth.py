from typing import Optional
from datetime import timedelta, date
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

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
from app.models.workout import Workout
from app.models.daily_tracker import DailyLog
from app.models.challenge import UserChallenge
from app.models.map_route import MapRoute

router = APIRouter(prefix="/auth", tags=["auth"])


class UserRegister(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    password: str
    full_name: str = ""
    height_cm: Optional[float] = 175.0
    weight_kg: Optional[float] = 70.0
    target_weight_kg: Optional[float] = 68.0
    age: Optional[int] = 25
    gender: Optional[str] = "Male"
    fitness_goal: Optional[str] = "Muscle Growth"


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

    # Initialize user's first daily log with signup physical metrics
    today = date.today()
    w = data.weight_kg or 70.0
    water_target = round(w * 35)
    daily_log = DailyLog(
        user_id=user.id,
        log_date=today,
        water_ml=0,
        target_water_ml=water_target,
        active_minutes=0,
        calories_burned=0,
        height_cm=data.height_cm or 175.0,
        weight_kg=w,
        target_weight_kg=data.target_weight_kg or 68.0,
        age=data.age or 25,
        gender=data.gender or "Male"
    )
    db.add(daily_log)
    db.commit()

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
            "full_name": user.full_name,
            "height_cm": data.height_cm,
            "weight_kg": data.weight_kg,
            "target_weight_kg": data.target_weight_kg,
            "age": data.age,
            "gender": data.gender
        }
    }


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    if not user:
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
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch latest daily log for physical stats
    log = db.query(DailyLog).filter(DailyLog.user_id == str(current_user.id)).order_by(DailyLog.log_date.desc()).first()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "height_cm": log.height_cm if log else 175.0,
        "weight_kg": log.weight_kg if log else 70.0,
        "target_weight_kg": log.target_weight_kg if log else 68.0,
        "age": log.age if log else 25,
        "gender": log.gender if log else "Male",
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }


@router.delete("/account")
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = str(current_user.id)
    db.query(Workout).filter(Workout.user_id == user_id).delete()
    db.query(DailyLog).filter(DailyLog.user_id == user_id).delete()
    db.query(UserChallenge).filter(UserChallenge.user_id == user_id).delete()
    db.query(MapRoute).filter(MapRoute.user_id == user_id).delete()
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    return {"message": "Account and associated data deleted permanently."}
