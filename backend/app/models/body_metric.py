from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class BodyMetric(Base):
    __tablename__ = "body_metrics"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Weight
    weight_kg = Column(Float, nullable=True)
    
    # Body measurements (cm)
    chest_cm = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    hips_cm = Column(Float, nullable=True)
    biceps_cm = Column(Float, nullable=True)
    thighs_cm = Column(Float, nullable=True)
    calves_cm = Column(Float, nullable=True)
    neck_cm = Column(Float, nullable=True)
    shoulders_cm = Column(Float, nullable=True)
    
    # Body composition (optional)
    body_fat_percentage = Column(Float, nullable=True)
    muscle_mass_kg = Column(Float, nullable=True)
    
    # Progress photo URLs
    front_photo_url = Column(Text, nullable=True)
    side_photo_url = Column(Text, nullable=True)
    back_photo_url = Column(Text, nullable=True)
    
    # Notes
    notes = Column(Text, default="")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="body_metrics")
