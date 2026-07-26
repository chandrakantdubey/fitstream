from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.daily_tracker import DailyLog
from app.models.challenge import UserChallenge
from app.models.workout import Workout, WorkoutSession
from app.models.map_route import MapRoute

router = APIRouter(prefix="/reset", tags=["Data Reset"])

class ResetChallengeReq(BaseModel):
    user_id: str = "1"
    challenge_id: str

@router.post("/today")
def reset_today_data(user_id: str = "1", db: Session = Depends(get_db)):
    today = date.today()
    log = db.query(DailyLog).filter(DailyLog.user_id == str(user_id), DailyLog.log_date == today).first()
    if log:
        log.water_ml = 0
        log.active_minutes = 0
        log.calories_burned = 0
        log.weight_kg = None
        log.waist_cm = None
        log.notes = ""
        db.commit()
    return {"message": "Today's tracking metrics reset successfully."}

@router.post("/challenge")
def reset_challenge_progress(req: ResetChallengeReq, db: Session = Depends(get_db)):
    ch = db.query(UserChallenge).filter(
        UserChallenge.user_id == str(req.user_id),
        UserChallenge.challenge_id == req.challenge_id
    ).first()
    if ch:
        ch.current_day = 1
        ch.completed_days = "[]"
        ch.is_completed = False
        db.commit()
        return {"message": f"Challenge '{ch.title}' reset to Day 1."}
    return {"message": "No active challenge found to reset."}

@router.post("/custom-workouts")
def clear_custom_workouts(user_id: str = "1", db: Session = Depends(get_db)):
    deleted_count = db.query(Workout).filter(Workout.user_id == str(user_id)).delete()
    db.commit()
    return {"message": f"Cleared {deleted_count} custom workout routines."}
