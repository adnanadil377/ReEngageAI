from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from db.base import Base
from datetime import datetime
import enum

class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class CampaignScheduleType(str, enum.Enum):
    IMMEDIATE = "immediate"
    SCHEDULED = "scheduled"

class CampaignFrequencyLimit(str, enum.Enum):
    NONE = "none" # No limit
    DAILY = "daily" # Max 1 per day per user
    WEEKLY = "weekly" # Max 1 per week per user
    MONTHLY = "monthly" # Max 1 per month per user

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    user_category_id = Column(Integer, ForeignKey('user_categories.id'), nullable=False)
    message_template_id = Column(Integer, ForeignKey('message_templates.id'), nullable=False)

    status = Column(SQLAlchemyEnum(CampaignStatus), default=CampaignStatus.DRAFT, nullable=False)
    schedule_type = Column(SQLAlchemyEnum(CampaignScheduleType), default=CampaignScheduleType.IMMEDIATE, nullable=False)
    scheduled_at = Column(DateTime, nullable=True) # Only if schedule_type is "scheduled"
    frequency_limit = Column(SQLAlchemyEnum(CampaignFrequencyLimit), default=CampaignFrequencyLimit.NONE, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_category = relationship("UserCategory", back_populates="campaigns")
    message_template = relationship("MessageTemplate", back_populates="campaigns")
    analytics_entries = relationship("CampaignAnalytics", back_populates="campaign")
