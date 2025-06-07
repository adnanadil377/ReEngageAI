from sqlalchemy.orm import Session
from backend.models.message_template import MessageTemplate

def create_message_template(db: Session, name: str, content: str) -> MessageTemplate:
    db_template = MessageTemplate(name=name, content=content)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def get_message_template(db: Session, template_id: int) -> MessageTemplate | None:
    return db.query(MessageTemplate).filter(MessageTemplate.id == template_id).first()

def get_message_templates(db: Session, skip: int = 0, limit: int = 100) -> list[MessageTemplate]:
    return db.query(MessageTemplate).offset(skip).limit(limit).all()

def update_message_template(db: Session, template_id: int, update_data: dict) -> MessageTemplate | None:
    db_template = db.query(MessageTemplate).filter(MessageTemplate.id == template_id).first()
    if db_template:
        for key, value in update_data.items():
            setattr(db_template, key, value)
        db.commit()
        db.refresh(db_template)
    return db_template

def delete_message_template(db: Session, template_id: int) -> bool:
    db_template = db.query(MessageTemplate).filter(MessageTemplate.id == template_id).first()
    if db_template:
        db.delete(db_template)
        db.commit()
        return True
    return False
