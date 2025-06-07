from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.campaign import CampaignStatus, CampaignScheduleType, CampaignFrequencyLimit

class CampaignBase(BaseModel):
    name: str
    user_category_id: int
    message_template_id: int
    status: CampaignStatus = CampaignStatus.DRAFT
    schedule_type: CampaignScheduleType = CampaignScheduleType.IMMEDIATE
    scheduled_at: Optional[datetime] = None
    frequency_limit: CampaignFrequencyLimit = CampaignFrequencyLimit.NONE

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    user_category_id: Optional[int] = None
    message_template_id: Optional[int] = None
    status: Optional[CampaignStatus] = None
    schedule_type: Optional[CampaignScheduleType] = None
    scheduled_at: Optional[datetime] = None # Allow clearing by passing None
    frequency_limit: Optional[CampaignFrequencyLimit] = None

class CampaignResponse(CampaignBase):
    id: int
    created_at: datetime
    updated_at: datetime
    # Potentially include nested UserCategoryResponse and MessageTemplateResponse here if needed
    class Config:
        orm_mode = True
