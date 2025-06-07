from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from sqlalchemy.orm import relationship
from db.base import Base

# User model
class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True)
    wa_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(100))
    isBot= Column(Integer)
    created_at = Column(DateTime, default=datetime.now())
    last_activity_at = Column(DateTime, nullable=True, default=datetime.utcnow)
    purchase_history = Column(JSON, nullable=True)

    sent_messages = relationship("Message", foreign_keys='Message.from_user_id', back_populates="sender")
    received_messages = relationship("Message", foreign_keys='Message.to_user_id', back_populates="receiver")