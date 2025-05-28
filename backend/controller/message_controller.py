from fastapi import HTTPException, Request, Response
import requests
import logging
from sqlalchemy import or_
from sqlalchemy.orm import Session
from models.user import User
from models.message import Message
from sio_instance import sio
from dotenv import load_dotenv
import os
from datetime import datetime, timezone
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
WHATSAPP_NUMBER_ID = os.getenv("WHATSAPP_NUMBER_ID")

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")


def get_messages(wa_id:str, db:Session):
    user=db.query(User).filter_by(wa_id=wa_id).first()
    messages = db.query(Message).filter(
        or_(Message.sender == user, Message.receiver == user)
    ).all()
    print(messages)
    return messages


def send_whatsapp_message(recipient_phone: str, message_text: str, db: Session):

    payload = {
        "messaging_product": "whatsapp",
        "to": recipient_phone,
        "type": "text",
        "text": {"body": message_text}
    }
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",        
        "Content-Type": "application/json"
    }


    try:
        res = requests.post(
            f"https://graph.facebook.com/v19.0/{WHATSAPP_NUMBER_ID}/messages",
            headers=headers,
            json=payload,
            timeout=15
        )
        res.raise_for_status()
        data = res.json()
        wamid = None

        if "messages" in data and len(data["messages"]) > 0:
            wamid = data["messages"][0].get("id")
            receiver1 = db.query(User).filter_by(wa_id=recipient_phone).first()
            sender1 = db.query(User).filter_by(name="bot").first()

            if not sender1:
                logger.error("Sender with name 'bot' not found.")
                return False
            
            if not receiver1:
                logger.error(f"Receiver with wa_id {recipient_phone} not found.")
                return False
            
            send_message = Message(
                wa_message_id=wamid,
                direction="outgoing",
                message_type="text",
                text_content=message_text,
                status="delivered",
                sender=sender1,
                receiver=receiver1
            )

            # await sio.emit("ai_message",{"wamid":wamid,"wa_message":message_text,"wa_type":"text","user_phone":recipient_phone,"direction":"outgoing"})
            db.add(send_message)
            db.commit()
        logger.info(f"data data {data}. {wamid}")
        logger.info(f"Arafat Traders WhatsApp reply sent to {recipient_phone}. Status: {res.status_code}.")
        return wamid
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send Arafat Traders WhatsApp reply to {recipient_phone}: {e}. Response text: {res.text if 'res' in locals() else 'N/A'}")
        return None
