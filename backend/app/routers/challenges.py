import json
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.challenge import UserChallenge

router = APIRouter(prefix="/challenges", tags=["30-Day Challenges"])

CHALLENGES_CATALOG = [
    {
        "id": "abs-30",
        "title": "Six Pack Abs in 30 Days",
        "category": "Abs & Core",
        "difficulty": "Beginner to Advanced",
        "duration_days": 30,
        "description": "30-Day progressive core sculptor targeting upper abs, lower abs, obliques, and deep transverse abdominis.",
        "icon": "fire"
    },
    {
        "id": "arms-30",
        "title": "Arm Sculpt & Strength 30 Days",
        "category": "Arms & Shoulders",
        "difficulty": "Intermediate",
        "duration_days": 30,
        "description": "Build defined biceps, firm triceps, and sculpted shoulders with progressive bodyweight & dumbbell routines.",
        "icon": "bicep"
    },
    {
        "id": "legs-30",
        "title": "Leg & Glute Builder 30 Days",
        "category": "Legs & Glutes",
        "difficulty": "Beginner to Intermediate",
        "duration_days": 30,
        "description": "Strengthen quads, hamstrings, glutes, and calves with progressive squats, lunges, and plyometrics.",
        "icon": "leg"
    },
    {
        "id": "fullbody-30",
        "title": "Full Body HIIT Fat Burn 30 Days",
        "category": "Full Body",
        "difficulty": "Advanced",
        "duration_days": 30,
        "description": "High-intensity metabolic conditioning designed to maximize calorie burn, endurance, and full-body tone.",
        "icon": "lightning"
    }
]

# Generate specific, progressive 30-day routines for each challenge type
def get_daily_routine_spec(challenge_id: str, day: int):
    is_rest = (day % 4 == 0)
    if is_rest:
        return {
            "title": f"Day {day}: Active Recovery & Stretch",
            "is_rest": True,
            "exercises": [
                {"name": "Cobra Stretch", "reps": "45 sec", "sets": 2},
                {"name": "Child's Pose", "reps": "60 sec", "sets": 2},
                {"name": "Cat-Cow Spine Warmup", "reps": "45 sec", "sets": 2}
            ]
        }

    # Intensity scaling multiplier over 30 days
    set_count = 3 if day < 15 else 4
    
    if challenge_id == "abs-30":
        if day <= 3:
            return {
                "title": f"Day {day}: Upper Ab Activation",
                "is_rest": False,
                "exercises": [
                    {"name": "Ab Crunches", "reps": f"{12 + day * 2} reps", "sets": set_count},
                    {"name": "Heel Touches", "reps": f"{16 + day * 2} reps", "sets": set_count},
                    {"name": "Forearm Plank", "reps": f"{20 + day * 5} sec", "sets": set_count}
                ]
            }
        elif day <= 7:
            return {
                "title": f"Day {day}: Lower Ab Focus",
                "is_rest": False,
                "exercises": [
                    {"name": "Lying Leg Raises", "reps": f"{10 + day} reps", "sets": set_count},
                    {"name": "Scissors Kicks", "reps": f"{20 + day} reps", "sets": set_count},
                    {"name": "Mountain Climbers", "reps": f"{20 + day * 2} reps", "sets": set_count}
                ]
            }
        elif day <= 11:
            return {
                "title": f"Day {day}: Oblique & Rotational Burn",
                "is_rest": False,
                "exercises": [
                    {"name": "Russian Twists", "reps": f"{16 + day} reps", "sets": set_count},
                    {"name": "Bicycle Crunches", "reps": f"{14 + day} reps", "sets": set_count},
                    {"name": "Side Plank Hold", "reps": f"{20 + day * 2} sec per side", "sets": set_count}
                ]
            }
        elif day <= 15:
            return {
                "title": f"Day {day}: Mid-Point Core Challenge",
                "is_rest": False,
                "exercises": [
                    {"name": "Ab Crunches", "reps": f"{18 + day} reps", "sets": set_count},
                    {"name": "Plank Hip Dips", "reps": f"{16 + day} reps", "sets": set_count},
                    {"name": "V-Up Crunches", "reps": f"{10 + day} reps", "sets": set_count}
                ]
            }
        elif day <= 23:
            return {
                "title": f"Day {day}: Deep Transverse Core Burn",
                "is_rest": False,
                "exercises": [
                    {"name": "Flutter Kicks", "reps": f"{30 + day * 2} sec", "sets": set_count},
                    {"name": "Bicycle Crunches", "reps": f"{20 + day} reps", "sets": set_count},
                    {"name": "High Plank to Low Plank", "reps": f"{12 + day} reps", "sets": set_count},
                    {"name": "Jackknife Sit-ups", "reps": f"{12 + day} reps", "sets": set_count}
                ]
            }
        else:
            return {
                "title": f"Day {day}: 30-Day Core Graduation Circuit",
                "is_rest": False,
                "exercises": [
                    {"name": "Ab Crunches", "reps": "25 reps", "sets": 4},
                    {"name": "Lying Leg Raises", "reps": "15 reps", "sets": 4},
                    {"name": "Russian Twists", "reps": "30 reps", "sets": 4},
                    {"name": "Forearm Plank", "reps": "60 sec", "sets": 4}
                ]
            }

    elif challenge_id == "arms-30":
        if day <= 7:
            return {
                "title": f"Day {day}: Tricep & Push-up Foundations",
                "is_rest": False,
                "exercises": [
                    {"name": "Standard Push-ups", "reps": f"{8 + day * 2} reps", "sets": set_count},
                    {"name": "Chair Tricep Dips", "reps": f"{10 + day * 2} reps", "sets": set_count},
                    {"name": "Arm Circles", "reps": "30 sec", "sets": set_count}
                ]
            }
        elif day <= 15:
            return {
                "title": f"Day {day}: Bicep & Shoulder Sculpt",
                "is_rest": False,
                "exercises": [
                    {"name": "Diamond Push-ups", "reps": f"{8 + day} reps", "sets": set_count},
                    {"name": "Pike Push-ups", "reps": f"{8 + day} reps", "sets": set_count},
                    {"name": "Doorframe Bicep Pulls", "reps": f"{12 + day} reps", "sets": set_count}
                ]
            }
        else:
            return {
                "title": f"Day {day}: Arm Strength Power Circuit",
                "is_rest": False,
                "exercises": [
                    {"name": "Decline Push-ups", "reps": f"{12 + day} reps", "sets": 4},
                    {"name": "Tricep Dips", "reps": f"{15 + day} reps", "sets": 4},
                    {"name": "Pike Push-ups", "reps": f"{10 + day} reps", "sets": 4},
                    {"name": "Plank Push-ups", "reps": "12 reps", "sets": 4}
                ]
            }

    elif challenge_id == "legs-30":
        if day <= 7:
            return {
                "title": f"Day {day}: Quad & Glute Activation",
                "is_rest": False,
                "exercises": [
                    {"name": "Air Squats", "reps": f"{15 + day * 2} reps", "sets": set_count},
                    {"name": "Glute Bridges", "reps": f"{15 + day * 2} reps", "sets": set_count},
                    {"name": "Calf Raises", "reps": f"{20 + day * 2} reps", "sets": set_count}
                ]
            }
        elif day <= 15:
            return {
                "title": f"Day {day}: Lunges & Hamstring Burn",
                "is_rest": False,
                "exercises": [
                    {"name": "Forward Lunges", "reps": f"{10 + day} per leg", "sets": set_count},
                    {"name": "Sumo Squats", "reps": f"{15 + day} reps", "sets": set_count},
                    {"name": "Wall Sit Hold", "reps": f"{30 + day * 3} sec", "sets": set_count}
                ]
            }
        else:
            return {
                "title": f"Day {day}: Leg Power & Plyometrics",
                "is_rest": False,
                "exercises": [
                    {"name": "Squat Jumps", "reps": "15 reps", "sets": 4},
                    {"name": "Reverse Lunges", "reps": "14 per leg", "sets": 4},
                    {"name": "Single-Leg Glute Bridges", "reps": "12 per leg", "sets": 4},
                    {"name": "Wall Sit", "reps": "60 sec", "sets": 4}
                ]
            }

    else: # fullbody-30
        return {
            "title": f"Day {day}: Full Body Metabolic Conditioning",
            "is_rest": False,
            "exercises": [
                {"name": "Jumping Jacks", "reps": "45 sec", "sets": set_count},
                {"name": "Burpees", "reps": f"{8 + (day // 3)} reps", "sets": set_count},
                {"name": "High Knees", "reps": "30 sec", "sets": set_count},
                {"name": "Push-up to Plank", "reps": "10 reps", "sets": set_count}
            ]
        }

