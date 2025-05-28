from sqlalchemy import Column, Integer, String, DateTime
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

    sent_messages = relationship("Message", foreign_keys='Message.from_user_id', back_populates="sender")
    received_messages = relationship("Message", foreign_keys='Message.to_user_id', back_populates="receiver")