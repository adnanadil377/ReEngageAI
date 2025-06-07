from sqlalchemy import Column, Integer, String, JSON
from db.base import Base
from sqlalchemy.orm import relationship

class UserCategory(Base):
    __tablename__ = "user_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    filter_criteria = Column(JSON, nullable=False) # e.g., {"signup_date_before": "YYYY-MM-DD", "last_activity_after": "YYYY-MM-DD", "purchase_min_value": 100}

    campaigns = relationship("Campaign", back_populates="user_category")
