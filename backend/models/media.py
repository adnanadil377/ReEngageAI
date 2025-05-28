from fastapi import FastAPI
from sqlalchemy import (
    Column, Integer, String, Text,
    ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base


class MessageMedia(Base):
    __tablename__ = 'message_media'

    media_id = Column(Integer, primary_key=True)
    message_id = Column(Integer, ForeignKey('messages.message_id', ondelete='CASCADE'), nullable=False)
    media_type = Column(String(20), nullable=False)  # 'image', 'video', etc.
    media_url = Column(Text, nullable=False)
    mime_type = Column(String(100))
    sha256_checksum = Column(String(100))
    caption = Column(Text)

    message = relationship("Message", back_populates="media")