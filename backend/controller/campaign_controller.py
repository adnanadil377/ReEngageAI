from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from backend.models.campaign import Campaign, CampaignStatus, CampaignScheduleType, CampaignFrequencyLimit
from backend.models.user import User
from backend.models.message_template import MessageTemplate
from backend.models.campaign_analytics import CampaignAnalytics, CampaignAnalyticsStatus
from backend.models.user_category import UserCategory
from backend.controller.user_category_controller import get_users_for_category
from backend.controller.message_controller import send_whatsapp_message # Assuming this path is correct
from datetime import datetime, timedelta
import logging
# from ast import literal_eval # Not needed if filter_criteria is properly handled as JSON by SQLAlchemy

# Configure logger
logger = logging.getLogger(__name__)

# It's good practice to configure logging at the application entry point
# For now, if no handlers are configured, add a basic one for this logger to see output.
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)


def check_frequency_limit(db: Session, user_id: int, campaign_id: int, frequency_limit: CampaignFrequencyLimit) -> bool:
    if frequency_limit == CampaignFrequencyLimit.NONE:
        return True

    now = datetime.utcnow()
    start_time = None
    if frequency_limit == CampaignFrequencyLimit.DAILY:
        start_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif frequency_limit == CampaignFrequencyLimit.WEEKLY:
        start_time = now - timedelta(days=now.weekday())
        start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
    elif frequency_limit == CampaignFrequencyLimit.MONTHLY:
        start_time = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else: # Should not happen if NONE is handled
        return True

    if start_time:
        message_count = db.query(CampaignAnalytics).filter(
            CampaignAnalytics.user_id == user_id,
            CampaignAnalytics.campaign_id == campaign_id, # Check for this specific campaign
            CampaignAnalytics.sent_at >= start_time,
            # Consider a broader set of statuses that indicate an attempt was made
            CampaignAnalytics.status.in_([CampaignAnalyticsStatus.SENT, CampaignAnalyticsStatus.DELIVERED, CampaignAnalyticsStatus.READ])
        ).count()
        return message_count == 0
    return True


