from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.program import Program, ProgramWeek, ProgramDay, ProgramExercise, UserProgram
from app.models.user import User

router = APIRouter(prefix="/programs", tags=["programs"])


class ProgramExerciseIn(BaseModel):
    exercise_id: str
    order_index: int = 0
    target_sets: int = 3
    target_reps: str = "10"
    rest_seconds: int = 60
    notes: str = ""


class ProgramDayIn(BaseModel):
    day_number: int
    name: str = "Day"
    workout_type: str = "workout"
    description: str = ""
    exercises: List[ProgramExerciseIn] = []


class ProgramWeekIn(BaseModel):
    week_number: int
    name: str = "Week"
    description: str = ""
    days: List[ProgramDayIn] = []


class ProgramIn(BaseModel):
    name: str
    description: str = ""
    difficulty: str = "intermediate"
    duration_weeks: int = 4
    category: str = "strength"
    is_public: bool = False
    weeks: List[ProgramWeekIn] = []


class UserProgramIn(BaseModel):
    program_id: str


@router.post("")
def create_program(data: ProgramIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    program = Program(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=data.name,
        description=data.description,
        difficulty=data.difficulty,
        duration_weeks=data.duration_weeks,
        category=data.category,
        is_public=data.is_public,
        is_template=True
    )
    db.add(program)
    db.flush()

    for week_in in data.weeks:
        week = ProgramWeek(
            id=str(uuid.uuid4()),
            program_id=program.id,
            week_number=week_in.week_number,
            name=week_in.name,
            description=week_in.description
        )
        db.add(week)
        db.flush()

        for day_in in week_in.days:
            day = ProgramDay(
                id=str(uuid.uuid4()),
                week_id=week.id,
                day_number=day_in.day_number,
                name=day_in.name,
                workout_type=day_in.workout_type,
                description=day_in.description
            )
            db.add(day)
            db.flush()

            for ex_in in day_in.exercises:
                ex = ProgramExercise(
                    id=str(uuid.uuid4()),
                    day_id=day.id,
                    exercise_id=ex_in.exercise_id,
                    order_index=ex_in.order_index,
                    target_sets=ex_in.target_sets,
                    target_reps=ex_in.target_reps,
                    rest_seconds=ex_in.rest_seconds,
                    notes=ex_in.notes
                )
                db.add(ex)

    db.commit()
    db.refresh(program)
    return _format_program(program)


@router.get("")
def list_programs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # User's private programs + public templates
    programs = db.query(Program).filter(
        (Program.user_id == current_user.id) | (Program.is_public == True)
    ).order_by(Program.created_at.desc()).all()
    return [_format_program(p) for p in programs]


@router.get("/{program_id}")
def get_program(program_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    program = db.query(Program).filter(
        Program.id == program_id,
        (Program.user_id == current_user.id) | (Program.is_public == True)
    ).first()
    return _format_program(program) if program else {"error": "Not found"}


@router.delete("/{program_id}")
def delete_program(program_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    program = db.query(Program).filter(
        Program.id == program_id,
        Program.user_id == current_user.id
    ).first()
    if program:
        db.delete(program)
        db.commit()
    return {"deleted": True}


# User Programs (enrolled programs)
@router.post("/enroll")
def enroll_program(data: UserProgramIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if program exists
    program = db.query(Program).filter(Program.id == data.program_id).first()
    if not program:
        return {"error": "Program not found"}
    
    # Check if already enrolled
    existing = db.query(UserProgram).filter(
        UserProgram.user_id == current_user.id,
        UserProgram.program_id == data.program_id,
        UserProgram.is_active == True
    ).first()
    if existing:
        return {"error": "Already enrolled in this program"}
    
    user_program = UserProgram(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        program_id=data.program_id,
        start_date=datetime.utcnow(),
        current_week=1,
        current_day=1,
        is_active=True
    )
    db.add(user_program)
    db.commit()
    db.refresh(user_program)
    return _format_user_program(user_program)


@router.get("/enrolled/active")
def get_active_program(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_program = db.query(UserProgram).filter(
        UserProgram.user_id == current_user.id,
        UserProgram.is_active == True
    ).first()
    return _format_user_program(user_program) if user_program else None


@router.put("/enrolled/{user_program_id}/progress")
def update_progress(
    user_program_id: str,
    week: int,
    day: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_program = db.query(UserProgram).filter(
        UserProgram.id == user_program_id,
        UserProgram.user_id == current_user.id
    ).first()
    if not user_program:
        return {"error": "Not found"}
    
    user_program.current_week = week
    user_program.current_day = day
    
    # Check if program completed
    program = db.query(Program).filter(Program.id == user_program.program_id).first()
    if program and week > program.duration_weeks:
        user_program.is_active = False
        user_program.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user_program)
    return _format_user_program(user_program)


@router.delete("/enrolled/{user_program_id}")
def leave_program(user_program_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_program = db.query(UserProgram).filter(
        UserProgram.id == user_program_id,
        UserProgram.user_id == current_user.id
    ).first()
    if user_program:
        user_program.is_active = False
        db.commit()
    return {"left": True}


def _format_program(p):
    return {
        "id": p.id,
        "user_id": p.user_id,
        "name": p.name,
        "description": p.description,
        "difficulty": p.difficulty,
        "duration_weeks": p.duration_weeks,
        "category": p.category,
        "is_public": p.is_public,
        "is_template": p.is_template,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "weeks": [_format_week(w) for w in p.weeks] if p.weeks else []
    }


def _format_week(w):
    return {
        "id": w.id,
        "week_number": w.week_number,
        "name": w.name,
        "description": w.description,
        "days": [_format_day(d) for d in w.days] if w.days else []
    }


def _format_day(d):
    return {
        "id": d.id,
        "day_number": d.day_number,
        "name": d.name,
        "workout_type": d.workout_type,
        "description": d.description,
        "exercises": [_format_exercise(e) for e in d.exercises] if d.exercises else []
    }


def _format_exercise(e):
    return {
        "id": e.id,
        "exercise_id": e.exercise_id,
        "order_index": e.order_index,
        "target_sets": e.target_sets,
        "target_reps": e.target_reps,
        "rest_seconds": e.rest_seconds,
        "notes": e.notes,
        "exercise": {
            "id": e.exercise.id,
            "name": e.exercise.name,
            "category": e.exercise.category,
            "equipment": e.exercise.equipment
        } if e.exercise else None
    }


def _format_user_program(up):
    return {
        "id": up.id,
        "user_id": up.user_id,
        "program_id": up.program_id,
        "start_date": up.start_date.isoformat() if up.start_date else None,
        "current_week": up.current_week,
        "current_day": up.current_day,
        "is_active": up.is_active,
        "completed_at": up.completed_at.isoformat() if up.completed_at else None,
        "program": _format_program(up.program) if up.program else None
    }
