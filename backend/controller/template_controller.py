import os
import requests # Using synchronous requests for simplicity here
import logging
from fastapi import FastAPI, HTTPException, status
from dotenv import load_dotenv
from typing import List, Optional

# Import our Pydantic models
from schemas.template_schema import (
    SendTemplateRequest, SendTemplateResponse,
    WhatsAppMessageRequest, WhatsAppTemplate, WhatsAppLanguage,
    WhatsAppTemplateComponent, WhatsAppTemplateParameter
)

def construct_whatsapp_payload(data: SendTemplateRequest) -> WhatsAppMessageRequest:
    """
    Constructs the payload for the WhatsApp API based on our simplified request.
    """
    components = []

    # Header Component
    if data.header_params:
        if len(data.header_params) > 1:
            # According to docs, header can have at most 1 parameter (image, document, video, or text)
            # But the `parameters` array inside a component can have multiple for `text` type.
            # For media, it's usually one object { "type": "image", "image": { "link": "..." } }
            # For text with placeholders {{1}} {{2}} in header, it's one component with multiple text parameters.
            # Let's assume header_params is a list of parameter objects for a single header component.
            header_component_params = [WhatsAppTemplateParameter(**p) for p in data.header_params]
            components.append(WhatsAppTemplateComponent(type="header", parameters=header_component_params))


    # Body Component
    if data.body_params:
        # Assuming body_params is a list of parameter objects like {"type": "text", "text": "value1"}, {"type": "text", "text": "value2"}
        body_component_params = [WhatsAppTemplateParameter(**p) for p in data.body_params]
        components.append(WhatsAppTemplateComponent(type="body", parameters=body_component_params))

    # Button Components
    # This is more complex as each button placeholder might be its own component definition
    # or one button component can have multiple parameters (e.g. for quick replies).
    # For URL buttons with dynamic parts, it's usually:
    # { "type": "button", "sub_type": "url", "index": "0", "parameters": [{ "type": "text", "text": "dynamic_part_of_url" }] }
    if data.button_params:
        for btn_comp_data in data.button_params:
            # Each item in button_params should fully define a button component
            # e.g., {"type": "button", "sub_type": "url", "index": "0", "parameters": [{"type": "text", "text": "tracking_id"}]}
            button_parameters = [WhatsAppTemplateParameter(**p) for p in btn_comp_data.get("parameters", [])]
            components.append(WhatsAppTemplateComponent(
                type=btn_comp_data["type"], # "button"
                sub_type=btn_comp_data.get("sub_type"),
                index=btn_comp_data.get("index"),
                parameters=button_parameters if button_parameters else None
            ))

    template_payload = WhatsAppTemplate(
        name=data.template_name,
        language=WhatsAppLanguage(code=data.language_code),
        components=components if components else None # API expects null or omitted if no components
    )

    return WhatsAppMessageRequest(
        to=data.recipient_phone_number, # Ensure this includes country code but no '+'
        template=template_payload
    )