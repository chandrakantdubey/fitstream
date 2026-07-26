from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.goal import Goal, GoalMilestone, PersonalRecord
from app.models.user import User

router = APIRouter(prefix="/goals", tags=["goals"])


class GoalIn(BaseModel):
    goal_type: str
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: str = "kg"
    exercise_id: Optional[str] = None
    target_date: Optional[datetime] = None
    title: str
    description: str = ""


class GoalMilestoneIn(BaseModel):
    title: str
    target_value: Optional[float] = None
    target_date: Optional[datetime] = None
    notes: str = ""


class PersonalRecordIn(BaseModel):
    exercise_id: str
    record_type: str
    value: float
    unit: str = "kg"
    reps: Optional[int] = None
    notes: str = ""


@router.post("")
def create_goal(data: GoalIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = Goal(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        goal_type=data.goal_type,
        target_value=data.target_value,
        current_value=data.current_value or 0,
        unit=data.unit,
        exercise_id=data.exercise_id,
        target_date=data.target_date,
        title=data.title,
        description=data.description
    )
    
    # Calculate initial progress
    if data.target_value and data.current_value:
        goal.progress_percentage = min(100, int((data.current_value / data.target_value) * 100))
    
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _format_goal(goal)


@router.get("")
def list_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).order_by(Goal.created_at.desc()).all()
    return [_format_goal(g) for g in goals]


@router.get("/active")
def get_active_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.is_active == True,
        Goal.is_completed == False
    ).order_by(Goal.target_date.asc().nulls_last()).all()
    return [_format_goal(g) for g in goals]


# Personal Records
@router.post("/records")
def create_record(data: PersonalRecordIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = PersonalRecord(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        exercise_id=data.exercise_id,
        record_type=data.record_type,
        value=data.value,
        unit=data.unit,
        reps=data.reps,
        notes=data.notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _format_record(record)


@router.get("/records")
def list_records(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(PersonalRecord).filter(
        PersonalRecord.user_id == current_user.id
    ).order_by(PersonalRecord.achieved_at.desc()).all()
    return [_format_record(r) for r in records]


@router.get("/records/exercise/{exercise_id}")
def get_exercise_records(exercise_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(PersonalRecord).filter(
        PersonalRecord.user_id == current_user.id,
        PersonalRecord.exercise_id == exercise_id
    ).order_by(PersonalRecord.achieved_at.desc()).all()
    return [_format_record(r) for r in records]


@router.get("/{goal_id}")
def get_goal(goal_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    return _format_goal(goal) if goal else {"error": "Not found"}


@router.put("/{goal_id}")
def update_goal(goal_id: str, data: GoalIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    if not goal:
        return {"error": "Not found"}
    
    goal.goal_type = data.goal_type
    goal.target_value = data.target_value
    goal.current_value = data.current_value or goal.current_value
    goal.unit = data.unit
    goal.exercise_id = data.exercise_id
    goal.target_date = data.target_date
    goal.title = data.title
    goal.description = data.description
    goal.updated_at = datetime.utcnow()
    
    # Recalculate progress
    if goal.target_value and goal.current_value:
        goal.progress_percentage = min(100, int((goal.current_value / goal.target_value) * 100))
    
    # Check if completed
    if goal.target_value and goal.current_value >= goal.target_value:
        goal.is_completed = True
        goal.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(goal)
    return _format_goal(goal)


@router.post("/{goal_id}/progress")
def update_progress(
    goal_id: str,
    current_value: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    if not goal:
        return {"error": "Not found"}
    
    goal.current_value = current_value
    goal.updated_at = datetime.utcnow()
    
    # Recalculate progress
    if goal.target_value:
        goal.progress_percentage = min(100, int((current_value / goal.target_value) * 100))
        
        # Check if completed
        if current_value >= goal.target_value:
            goal.is_completed = True
            goal.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(goal)
    return _format_goal(goal)


@router.delete("/{goal_id}")
def delete_goal(goal_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    if goal:
        db.delete(goal)
        db.commit()
    return {"deleted": True}


# Milestones
@router.post("/{goal_id}/milestones")
def create_milestone(
    goal_id: str,
    data: GoalMilestoneIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    if not goal:
        return {"error": "Goal not found"}
    
    milestone = GoalMilestone(
        id=str(uuid.uuid4()),
        goal_id=goal_id,
        title=data.title,
        target_value=data.target_value,
        target_date=data.target_date,
        notes=data.notes
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return _format_milestone(milestone)


@router.put("/milestones/{milestone_id}/complete")
def complete_milestone(
    milestone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    milestone = db.query(GoalMilestone).join(Goal).filter(
        GoalMilestone.id == milestone_id,
        Goal.user_id == current_user.id
    ).first()
    if not milestone:
        return {"error": "Not found"}
    
    milestone.is_completed = True
    milestone.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(milestone)
    return _format_milestone(milestone)


def _format_goal(g):
    return {
        "id": g.id,
        "user_id": g.user_id,
        "goal_type": g.goal_type,
        "target_value": g.target_value,
        "current_value": g.current_value,
        "unit": g.unit,
        "exercise_id": g.exercise_id,
        "target_date": g.target_date.isoformat() if g.target_date else None,
        "start_date": g.start_date.isoformat() if g.start_date else None,
        "is_active": g.is_active,
        "is_completed": g.is_completed,
        "completed_at": g.completed_at.isoformat() if g.completed_at else None,
        "progress_percentage": g.progress_percentage,
        "title": g.title,
        "description": g.description,
        "created_at": g.created_at.isoformat() if g.created_at else None,
        "updated_at": g.updated_at.isoformat() if g.updated_at else None,
        "milestones": [_format_milestone(m) for m in g.milestones] if g.milestones else []
    }


def _format_milestone(m):
    return {
        "id": m.id,
        "goal_id": m.goal_id,
        "title": m.title,
        "target_value": m.target_value,
        "target_date": m.target_date.isoformat() if m.target_date else None,
        "is_completed": m.is_completed,
        "completed_at": m.completed_at.isoformat() if m.completed_at else None,
        "notes": m.notes,
        "created_at": m.created_at.isoformat() if m.created_at else None
    }


def _format_record(r):
    return {
        "id": r.id,
        "user_id": r.user_id,
        "exercise_id": r.exercise_id,
        "record_type": r.record_type,
        "value": r.value,
        "unit": r.unit,
        "reps": r.reps,
        "notes": r.notes,
        "achieved_at": r.achieved_at.isoformat() if r.achieved_at else None,
        "exercise": {
            "id": r.exercise.id,
            "name": r.exercise.name
        } if r.exercise else None
    }
