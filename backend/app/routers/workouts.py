from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid
from app.core.database import get_db
from app.models.workout import Workout, WorkoutExercise, WorkoutSession, SessionSet
from app.models.exercise import Exercise

router = APIRouter(prefix="/workouts", tags=["workouts"])


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


@router.post("")
def create_workout(data: WorkoutIn, db: Session = Depends(get_db)):
    w = Workout(id=str(uuid.uuid4())[:8], name=data.name)
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
def list_workouts(db: Session = Depends(get_db)):
    return [_format_workout(w) for w in db.query(Workout).order_by(Workout.created_at.desc()).all()]


@router.get("/{workout_id}")
def get_workout(workout_id: str, db: Session = Depends(get_db)):
    w = db.query(Workout).filter(Workout.id == workout_id).first()
    return _format_workout(w) if w else {"error": "Not found"}


@router.delete("/{workout_id}")
def delete_workout(workout_id: str, db: Session = Depends(get_db)):
    w = db.query(Workout).filter(Workout.id == workout_id).first()
    if w:
        db.delete(w)
        db.commit()
    return {"deleted": True}


@router.put("/{workout_id}")
def update_workout(workout_id: str, data: WorkoutIn, db: Session = Depends(get_db)):
    w = db.query(Workout).filter(Workout.id == workout_id).first()
    if not w:
        return {"error": "Not found"}

    w.name = data.name
    w.updated_at = datetime.utcnow()

    # Delete old exercises, add new
    db.query(WorkoutExercise).filter(WorkoutExercise.workout_id == workout_id).delete()
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


# --- Session (workout execution) ---

@router.post("/{workout_id}/sessions")
def start_session(workout_id: str, db: Session = Depends(get_db)):
    s = WorkoutSession(
        id=str(uuid.uuid4())[:8],
        workout_id=workout_id,
        started_at=datetime.utcnow()
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return _format_session(s)


@router.get("/{workout_id}/sessions")
def list_sessions(workout_id: str, db: Session = Depends(get_db)):
    sessions = db.query(WorkoutSession).filter(WorkoutSession.workout_id == workout_id).order_by(WorkoutSession.started_at.desc()).all()
    return [_format_session(s) for s in sessions]


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
def complete_session(session_id: str, db: Session = Depends(get_db)):
    s = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
    if not s:
        return {"error": "Not found"}
    s.completed_at = datetime.utcnow()
    if s.started_at:
        s.duration_seconds = int((s.completed_at - s.started_at).total_seconds())
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
                "id": we.exercise.id,
                "name": we.exercise.name,
                "category": we.exercise.category,
                "equipment": we.exercise.equipment,
                "target": we.exercise.target,
                "media_id": we.exercise.media_id
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