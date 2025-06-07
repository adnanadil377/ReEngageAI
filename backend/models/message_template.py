from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base

class MessageTemplate(Base):
    __tablename__ = "message_templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False) # Message content, possibly with placeholders like {{name}}
    # Removed category_id as a template might be usable across categories or linked via Campaign

    campaigns = relationship("Campaign", back_populates="message_template")
