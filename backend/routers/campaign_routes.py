from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
from backend.db.session import get_db # Assuming get_db is in backend.db.session
from backend.controller import campaign_controller
from backend.schemas import campaign_schema # Imports from __init__.py
from backend.models.campaign import CampaignStatus, CampaignScheduleType, CampaignFrequencyLimit # For direct use if needed
from datetime import datetime

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.post("/", response_model=campaign_schema.CampaignResponse, status_code=201)
def create_new_campaign(campaign: campaign_schema.CampaignCreate, db: Session = Depends(get_db)):
    # Pydantic should validate enum values automatically.
    # Ensure scheduled_at is handled correctly if schedule_type is IMMEDIATE
    if campaign.schedule_type == CampaignScheduleType.IMMEDIATE and campaign.scheduled_at is not None:
        raise HTTPException(status_code=400, detail="scheduled_at must be null for immediate campaigns.")
    if campaign.schedule_type == CampaignScheduleType.SCHEDULED and campaign.scheduled_at is None:
        raise HTTPException(status_code=400, detail="scheduled_at is required for scheduled campaigns.")

    return campaign_controller.create_campaign(
        db=db,
        name=campaign.name,
        user_category_id=campaign.user_category_id,
        message_template_id=campaign.message_template_id,
        status=campaign.status,
        schedule_type=campaign.schedule_type,
        scheduled_at=campaign.scheduled_at,
        frequency_limit=campaign.frequency_limit
    )

@router.get("/{campaign_id}", response_model=campaign_schema.CampaignResponse)
def read_single_campaign(campaign_id: int, db: Session = Depends(get_db)):
    db_campaign = campaign_controller.get_campaign(db, campaign_id=campaign_id)
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return db_campaign

@router.get("/", response_model=List[campaign_schema.CampaignResponse])
def read_all_campaigns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return campaign_controller.get_campaigns(db, skip=skip, limit=limit)

@router.put("/{campaign_id}", response_model=campaign_schema.CampaignResponse)
def update_single_campaign(campaign_id: int, campaign: campaign_schema.CampaignUpdate, db: Session = Depends(get_db)):
    update_data = campaign.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    # Add validation for scheduled_at based on schedule_type if provided in update_data
    if 'schedule_type' in update_data or 'scheduled_at' in update_data:
        # Need the current state of the campaign or rely on Pydantic model defaults
        db_campaign = campaign_controller.get_campaign(db, campaign_id=campaign_id)
        if not db_campaign:
            raise HTTPException(status_code=404, detail="Campaign not found for update validation")

        current_schedule_type = update_data.get('schedule_type', db_campaign.schedule_type)
        current_scheduled_at = update_data.get('scheduled_at', db_campaign.scheduled_at)

        if current_schedule_type == CampaignScheduleType.IMMEDIATE and current_scheduled_at is not None:
             # If explicitly setting to IMMEDIATE, ensure scheduled_at is None or becomes None.
            if 'scheduled_at' in update_data and update_data['scheduled_at'] is not None:
                 raise HTTPException(status_code=400, detail="scheduled_at must be null for immediate campaigns.")
            elif 'scheduled_at' not in update_data: # if scheduled_at is not being changed, but type is, force it
                 update_data['scheduled_at'] = None

        if current_schedule_type == CampaignScheduleType.SCHEDULED and current_scheduled_at is None:
            raise HTTPException(status_code=400, detail="scheduled_at is required for scheduled campaigns.")

    updated_campaign = campaign_controller.update_campaign(db, campaign_id=campaign_id, update_data=update_data)
    if updated_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return updated_campaign

@router.delete("/{campaign_id}", status_code=204)
def delete_single_campaign(campaign_id: int, db: Session = Depends(get_db)):
    if not campaign_controller.delete_campaign(db, campaign_id=campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found")
    return Response(status_code=204)

@router.post("/process-active-campaigns", summary="Trigger Active Campaign Processing", tags=["Campaigns"])
def trigger_campaign_processing(db: Session = Depends(get_db)):
    try:
        campaign_controller.process_active_campaigns(db=db)
        return {"message": "Active campaign processing initiated successfully."}
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail=f"An error occurred during campaign processing: {str(e)}")