class ChallengeStartReq(BaseModel):
    user_id: str = "1"
    challenge_id: str

class CompleteDayReq(BaseModel):
    user_id: str = "1"
    challenge_id: str
    day_number: int

@router.get("/catalog")
def get_challenges_catalog():
    return CHALLENGES_CATALOG

@router.get("/user")
def get_user_challenges(user_id: str = "1", db: Session = Depends(get_db)):
    active = db.query(UserChallenge).filter(UserChallenge.user_id == str(user_id)).all()
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
    template = next((c for c in CHALLENGES_CATALOG if c["id"] == req.challenge_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Challenge template not found")
    
    existing = db.query(UserChallenge).filter(
        UserChallenge.user_id == str(req.user_id),
        UserChallenge.challenge_id == req.challenge_id
    ).first()

    if not existing:
        existing = UserChallenge(
            user_id=str(req.user_id),
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
        UserChallenge.user_id == str(req.user_id),
        UserChallenge.challenge_id == req.challenge_id
    ).first()

    if not ch:
        template = next((c for c in CHALLENGES_CATALOG if c["id"] == req.challenge_id), None)
        title = template["title"] if template else "Challenge"
        ch = UserChallenge(
            user_id=str(req.user_id),
            challenge_id=req.challenge_id,
            title=title,
            start_date=date.today(),
            current_day=1,
            completed_days="[]"
        )
        db.add(ch)
        db.commit()

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
def get_challenge_details(challenge_id: str, user_id: str = "1", db: Session = Depends(get_db)):
    template = next((c for c in CHALLENGES_CATALOG if c["id"] == challenge_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Challenge template not found")
    
    ch = db.query(UserChallenge).filter(
        UserChallenge.user_id == str(user_id),
        UserChallenge.challenge_id == challenge_id
    ).first()

    completed_days = json.loads(ch.completed_days or "[]") if ch else []
    current_day = ch.current_day if ch else 1

    schedule = []
    for day in range(1, 31):
        routine_spec = get_daily_routine_spec(challenge_id, day)
        schedule.append({
            "day": day,
            "title": routine_spec["title"],
            "is_rest": routine_spec["is_rest"],
            "is_completed": day in completed_days,
            "is_current": day == current_day,
            "exercises": routine_spec["exercises"]
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
