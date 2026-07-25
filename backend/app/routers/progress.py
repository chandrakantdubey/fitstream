from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.progress import DailyProgress
from app.models.workout import WorkoutSession, SessionSet
from app.models.user import User

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get user's workout sessions through their workouts
    user_workout_ids = [w.id for w in current_user.workouts]
    
    total_sessions = db.query(WorkoutSession).filter(
        WorkoutSession.workout_id.in_(user_workout_ids)
    ).count()
    
    completed_sessions = db.query(WorkoutSession).filter(
        WorkoutSession.workout_id.in_(user_workout_ids),
        WorkoutSession.completed_at != None
    ).count()
    
    # Get all session sets for user's sessions
    user_session_ids = [s.id for s in db.query(WorkoutSession).filter(
        WorkoutSession.workout_id.in_(user_workout_ids)
    ).all()]
    
    total_sets = db.query(SessionSet).filter(
        SessionSet.session_id.in_(user_session_ids)
    ).count()

    # Last 7 days activity
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly = db.query(func.date(WorkoutSession.started_at), func.count()).filter(
        WorkoutSession.started_at >= week_ago,
        WorkoutSession.workout_id.in_(user_workout_ids)
    ).group_by(func.date(WorkoutSession.started_at)).all()

    # Total volume
    total_volume = db.query(func.sum(SessionSet.weight_kg * SessionSet.reps_completed)).filter(
        SessionSet.session_id.in_(user_session_ids)
    ).scalar() or 0

    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "total_sets": total_sets,
        "total_volume": round(total_volume, 2),
        "weekly_activity": {str(d): c for d, c in weekly}
    }


@router.get("/history")
def get_history(days: int = 30, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_workout_ids = [w.id for w in current_user.workouts]
    since = datetime.utcnow() - timedelta(days=days)
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.started_at >= since,
        WorkoutSession.workout_id.in_(user_workout_ids)
    ).order_by(WorkoutSession.started_at.desc()).all()

    return [{
        "id": s.id,
        "workout_name": s.workout.name if s.workout else "Unknown",
        "started_at": s.started_at.isoformat() if s.started_at else None,
        "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        "duration_seconds": s.duration_seconds,
        "sets_count": len(s.sets)
    } for s in sessions]