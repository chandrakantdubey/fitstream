from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="workouts")
    exercises = relationship("WorkoutExercise", back_populates="workout", cascade="all, delete-orphan", order_by="WorkoutExercise.order_index")
    sessions = relationship("WorkoutSession", back_populates="workout", cascade="all, delete-orphan")


class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"

    id = Column(String, primary_key=True, index=True)
    workout_id = Column(String, ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(String, ForeignKey("exercises.id"), nullable=False)
    order_index = Column(Integer, default=0)
    target_sets = Column(Integer, default=3)
    target_reps = Column(Integer, default=10)
    rest_seconds = Column(Integer, default=60)
    notes = Column(Text, default="")

    workout = relationship("Workout", back_populates="exercises")
    exercise = relationship("Exercise")


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(String, primary_key=True, index=True)
    workout_id = Column(String, ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    notes = Column(Text, default="")

    workout = relationship("Workout", back_populates="sessions")
    sets = relationship("SessionSet", back_populates="session", cascade="all, delete-orphan")


class SessionSet(Base):
    __tablename__ = "session_sets"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("workout_sessions.id", ondelete="CASCADE"), nullable=False)
    workout_exercise_id = Column(String, ForeignKey("workout_exercises.id"), nullable=False)
    set_number = Column(Integer, nullable=False)
    reps_completed = Column(Integer, default=0)
    weight_kg = Column(Float, default=0.0)
    completed_at = Column(DateTime, nullable=True)

    session = relationship("WorkoutSession", back_populates="sets")