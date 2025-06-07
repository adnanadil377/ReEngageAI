from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
# from db.session import get_db # Assuming get_db is in backend.db.session
from db.database import get_db

from controller import campaign_analytics_controller
from schemas import campaign_analytics_schema # Imports from __init__.py

router = APIRouter(prefix="/campaign-analytics", tags=["Campaign Analytics"])

@router.get("/summary/{campaign_id}", response_model=campaign_analytics_schema.CampaignAnalyticsSummary)
def get_summary(campaign_id: int, db: Session = Depends(get_db)):
    summary = campaign_analytics_controller.get_campaign_summary_analytics(db, campaign_id=campaign_id)
    if "error" in summary: # Check if controller returned an error structure
        raise HTTPException(status_code=404, detail=summary["error"])
    return summary

@router.get("/summaries/", response_model=List[campaign_analytics_schema.CampaignAnalyticsSummary])
def get_all_summaries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    summaries = campaign_analytics_controller.get_all_campaign_summaries(db, skip=skip, limit=limit)
    # The controller already handles campaigns that might error during individual summary generation.
    # So, we can directly return the list.
    return summaries
