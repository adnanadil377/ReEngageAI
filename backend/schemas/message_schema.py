from pydantic import BaseModel, Field 
from typing import Optional, List
from datetime import datetime

class MessageBase(BaseModel):
    text_content: str
    direction: str = Field(..., example="incoming", description="Direction of the message (incoming/outgoing)")
    timestamp: datetime
    status: Optional[str] = Field(None, example="delivered", description="Message status (e.g., sent, delivered, read)")

class MessageResponse(MessageBase):
    wa_message_id: str = Field(..., example="wamid.gBGGFm...")
    # user_id: int # If you want to include the user FK

    class Config:
        # orm_mode = True
        from_attributes=True