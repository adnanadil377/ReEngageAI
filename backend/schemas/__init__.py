from .user_category_schema import (
    UserCategoryBase,
    UserCategoryCreate,
    UserCategoryUpdate,
    UserCategoryResponse
)

from .message_template_schema import (
    MessageTemplateBase,
    MessageTemplateCreate,
    MessageTemplateUpdate,
    MessageTemplateResponse
)

from .campaign_schema import (
    CampaignBase,
    CampaignCreate,
    CampaignUpdate,
    CampaignResponse
)

from .campaign_analytics_schema import (
    CampaignAnalyticsSummary
)

# You might also have other existing schemas, e.g.:
# from .user_schema import User, UserCreate
# from .token_schema import Token, TokenData
# from .message_schema import Message, MessageCreate
# from .template_schema import Template, TemplateCreate # If this was the old one for MessageTemplate

# This makes it easier to import: from backend.schemas import UserCategoryCreate, etc.
