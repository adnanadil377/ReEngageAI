# schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Union
from datetime import datetime

# --- Schemas for User Credentials ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    # Optional: If you want to associate with an existing User profile during signup
    # wa_id: Optional[str] = None
    # name: Optional[str] = None # If creating a basic User profile alongside credentials

class UserLogin(BaseModel):
    email: EmailStr # Or username: str if you use username
    password: str

class UserInDB(BaseModel): # For representing user data from DB (excluding password)
    id: int
    email: EmailStr
    user_id: Optional[int] = None # If linked to a User profile
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        # orm_mode = True # For Pydantic to work with SQLAlchemy models
        from_attributes=True
# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None # Or username, corresponds to 'sub' in JWT
    user_id: Optional[int] = None # Or whatever identifier you put in the token

# --- Your Existing User Schema (Example) ---
class UserBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class UserSchema(UserBase): # Schema for returning User details
    id: int
    wa_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Include credentials if you want to nest them (usually not for general user lists)
    # credentials: Optional[UserInDB] = None

    class Config:
        # orm_mode = True
        from_attributes=True