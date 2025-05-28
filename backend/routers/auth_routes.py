# auth_routes.py (or add to main.py)
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from auth import security, auth_controller
# from . import crud, models, schemas, security
from models import user_credentials
from schemas import auth_schema
# from db.session import SessionLocal
from db.database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login") # Points to your login endpoint

@router.post("/signup", response_model=auth_schema.UserInDB, status_code=status.HTTP_201_CREATED)
async def signup_user(user: auth_schema.UserCreate, db: Session = Depends(get_db)):
    db_user_cred = auth_controller.get_user_credential_by_email(db, email=user.email)
    if db_user_cred:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    created_user_cred = auth_controller.create_user_credential(db=db, user_cred=user)
    return created_user_cred # Or a custom response like {"message": "User created successfully"}

@router.post("/login", response_model=auth_schema.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), # Use form data for login
    db: Session = Depends(get_db)
):
    user_cred = auth_controller.get_user_credential_by_email(db, email=form_data.username) # form_data.username is the email
    if not user_cred or not security.verify_password(form_data.password, user_cred.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token_data = {
        "sub": user_cred.email, # 'sub' (subject) is standard claim for user identifier
        "user_id": user_cred.id, # Or user_cred.user_id if you want the main profile ID
        # Add other claims like roles if you have them
    }
    access_token = security.create_access_token(
        data=access_token_data, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Dependency to get current user
async def get_current_user_credential(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> user_credentials.UserCredentials:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = security.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    token_data = auth_schema.TokenData(email=email, user_id=payload.get("user_id")) # Validate payload structure
    
    user_cred = auth_controller.get_user_credential_by_email(db, email=token_data.email)
    if user_cred is None:
        raise credentials_exception
    return user_cred

# Example of a protected endpoint that requires authentication
@router.get("/me", response_model=auth_schema.UserInDB)
async def read_users_me(current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
    # current_user is the UserCredentials object
    # If you want to return the main User profile:
    # if current_user.user_profile:
    #     return current_user.user_profile
    return current_user