from fastapi import HTTPException, Request, Response
import requests
import logging
from sqlalchemy import or_
from sqlalchemy.orm import Session
from controller.message_controller import send_whatsapp_message
from models.user import User
from models.message import Message
from sio_instance import sio
from dotenv import load_dotenv
import os
from datetime import datetime, timezone
from google import genai
from google.genai import types

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY= os.getenv("GEMINI_API_KEY")
BOT_USER_ID = 11

client = genai.Client(api_key=GEMINI_API_KEY)

generate_content_config = types.GenerateContentConfig(
        max_output_tokens=100,
        response_mime_type="text/plain",
        system_instruction=[
            types.Part.from_text(text="""\"You are a friendly, knowledgeable, and helpful construction materials assistant for Arafat Traders (arafatraders.com), \"
        \"a trusted supplier of construction materials in Kerala, India. Our philosophy is 'Building Kerala's Future, Together!' and we believe in providing quality materials for strong and lasting structures. \"
        \"Our products include a wide range of cement, TMT steel, sand (river sand, M-sand), bricks, aggregates, plumbing supplies, and electrical components. We focus on quality, reliability, and timely delivery. [2]\\n\\n\" # Placeholder [2]
        \"IMPORTANT INSTRUCTIONS:\\n\"
        \"- LANGUAGE: You MUST understand users who communicate in English OR Malayalam written in English letters (Manglish). Examples of Manglish: 'cementinte vila ethrayanu?', 'ee kambi kittumo?'. However, you MUST ALWAYS RESPOND IN ENGLISH ONLY.\\n\"
        \"- CONCISENESS: Keep your responses brief and to the point. Aim for 1-2 sentences if possible, unless more detail is essential to fully answer the question. Avoid unnecessary fluff.\\n\"
        \"- SINGLE ANSWER: Always provide a single, direct, and definitive answer. Do not offer multiple choices or ask the user to pick from different versions of your response.\\n\\n\"
        \"GENERAL ASSISTANCE (Always in English):\\n\"
        \"Assist customers with their construction material queries, recommend Arafat Traders products based on their project needs (e.g., for residential construction, commercial projects, specific structural requirements), and help with product information like grades of cement, types of steel, availability of brands. [1, 2]\" # Placeholders [1, 2]
        \"Align with Arafat Traders' values of quality materials and customer service. [2]\" # Placeholder [2]
        \"If asked about your name, you can say you're the Arafat Traders virtual assistant. \"
        \"If you don't know something specific, suggest checking the Arafat Traders website (arafatraders.com), contacting our sales team, or state that you will try to find out. \"
        \"When discussing products, you can mention specific types like 'OPC 53 Grade Cement', 'Fe500 TMT Steel Bars', or specific brands Arafat Traders might stock (e.g., 'UltraTech Cement', 'Tata Tiscon steel bars'). [1, 3]\" # Placeholders [1, 3]
    """),
        ],
    )


def load_chat_history(wa_id: str, bot_id: int, db: Session, max_recent_messages: int = 25):
    history=[]
    user=db.query(User).filter_by(wa_id=wa_id).first()
    bot=db.query(User).filter_by(name="bot").first()
    subquery=(db.query(Message).filter(or_(
                    (Message.sender == user) & (Message.receiver == bot),
                    (Message.receiver == bot) & (Message.receiver == user)
                )
            )
            .order_by(Message.timestamp.desc())
            .limit(max_recent_messages)
            .subquery()
        )
    db_messages = db.query(subquery).order_by(subquery.c.timestamp.asc()).all()
    for msg in db_messages:
            if msg.text_content is None:
                continue

            role = ""
            # Determine role based on direction column or from_user_id
            # Assuming msg object has attributes like msg.direction, msg.from_user_id
            if msg.direction == "incoming": # Message is to the bot from the active_user
                role = "user"
            elif msg.direction == "outgoing": # Message is from the bot to the active_user
                role = "model"
            # else: # Fallback using from_user_id if direction is ambiguous or not set
            #     if msg.from_user_id == active_user_id:
            #         role = "user"
            #     elif msg.from_user_id == bot_id:
            #         role = "model"
            #     else:
            #         logger.warning(f"Could not determine role for message ID: {msg.message_id}")
            #         continue
            
            if role:
                history.append({'role': role, 'parts': [{'text': msg.text_content.strip()}]})
        
    logger.info(f"Loaded {len(history)} messages from DB via SQLAlchemy for user {wa_id}.")
    db.close()
    return history

def ai_gemini_response(recipient_phone: str, message_text: str, db: Session):
    chat = client.chats.create(model="gemini-2.0-flash", config=generate_content_config, history=load_chat_history(recipient_phone,BOT_USER_ID, db))
    response = chat.send_message(message_text, config=generate_content_config)
    send_whatsapp_message(recipient_phone,response.text, db)
    print(response.text)


    # for message in chat.get_history():
    #     print(f'role - {message.role}',end=": ")
    #     print(message.parts[0].text)
    print(chat.get_history())
    # print(chat)