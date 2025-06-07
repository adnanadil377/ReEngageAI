from typing import List
from fastapi import APIRouter, Depends, Path, Request, HTTPException, requests, status # 'requests' import seems unused here, maybe for a specific case later
from sqlalchemy.orm import Session
# Corrected or ensured db imports assuming structure
from db.database import get_db # if get_db is here
# from backend.db.session import get_db # Or if get_db is here, ensure consistency
from models import user_credentials # Assuming direct import works
from routers.auth_routes import get_current_user_credential # Assuming path
# from backend.db.session import SessionLocal # Usually not imported directly in routers
from models.message import Message
from controller.user_controller import create_user
from controller.webhook_controller import receive_webhook, send_whatsapp_message, verify_webhook # Assuming path
from controller.message_controller import get_messages # Assuming path
from schemas.send_schema import SendMessageModel # Assuming path
from schemas.user_schema import UserBotModeUpdateRequest, UserBotModeUpdateResponse, UserModel # Assuming path

from models.user import User
from sio_instance import sio # Assuming path
import logging

# Import new routers
from routers import user_category_routes, message_template_routes, campaign_routes, campaign_analytics_routes

router = APIRouter() # This is the main router for this module

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Existing routes from api.py (ensure they use 'router')

@router.post("/users") # Changed from api_router to router
def create_user_route(user: UserModel, db: Session = Depends(get_db),current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
    return create_user(name=user.name, wa_id=user.wa_id, db=db)


@router.get("/users") # Changed from api_router to router
def get_users(db: Session = Depends(get_db), current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
    all_user=db.query(User).all()
    return all_user


@router.get("/webhook") # Changed from api_router to router
async def ver_webhook(request:Request):
    return await verify_webhook(request=request)


@router.post("/webhook") # Changed from api_router to router
async def rec_webhook(request:Request,db: Session = Depends(get_db)):
    return await receive_webhook(request=request, db=db)

@router.post("/messages") # Changed from api_router to router
async def send_message(sendMessage: SendMessageModel, db: Session = Depends(get_db),current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
    wamid = send_whatsapp_message(sendMessage.recipient_phone, sendMessage.message_text, db)
    
    if not wamid:
        # Consider raising HTTPException for client feedback
        raise HTTPException(status_code=500, detail="Failed to send message or user/bot not found")

    db_message = db.query(Message).filter(Message.wa_message_id == wamid).order_by(Message.timestamp.desc()).first()

    if db_message:
        outgoing_message_payload = {
            "wa_message_id": db_message.wa_message_id,
            "direction": db_message.direction,
            "text_content": db_message.text_content,
            "timestamp": db_message.timestamp.isoformat(),
            "status": db_message.status,
            "recipient_phone": sendMessage.recipient_phone,
        }
        await sio.emit("new_message", outgoing_message_payload)
        logger.info(f"Emitted new_message (outgoing) for wamid {wamid}")
    else:
        logger.error(f"Message with wamid {wamid} not found in DB after sending for emitting.")

    return {"status": True, "wamid": wamid}

@router.get("/messages") # Changed from api_router to router
async def rec_message(wa_id:str,db: Session = Depends(get_db),current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
    return get_messages(wa_id,db)


@router.put( # Changed from api_router to router
    "/users/{wa_id}/mode",
    response_model=UserBotModeUpdateResponse,
    status_code=status.HTTP_200_OK,
    tags=["Users"],
    summary="Update the bot interaction mode for a specific user"
)
async def update_user_bot_mode(
    mode_update_payload: UserBotModeUpdateRequest,
    wa_id: str = Path(..., description="The WhatsApp ID of the user whose mode is to be updated.", example="1234567890"),
    db: Session = Depends(get_db),
    current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)
):
    logger.info(f"Attempting to update bot mode for wa_id: {wa_id} by user: {current_user.email}")
    db_user = db.query(User).filter(User.wa_id == wa_id).first()

    if not db_user:
        logger.warning(f"User with wa_id '{wa_id}' not found for mode update.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with wa_id '{wa_id}' not found."
        )
    db_user.isBot = mode_update_payload.is_bot
   
    try:
        db.commit()
        db.refresh(db_user)
        logger.info(f"Successfully updated bot mode for wa_id: {wa_id} to is_bot={db_user.isBot}")
    except Exception as e:
        db.rollback()
        logger.error(f"Database error while updating mode for wa_id {wa_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the user's mode."
        )
    return UserBotModeUpdateResponse(
        wa_id=db_user.wa_id,
        is_bot=db_user.isBot,
        message="User interaction mode updated successfully."
    )

# Include the new routers into the existing 'router'
router.include_router(user_category_routes.router)
router.include_router(message_template_routes.router)
router.include_router(campaign_routes.router)
router.include_router(campaign_analytics_routes.router)

# Ensure that when the FastAPI application is created (e.g., in main.py),
# this 'router' instance from 'backend.routers.api' is included.
# For example, in main.py:
# from backend.routers.api import router as api_router_v1 (or any alias)
# app.include_router(api_router_v1, prefix="/api/v1") # Or similar
# Or, if this `router` is directly imported as `api_router` in `main.py`
# (e.g. `from backend.routers import api_router`), then just `app.include_router(api_router)`.
# The key is that this `router` object, which now contains all routes, is used by the FastAPI app instance.
