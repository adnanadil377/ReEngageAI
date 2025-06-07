from fastapi import HTTPException, Request, Response
import requests
import logging
from sqlalchemy.orm import Session
from controller.message_controller import send_whatsapp_message
from controller.user_controller import create_user
from controller.gemini_controller import ai_gemini_response
from models.user import User
from models.message import Message
from models.campaign_analytics import CampaignAnalytics, CampaignAnalyticsStatus # Added
from sqlalchemy import desc # Added
from sio_instance import sio
from dotenv import load_dotenv
import os
from datetime import datetime, timezone, timedelta # Added timedelta
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
WHATSAPP_NUMBER_ID = os.getenv("WHATSAPP_NUMBER_ID")

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")


# def send_whatsapp_message(recipient_phone: str, message_text: str, db: Session):

#     payload = {
#         "messaging_product": "whatsapp",
#         "to": recipient_phone,
#         "type": "text",
#         "text": {"body": message_text}
#     }
#     headers = {
#         "Authorization": f"Bearer {WHATSAPP_TOKEN}",        
#         "Content-Type": "application/json"
#     }


#     try:
#         res = requests.post(
#             f"https://graph.facebook.com/v19.0/{WHATSAPP_NUMBER_ID}/messages",
#             headers=headers,
#             json=payload,
#             timeout=15
#         )
#         res.raise_for_status()
#         data = res.json()
#         wamid = None

#         if "messages" in data and len(data["messages"]) > 0:
#             wamid = data["messages"][0].get("id")
#             receiver1 = db.query(User).filter_by(wa_id=recipient_phone).first()
#             sender1 = db.query(User).filter_by(name="bot").first()

#             if not sender1:
#                 logger.error("Sender with name 'bot' not found.")
#                 return False
            
#             if not receiver1:
#                 logger.error(f"Receiver with wa_id {recipient_phone} not found.")
#                 return False
            
#             send_message = Message(
#                 wa_message_id=wamid,
#                 direction="outgoing",
#                 message_type="text",
#                 text_content=message_text,
#                 status="delivered",
#                 sender=sender1,
#                 receiver=receiver1
#             )

#             db.add(send_message)
#             db.commit()
#         logger.info(f"data data {data}. {wamid}")
#         logger.info(f"Arafat Traders WhatsApp reply sent to {recipient_phone}. Status: {res.status_code}.")
#         return wamid
    
#     except requests.exceptions.RequestException as e:
#         logger.error(f"Failed to send Arafat Traders WhatsApp reply to {recipient_phone}: {e}. Response text: {res.text if 'res' in locals() else 'N/A'}")
#         return None
    


async def verify_webhook(request: Request):
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        logger.info("Arafat Traders Webhook (English Output) verified successfully!") # Changed
        return Response(content=challenge, media_type="text/plain")
    else:
        logger.warning(f"Arafat Traders Webhook (English Output) verification failed. Mode: {mode}, Token: {token}") # Changed
        raise HTTPException(status_code=403, detail="Verification token mismatch or mode mismatch")



