from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.progress import DailyProgress
from app.models.workout import WorkoutSession, SessionSet

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_sessions = db.query(WorkoutSession).count()
    completed_sessions = db.query(WorkoutSession).filter(WorkoutSession.completed_at != None).count()
    total_sets = db.query(SessionSet).count()

    # Last 7 days activity
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly = db.query(func.date(WorkoutSession.started_at), func.count()).filter(
        WorkoutSession.started_at >= week_ago
    ).group_by(func.date(WorkoutSession.started_at)).all()

    # Total volume
    total_volume = db.query(func.sum(SessionSet.weight_kg * SessionSet.reps_completed)).scalar() or 0

    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "total_sets": total_sets,
        "total_volume": round(total_volume, 2),
        "weekly_activity": {str(d): c for d, c in weekly}
    }


@router.get("/history")
def get_history(days: int = 30, db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=days)
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.started_at >= since
    ).order_by(WorkoutSession.started_at.desc()).all()

    return [{
        "id": s.id,
        "workout_name": s.workout.name if s.workout else "Unknown",
        "started_at": s.started_at.isoformat() if s.started_at else None,
        "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        "duration_seconds": s.duration_seconds,
        "sets_count": len(s.sets)
    } for s in sessions]