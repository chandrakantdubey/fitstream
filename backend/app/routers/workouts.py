from datetime import datetime
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workout import Workout, WorkoutExercise, WorkoutSession, SessionSet
from app.models.exercise import Exercise

router = APIRouter(prefix="/workouts", tags=["Workouts & Routines"])


class ExerciseInput(BaseModel):
    name: str
    target: str = "Full Body"
    sets: int = 3
    reps: int = 10
    weight: float = 0.0


class WorkoutCreate(BaseModel):
    user_id: str = "1"
    name: str
    description: Optional[str] = ""
    category: str = "General"
    exercises: List[ExerciseInput] = []


class LogSetInput(BaseModel):
    workout_exercise_id: str
    set_number: int
    reps_completed: int
    weight_kg: float = 0.0


PRESET_ROUTINES = [
    {
        "id": "ppl-push",
        "name": "Push Day (Chest, Shoulders & Triceps)",
        "category": "Push/Pull/Legs",
        "duration": "45 min",
        "exercises": [
            {"id": "p1", "name": "Barbell Bench Press", "target": "Chest", "sets": 4, "reps": 8, "weight": 60.0},
            {"id": "p2", "name": "Incline Dumbbell Press", "target": "Upper Chest", "sets": 3, "reps": 10, "weight": 22.0},
            {"id": "p3", "name": "Dumbbell Overhead Shoulder Press", "target": "Shoulders", "sets": 3, "reps": 10, "weight": 18.0},
            {"id": "p4", "name": "Dumbbell Lateral Raises", "target": "Lateral Delts", "sets": 3, "reps": 12, "weight": 10.0},
            {"id": "p5", "name": "Cable Tricep Rope Pushdowns", "target": "Triceps", "sets": 3, "reps": 12, "weight": 25.0}
        ]
    },
    {
        "id": "ppl-pull",
        "name": "Pull Day (Back, Lats & Biceps)",
        "category": "Push/Pull/Legs",
        "duration": "50 min",
        "exercises": [
            {"id": "l1", "name": "Lat Pulldown", "target": "Lats & Upper Back", "sets": 4, "reps": 10, "weight": 55.0},
            {"id": "l2", "name": "Bent-Over Barbell Row", "target": "Mid Back", "sets": 4, "reps": 8, "weight": 50.0},
            {"id": "l3", "name": "Face Pulls", "target": "Rear Delts", "sets": 3, "reps": 15, "weight": 20.0},
            {"id": "l4", "name": "Standing Dumbbell Bicep Curls", "target": "Biceps", "sets": 3, "reps": 10, "weight": 14.0},
            {"id": "l5", "name": "Hammer Curls", "target": "Brachialis", "sets": 3, "reps": 12, "weight": 14.0}
        ]
    },
    {
        "id": "ppl-legs",
        "name": "Legs & Abs Hypertrophy",
        "category": "Push/Pull/Legs",
        "duration": "55 min",
        "exercises": [
            {"id": "g1", "name": "Barbell Back Squats", "target": "Quads & Glutes", "sets": 4, "reps": 8, "weight": 70.0},
            {"id": "g2", "name": "Romanian Deadlifts", "target": "Hamstrings", "sets": 4, "reps": 10, "weight": 60.0},
            {"id": "g3", "name": "Leg Press", "target": "Quads", "sets": 3, "reps": 12, "weight": 120.0},
            {"id": "g4", "name": "Standing Calf Raises", "target": "Calves", "sets": 4, "reps": 15, "weight": 40.0},
            {"id": "g5", "name": "Hanging Leg Raises", "target": "Abs", "sets": 3, "reps": 12, "weight": 0.0}
        ]
    },
    {
        "id": "home-calisthenics",
        "name": "Home Calisthenics Burn",
        "category": "No Equipment",
        "duration": "30 min",
        "exercises": [
            {"id": "c1", "name": "Standard Push-ups", "target": "Chest & Core", "sets": 3, "reps": 15, "weight": 0.0},
            {"id": "c2", "name": "Bodyweight Air Squats", "target": "Quads", "sets": 3, "reps": 20, "weight": 0.0},
            {"id": "c3", "name": "Chair Tricep Dips", "target": "Triceps", "sets": 3, "reps": 12, "weight": 0.0},
            {"id": "c4", "name": "Mountain Climbers", "target": "Full Body", "sets": 3, "reps": 30, "weight": 0.0},
            {"id": "c5", "name": "Forearm Plank", "target": "Core Stability", "sets": 3, "reps": 45, "weight": 0.0}
        ]
    }
]


