from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.body_metric import BodyMetric
from app.models.user import User

router = APIRouter(prefix="/body-metrics", tags=["body-metrics"])


class BodyMetricIn(BaseModel):
    date: Optional[datetime] = None
    weight_kg: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hips_cm: Optional[float] = None
    biceps_cm: Optional[float] = None
    thighs_cm: Optional[float] = None
    calves_cm: Optional[float] = None
    neck_cm: Optional[float] = None
    shoulders_cm: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    muscle_mass_kg: Optional[float] = None
    front_photo_url: Optional[str] = None
    side_photo_url: Optional[str] = None
    back_photo_url: Optional[str] = None
    notes: str = ""


@router.post("")
def create_metric(data: BodyMetricIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    metric = BodyMetric(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        date=data.date or datetime.utcnow(),
        weight_kg=data.weight_kg,
        chest_cm=data.chest_cm,
        waist_cm=data.waist_cm,
        hips_cm=data.hips_cm,
        biceps_cm=data.biceps_cm,
        thighs_cm=data.thighs_cm,
        calves_cm=data.calves_cm,
        neck_cm=data.neck_cm,
        shoulders_cm=data.shoulders_cm,
        body_fat_percentage=data.body_fat_percentage,
        muscle_mass_kg=data.muscle_mass_kg,
        front_photo_url=data.front_photo_url,
        side_photo_url=data.side_photo_url,
        back_photo_url=data.back_photo_url,
        notes=data.notes
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return _format_metric(metric)


@router.get("")
def list_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    metrics = db.query(BodyMetric).filter(
        BodyMetric.user_id == current_user.id
    ).order_by(BodyMetric.date.desc()).all()
    return [_format_metric(m) for m in metrics]


@router.get("/{metric_id}")
def get_metric(metric_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    metric = db.query(BodyMetric).filter(
        BodyMetric.id == metric_id,
        BodyMetric.user_id == current_user.id
    ).first()
    return _format_metric(metric) if metric else {"error": "Not found"}


@router.put("/{metric_id}")
def update_metric(metric_id: str, data: BodyMetricIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    metric = db.query(BodyMetric).filter(
        BodyMetric.id == metric_id,
        BodyMetric.user_id == current_user.id
    ).first()
    if not metric:
        return {"error": "Not found"}
    
    if data.date is not None:
        metric.date = data.date
    if data.weight_kg is not None:
        metric.weight_kg = data.weight_kg
    if data.chest_cm is not None:
        metric.chest_cm = data.chest_cm
    if data.waist_cm is not None:
        metric.waist_cm = data.waist_cm
    if data.hips_cm is not None:
        metric.hips_cm = data.hips_cm
    if data.biceps_cm is not None:
        metric.biceps_cm = data.biceps_cm
    if data.thighs_cm is not None:
        metric.thighs_cm = data.thighs_cm
    if data.calves_cm is not None:
        metric.calves_cm = data.calves_cm
    if data.neck_cm is not None:
        metric.neck_cm = data.neck_cm
    if data.shoulders_cm is not None:
        metric.shoulders_cm = data.shoulders_cm
    if data.body_fat_percentage is not None:
        metric.body_fat_percentage = data.body_fat_percentage
    if data.muscle_mass_kg is not None:
        metric.muscle_mass_kg = data.muscle_mass_kg
    if data.front_photo_url is not None:
        metric.front_photo_url = data.front_photo_url
    if data.side_photo_url is not None:
        metric.side_photo_url = data.side_photo_url
    if data.back_photo_url is not None:
        metric.back_photo_url = data.back_photo_url
    if data.notes is not None:
        metric.notes = data.notes
    
    db.commit()
    db.refresh(metric)
    return _format_metric(metric)


@router.delete("/{metric_id}")
def delete_metric(metric_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    metric = db.query(BodyMetric).filter(
        BodyMetric.id == metric_id,
        BodyMetric.user_id == current_user.id
    ).first()
    if metric:
        db.delete(metric)
        db.commit()
    return {"deleted": True}


@router.get("/summary/weight")
def get_weight_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    metrics = db.query(BodyMetric).filter(
        BodyMetric.user_id == current_user.id,
        BodyMetric.weight_kg.isnot(None)
    ).order_by(BodyMetric.date.asc()).all()
    
    if not metrics:
        return {"current": None, "change": None, "trend": []}
    
    weights = [{"date": m.date.isoformat(), "weight": m.weight_kg} for m in metrics]
    current = metrics[-1].weight_kg
    change = current - metrics[0].weight_kg if len(metrics) > 1 else 0
    
    return {
        "current": current,
        "change": round(change, 2),
        "trend": weights
    }


def _format_metric(m):
    return {
        "id": m.id,
        "user_id": m.user_id,
        "date": m.date.isoformat() if m.date else None,
        "weight_kg": m.weight_kg,
        "chest_cm": m.chest_cm,
        "waist_cm": m.waist_cm,
        "hips_cm": m.hips_cm,
        "biceps_cm": m.biceps_cm,
        "thighs_cm": m.thighs_cm,
        "calves_cm": m.calves_cm,
        "neck_cm": m.neck_cm,
        "shoulders_cm": m.shoulders_cm,
        "body_fat_percentage": m.body_fat_percentage,
        "muscle_mass_kg": m.muscle_mass_kg,
        "front_photo_url": m.front_photo_url,
        "side_photo_url": m.side_photo_url,
        "back_photo_url": m.back_photo_url,
        "notes": m.notes,
        "created_at": m.created_at.isoformat() if m.created_at else None
    }
