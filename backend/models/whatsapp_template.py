# models.py (SQLAlchemy model)
from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from db.base import Base
# If you have a User model to associate who created/owns the template (optional)
# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String, unique=True, index=True)
#     # ... other user fields
#     templates_created = relationship("WhatsappTemplateDB", back_populates="creator")


class WhatsappTemplateDB(Base):
    __tablename__ = "whatsapp_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False, comment="The exact name of the template registered with Meta")
    description = Column(Text, nullable=True, comment="User-friendly description for frontend display")
    language_code = Column(String, default="en_US", nullable=False, comment="Default language code, e.g., en_US, es")
    category = Column(String, nullable=True, comment="Template category (e.g., MARKETING, UTILITY, AUTHENTICATION)")
    status = Column(String, default="PENDING", comment="Status in Meta (e.g., PENDING, APPROVED, REJECTED, PAUSED) - you might sync this")

    # Storing component structure as JSON.
    # This provides flexibility but requires careful handling in the frontend and backend.
    # Example:
    # {
    #   "HEADER": {"format": "TEXT", "text": "Welcome {{1}}!", "example": {"header_text": ["Customer Name"]}},
    #   "BODY": {"text": "Your order {{1}} is confirmed. Track it at {{2}}.", "example": {"body_text": ["ORD123", "tracking.com/ORD123"]}},
    #   "FOOTER": {"text": "Thanks for choosing us!"},
    #   "BUTTONS": [
    #     {"type": "QUICK_REPLY", "text": "Track Order"},
    #     {"type": "URL", "text": "Visit Website", "url": "https://example.com/{{1}}", "example": ["product_page"]}
    #   ]
    # }
    components_structure = Column(JSON, nullable=True, comment="JSON representation of the template structure (placeholders, types)")

    # --- Optional fields for more detailed placeholder tracking ---
    # These can be derived from components_structure or stored explicitly if needed for querying
    # header_param_count = Column(Integer, default=0)
    # body_param_count = Column(Integer, default=0)
    # button_param_counts = Column(JSON, nullable=True) # e.g., {"url_buttons": [{"index": 0, "param_count": 1}]}

    # raw_meta_response = Column(JSON, nullable=True, comment="Store the full response from Meta when template was created/fetched (optional)")
    is_active = Column(Boolean, default=True, comment="Whether this template is actively usable in the system")

    # created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional: link to a user
    # creator = relationship("User", back_populates="templates_created") # Optional

    # def __repr__(self):
    #     return f"<WhatsappTemplateDB(name='{self.name}', language_code='{self.language_code}')>"