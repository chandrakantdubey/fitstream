from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.exercise import Exercise

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("")
def list_exercises(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    equipment: Optional[str] = Query(None),
    target: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=2000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Exercise)

    if q:
        q = q.lower()
        query = query.filter(
            (Exercise.name.ilike(f"%{q}%")) |
            (Exercise.target.ilike(f"%{q}%")) |
            (Exercise.muscle_group.ilike(f"%{q}%"))
        )

    if category:
        query = query.filter(Exercise.category.ilike(category))
    if equipment:
        query = query.filter(Exercise.equipment.ilike(equipment))
    if target:
        query = query.filter(Exercise.target.ilike(target))

    total = query.count()
    items = query.offset(offset).limit(limit).all()

    return {
        "items": [{
            "id": e.id, "name": e.name, "category": e.category,
            "body_part": e.body_part, "equipment": e.equipment,
            "target": e.target, "muscle_group": e.muscle_group,
            "secondary_muscles": e.secondary_muscles,
            "instructions": e.instructions, "media_id": e.media_id
        } for e in items],
        "total": total, "limit": limit, "offset": offset
    }


@router.get("/{exercise_id}")
def get_exercise(exercise_id: str, db: Session = Depends(get_db)):
    e = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not e:
        return {"error": "Not found"}
    return {
        "id": e.id, "name": e.name, "category": e.category,
        "body_part": e.body_part, "equipment": e.equipment,
        "target": e.target, "muscle_group": e.muscle_group,
        "secondary_muscles": e.secondary_muscles,
        "instructions": e.instructions, "media_id": e.media_id
    }


@router.get("/filters/all")
def get_filters(db: Session = Depends(get_db)):
    return {
        "categories": sorted([r[0] for r in db.query(Exercise.category).distinct().all()]),
        "equipment": sorted([r[0] for r in db.query(Exercise.equipment).distinct().all()]),
        "targets": sorted([r[0] for r in db.query(Exercise.target).distinct().all()]),
        "total_exercises": db.query(Exercise).count()
    }