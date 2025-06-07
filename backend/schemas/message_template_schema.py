from pydantic import BaseModel
from typing import Optional

class MessageTemplateBase(BaseModel):
    name: str
    content: str

class MessageTemplateCreate(MessageTemplateBase):
    pass

class MessageTemplateUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None

class MessageTemplateResponse(MessageTemplateBase):
    id: int
    class Config:
        orm_mode = True
