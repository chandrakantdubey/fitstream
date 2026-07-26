from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import uuid
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.workout import Workout, WorkoutExercise, WorkoutSession, SessionSet
from app.models.exercise import Exercise
from app.models.user import User
from app.models.daily_tracker import DailyLog

router = APIRouter(prefix="/workouts", tags=["workouts"])

PRESET_ROUTINES = [
    {
        "id": "ppl-push",
        "name": "Push Day (Chest, Shoulders & Triceps)",
        "category": "Push/Pull/Legs",
        "duration": "45 min",
        "exercises": [
            {"id": "ex-push-1", "name": "Barbell Bench Press", "target": "Chest", "sets": 4, "reps": 8, "weight": 60.0},
            {"id": "ex-push-2", "name": "Incline Dumbbell Press", "target": "Upper Chest", "sets": 3, "reps": 10, "weight": 22.5},
            {"id": "ex-push-3", "name": "Standing Overhead Press", "target": "Shoulders", "sets": 3, "reps": 8, "weight": 40.0},
            {"id": "ex-push-4", "name": "Dumbbell Lateral Raises", "target": "Side Delt", "sets": 4, "reps": 12, "weight": 10.0},
            {"id": "ex-push-5", "name": "Tricep Rope Pushdowns", "target": "Triceps", "sets": 3, "reps": 12, "weight": 25.0}
        ]
    },
    {
        "id": "ppl-pull",
        "name": "Pull Day (Back, Lat & Biceps)",
        "category": "Push/Pull/Legs",
        "duration": "50 min",
        "exercises": [
            {"id": "ex-pull-1", "name": "Barbell Deadlift", "target": "Lower Back & Glutes", "sets": 3, "reps": 5, "weight": 100.0},
            {"id": "ex-pull-2", "name": "Lat Pulldowns", "target": "Lats", "sets": 4, "reps": 10, "weight": 55.0},
            {"id": "ex-pull-3", "name": "Bent-Over Barbell Row", "target": "Upper Back", "sets": 3, "reps": 8, "weight": 50.0},
            {"id": "ex-pull-4", "name": "Face Pulls", "target": "Rear Delt", "sets": 3, "reps": 15, "weight": 20.0},
            {"id": "ex-pull-5", "name": "Dumbbell Bicep Curls", "target": "Biceps", "sets": 3, "reps": 12, "weight": 14.0}
        ]
    },
    {
        "id": "ppl-legs",
        "name": "Legs & Abs Hypertrophy",
        "category": "Push/Pull/Legs",
        "duration": "55 min",
        "exercises": [
            {"id": "ex-leg-1", "name": "Barbell Back Squat", "target": "Quads & Glutes", "sets": 4, "reps": 8, "weight": 80.0},
            {"id": "ex-leg-2", "name": "Romanian Deadlift", "target": "Hamstrings", "sets": 3, "reps": 10, "weight": 70.0},
            {"id": "ex-leg-3", "name": "Leg Press", "target": "Quads", "sets": 3, "reps": 12, "weight": 120.0},
            {"id": "ex-leg-4", "name": "Standing Calf Raises", "target": "Calves", "sets": 4, "reps": 15, "weight": 45.0},
            {"id": "ex-leg-5", "name": "Hanging Leg Raises", "target": "Abs", "sets": 3, "reps": 12, "weight": 0.0}
        ]
    },
    {
        "id": "home-bodyweight",
        "name": "Home Calisthenics Burn",
        "category": "No Equipment",
        "duration": "30 min",
        "exercises": [
            {"id": "ex-bw-1", "name": "Push-ups", "target": "Chest & Triceps", "sets": 3, "reps": 15, "weight": 0.0},
            {"id": "ex-bw-2", "name": "Bodyweight Air Squats", "target": "Quads", "sets": 4, "reps": 20, "weight": 0.0},
            {"id": "ex-bw-3", "name": "Plank to Push-up", "target": "Core", "sets": 3, "reps": 10, "weight": 0.0},
            {"id": "ex-bw-4", "name": "Walking Lunges", "target": "Legs", "sets": 3, "reps": 12, "weight": 0.0},
            {"id": "ex-bw-5", "name": "Mountain Climbers", "target": "Full Body Cardio", "sets": 3, "reps": 30, "weight": 0.0}
        ]
    }
]

class WEIn(BaseModel):
    exercise_id: str
    order_index: int = 0
    target_sets: int = 3
    target_reps: int = 10
    rest_seconds: int = 60
    notes: str = ""

class WorkoutIn(BaseModel):
    name: str
    exercises: List[WEIn]

class SessionSetIn(BaseModel):
    workout_exercise_id: str
    set_number: int
    reps_completed: int
    weight_kg: float = 0.0

