from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from db.base import Base
from datetime import datetime
import enum

class CampaignAnalyticsStatus(str, enum.Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    REPLIED = "replied"
    FAILED = "failed" # If sending failed

class CampaignAnalytics(Base):
    __tablename__ = "campaign_analytics"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey('campaigns.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False) # Assuming user_id is the PK in User model
    message_id = Column(Integer, ForeignKey('messages.message_id'), nullable=True) # Link to the actual message if applicable
    wa_message_id = Column(String(100), nullable=True) # Store the WhatsApp message ID

    status = Column(SQLAlchemyEnum(CampaignAnalyticsStatus), default=CampaignAnalyticsStatus.SENT, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    delivered_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True) # Synonymous with 'read_at'
    replied_at = Column(DateTime, nullable=True)
    failed_reason = Column(String(255), nullable=True) # If status is 'failed'

    campaign = relationship("Campaign", back_populates="analytics_entries")
    user = relationship("User") # Add back_populates if you define the relationship on User model
    message = relationship("Message") # Add back_populates if you define the relationship on Message model
