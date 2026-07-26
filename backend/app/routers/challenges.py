import json
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.challenge import UserChallenge

router = APIRouter(prefix="/challenges", tags=["30-Day Challenges"])

# Pre-defined Leap-Fitness style 30-day challenges templates
CHALLENGES_CATALOG = [
    {
        "id": "abs-30",
        "title": "Six Pack Abs in 30 Days",
        "category": "Abs & Core",
        "difficulty": "Beginner",
        "duration_days": 30,
        "description": "Progressive core sculptor targeting upper/lower abs and obliques with zero equipment required.",
        "icon": "fire",
        "routine_template": [
            {"name": "Crunches", "reps": "15 reps", "sets": 3},
            {"name": "Plank", "reps": "30 sec", "sets": 3},
            {"name": "Leg Raises", "reps": "12 reps", "sets": 3},
            {"name": "Mountain Climbers", "reps": "20 reps", "sets": 3},
            {"name": "Russian Twists", "reps": "20 reps", "sets": 3}
        ]
    },
    {
        "id": "arms-30",
        "title": "Arm Sculpt & Strength 30 Days",
        "category": "Arms & Shoulders",
        "difficulty": "Intermediate",
        "duration_days": 30,
        "description": "Build toned biceps, triceps, and shoulders with progressive bodyweight & dumbbell exercises.",
        "icon": "bicep",
        "routine_template": [
            {"name": "Push-ups", "reps": "12 reps", "sets": 3},
            {"name": "Tricep Dips", "reps": "12 reps", "sets": 3},
            {"name": "Diamond Push-ups", "reps": "10 reps", "sets": 3},
            {"name": "Arm Circles", "reps": "30 sec", "sets": 2},
            {"name": "Pike Push-ups", "reps": "10 reps", "sets": 3}
        ]
    },
    {
        "id": "legs-30",
        "title": "Leg & Glute Builder 30 Days",
        "category": "Legs & Glutes",
        "difficulty": "Beginner",
        "duration_days": 30,
        "description": "Strengthen quads, hamstrings, and glutes with progressive squats, lunges, and calf raises.",
        "icon": "leg",
        "routine_template": [
            {"name": "Air Squats", "reps": "20 reps", "sets": 3},
            {"name": "Forward Lunges", "reps": "12 per leg", "sets": 3},
            {"name": "Glute Bridges", "reps": "15 reps", "sets": 3},
            {"name": "Wall Sit", "reps": "45 sec", "sets": 3},
            {"name": "Calf Raises", "reps": "25 reps", "sets": 3}
        ]
    },
    {
        "id": "fullbody-30",
        "title": "Full Body HIIT Fat Burn",
        "category": "Full Body",
        "difficulty": "Advanced",
        "duration_days": 30,
        "description": "High-intensity metabolic conditioning designed to maximize calorie burn and endurance.",
        "icon": "lightning",
        "routine_template": [
            {"name": "Jumping Jacks", "reps": "45 sec", "sets": 3},
            {"name": "Burpees", "reps": "10 reps", "sets": 3},
            {"name": "High Knees", "reps": "30 sec", "sets": 3},
            {"name": "Push-up to Plank", "reps": "10 reps", "sets": 3},
            {"name": "Squat Jumps", "reps": "12 reps", "sets": 3}
        ]
    }
]

class ChallengeStartReq(BaseModel):
    user_id: int = 1
    challenge_id: str

class CompleteDayReq(BaseModel):
    user_id: int = 1
    challenge_id: str
    day_number: int

@router.get("/catalog")
def get_challenges_catalog():
    return CHALLENGES_CATALOG

@router.get("/user")
def get_user_challenges(user_id: int = 1, db: Session = Depends(get_db)):
    active = db.query(UserChallenge).filter(UserChallenge.user_id == user_id).all()
    results = []
    for ch in active:
        completed_days_list = json.loads(ch.completed_days or "[]")
        results.append({
            "id": ch.id,
            "challenge_id": ch.challenge_id,
            "title": ch.title,
            "category": ch.category,
            "difficulty": ch.difficulty,
            "start_date": str(ch.start_date),
            "current_day": ch.current_day,
            "completed_days": completed_days_list,
            "progress_percent": round((len(completed_days_list) / 30) * 100),
            "is_completed": ch.is_completed
        })
    return results

@router.post("/start")
def start_challenge(req: ChallengeStartReq, db: Session = Depends(get_db)):
    # Find catalog template
    template = next((c for c in CHALLENGES_CATALOG if c["id"] == req.challenge_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Challenge template not found")
    
    existing = db.query(UserChallenge).filter(
        UserChallenge.user_id == req.user_id,
        UserChallenge.challenge_id == req.challenge_id
    ).first()

    if not existing:
        existing = UserChallenge(
            user_id=req.user_id,
            challenge_id=req.challenge_id,
            title=template["title"],
            category=template["category"],
            difficulty=template["difficulty"],
            start_date=date.today(),
            current_day=1,
            completed_days="[]",
            is_completed=False
        )
        db.add(existing)
        db.commit()
        db.refresh(existing)
    
    return {"message": "Challenge started", "challenge_id": existing.challenge_id}

@router.post("/complete-day")
def complete_challenge_day(req: CompleteDayReq, db: Session = Depends(get_db)):
    ch = db.query(UserChallenge).filter(
        UserChallenge.user_id == req.user_id,
        UserChallenge.challenge_id == req.challenge_id
    ).first()

    if not ch:
        raise HTTPException(status_code=404, detail="Active user challenge not found")

    completed_days_list = json.loads(ch.completed_days or "[]")
    if req.day_number not in completed_days_list:
        completed_days_list.append(req.day_number)
        ch.completed_days = json.dumps(sorted(completed_days_list))
    
    if req.day_number >= ch.current_day and req.day_number < 30:
        ch.current_day = req.day_number + 1
    
    if len(completed_days_list) >= 30:
        ch.is_completed = True
    
    db.commit()
    return {
        "message": f"Day {req.day_number} completed!",
        "current_day": ch.current_day,
        "completed_days": completed_days_list,
        "is_completed": ch.is_completed
    }

@router.get("/details/{challenge_id}")
def get_challenge_details(challenge_id: str, user_id: int = 1, db: Session = Depends(get_db)):
    template = next((c for c in CHALLENGES_CATALOG if c["id"] == challenge_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Challenge template not found")
    
    ch = db.query(UserChallenge).filter(
        UserChallenge.user_id == user_id,
        UserChallenge.challenge_id == challenge_id
    ).first()

    completed_days = json.loads(ch.completed_days or "[]") if ch else []
    current_day = ch.current_day if ch else 1

    # Generate 30 day schedule where days 4, 8, 12, 16, 20, 24, 28 are REST days
    schedule = []
    for day in range(1, 31):
        is_rest = (day % 4 == 0)
        # Intensity scaling factor (1.0 to 1.5 multiplier over 30 days)
        scale = 1.0 + (day / 60.0)
        exercises = []
        if not is_rest:
            for ex in template["routine_template"]:
                exercises.append({
                    "name": ex["name"],
                    "sets": ex["sets"],
                    "reps": ex["reps"]
                })

        schedule.append({
            "day": day,
            "is_rest": is_rest,
            "is_completed": day in completed_days,
            "is_current": day == current_day,
            "exercises": exercises
        })

    return {
        "template": template,
        "user_progress": {
            "current_day": current_day,
            "completed_days": completed_days,
            "is_completed": ch.is_completed if ch else False,
            "started": ch is not None
        },
        "schedule": schedule
    }
