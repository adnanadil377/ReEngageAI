from pydantic import BaseModel, Field 
from typing import Optional, List
from datetime import datetime

class UserModel(BaseModel):
    name:str = None
    wa_id:str = None

class UserBotModeUpdateRequest(BaseModel):
    is_bot: bool = Field(..., description="Set to true if the user interaction should be handled by a bot, false otherwise.")

class UserBotModeUpdateResponse(BaseModel):
    wa_id: str
    is_bot: bool
    message: str

class UserBase(BaseModel):
    name: str = Field(..., example="John Doe")
    wa_id: str = Field(..., example="1234567890", description="WhatsApp ID of the user")

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int # Assuming your User model has an 'id' primary key
    isBot: Optional[bool] = Field(default=False, description="Indicates if AI/bot mode is active for this user") # Or is_bot

    class Config:
        # orm_mode = True # For SQLAlchemy model conversion
        from_attributes=True


