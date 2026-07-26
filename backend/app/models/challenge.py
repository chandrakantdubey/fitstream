from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    challenge_id = Column(String, nullable=False) # e.g. 'abs-30', 'arm-sculpt-30', 'fullbody-fatburn-30'
    title = Column(String, nullable=False)
    category = Column(String, default="Full Body")
    difficulty = Column(String, default="Beginner")
    start_date = Column(Date, default=date.today, nullable=False)
    current_day = Column(Integer, default=1) # 1 to 30
    completed_days = Column(Text, default="[]") # JSON list of integers [1, 2, 3...]
    is_completed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="challenges")
