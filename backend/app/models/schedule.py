from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ScheduledWorkout(Base):
    __tablename__ = "scheduled_workouts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workout_id = Column(String, ForeignKey("workouts.id", ondelete="CASCADE"), nullable=True)  # Optional if using program
    program_day_id = Column(String, ForeignKey("program_days.id", ondelete="CASCADE"), nullable=True)  # For program-based scheduling
    
    # Scheduling
    scheduled_date = Column(DateTime, nullable=False)
    scheduled_time = Column(String, nullable=True)  # HH:MM format
    
    # Status
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    is_skipped = Column(Boolean, default=False)
    skipped_reason = Column(Text, default="")
    
    # Reminders
    reminder_minutes_before = Column(Integer, default=30)  # 30 minutes before by default
    reminder_sent = Column(Boolean, default=False)
    
    # Notes
    notes = Column(Text, default="")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="scheduled_workouts")
    workout = relationship("Workout")
    program_day = relationship("ProgramDay")


class RecurringSchedule(Base):
    __tablename__ = "recurring_schedules"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workout_id = Column(String, ForeignKey("workouts.id", ondelete="CASCADE"), nullable=True)
    
    # Recurrence pattern
    frequency = Column(String, nullable=False)  # daily, weekly, monthly
    days_of_week = Column(String, default="")  # Comma-separated: "1,3,5" for Mon,Wed,Fri
    interval = Column(Integer, default=1)  # Every X days/weeks/months
    
    # Time
    scheduled_time = Column(String, nullable=True)  # HH:MM format
    
    # Date range
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Notes
    notes = Column(Text, default="")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    workout = relationship("Workout")


class WorkoutReminder(Base):
    __tablename__ = "workout_reminders"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheduled_workout_id = Column(String, ForeignKey("scheduled_workouts.id", ondelete="CASCADE"), nullable=True)
    
    # Reminder details
    reminder_type = Column(String, default="workout")  # workout, rest_day, milestone
    title = Column(String, nullable=False)
    message = Column(Text, default="")
    
    # Timing
    remind_at = Column(DateTime, nullable=False)
    
    # Status
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime, nullable=True)
    
    # Channels
    send_push = Column(Boolean, default=True)
    send_email = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    scheduled_workout = relationship("ScheduledWorkout")
