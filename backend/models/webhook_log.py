from fastapi import FastAPI
from sqlalchemy import (
    Column, Integer, String, Text,
    ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base


# WebhookLog model
class WebhookLog(Base):
    __tablename__ = 'webhook_log'

    log_id = Column(Integer, primary_key=True)
    event_type = Column(String(50))
    payload = Column(JSON)  # JSON type works in SQLite but has limitations
    received_at = Column(DateTime, default=datetime.utcnow)