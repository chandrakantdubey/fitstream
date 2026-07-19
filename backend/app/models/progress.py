from sqlalchemy import Column, String, Integer, Date, Float, func
from app.core.database import Base


class DailyProgress(Base):
    __tablename__ = "daily_progress"

    id = Column(String, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    exercise_id = Column(String, nullable=False, index=True)
    total_sets = Column(Integer, default=0)
    total_reps = Column(Integer, default=0)
    total_volume = Column(Float, default=0.0)  # weight * reps
    max_weight = Column(Float, default=0.0)