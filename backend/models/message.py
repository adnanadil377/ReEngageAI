from fastapi import FastAPI
from sqlalchemy import (
    Column, Integer, String, Text,
    ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base



# Message model
class Message(Base):
    __tablename__ = "messages"
    message_id = Column(Integer, primary_key=True)
    wa_message_id = Column(String(100), unique=True, nullable=False)
    from_user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    to_user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)

    direction = Column(String(20), nullable=False)  # 'incoming' or 'outgoing'
    message_type = Column(String(20), nullable=False)  # 'text', 'image', etc.
    text_content = Column(Text)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    status = Column(String(20), default='sent')  # 'sent', 'delivered', 'read', 'failed'

    sender = relationship("User", foreign_keys=[from_user_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[to_user_id], back_populates="received_messages")
    media = relationship("MessageMedia", uselist=False, back_populates="message")