@router.get("/presets")
def get_preset_routines():
    return PRESET_ROUTINES


@router.get("")
def get_user_workouts(user_id: str = "1", db: Session = Depends(get_db)):
    workouts = db.query(Workout).filter(Workout.user_id == str(user_id)).all()
    results = []
    for w in workouts:
        ex_list = []
        for we in w.exercises:
            ex_list.append({
                "id": we.id,
                "name": we.exercise.name if we.exercise else "Exercise",
                "target": we.exercise.target if we.exercise else "Full Body",
                "sets": we.target_sets,
                "reps": we.target_reps
            })
        results.append({
            "id": w.id,
            "name": w.name,
            "category": getattr(w, "category", "General"),
            "exercises": ex_list,
            "created_at": w.created_at.isoformat() if w.created_at else None
        })
    return results


@router.post("")
def create_custom_workout(data: WorkoutCreate, db: Session = Depends(get_db)):
    workout = Workout(
        id=str(uuid.uuid4())[:8],
        user_id=str(data.user_id),
        name=data.name
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)

    for idx, ex_in in enumerate(data.exercises):
        ex_obj = db.query(Exercise).filter(Exercise.name.ilike(ex_in.name)).first()
        if not ex_obj:
            ex_obj = Exercise(
                id=str(uuid.uuid4())[:8],
                name=ex_in.name,
                target=ex_in.target,
                category="Custom"
            )
            db.add(ex_obj)
            db.commit()
            db.refresh(ex_obj)

        we = WorkoutExercise(
            id=str(uuid.uuid4())[:8],
            workout_id=workout.id,
            exercise_id=ex_obj.id,
            order_index=idx,
            target_sets=ex_in.sets,
            target_reps=ex_in.reps
        )
        db.add(we)

    db.commit()
    return {"id": workout.id, "name": workout.name, "message": "Workout routine created successfully"}


@router.get("/{workout_id}")
def get_workout_details(workout_id: str, db: Session = Depends(get_db)):
    preset = next((p for p in PRESET_ROUTINES if p["id"] == workout_id), None)
    if preset:
        return preset

    workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout routine not found")

    ex_list = []
    for we in workout.exercises:
        ex_list.append({
            "id": we.id,
            "name": we.exercise.name if we.exercise else "Exercise",
            "target": we.exercise.target if we.exercise else "Full Body",
            "sets": we.target_sets,
            "reps": we.target_reps
        })

    return {
        "id": workout.id,
        "name": workout.name,
        "category": "Custom",
        "exercises": ex_list
    }


@router.delete("/{workout_id}")
def delete_workout(workout_id: str, db: Session = Depends(get_db)):
    db.query(WorkoutExercise).filter(WorkoutExercise.workout_id == workout_id).delete()
    db.query(Workout).filter(Workout.id == workout_id).delete()
    db.commit()
    return {"message": "Workout routine deleted successfully"}


@router.post("/{workout_id}/sessions")
def start_workout_session(workout_id: str, user_id: str = "1", db: Session = Depends(get_db)):
    session = WorkoutSession(
        id=str(uuid.uuid4())[:8],
        workout_id=workout_id,
        started_at=datetime.utcnow()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "workout_id": session.workout_id, "started_at": session.started_at.isoformat()}


@router.post("/sessions/{session_id}/sets")
def log_session_set(
    session_id: str,
    data: LogSetInput,
    db: Session = Depends(get_db)
):
    logged_set = SessionSet(
        id=str(uuid.uuid4())[:8],
        session_id=session_id,
        workout_exercise_id=data.workout_exercise_id,
        set_number=data.set_number,
        reps_completed=data.reps_completed,
        weight_kg=data.weight_kg,
        completed_at=datetime.utcnow()
    )
    db.add(logged_set)
    db.commit()
    return {"message": "Set logged successfully"}


@router.post("/sessions/{session_id}/complete")
def complete_workout_session(session_id: str, user_id: str = "1", db: Session = Depends(get_db)):
    session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Workout session not found")

    session.completed_at = datetime.utcnow()
    if session.started_at:
        duration = (session.completed_at - session.started_at).total_seconds()
        session.duration_seconds = int(duration)
    db.commit()
    return {"message": "Workout session completed!", "duration_seconds": session.duration_seconds}