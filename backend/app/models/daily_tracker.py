from datetime import datetime, date
from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    log_date = Column(Date, default=date.today, nullable=False, index=True)
    water_ml = Column(Integer, default=0)
    target_water_ml = Column(Integer, default=2500)
    active_minutes = Column(Integer, default=0)
    calories_burned = Column(Integer, default=0)
    weight_kg = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    chest_cm = Column(Float, nullable=True)
    bicep_cm = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="daily_logs")
