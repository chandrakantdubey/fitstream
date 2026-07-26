from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class MapRoute(Base):
    __tablename__ = "map_routes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, default="Outdoor Workout")
    activity_type = Column(String, default="Running")
    distance_km = Column(Float, default=0.0)
    duration_seconds = Column(Integer, default=0)
    avg_speed_kmh = Column(Float, default=0.0)
    calories_burned = Column(Integer, default=0)
    elevation_gain_m = Column(Float, default=0.0)
    coordinates_json = Column(Text, default="[]")
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="map_routes")
