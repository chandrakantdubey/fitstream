import json
from datetime import date, datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.daily_tracker import DailyLog
from app.models.workout import WorkoutSession

router = APIRouter(prefix="/daily", tags=["Daily Tracker"])

class WaterUpdateReq(BaseModel):
    user_id: str = "1"
    amount_ml: int
    set_exact: bool = False

class BodyMetricsLogReq(BaseModel):
    user_id: str = "1"
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    target_weight_kg: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    waist_cm: Optional[float] = None
    chest_cm: Optional[float] = None
    bicep_cm: Optional[float] = None
    thigh_cm: Optional[float] = None
    activity_level: Optional[str] = None
    notes: Optional[str] = None

@router.get("/log")
def get_daily_log(user_id: str = "1", log_date: Optional[str] = None, db: Session = Depends(get_db)):
    target_date = date.fromisoformat(log_date) if log_date else date.today()
    log = db.query(DailyLog).filter(DailyLog.user_id == str(user_id), DailyLog.log_date == target_date).first()
    if not log:
        # Check previous log for height/weight fallback
        prev_log = db.query(DailyLog).filter(DailyLog.user_id == str(user_id)).order_by(DailyLog.log_date.desc()).first()
        h = prev_log.height_cm if prev_log and prev_log.height_cm else 175.0
        w = prev_log.weight_kg if prev_log and prev_log.weight_kg else 70.0
        tw = prev_log.target_weight_kg if prev_log and prev_log.target_weight_kg else 68.0
        a = prev_log.age if prev_log and prev_log.age else 25
        g = prev_log.gender if prev_log and prev_log.gender else "Male"

        target_w_ml = round(w * 35) # 35ml per kg recommendation
        log = DailyLog(
            user_id=str(user_id),
            log_date=target_date,
            water_ml=0,
            target_water_ml=target_w_ml,
            active_minutes=0,
            calories_burned=0,
            height_cm=h,
            weight_kg=w,
            target_weight_kg=tw,
            age=a,
            gender=g
        )
        db.add(log)
        db.commit()
        db.refresh(log)

    start_dt = datetime.combine(target_date, datetime.min.time())
    end_dt = datetime.combine(target_date, datetime.max.time())
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.started_at >= start_dt,
        WorkoutSession.started_at <= end_dt
    ).all()

    total_duration_sec = sum([s.duration_seconds or 0 for s in sessions if s.completed_at])
    log.active_minutes = round(total_duration_sec / 60)
    log.calories_burned = log.active_minutes * 8
    db.commit()

    # BMI Calculation
    bmi = 0.0
    bmi_category = "Normal"
    if log.height_cm and log.weight_kg and log.height_cm > 0:
        height_m = log.height_cm / 100.0
        bmi = round(log.weight_kg / (height_m * height_m), 1)
        if bmi < 18.5: bmi_category = "Underweight"
        elif bmi < 25.0: bmi_category = "Normal Weight"
        elif bmi < 30.0: bmi_category = "Overweight"
        else: bmi_category = "Obese"

    # BMR Calculation (Mifflin-St Jeor)
    bmr = 0
    if log.weight_kg and log.height_cm and log.age:
        if log.gender == "Female":
            bmr = round(10 * log.weight_kg + 6.25 * log.height_cm - 5 * log.age - 161)
        else:
            bmr = round(10 * log.weight_kg + 6.25 * log.height_cm - 5 * log.age + 5)

    return {
        "id": log.id,
        "date": str(log.log_date),
        "water_ml": log.water_ml,
        "target_water_ml": log.target_water_ml,
        "active_minutes": log.active_minutes,
        "calories_burned": log.calories_burned,
        "height_cm": log.height_cm,
        "weight_kg": log.weight_kg,
        "target_weight_kg": log.target_weight_kg,
        "age": log.age,
        "gender": log.gender,
        "waist_cm": log.waist_cm,
        "chest_cm": log.chest_cm,
        "bicep_cm": log.bicep_cm,
        "thigh_cm": log.thigh_cm,
        "activity_level": log.activity_level,
        "bmi": bmi,
        "bmi_category": bmi_category,
        "bmr_calories": bmr,
        "notes": log.notes,
        "workouts_completed_today": len(sessions)
    }

@router.post("/water")
def update_water_intake(req: WaterUpdateReq, db: Session = Depends(get_db)):
    today = date.today()
    log = db.query(DailyLog).filter(DailyLog.user_id == str(req.user_id), DailyLog.log_date == today).first()
    if not log:
        log = DailyLog(user_id=str(req.user_id), log_date=today, water_ml=0, target_water_ml=2500)
        db.add(log)
    
    if req.set_exact:
        log.water_ml = max(0, req.amount_ml)
    else:
        log.water_ml = max(0, log.water_ml + req.amount_ml)
    
    db.commit()
    db.refresh(log)
    return {"water_ml": log.water_ml, "target_water_ml": log.target_water_ml}

@router.post("/metrics")
def log_body_metrics(req: BodyMetricsLogReq, db: Session = Depends(get_db)):
    today = date.today()
    log = db.query(DailyLog).filter(DailyLog.user_id == str(req.user_id), DailyLog.log_date == today).first()
    if not log:
        log = DailyLog(user_id=str(req.user_id), log_date=today)
        db.add(log)
    
    if req.height_cm is not None: log.height_cm = req.height_cm
    if req.weight_kg is not None: 
        log.weight_kg = req.weight_kg
        log.target_water_ml = round(req.weight_kg * 35)
    if req.target_weight_kg is not None: log.target_weight_kg = req.target_weight_kg
    if req.age is not None: log.age = req.age
    if req.gender is not None: log.gender = req.gender
    if req.waist_cm is not None: log.waist_cm = req.waist_cm
    if req.chest_cm is not None: log.chest_cm = req.chest_cm
    if req.bicep_cm is not None: log.bicep_cm = req.bicep_cm
    if req.thigh_cm is not None: log.thigh_cm = req.thigh_cm
    if req.activity_level is not None: log.activity_level = req.activity_level
    if req.notes is not None: log.notes = req.notes
    
    db.commit()
    return {"message": "Physical profile metrics saved successfully", "date": str(today)}

@router.get("/streak")
def get_user_streak(user_id: str = "1", db: Session = Depends(get_db)):
    sessions = db.query(WorkoutSession).filter(WorkoutSession.completed_at != None).all()
    workout_dates = set([s.started_at.date() for s in sessions if s.started_at])

    today = date.today()
    streak = 0
    curr = today
    if curr not in workout_dates and (curr - timedelta(days=1)) in workout_dates:
        curr = curr - timedelta(days=1)
    
    while curr in workout_dates:
        streak += 1
        curr -= timedelta(days=1)
    
    heatmap = {}
    for i in range(60):
        d = today - timedelta(days=i)
        heatmap[str(d)] = str(d) in [str(wd) for wd in workout_dates]

    return {
        "current_streak": streak,
        "total_workouts": len(sessions),
        "workout_heatmap": heatmap
    }