async def receive_webhook(request: Request,db: Session):
    try:
        body = await request.json()
        logger.info(f"fawefj ${body}")
    except Exception as e:
        logger.error(f"Error parsing Arafat Traders request body: {e}") # Changed
        return Response(content="Error parsing JSON body", status_code=400)

    if not body.get("object") == "whatsapp_business_account":
        return {"status": "ignored, not whatsapp_business_account object"}
    
    entries = body.get("entry", [])
    if not entries: return {"status": "ignored, no entries"}
    
    changes = entries[0].get("changes", [])
    if not changes: return {"status": "ignored, no changes"}
    
    value = changes[0].get("value", {})
    messages = value.get("messages", [])

    if not messages:
        statuses = value.get("statuses", [])
        if statuses:
            logger.info(f"Received Arafat Traders status update: {statuses}") # Changed
            logger.info({"wamid":statuses[0].get("id"),"status":statuses[0].get("status")})
            message_to_update = db.query(Message).filter_by(wa_message_id=statuses[0].get("id")).first()
            if message_to_update:
                original_message_status = message_to_update.status
                new_status_from_webhook = statuses[0].get("status")
                message_to_update.status = new_status_from_webhook

                # Update CampaignAnalytics
                campaign_analytics_entry = db.query(CampaignAnalytics).filter(
                    CampaignAnalytics.wa_message_id == statuses[0].get("id")
                ).first()

                if campaign_analytics_entry:
                    if new_status_from_webhook == "delivered":
                        campaign_analytics_entry.status = CampaignAnalyticsStatus.DELIVERED
                        campaign_analytics_entry.delivered_at = datetime.utcnow()
                    elif new_status_from_webhook == "read":
                        campaign_analytics_entry.status = CampaignAnalyticsStatus.READ
                        campaign_analytics_entry.opened_at = datetime.utcnow()
                    elif new_status_from_webhook == "failed": # Handle failed status if it comes via webhook
                       campaign_analytics_entry.status = CampaignAnalyticsStatus.FAILED
                       # campaign_analytics_entry.failed_reason = statuses[0].get("errors", "N/A") # If error details are provided
                    db.add(campaign_analytics_entry)

                db.commit() # Commit changes for Message and CampaignAnalytics
                logger.info(f"Message {message_to_update.wa_message_id} status updated to {new_status_from_webhook}. Campaign analytics updated if linked.")
                await sio.emit("message_status_update",{"wamid":statuses[0].get("id"),"wa_id":statuses[0].get("recipient_id"),"status":new_status_from_webhook})
            return {"status": "status update received"}
        return {"status": "ignored, no messages"}

    message_obj = messages[0]
    wamid = message_obj.get("id")

    existing_message = db.query(Message).filter_by(wa_message_id=wamid).first()
    if existing_message:
        logger.info(f"Incoming message with wamid {wamid} already processed. Skipping.")
        # It's important to return a 200 OK to WhatsApp to prevent further retries.
        return Response(content="Message already processed", status_code=200) 

    wa_message=message_obj["text"]["body"]
    wa_type=message_obj.get("type")
    user_phone=message_obj.get('from')


    # only for the media messages
    if message_obj.get("type") != "text":
        logger.info(f"Arafat Traders Webhook ignored: Non-text message type: {message_obj.get('type')}") # Changed
        user_phone_for_non_text = message_obj.get("from")

        if user_phone_for_non_text:
            send_whatsapp_message(user_phone_for_non_text, "I can only understand text messages right now. Please type your query in English for Arafat Traders.") # Changed
        return {"status": "ignored, non-text message"}
    

    logger.info({"wamid":wamid,"wa_message":wa_message,"wa_type":wa_type,"user_phone":user_phone})
    sender1=db.query(User).filter_by(wa_id=user_phone).first()
    receiver1=db.query(User).filter_by(name="bot").first()


    if not sender1:
        create_sender1=create_user("unkwon user", user_phone, db)
        logger.info(f"Sender with wa_id {user_phone} created.{create_sender1.user} - {create_sender1.wa_id}")
        return {"error": "Sender not found"}

    if not receiver1:
        logger.error("Receiver with name 'bot' not found.")
        return {"error": "Receiver not found"}


    mess=Message(wa_message_id=wamid,direction="incoming",message_type=wa_type,text_content=wa_message,status="sent",sender=sender1,receiver=receiver1)
    db.add(mess)
    # db.commit() # Deferred commit

    if sender1: # sender1 is the User object for the incoming message
        sender1.last_activity_at = datetime.utcnow()
        db.add(sender1)

        # Try to link reply to a campaign
        time_window_start = datetime.utcnow() - timedelta(days=7) # Example: 7-day window

        last_campaign_message_analytic = db.query(CampaignAnalytics).filter(
            CampaignAnalytics.user_id == sender1.user_id,
            CampaignAnalytics.sent_at >= time_window_start,
            (CampaignAnalytics.status == CampaignAnalyticsStatus.SENT) | (CampaignAnalytics.status == CampaignAnalyticsStatus.DELIVERED) | (CampaignAnalytics.status == CampaignAnalyticsStatus.READ) # also consider READ as a state that can be replied to
        ).order_by(desc(CampaignAnalytics.sent_at)).first()

        if last_campaign_message_analytic:
            # Check if it's not already marked as replied to avoid duplicate updates if webhook retries or similar
            if last_campaign_message_analytic.status != CampaignAnalyticsStatus.REPLIED:
                 last_campaign_message_analytic.status = CampaignAnalyticsStatus.REPLIED
                 last_campaign_message_analytic.replied_at = datetime.utcnow()
                 db.add(last_campaign_message_analytic)
                 logger.info(f"Marked campaign analytics ID {last_campaign_message_analytic.id} as REPLIED for user {sender1.user_id}")

    db.commit() # Single commit for new message, user update, and campaign analytics update.

    if(sender1 and sender1.isBot): # Check sender1 exists
        ai_gemini_response(user_phone,wa_message, db)
    
    await sio.emit("incoming_message",{"wamid":wamid,"wa_message":wa_message,"wa_type":wa_type,"user_phone":user_phone,"direction":"incoming"})
    
    return {"wamid":wamid,"wa_message":wa_message,"wa_type":wa_type,"user_phone":user_phone}

