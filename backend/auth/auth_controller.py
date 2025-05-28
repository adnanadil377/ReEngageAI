# crud.py
from typing import Optional
from auth import security
from sqlalchemy.orm import Session
# from . import UserCre, schemas, security # security for password hashing
from models.user_credentials import UserCredentials
from schemas.auth_schema import UserBase, UserCreate, UserInDB, UserLogin, UserSchema
# --- CRUD for UserCredentials ---
def get_user_credential_by_email(db: Session, email: str) -> Optional[UserCredentials]:
    return db.query(UserCredentials).filter(UserCredentials.email == email).first()

def get_user_credential(db: Session, user_cred_id: int) -> Optional[UserCredentials]:
    return db.query(UserCredentials).filter(UserCredentials.id == user_cred_id).first()

def create_user_credential(db: Session, user_cred: UserCreate) -> UserCredentials:
    hashed_password = security.get_password_hash(user_cred.password)
    db_user_cred = UserCredentials(
        email=user_cred.email,
        hashed_password=hashed_password
    )
    # Optional: If creating/linking a main User profile at the same time
    # if user_cred.wa_id:
    #     # Check if User with wa_id exists, or create one
    #     db_user_profile = db.query(models.User).filter(models.User.wa_id == user_cred.wa_id).first()
    #     if not db_user_profile:
    #         db_user_profile = models.User(wa_id=user_cred.wa_id, name=user_cred.name, email=user_cred.email) # Basic profile
    #         db.add(db_user_profile)
    #         db.flush() # To get the ID if it's new
    #     db_user_cred.user_profile = db_user_profile # Link them

    db.add(db_user_cred)
    db.commit()
    db.refresh(db_user_cred)
    return db_user_cred

# --- Your existing CRUD functions for Users ---
# def get_user(db: Session, user_id: int): ...
# def get_user_by_wa_id(db: Session, wa_id: str): ...
# def get_users(db: Session, skip: int = 0, limit: int = 100): ...
# def create_user(db: Session, user: schemas.UserCreate): ... # (if you have a UserCreate schema)