def create_campaign(db: Session, name: str, user_category_id: int, message_template_id: int,
                    schedule_type: CampaignScheduleType, status: CampaignStatus,
                    scheduled_at: datetime | None = None,
                    frequency_limit: CampaignFrequencyLimit = CampaignFrequencyLimit.NONE) -> Campaign:
    db_campaign = Campaign(
        name=name,
        user_category_id=user_category_id,
        message_template_id=message_template_id,
        schedule_type=schedule_type,
        status=status,
        scheduled_at=scheduled_at,
        frequency_limit=frequency_limit
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

def get_campaign(db: Session, campaign_id: int) -> Campaign | None:
    return db.query(Campaign).filter(Campaign.id == campaign_id).first()

def get_campaigns(db: Session, skip: int = 0, limit: int = 100) -> list[Campaign]:
    return db.query(Campaign).offset(skip).limit(limit).all()

def update_campaign(db: Session, campaign_id: int, update_data: dict) -> Campaign | None:
    db_campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if db_campaign:
        for key, value in update_data.items():
            if key == "status" and isinstance(value, str):
                value = CampaignStatus(value)
            elif key == "schedule_type" and isinstance(value, str):
                value = CampaignScheduleType(value)
            elif key == "frequency_limit" and isinstance(value, str):
                value = CampaignFrequencyLimit(value)
            setattr(db_campaign, key, value)
        db.commit()
        db.refresh(db_campaign)
    return db_campaign

def delete_campaign(db: Session, campaign_id: int) -> bool:
    db_campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if db_campaign:
        db.delete(db_campaign)
        db.commit()
        return True
    return False


def process_active_campaigns(db: Session):
    logger.info("Starting to process active campaigns...")
    now = datetime.utcnow()

    # Fetch active campaigns that are either immediate or scheduled for the past
    campaigns_to_run = db.query(Campaign).filter(
        Campaign.status == CampaignStatus.ACTIVE,
        (Campaign.schedule_type == CampaignScheduleType.IMMEDIATE) |
        (Campaign.scheduled_at <= now)
    ).all()

    logger.info(f"Found {len(campaigns_to_run)} campaigns to process.")

    for campaign in campaigns_to_run:
        logger.info(f"Processing campaign ID: {campaign.id}, Name: {campaign.name}")

        user_category = db.query(UserCategory).filter(UserCategory.id == campaign.user_category_id).first()
        message_template = db.query(MessageTemplate).filter(MessageTemplate.id == campaign.message_template_id).first()

        if not user_category:
            logger.warning(f"User category ID {campaign.user_category_id} not found for campaign ID {campaign.id}. Skipping campaign.")
            continue
        if not message_template:
            logger.warning(f"Message template ID {campaign.message_template_id} not found for campaign ID {campaign.id}. Skipping campaign.")
            continue

        logger.info(f"Fetching users for category ID: {user_category.id} ({user_category.name}) for campaign ID: {campaign.id}")

        # Assuming get_users_for_category is available and works as expected
        eligible_users = get_users_for_category(db, user_category.id)
        logger.info(f"Found {len(eligible_users)} eligible users for campaign ID: {campaign.id}")

        for user in eligible_users:
            if not user.wa_id:
                logger.warning(f"User ID {user.user_id} has no wa_id. Skipping for campaign ID: {campaign.id}")
                continue

            if not check_frequency_limit(db, user.user_id, campaign.id, campaign.frequency_limit):
                logger.info(f"Frequency limit reached for user ID {user.user_id} and campaign ID: {campaign.id}. Skipping.")
                continue

            personalized_message = message_template.content.replace("{{name}}", user.name if user.name else "Customer")

            logger.info(f"Attempting to send message to user ID {user.user_id} (WA ID: {user.wa_id}) for campaign ID: {campaign.id}")

            analytics_entry = CampaignAnalytics(
                campaign_id=campaign.id,
                user_id=user.user_id,
                sent_at=datetime.utcnow(),
                status=CampaignAnalyticsStatus.SENT
            )
            db.add(analytics_entry)
            # It's often better to flush later or let commit handle it unless ID is needed before commit.
            # For safety and to ensure analytics_entry has an ID if other parts of the loop need it before commit:
            db.flush()

            try:
                # Ensure send_whatsapp_message is correctly imported and defined
                # from backend.controller.message_controller import send_whatsapp_message
                wa_message_id = send_whatsapp_message(recipient_phone=user.wa_id, message_text=personalized_message, db=db)

                if wa_message_id:
                    analytics_entry.wa_message_id = wa_message_id
                    # Status remains SENT, webhook updates will handle DELIVERED, READ etc.
                    logger.info(f"Message submitted for sending to WA ID: {user.wa_id}. WA Message ID: {wa_message_id} for campaign {campaign.id}")
                else:
                    analytics_entry.status = CampaignAnalyticsStatus.FAILED
                    analytics_entry.failed_reason = "send_whatsapp_message returned no wa_message_id"
                    logger.error(f"Failed to send message to WA ID: {user.wa_id} for campaign {campaign.id}. send_whatsapp_message returned None.")

            except Exception as e:
                logger.error(f"Exception sending message to WA ID: {user.wa_id} for campaign {campaign.id}: {str(e)}")
                analytics_entry.status = CampaignAnalyticsStatus.FAILED
                analytics_entry.failed_reason = str(e)

            # Commit after each message attempt to save analytics state incrementally
            db.commit()

        # After processing all users for a campaign
        if campaign.schedule_type == CampaignScheduleType.SCHEDULED and campaign.status == CampaignStatus.ACTIVE:
            # This logic marks a one-time scheduled campaign as COMPLETED after its run.
            # Recurring campaigns would need different logic (e.g., update a 'last_run_at' field and keep ACTIVE).
            campaign.status = CampaignStatus.COMPLETED
            # db.add(campaign) # Not needed if already part of session, just modify
            db.commit()
            logger.info(f"Campaign ID: {campaign.id} marked as COMPLETED.")

    logger.info("Finished processing active campaigns.")
