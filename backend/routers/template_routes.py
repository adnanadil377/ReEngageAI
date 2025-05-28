from typing import List
from fastapi import APIRouter, Depends, Path, Request, HTTPException, requests, status
from sqlalchemy.orm import Session
from models.whatsapp_template import WhatsappTemplateDB
from controller.template_controller import construct_whatsapp_payload
from db.database import get_db
from models import user_credentials
from routers.auth_routes import get_current_user_credential
from db.session import SessionLocal

from controller.webhook_controller import WHATSAPP_TOKEN,WHATSAPP_NUMBER_ID, receive_webhook, send_whatsapp_message, verify_webhook
from schemas.template_schema import (
    SendTemplateRequest, SendTemplateResponse,
    WhatsAppMessageRequest, WhatsAppTemplate, WhatsAppLanguage,
    WhatsAppTemplateComponent, WhatsAppTemplateParameter, WhatsappTemplate, WhatsappTemplateCreate
)

import logging
# router = APIRouter()

router = APIRouter(
    prefix="/whatsapp-templates",
    tags=["WhatsApp Templates Management"],
    responses={404: {"description": "Not found"}},
)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

WHATSAPP_API_URL = f"https://graph.facebook.com/v22.0/{WHATSAPP_NUMBER_ID}/messages"

@router.post("/send-template", response_model=SendTemplateResponse, status_code=status.HTTP_200_OK)
async def send_whatsapp_template(template_data: SendTemplateRequest, current_user: user_credentials.UserCredentials = Depends(get_current_user_credential)):
    """
    Sends a WhatsApp template message.

    - **recipient_phone_number**: Recipient's phone number (e.g., 919876543210).
    - **template_name**: The exact name of your approved template.
    - **language_code**: Language code (e.g., "en_US").
    - **header_params**: List of parameter objects for the header.
      - For image: `[{"type": "image", "image": {"link": "https://example.com/image.png"}}]`
      - For text with placeholder `{{1}}`: `[{"type": "text", "text": "Your Name"}]`
    - **body_params**: List of parameter objects for the body.
      - For body with `{{1}}` and `{{2}}`: `[{"type": "text", "text": "Value1"}, {"type": "text", "text": "Value2"}]`
    - **button_params**: List of parameter objects for buttons (more advanced).
      - For a URL button `https://example.com/{{1}}` (index 0):
        `[{"type": "button", "sub_type": "url", "index": "0", "parameters": [{"type": "text", "text": "dynamic_path"}]}]`
    """
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }

    try:
        whatsapp_payload = construct_whatsapp_payload(template_data)
        payload_dict = whatsapp_payload.model_dump(exclude_none=True) # Convert Pydantic model to dict, removing None values
        logger.info(f"Sending payload to WhatsApp: {payload_dict}")
    except Exception as e:
        logger.error(f"Error constructing payload: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error in payload construction: {str(e)}")

    try:
        # Using synchronous requests. For production, consider httpx for async.
        response = requests.post(WHATSAPP_API_URL, headers=headers, json=payload_dict)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4XX or 5XX)

        response_data = response.json()
        logger.info(f"WhatsApp API Response: {response_data}")

        # Successful response usually contains messages array with an id
        message_id = None
        if "messages" in response_data and len(response_data["messages"]) > 0:
            message_id = response_data["messages"][0].get("id")

        return SendTemplateResponse(
            message="Template message sent successfully (or queued by Meta).",
            message_id=message_id,
            details=response_data
        )

    except requests.exceptions.HTTPError as e:
        error_details = "No error details from WhatsApp API."
        if e.response is not None:
            try:
                error_details = e.response.json()
            except requests.exceptions.JSONDecodeError:
                error_details = e.response.text
        logger.error(f"HTTP error sending to WhatsApp: {e.status_code} - {error_details}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, # Or e.response.status_code if you want to pass it through
            detail={"error": "Failed to send message via WhatsApp API", "api_response": error_details}
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception sending to WhatsApp: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "Network error or WhatsApp API unavailable.", "details": str(e)}
        )
    except Exception as e: # Catch-all for other unexpected errors
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "An unexpected error occurred.", "details": str(e)}
        )


# routers/templates.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Adjust imports based on your project structure
# from .. import models # This should be your models.py with WhatsappTemplateDB
# from .. import schemas # This should be your schemas.py with Pydantic models
# from ..database import get_db # Your DB session dependency


# --- Endpoint to ADD a new template ---
@router.post("/", response_model=WhatsappTemplate, status_code=status.HTTP_201_CREATED)
def create_whatsapp_template_entry(
    template_data: WhatsappTemplateCreate,
    db: Session = Depends(get_db)
):
    """
    Add a new WhatsApp template definition to the database.
    This is for your application's internal management and UI.
    The template must still be separately created and approved by Meta.

    - **name**: The exact name of the template as registered with Meta. Must be unique.
    - **description**: A user-friendly description of what the template is for.
    - **language_code**: The primary language code for this template (e.g., "en_US").
    - **category**: The category assigned by Meta (e.g., "UTILITY", "MARKETING").
    - **status**: Current status with Meta (e.g., "PENDING_APPROVAL", "APPROVED", "REJECTED").
    - **components_structure**: A JSON object describing the template's parts (header, body, footer, buttons)
      and any placeholders (e.g., `{{1}}`, `{{2}}`). Include example values if possible.
    - **is_active**: Whether this template definition should be considered active for use in your system.
    """
    db_template_check = db.query(WhatsappTemplateDB).filter(WhatsappTemplateDB.name == template_data.name).first()
    if db_template_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A template with the name '{template_data.name}' already exists."
        )

    # Create an instance of the SQLAlchemy model from the Pydantic model
    new_template = WhatsappTemplateDB(**template_data.model_dump())

    db.add(new_template)
    db.commit()
    db.refresh(new_template) # To get the ID and any other DB-generated values
    return new_template


# --- Endpoint to SHOW all templates ---
@router.get("/", response_model=List[WhatsappTemplate])
def get_all_whatsapp_templates(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None, # Optional query parameter to filter by active status
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of all WhatsApp template definitions stored in the database.
    Supports pagination and filtering by active status.

    - **skip**: Number of records to skip (for pagination).
    - **limit**: Maximum number of records to return (for pagination).
    - **is_active**: (Optional) Filter templates by their active status (`true` or `false`).
    """
    query = db.query(WhatsappTemplateDB)

    if is_active is not None:
        query = query.filter(WhatsappTemplateDB.is_active == is_active)

    templates = query.offset(skip).limit(limit).all()
    return templates