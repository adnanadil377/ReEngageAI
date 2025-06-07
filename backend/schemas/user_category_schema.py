from pydantic import BaseModel, Json
from typing import Optional, Dict, Any

class UserCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    filter_criteria: Dict[str, Any]

class UserCategoryCreate(UserCategoryBase):
    pass

class UserCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    filter_criteria: Optional[Dict[str, Any]] = None

class UserCategoryResponse(UserCategoryBase):
    id: int
    class Config:
        orm_mode = True
