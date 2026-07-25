from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import uuid
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.schedule import ScheduledWorkout, RecurringSchedule, WorkoutReminder
from app.models.user import User

router = APIRouter(prefix="/schedule", tags=["schedule"])


class ScheduledWorkoutIn(BaseModel):
    workout_id: Optional[str] = None
    program_day_id: Optional[str] = None
    scheduled_date: datetime
    scheduled_time: Optional[str] = None
    reminder_minutes_before: int = 30
    notes: str = ""


class RecurringScheduleIn(BaseModel):
    workout_id: Optional[str] = None
    frequency: str  # daily, weekly, monthly
    days_of_week: str = ""
    interval: int = 1
    scheduled_time: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: str = ""


@router.post("/workouts")
def schedule_workout(data: ScheduledWorkoutIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scheduled = ScheduledWorkout(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        workout_id=data.workout_id,
        program_day_id=data.program_day_id,
        scheduled_date=data.scheduled_date,
        scheduled_time=data.scheduled_time,
        reminder_minutes_before=data.reminder_minutes_before,
        notes=data.notes
    )
    db.add(scheduled)
    db.commit()
    db.refresh(scheduled)
    return _format_scheduled(scheduled)


@router.get("/workouts")
def list_scheduled(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ScheduledWorkout).filter(ScheduledWorkout.user_id == current_user.id)
    
    if start_date:
        query = query.filter(ScheduledWorkout.scheduled_date >= start_date)
    if end_date:
        query = query.filter(ScheduledWorkout.scheduled_date <= end_date)
    
    scheduled = query.order_by(ScheduledWorkout.scheduled_date.asc()).all()
    return [_format_scheduled(s) for s in scheduled]


@router.get("/workouts/upcoming")
def get_upcoming(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    upcoming = db.query(ScheduledWorkout).filter(
        ScheduledWorkout.user_id == current_user.id,
        ScheduledWorkout.scheduled_date >= now,
        ScheduledWorkout.is_completed == False,
        ScheduledWorkout.is_skipped == False
    ).order_by(ScheduledWorkout.scheduled_date.asc()).limit(10).all()
    return [_format_scheduled(s) for s in upcoming]


@router.get("/workouts/{scheduled_id}")
def get_scheduled(scheduled_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scheduled = db.query(ScheduledWorkout).filter(
        ScheduledWorkout.id == scheduled_id,
        ScheduledWorkout.user_id == current_user.id
    ).first()
    return _format_scheduled(scheduled) if scheduled else {"error": "Not found"}


@router.put("/workouts/{scheduled_id}/complete")
def complete_scheduled(scheduled_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scheduled = db.query(ScheduledWorkout).filter(
        ScheduledWorkout.id == scheduled_id,
        ScheduledWorkout.user_id == current_user.id
    ).first()
    if not scheduled:
        return {"error": "Not found"}
    
    scheduled.is_completed = True
    scheduled.completed_at = datetime.utcnow()
    scheduled.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(scheduled)
    return _format_scheduled(scheduled)


@router.put("/workouts/{scheduled_id}/skip")
def skip_scheduled(scheduled_id: str, reason: str = "", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scheduled = db.query(ScheduledWorkout).filter(
        ScheduledWorkout.id == scheduled_id,
        ScheduledWorkout.user_id == current_user.id
    ).first()
    if not scheduled:
        return {"error": "Not found"}
    
    scheduled.is_skipped = True
    scheduled.skipped_reason = reason
    scheduled.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(scheduled)
    return _format_scheduled(scheduled)


@router.put("/workouts/{scheduled_id}")
def update_scheduled(scheduled_id: str, data: ScheduledWorkoutIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scheduled = db.query(ScheduledWorkout).filter(
        ScheduledWorkout.id == scheduled_id,
        ScheduledWorkout.user_id == current_user.id
    ).first()
    if not scheduled:
        return {"error": "Not found"}
    
    scheduled.workout_id = data.workout_id
    scheduled.program_day_id = data.program_day_id
    scheduled.scheduled_date = data.scheduled_date
    scheduled.scheduled_time = data.scheduled_time
    scheduled.reminder_minutes_before = data.reminder_minutes_before
    scheduled.notes = data.notes
    scheduled.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(scheduled)
    return _format_scheduled(scheduled)


@router.delete("/workouts/{scheduled_id}")
def delete_scheduled(scheduled_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scheduled = db.query(ScheduledWorkout).filter(
        ScheduledWorkout.id == scheduled_id,
        ScheduledWorkout.user_id == current_user.id
    ).first()
    if scheduled:
        db.delete(scheduled)
        db.commit()
    return {"deleted": True}


# Recurring schedules
@router.post("/recurring")
def create_recurring(data: RecurringScheduleIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recurring = RecurringSchedule(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        workout_id=data.workout_id,
        frequency=data.frequency,
        days_of_week=data.days_of_week,
        interval=data.interval,
        scheduled_time=data.scheduled_time,
        start_date=data.start_date,
        end_date=data.end_date,
        notes=data.notes
    )
    db.add(recurring)
    db.commit()
    db.refresh(recurring)
    return _format_recurring(recurring)


@router.get("/recurring")
def list_recurring(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recurring = db.query(RecurringSchedule).filter(
        RecurringSchedule.user_id == current_user.id,
        RecurringSchedule.is_active == True
    ).order_by(RecurringSchedule.created_at.desc()).all()
    return [_format_recurring(r) for r in recurring]


@router.put("/recurring/{recurring_id}/deactivate")
def deactivate_recurring(recurring_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recurring = db.query(RecurringSchedule).filter(
        RecurringSchedule.id == recurring_id,
        RecurringSchedule.user_id == current_user.id
    ).first()
    if not recurring:
        return {"error": "Not found"}
    
    recurring.is_active = False
    recurring.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(recurring)
    return _format_recurring(recurring)


@router.delete("/recurring/{recurring_id}")
def delete_recurring(recurring_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recurring = db.query(RecurringSchedule).filter(
        RecurringSchedule.id == recurring_id,
        RecurringSchedule.user_id == current_user.id
    ).first()
    if recurring:
        db.delete(recurring)
        db.commit()
    return {"deleted": True}


@router.get("/calendar")
def get_calendar(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get first and last day of month
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(year, month + 1, 1) - timedelta(days=1)
    
    scheduled = db.query(ScheduledWorkout).filter(
        ScheduledWorkout.user_id == current_user.id,
        ScheduledWorkout.scheduled_date >= start_date,
        ScheduledWorkout.scheduled_date <= end_date
    ).order_by(ScheduledWorkout.scheduled_date.asc()).all()
    
    # Group by date
    calendar = {}
    for s in scheduled:
        date_key = s.scheduled_date.strftime("%Y-%m-%d")
        if date_key not in calendar:
            calendar[date_key] = []
        calendar[date_key].append(_format_scheduled(s))
    
    return calendar


def _format_scheduled(s):
    return {
        "id": s.id,
        "user_id": s.user_id,
        "workout_id": s.workout_id,
        "program_day_id": s.program_day_id,
        "scheduled_date": s.scheduled_date.isoformat() if s.scheduled_date else None,
        "scheduled_time": s.scheduled_time,
        "is_completed": s.is_completed,
        "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        "is_skipped": s.is_skipped,
        "skipped_reason": s.skipped_reason,
        "reminder_minutes_before": s.reminder_minutes_before,
        "reminder_sent": s.reminder_sent,
        "notes": s.notes,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        "workout": {
            "id": s.workout.id,
            "name": s.workout.name
        } if s.workout else None,
        "program_day": {
            "id": s.program_day.id,
            "name": s.program_day.name,
            "day_number": s.program_day.day_number
        } if s.program_day else None
    }


def _format_recurring(r):
    return {
        "id": r.id,
        "user_id": r.user_id,
        "workout_id": r.workout_id,
        "frequency": r.frequency,
        "days_of_week": r.days_of_week,
        "interval": r.interval,
        "scheduled_time": r.scheduled_time,
        "start_date": r.start_date.isoformat() if r.start_date else None,
        "end_date": r.end_date.isoformat() if r.end_date else None,
        "is_active": r.is_active,
        "notes": r.notes,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        "workout": {
            "id": r.workout.id,
            "name": r.workout.name
        } if r.workout else None
    }
