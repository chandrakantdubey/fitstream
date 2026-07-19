from sqlalchemy import Column, String, Text, JSON
from app.core.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    body_part = Column(String, nullable=False)
    equipment = Column(String, index=True, nullable=False)
    target = Column(String, index=True, nullable=False)
    muscle_group = Column(String, default="")
    secondary_muscles = Column(JSON, default=list)
    instructions = Column(Text, nullable=False)
    media_id = Column(String, nullable=True)