@router.get("/presets")
def get_preset_routines():
    return PRESET_ROUTINES

@router.post("")
def create_workout(data: WorkoutIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    w = Workout(id=str(uuid.uuid4())[:8], user_id=current_user.id, name=data.name)
    db.add(w)
    db.flush()

    for we in data.exercises:
        db.add(WorkoutExercise(
            id=str(uuid.uuid4())[:8],
            workout_id=w.id,
            exercise_id=we.exercise_id,
            order_index=we.order_index,
            target_sets=we.target_sets,
            target_reps=we.target_reps,
            rest_seconds=we.rest_seconds,
            notes=we.notes
        ))

    db.commit()
    db.refresh(w)
    return _format_workout(w)

@router.get("")
def list_workouts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_workouts = db.query(Workout).filter(Workout.user_id == current_user.id).order_by(Workout.created_at.desc()).all()
    formatted = [_format_workout(w) for w in user_workouts]
    return formatted

@router.get("/{workout_id}")
def get_workout(workout_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check presets first
    preset = next((p for p in PRESET_ROUTINES if p["id"] == workout_id), None)
    if preset:
        return preset

    w = db.query(Workout).filter(Workout.id == workout_id, Workout.user_id == current_user.id).first()
    return _format_workout(w) if w else {"error": "Not found"}

@router.delete("/{workout_id}")
def delete_workout(workout_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    w = db.query(Workout).filter(Workout.id == workout_id, Workout.user_id == current_user.id).first()
    if w:
        db.delete(w)
        db.commit()
    return {"deleted": True}

# --- Session (workout execution) ---

@router.post("/{workout_id}/sessions")
def start_session(workout_id: str, user_id: int = 1, db: Session = Depends(get_db)):
    s = WorkoutSession(
        id=str(uuid.uuid4())[:8],
        workout_id=workout_id,
        started_at=datetime.utcnow()
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return _format_session(s)

@router.post("/sessions/{session_id}/sets")
def log_set(session_id: str, data: SessionSetIn, db: Session = Depends(get_db)):
    ss = SessionSet(
        id=str(uuid.uuid4())[:8],
        session_id=session_id,
        workout_exercise_id=data.workout_exercise_id,
        set_number=data.set_number,
        reps_completed=data.reps_completed,
        weight_kg=data.weight_kg,
        completed_at=datetime.utcnow()
    )
    db.add(ss)
    db.commit()
    db.refresh(ss)
    return {"id": ss.id, "set_number": ss.set_number, "reps": ss.reps_completed, "weight": ss.weight_kg}

@router.post("/sessions/{session_id}/complete")
def complete_session(session_id: str, user_id: int = 1, db: Session = Depends(get_db)):
    s = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
    if not s:
        return {"error": "Not found"}
    s.completed_at = datetime.utcnow()
    if s.started_at:
        s.duration_seconds = int((s.completed_at - s.started_at).total_seconds())
    
    # Update DailyLog active minutes
    today = date.today()
    log = db.query(DailyLog).filter(DailyLog.user_id == user_id, DailyLog.log_date == today).first()
    if not log:
        log = DailyLog(user_id=user_id, log_date=today)
        db.add(log)
    
    added_mins = max(1, round((s.duration_seconds or 300) / 60))
    log.active_minutes += added_mins
    log.calories_burned += added_mins * 8
    db.commit()

    return _format_session(s)

def _format_workout(w):
    return {
        "id": w.id,
        "name": w.name,
        "created_at": w.created_at.isoformat() if w.created_at else None,
        "updated_at": w.updated_at.isoformat() if w.updated_at else None,
        "exercises": [{
            "id": we.id,
            "exercise_id": we.exercise_id,
            "order_index": we.order_index,
            "target_sets": we.target_sets,
            "target_reps": we.target_reps,
            "rest_seconds": we.rest_seconds,
            "notes": we.notes,
            "exercise": {
                "id": we.exercise.id if we.exercise else we.exercise_id,
                "name": we.exercise.name if we.exercise else "Exercise",
                "category": we.exercise.category if we.exercise else "Strength",
                "equipment": we.exercise.equipment if we.exercise else "Full Gym",
                "target": we.exercise.target if we.exercise else "Full Body",
                "media_id": we.exercise.media_id if we.exercise else None
            }
        } for we in w.exercises],
        "session_count": len(w.sessions)
    }

def _format_session(s):
    return {
        "id": s.id,
        "workout_id": s.workout_id,
        "started_at": s.started_at.isoformat() if s.started_at else None,
        "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        "duration_seconds": s.duration_seconds,
        "sets_completed": len(s.sets)
    }