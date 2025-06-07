from sqlalchemy.orm import Session
from sqlalchemy import func, case
from models.campaign import Campaign
from models.campaign_analytics import CampaignAnalytics, CampaignAnalyticsStatus
from models.user import User # If needed for user details - included for now
from datetime import datetime

def get_campaign_summary_analytics(db: Session, campaign_id: int) -> dict:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        return {"error": "Campaign not found", "campaign_id": campaign_id}

    total_sent = db.query(CampaignAnalytics).filter(
        CampaignAnalytics.campaign_id == campaign_id
        # This counts all entries, including those that might be pending or failed before actual send by provider
    ).count()

    # More accurate sent count would be messages that aren't in a 'failed' state before actual send attempt.
    # However, 'SENT' in CampaignAnalytics means we *attempted* to send it.
    # For this purpose, total_sent as all entries for the campaign is a common way to start.

    total_delivered = db.query(CampaignAnalytics).filter(
        CampaignAnalytics.campaign_id == campaign_id,
        CampaignAnalytics.status == CampaignAnalyticsStatus.DELIVERED
    ).count()

    total_opened = db.query(CampaignAnalytics).filter( # "opened" is "read"
        CampaignAnalytics.campaign_id == campaign_id,
        CampaignAnalytics.status == CampaignAnalyticsStatus.READ
    ).count()

    total_replied = db.query(CampaignAnalytics).filter(
        CampaignAnalytics.campaign_id == campaign_id,
        CampaignAnalytics.status == CampaignAnalyticsStatus.REPLIED
    ).count()

    total_failed = db.query(CampaignAnalytics).filter(
        CampaignAnalytics.campaign_id == campaign_id,
        CampaignAnalytics.status == CampaignAnalyticsStatus.FAILED
    ).count()

    # Rates are typically based on successfully delivered messages
    open_rate = (total_opened / total_delivered) * 100 if total_delivered > 0 else 0
    response_rate = (total_replied / total_delivered) * 100 if total_delivered > 0 else 0
    # delivery_rate = (total_delivered / total_sent) * 100 if total_sent > 0 else 0 # If total_sent means actual attempts

    return {
        "campaign_id": campaign.id,
        "campaign_name": campaign.name,
        "total_records": total_sent, # Renamed from total_sent to avoid confusion with actual sends vs failures
        "total_delivered": total_delivered,
        "total_opened_read": total_opened, # Clarified name
        "total_replied": total_replied,
        "total_failed_on_send": total_failed, # Clarified what this failure means
        # "delivery_rate_percentage": round(delivery_rate, 2),
        "open_rate_percentage_on_delivered": round(open_rate, 2),
        "response_rate_percentage_on_delivered": round(response_rate, 2)
    }

def get_all_campaign_summaries(db: Session, skip: int = 0, limit: int = 100) -> list[dict]:
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()
    summaries = []
    for campaign in campaigns:
        summary = get_campaign_summary_analytics(db=db, campaign_id=campaign.id)
        # Add campaign specific details if not already in summary, or if summary returns error
        if "error" in summary:
             summaries.append({
                "campaign_id": campaign.id,
                "campaign_name": campaign.name,
                "status": campaign.status.value if campaign.status else None, # show current status
                "error": summary["error"]
            })
        else:
            # Add campaign status to the summary for easier overview
            summary["campaign_status"] = campaign.status.value if campaign.status else None
            summaries.append(summary)
    return summaries

# Example of a more detailed query (optional, can be added if needed)
# def get_campaign_replied_users(db: Session, campaign_id: int) -> list[User]:
#     replied_analytics = db.query(CampaignAnalytics).filter(
#         CampaignAnalytics.campaign_id == campaign_id,
#         CampaignAnalytics.status == CampaignAnalyticsStatus.REPLIED
#     ).all()
#     user_ids = [ra.user_id for ra in replied_analytics]
#     if not user_ids:
#         return []
#     return db.query(User).filter(User.user_id.in_(user_ids)).all()
