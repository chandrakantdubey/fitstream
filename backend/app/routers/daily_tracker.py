import json
import uuid
from datetime import date, datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.daily_tracker import DailyLog
from app.models.body_metric import BodyMetric
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
        prev_log = db.query(DailyLog).filter(DailyLog.user_id == str(user_id)).order_by(DailyLog.log_date.desc()).first()
        h = prev_log.height_cm if prev_log and prev_log.height_cm else None
        w = prev_log.weight_kg if prev_log and prev_log.weight_kg else None
        tw = prev_log.target_weight_kg if prev_log and prev_log.target_weight_kg else None
        a = prev_log.age if prev_log and prev_log.age else None
        g = prev_log.gender if prev_log and prev_log.gender else "Male"

        target_w_ml = round(w * 35) if w else 2450
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

    height_m = (log.height_cm / 100.0) if log.height_cm else None
    bmi = round(log.weight_kg / (height_m ** 2), 1) if (log.weight_kg and height_m) else None

    bmi_cat = "Normal"
    if bmi:
        if bmi < 18.5:
            bmi_cat = "Underweight"
        elif bmi <= 24.9:
            bmi_cat = "Normal Weight"
        elif bmi <= 29.9:
            bmi_cat = "Overweight"
        else:
            bmi_cat = "Obese"

    bmr = 1680
    if log.weight_kg and log.height_cm and log.age:
        if (log.gender or "").lower() == "female":
            bmr = round(10 * log.weight_kg + 6.25 * log.height_cm - 5 * log.age - 161)
        else:
            bmr = round(10 * log.weight_kg + 6.25 * log.height_cm - 5 * log.age + 5)

    return {
        "id": log.id,
        "user_id": log.user_id,
        "log_date": log.log_date.isoformat(),
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
        "bmi": bmi,
        "bmi_category": bmi_cat,
        "bmr_calories": bmr
    }

@router.post("/water")
def update_water(req: WaterUpdateReq, db: Session = Depends(get_db)):
    today = date.today()
    log = db.query(DailyLog).filter(DailyLog.user_id == str(req.user_id), DailyLog.log_date == today).first()
    if not log:
        log = DailyLog(user_id=str(req.user_id), log_date=today, water_ml=0, target_water_ml=2450)
        db.add(log)
        db.commit()
        db.refresh(log)

    if req.set_exact:
        log.water_ml = req.amount_ml
    else:
        log.water_ml = max(0, log.water_ml + req.amount_ml)

    db.commit()
    return {"user_id": log.user_id, "water_ml": log.water_ml, "target_water_ml": log.target_water_ml}

@router.post("/metrics")
def update_body_metrics(req: BodyMetricsLogReq, db: Session = Depends(get_db)):
    today = date.today()
    log = db.query(DailyLog).filter(DailyLog.user_id == str(req.user_id), DailyLog.log_date == today).first()
    if not log:
        log = DailyLog(user_id=str(req.user_id), log_date=today, water_ml=0, target_water_ml=2450)
        db.add(log)

    if req.height_cm is not None:
        log.height_cm = req.height_cm
    if req.weight_kg is not None:
        log.weight_kg = req.weight_kg
        log.target_water_ml = round(req.weight_kg * 35)
    if req.target_weight_kg is not None:
        log.target_weight_kg = req.target_weight_kg
    if req.age is not None:
        log.age = req.age
    if req.gender is not None:
        log.gender = req.gender
    if req.waist_cm is not None:
        log.waist_cm = req.waist_cm
    if req.chest_cm is not None:
        log.chest_cm = req.chest_cm
    if req.bicep_cm is not None:
        log.bicep_cm = req.bicep_cm
    if req.thigh_cm is not None:
        log.thigh_cm = req.thigh_cm

    bm = BodyMetric(
        id=str(uuid.uuid4())[:8],
        user_id=str(req.user_id),
        date=datetime.utcnow(),
        weight_kg=req.weight_kg,
        waist_cm=req.waist_cm,
        chest_cm=req.chest_cm,
        biceps_cm=req.bicep_cm,
        thighs_cm=req.thigh_cm,
        notes=req.notes or ""
    )
    db.add(bm)
    db.commit()
    return {"message": "Body metrics updated successfully"}

@router.get("/streak")
def get_user_streak(user_id: str = "1", db: Session = Depends(get_db)):
    logs = db.query(DailyLog).filter(DailyLog.user_id == str(user_id)).order_by(DailyLog.log_date.desc()).all()
    if not logs:
        return {"current_streak": 0, "total_workouts": 0}

    streak = 0
    today = date.today()
    check_date = today

    for l in logs:
        if l.log_date == check_date or l.log_date == check_date - timedelta(days=1):
            if l.active_minutes > 0 or l.water_ml > 0:
                streak += 1
                check_date = l.log_date - timedelta(days=1)

    completed_sessions = db.query(WorkoutSession).filter(WorkoutSession.completed_at != None).count()
    return {"current_streak": streak, "total_workouts": completed_sessions}

@router.get("/analytics-history")
def get_analytics_history(user_id: str = "1", db: Session = Depends(get_db)):
    metrics = db.query(BodyMetric).filter(BodyMetric.user_id == str(user_id)).order_by(BodyMetric.date.asc()).all()
    weight_history = []
    for m in metrics:
        if m.weight_kg:
            weight_history.append({
                "date": m.date.strftime("%b %d") if m.date else "Today",
                "weight_kg": m.weight_kg
            })

    if not weight_history:
        dlogs = db.query(DailyLog).filter(DailyLog.user_id == str(user_id), DailyLog.weight_kg != None).order_by(DailyLog.log_date.asc()).all()
        for dl in dlogs:
            weight_history.append({
                "date": dl.log_date.strftime("%b %d"),
                "weight_kg": dl.weight_kg
            })

    today = date.today()
    weekly_activity = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    for i in range(6, -1, -1):
        target_d = today - timedelta(days=i)
        d_name = days[target_d.weekday()]
        dl = db.query(DailyLog).filter(DailyLog.user_id == str(user_id), DailyLog.log_date == target_d).first()
        weekly_activity.append({
            "day": d_name,
            "date": target_d.isoformat(),
            "minutes": dl.active_minutes if dl else 0,
            "cals": dl.calories_burned if dl else 0,
            "water_ml": dl.water_ml if dl else 0
        })

    has_weight_data = len(weight_history) > 1
    has_activity_data = any(d["minutes"] > 0 or d["cals"] > 0 for d in weekly_activity)

    latest_log = get_daily_log(user_id=user_id, db=db)

    return {
        "weight_history": weight_history,
        "weekly_activity": weekly_activity,
        "has_weight_data": has_weight_data,
        "has_activity_data": has_activity_data,
        "current_metrics": latest_log
    }
