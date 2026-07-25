from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import json
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.workout import Workout, WorkoutExercise, WorkoutSession, SessionSet
from app.models.body_metric import BodyMetric
from app.models.goal import Goal, PersonalRecord
from app.models.schedule import ScheduledWorkout

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/full")
def export_full_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Export all user data as JSON"""
    
    # Get user's workouts
    workouts = db.query(Workout).filter(Workout.user_id == current_user.id).all()
    workout_data = []
    for w in workouts:
        workout_dict = {
            "id": w.id,
            "name": w.name,
            "created_at": w.created_at.isoformat() if w.created_at else None,
            "updated_at": w.updated_at.isoformat() if w.updated_at else None,
            "exercises": []
        }
        for we in w.exercises:
            workout_dict["exercises"].append({
                "id": we.id,
                "exercise_id": we.exercise_id,
                "order_index": we.order_index,
                "target_sets": we.target_sets,
                "target_reps": we.target_reps,
                "rest_seconds": we.rest_seconds,
                "notes": we.notes
            })
        workout_data.append(workout_dict)
    
    # Get sessions
    session_data = []
    for w in workouts:
        for s in w.sessions:
            session_dict = {
                "id": s.id,
                "workout_id": s.workout_id,
                "started_at": s.started_at.isoformat() if s.started_at else None,
                "completed_at": s.completed_at.isoformat() if s.completed_at else None,
                "duration_seconds": s.duration_seconds,
                "notes": s.notes,
                "sets": []
            }
            for ss in s.sets:
                session_dict["sets"].append({
                    "id": ss.id,
                    "set_number": ss.set_number,
                    "reps_completed": ss.reps_completed,
                    "weight_kg": ss.weight_kg,
                    "completed_at": ss.completed_at.isoformat() if ss.completed_at else None
                })
            session_data.append(session_dict)
    
    # Get body metrics
    body_metrics = db.query(BodyMetric).filter(BodyMetric.user_id == current_user.id).all()
    body_metric_data = [{
        "id": bm.id,
        "date": bm.date.isoformat() if bm.date else None,
        "weight_kg": bm.weight_kg,
        "chest_cm": bm.chest_cm,
        "waist_cm": bm.waist_cm,
        "hips_cm": bm.hips_cm,
        "biceps_cm": bm.biceps_cm,
        "thighs_cm": bm.thighs_cm,
        "calves_cm": bm.calves_cm,
        "neck_cm": bm.neck_cm,
        "shoulders_cm": bm.shoulders_cm,
        "body_fat_percentage": bm.body_fat_percentage,
        "muscle_mass_kg": bm.muscle_mass_kg,
        "notes": bm.notes
    } for bm in body_metrics]
    
    # Get goals
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    goal_data = [{
        "id": g.id,
        "goal_type": g.goal_type,
        "target_value": g.target_value,
        "current_value": g.current_value,
        "unit": g.unit,
        "exercise_id": g.exercise_id,
        "target_date": g.target_date.isoformat() if g.target_date else None,
        "start_date": g.start_date.isoformat() if g.start_date else None,
        "is_active": g.is_active,
        "is_completed": g.is_completed,
        "progress_percentage": g.progress_percentage,
        "title": g.title,
        "description": g.description
    } for g in goals]
    
    # Get personal records
    records = db.query(PersonalRecord).filter(PersonalRecord.user_id == current_user.id).all()
    record_data = [{
        "id": r.id,
        "exercise_id": r.exercise_id,
        "record_type": r.record_type,
        "value": r.value,
        "unit": r.unit,
        "reps": r.reps,
        "notes": r.notes,
        "achieved_at": r.achieved_at.isoformat() if r.achieved_at else None
    } for r in records]
    
    # Get scheduled workouts
    scheduled = db.query(ScheduledWorkout).filter(ScheduledWorkout.user_id == current_user.id).all()
    scheduled_data = [{
        "id": s.id,
        "workout_id": s.workout_id,
        "scheduled_date": s.scheduled_date.isoformat() if s.scheduled_date else None,
        "scheduled_time": s.scheduled_time,
        "is_completed": s.is_completed,
        "is_skipped": s.is_skipped,
        "notes": s.notes
    } for s in scheduled]
    
    export_data = {
        "export_date": datetime.utcnow().isoformat(),
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        },
        "workouts": workout_data,
        "sessions": session_data,
        "body_metrics": body_metric_data,
        "goals": goal_data,
        "personal_records": record_data,
        "scheduled_workouts": scheduled_data
    }
    
    return JSONResponse(content=export_data)


@router.get("/workouts")
def export_workouts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Export workouts only"""
    workouts = db.query(Workout).filter(Workout.user_id == current_user.id).all()
    workout_data = []
    for w in workouts:
        workout_dict = {
            "id": w.id,
            "name": w.name,
            "created_at": w.created_at.isoformat() if w.created_at else None,
            "exercises": []
        }
        for we in w.exercises:
            workout_dict["exercises"].append({
                "exercise_id": we.exercise_id,
                "order_index": we.order_index,
                "target_sets": we.target_sets,
                "target_reps": we.target_reps,
                "rest_seconds": we.rest_seconds,
                "notes": we.notes
            })
        workout_data.append(workout_dict)
    
    return JSONResponse(content={"workouts": workout_data})


@router.get("/progress")
def export_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Export progress data (sessions, body metrics, records)"""
    
    # Get body metrics
    body_metrics = db.query(BodyMetric).filter(BodyMetric.user_id == current_user.id).all()
    body_metric_data = [{
        "date": bm.date.isoformat() if bm.date else None,
        "weight_kg": bm.weight_kg,
        "chest_cm": bm.chest_cm,
        "waist_cm": bm.waist_cm,
        "hips_cm": bm.hips_cm
    } for bm in body_metrics]
    
    # Get personal records
    records = db.query(PersonalRecord).filter(PersonalRecord.user_id == current_user.id).all()
    record_data = [{
        "exercise_id": r.exercise_id,
        "record_type": r.record_type,
        "value": r.value,
        "unit": r.unit,
        "achieved_at": r.achieved_at.isoformat() if r.achieved_at else None
    } for r in records]
    
    return JSONResponse(content={
        "body_metrics": body_metric_data,
        "personal_records": record_data
    })
