from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Program(Base):
    __tablename__ = "programs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # Null for public templates
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    difficulty = Column(String, default="intermediate")  # beginner, intermediate, advanced
    duration_weeks = Column(Integer, default=4)
    category = Column(String, default="strength")  # strength, hypertrophy, endurance, mixed
    is_public = Column(Boolean, default=False)
    is_template = Column(Boolean, default=True)  # If true, it's a template that can be copied
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="programs")
    weeks = relationship("ProgramWeek", back_populates="program", cascade="all, delete-orphan", order_by="ProgramWeek.week_number")


class ProgramWeek(Base):
    __tablename__ = "program_weeks"

    id = Column(String, primary_key=True, index=True)
    program_id = Column(String, ForeignKey("programs.id", ondelete="CASCADE"), nullable=False)
    week_number = Column(Integer, nullable=False)
    name = Column(String, default="Week")
    description = Column(Text, default="")

    program = relationship("Program", back_populates="weeks")
    days = relationship("ProgramDay", back_populates="week", cascade="all, delete-orphan", order_by="ProgramDay.day_number")


class ProgramDay(Base):
    __tablename__ = "program_days"

    id = Column(String, primary_key=True, index=True)
    week_id = Column(String, ForeignKey("program_weeks.id", ondelete="CASCADE"), nullable=False)
    day_number = Column(Integer, nullable=False)  # 1-7 for days of week
    name = Column(String, default="Day")
    workout_type = Column(String, default="workout")  # workout, rest, active_recovery
    description = Column(Text, default="")

    week = relationship("ProgramWeek", back_populates="days")
    exercises = relationship("ProgramExercise", back_populates="day", cascade="all, delete-orphan", order_by="ProgramExercise.order_index")


class ProgramExercise(Base):
    __tablename__ = "program_exercises"

    id = Column(String, primary_key=True, index=True)
    day_id = Column(String, ForeignKey("program_days.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(String, ForeignKey("exercises.id"), nullable=False)
    order_index = Column(Integer, default=0)
    target_sets = Column(Integer, default=3)
    target_reps = Column(String, default="10")  # Can be "8-12", "10", etc.
    rest_seconds = Column(Integer, default=60)
    notes = Column(Text, default="")

    day = relationship("ProgramDay", back_populates="exercises")
    exercise = relationship("Exercise")


class UserProgram(Base):
    __tablename__ = "user_programs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    program_id = Column(String, ForeignKey("programs.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow)
    current_week = Column(Integer, default=1)
    current_day = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="active_programs")
    program = relationship("Program")
