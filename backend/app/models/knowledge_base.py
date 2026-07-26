from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base

class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g. 'Volume Guidelines', 'Exercise Science', 'Form Guide', 'Nutrition & Recovery'
    summary = Column(String, nullable=False)
    content = Column(Text, nullable=False) # Markdown / HTML text
    icon = Column(String, default="book")
    read_time = Column(String, default="4 min read")
    created_at = Column(DateTime, default=datetime.utcnow)
