# schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class WhatsAppLanguage(BaseModel):
    code: str = Field(default="en_US", description="Language code (e.g., 'en_US', 'es_MX', 'en')")

class WhatsAppTemplateParameter(BaseModel):
    type: str # "text", "currency", "date_time", "image", "document", "video"
    text: Optional[str] = None
    currency: Optional[Dict[str, Any]] = None # {"fallback_value": "$10.99", "code": "USD", "amount_1000": 10990}
    date_time: Optional[Dict[str, str]] = None # {"fallback_value": "February 25, 1977"}
    image: Optional[Dict[str, str]] = None # {"link": "http(s)://URL"} or {"id": "MEDIA_ID"}
    document: Optional[Dict[str, str]] = None # {"link": "http(s)://URL", "filename": "optional_filename.pdf"} or {"id": "MEDIA_ID"}
    video: Optional[Dict[str, str]] = None # {"link": "http(s)://URL"} or {"id": "MEDIA_ID"}

class WhatsAppTemplateComponent(BaseModel):
    type: str  # "header", "body", "button"
    parameters: Optional[List[WhatsAppTemplateParameter]] = None
    sub_type: Optional[str] = None # For buttons: "url", "quick_reply"
    index: Optional[str] = None # For buttons: "0", "1", ... for URL buttons

class WhatsAppTemplate(BaseModel):
    name: str
    language: WhatsAppLanguage
    components: Optional[List[WhatsAppTemplateComponent]] = None

class WhatsAppMessageRequest(BaseModel):
    messaging_product: str = "whatsapp"
    to: str = Field(..., description="Recipient's WhatsApp number with country code, e.g., 15550001234")
    type: str = "template"
    template: WhatsAppTemplate

# --- Our API Request Model (what our FastAPI endpoint will accept) ---
class SendTemplateRequest(BaseModel):
    recipient_phone_number: str = Field(..., description="E.g., 919876543210 (no +)")
    template_name: str = Field(..., description="Name of the approved template")
    language_code: str = Field(default="en_US", description="E.g., 'en_US', 'en'")
    # Parameters for different sections
    header_params: Optional[List[Dict[str, Any]]] = Field(None, description="Parameters for the header component, e.g., [{'type': 'image', 'image': {'link': 'url'}}]. Max 1 for header.")
    body_params: Optional[List[Dict[str, Any]]] = Field(None, description="Parameters for the body, e.g., [{'type': 'text', 'text': 'John Doe'}]")
    # For button placeholders (less common for basic templates, often used for dynamic URLs in CTA buttons)
    # Example: Template has a button "Visit us at https://example.com/{{1}}"
    # button_params would be like: [{"type": "button", "sub_type": "url", "index": "0", "parameters": [{"type": "text", "text": "dynamic_path_segment"}] }]
    button_params: Optional[List[Dict[str, Any]]] = Field(None, description="Parameters for button components.")


class SendTemplateResponse(BaseModel):
    message: str
    message_id: Optional[str] = None
    details: Optional[Any] = None


# Schema for creating a new template entry in the DB
class WhatsappTemplateCreate(BaseModel):
    name: str = Field(..., description="The exact name of the template registered with Meta")
    description: Optional[str] = Field(None, description="User-friendly description for the template")
    language_code: str = Field(default="en_US", description="Default language code, e.g., 'en_US', 'es'")
    category: Optional[str] = Field(None, description="Template category (e.g., MARKETING, UTILITY)")
    status: Optional[str] = Field(default="PENDING_APPROVAL", description="Status of the template with Meta")
    components_structure: Optional[Dict[str, Any]] = Field(
        None,
        description="JSON object detailing template components (header, body, buttons) and placeholders",
        examples=[{
            "HEADER": {"format": "TEXT", "text": "Invoice for {{1}}", "example_text": ["INV001"]},
            "BODY": {"text": "Hi {{1}}, your code is {{2}}.", "example_text": ["David", "5678"]},
            "BUTTONS": [
                {"type": "QUICK_REPLY", "text": "Confirm"},
                {"type": "URL", "text": "View Details", "url": "https://site.com/order/{{1}}", "example_url_suffix": ["12345"]}
            ]
        }]
    )
    is_active: bool = Field(default=True, description="Whether this template can be actively used")

# Schema for representing a template when reading from the DB (response model)
class WhatsappTemplate(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    language_code: str
    category: Optional[str] = None
    status: Optional[str] = None
    components_structure: Optional[Dict[str, Any]] = None
    is_active: bool

    class Config:
        # orm_mode = True # Pydantic V1
        from_attributes = True # Pydantic V2