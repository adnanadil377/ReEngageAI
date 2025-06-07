from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema for the summary, matching controller output
class CampaignAnalyticsSummary(BaseModel):
    campaign_id: int
    campaign_name: str
    total_records: int
    total_delivered: int
    total_opened_read: int
    total_replied: int
    total_failed_on_send: int
    open_rate_percentage_on_delivered: float
    response_rate_percentage_on_delivered: float
    campaign_status: Optional[str] = None # Added as controller provides this

    class Config:
        orm_mode = True # Useful if data is directly from an ORM model or dict that behaves like one
