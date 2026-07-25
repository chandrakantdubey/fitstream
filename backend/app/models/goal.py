from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Goal type and target
    goal_type = Column(String, nullable=False)  # weight_loss, weight_gain, strength, endurance, custom
    target_value = Column(Float, nullable=True)  # Target weight, kg lifted, etc.
    current_value = Column(Float, nullable=True)
    unit = Column(String, default="kg")  # kg, lbs, reps, minutes, etc.
    
    # Exercise-specific goals (for strength goals)
    exercise_id = Column(String, ForeignKey("exercises.id"), nullable=True)
    
    # Timeframe
    target_date = Column(DateTime, nullable=True)
    start_date = Column(DateTime, default=datetime.utcnow)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Progress tracking
    progress_percentage = Column(Integer, default=0)  # 0-100
    
    # Details
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="goals")
    exercise = relationship("Exercise")
    milestones = relationship("GoalMilestone", back_populates="goal", cascade="all, delete-orphan")


class GoalMilestone(Base):
    __tablename__ = "goal_milestones"

    id = Column(String, primary_key=True, index=True)
    goal_id = Column(String, ForeignKey("goals.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String, nullable=False)
    target_value = Column(Float, nullable=True)
    target_date = Column(DateTime, nullable=True)
    
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    notes = Column(Text, default="")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    goal = relationship("Goal", back_populates="milestones")


class PersonalRecord(Base):
    __tablename__ = "personal_records"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(String, ForeignKey("exercises.id"), nullable=False)
    
    # Record type
    record_type = Column(String, nullable=False)  # weight_1rm, reps_max, volume, time
    
    # Record value
    value = Column(Float, nullable=False)  # kg for weight, count for reps, etc.
    unit = Column(String, default="kg")
    
    # Context
    reps = Column(Integer, nullable=True)  # For weight records, how many reps
    notes = Column(Text, default="")
    
    achieved_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    exercise = relationship("Exercise")
