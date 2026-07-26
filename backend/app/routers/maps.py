import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.map_route import MapRoute

router = APIRouter(prefix="/maps", tags=["GPS Outdoor Maps Tracker"])

class CoordinatePoint(BaseModel):
    lat: float
    lng: float
    timestamp: Optional[str] = None
    speed_kmh: Optional[float] = None

class SaveMapRouteReq(BaseModel):
    user_id: int = 1
    title: str = "Outdoor Workout"
    activity_type: str = "Running" # Running, Cycling, Walking
    distance_km: float
    duration_seconds: int
    avg_speed_kmh: float
    calories_burned: int
    elevation_gain_m: float = 0.0
    coordinates: List[CoordinatePoint]
    notes: Optional[str] = None

@router.post("/route")
def save_map_route(req: SaveMapRouteReq, db: Session = Depends(get_db)):
    coords_json = json.dumps([p.dict() for p in req.coordinates])
    route = MapRoute(
        user_id=req.user_id,
        title=req.title,
        activity_type=req.activity_type,
        distance_km=req.distance_km,
        duration_seconds=req.duration_seconds,
        avg_speed_kmh=req.avg_speed_kmh,
        calories_burned=req.calories_burned,
        elevation_gain_m=req.elevation_gain_m,
        coordinates_json=coords_json,
        notes=req.notes
    )
    db.add(route)
    db.commit()
    db.refresh(route)

    return {
        "id": route.id,
        "title": route.title,
        "activity_type": route.activity_type,
        "distance_km": route.distance_km,
        "duration_seconds": route.duration_seconds,
        "created_at": str(route.created_at)
    }

@router.get("/routes")
def get_map_routes(user_id: int = 1, limit: int = 20, db: Session = Depends(get_db)):
    routes = db.query(MapRoute).filter(MapRoute.user_id == user_id).order_by(MapRoute.created_at.desc()).limit(limit).all()
    results = []
    for r in routes:
        coords = json.loads(r.coordinates_json or "[]")
        results.append({
            "id": r.id,
            "title": r.title,
            "activity_type": r.activity_type,
            "distance_km": r.distance_km,
            "duration_seconds": r.duration_seconds,
            "avg_speed_kmh": r.avg_speed_kmh,
            "calories_burned": r.calories_burned,
            "elevation_gain_m": r.elevation_gain_m,
            "point_count": len(coords),
            "created_at": str(r.created_at)
        })
    return results

@router.get("/routes/{route_id}")
def get_map_route_detail(route_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    route = db.query(MapRoute).filter(MapRoute.id == route_id, MapRoute.user_id == user_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    return {
        "id": route.id,
        "title": route.title,
        "activity_type": route.activity_type,
        "distance_km": route.distance_km,
        "duration_seconds": route.duration_seconds,
        "avg_speed_kmh": route.avg_speed_kmh,
        "calories_burned": route.calories_burned,
        "elevation_gain_m": route.elevation_gain_m,
        "coordinates": json.loads(route.coordinates_json or "[]"),
        "notes": route.notes,
        "created_at": str(route.created_at)
    }

@router.delete("/routes/{route_id}")
def delete_map_route(route_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    route = db.query(MapRoute).filter(MapRoute.id == route_id, MapRoute.user_id == user_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    db.delete(route)
    db.commit()
    return {"message": "Route deleted"}
