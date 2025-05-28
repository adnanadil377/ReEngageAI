from typing import List
from fastapi import APIRouter, Depends, Path, Request, HTTPException, requests, status
from sqlalchemy.orm import Session
from db.database import get_db
from models import user_credentials
from routers.auth_routes import get_current_user_credential
from db.session import SessionLocal
from models.message import Message
from controller.user_controller import create_user
from controller.webhook_controller import receive_webhook, send_whatsapp_message, verify_webhook
from controller.message_controller import get_messages
from schemas.send_schema import SendMessageModel
from schemas.user_schema import UserBotModeUpdateRequest, UserBotModeUpdateResponse, UserModel


from models.user import User
from sio_instance import sio
import logging
router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/users")
def create_user_route(user: UserModel, db: Session = Depends(get_db),current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
    return create_user(name=user.name, wa_id=user.wa_id, db=db)


@router.get("/users")
def get_users(db: Session = Depends(get_db), current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
    all_user=db.query(User).all()
    return all_user


@router.get("/webhook")
async def ver_webhook(request:Request):
    return await verify_webhook(request=request)


@router.post("/webhook")
async def rec_webhook(request:Request,db: Session = Depends(get_db)):
    return await receive_webhook(request=request, db=db)

@router.post("/messages")
async def send_message(sendMessage: SendMessageModel, db: Session = Depends(get_db),current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
    # send_whatsapp_message now saves the message and returns wamid
    wamid = send_whatsapp_message(sendMessage.recipient_phone, sendMessage.message_text, db)
    
    if not wamid:
        return {"success": False, "error": "Failed to send message or user/bot not found"}

    # Retrieve the message that was just saved to get all its details for emission
    db_message = db.query(Message).filter(Message.wa_message_id == wamid).order_by(Message.timestamp.desc()).first() # Ensure you get the correct one

    if db_message:
        outgoing_message_payload = {
            "wa_message_id": db_message.wa_message_id,
            "direction": db_message.direction, # Should be "outgoing"
            "text_content": db_message.text_content,
            "timestamp": db_message.timestamp.isoformat(),
            "status": db_message.status, # Should be "sent" or "delivered" based on send_whatsapp_message
            "recipient_phone": sendMessage.recipient_phone, # For outgoing, this is customer's phone (receiver)
        }
        await sio.emit("new_message", outgoing_message_payload)
        logger.info(f"Emitted new_message (outgoing) for wamid {wamid}")
    else:
        logger.error(f"Message with wamid {wamid} not found in DB after sending for emitting.")

    return {"status": True, "wamid": wamid}

@router.get("/messages")
async def rec_message(wa_id:str,db: Session = Depends(get_db),current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
    return get_messages(wa_id,db)

# @router.put("/update")
# async def update_user_reply(wa_id:str,isBot:int, db: Session = Depends(get_db), current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
#     user=db.query(User).filter_by(wa_id=wa_id).first()
#     if user:
#         user.isBot=isBot
#         db.commit()
#         return {"status": True, "wa_id": wa_id}
#     return {"status": False, "wa_id": wa_id}


@router.put(
    "/users/{wa_id}/mode",  # More RESTful: identifies the resource and the aspect to update
    response_model=UserBotModeUpdateResponse,
    status_code=status.HTTP_200_OK,
    tags=["Users"], # Helps organize your API docs
    summary="Update the bot interaction mode for a specific user"
)
async def update_user_bot_mode(
    mode_update_payload: UserBotModeUpdateRequest, # Request body validated by Pydantic
    wa_id: str = Path(..., description="The WhatsApp ID of the user whose mode is to be updated.", example="1234567890"),
    db: Session = Depends(get_db),
    current_user: user_credentials.UserCredentials = Depends(get_current_user_credential) # Authentication
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
        db.refresh(db_user) # To get the updated state from the DB, especially if there are triggers or defaults
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
        is_bot=db_user.isBot, # Or db_user.is_bot
        message="User interaction mode updated successfully."
    )
