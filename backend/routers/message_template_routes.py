from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
# from db.session import get_db # Assuming get_db is in backend.db.session
from db.database import get_db
from controller import message_template_controller
from schemas import message_template_schema # Imports from __init__.py

router = APIRouter(prefix="/message-templates", tags=["Message Templates"])

@router.post("/", response_model=message_template_schema.MessageTemplateResponse, status_code=201)
def create_template(template: message_template_schema.MessageTemplateCreate, db: Session = Depends(get_db)):
    return message_template_controller.create_message_template(db=db, name=template.name, content=template.content)

@router.get("/{template_id}", response_model=message_template_schema.MessageTemplateResponse)
def read_template(template_id: int, db: Session = Depends(get_db)):
    db_template = message_template_controller.get_message_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Message template not found")
    return db_template

@router.get("/", response_model=List[message_template_schema.MessageTemplateResponse])
def read_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return message_template_controller.get_message_templates(db, skip=skip, limit=limit)

@router.put("/{template_id}", response_model=message_template_schema.MessageTemplateResponse)
def update_template(template_id: int, template: message_template_schema.MessageTemplateUpdate, db: Session = Depends(get_db)):
    update_data = template.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    updated_template = message_template_controller.update_message_template(db, template_id=template_id, update_data=update_data)
    if updated_template is None:
        raise HTTPException(status_code=404, detail="Message template not found")
    return updated_template

@router.delete("/{template_id}", status_code=204)
def delete_template(template_id: int, db: Session = Depends(get_db)):
    if not message_template_controller.delete_message_template(db, template_id=template_id):
        raise HTTPException(status_code=404, detail="Message template not found")
    return Response(status_code=204)
