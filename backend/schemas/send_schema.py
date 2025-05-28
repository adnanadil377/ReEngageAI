from pydantic import BaseModel, Field 
from typing import Optional, List
from datetime import datetime


class SendMessageModel(BaseModel):
    recipient_phone: str = None
    message_text: str = None


# In a file like schemas/send_schema.py (you have SendMessageModel)
class SendMessageRequest(BaseModel): # Renaming for clarity
    recipient_phone: str = Field(..., example="1234567890", description="Recipient's WhatsApp ID")
    message_text: str = Field(..., example="Hello there!")

class SendMessageSuccessResponse(BaseModel):
    status: bool = True
    wamid: str = Field(..., example="wamid.gBGGFm...")
    message: str = "Message sent successfully and queued for emission."

class WebhookAcknowledgeResponse(BaseModel):
    status: str = "received"
    message: Optional[str] = None