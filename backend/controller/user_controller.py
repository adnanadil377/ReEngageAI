from fastapi import FastAPI
from sqlalchemy.orm import Session
from db.session import SessionLocal
from models.user import User

# session=SessionLocal()

def create_user(name: str, wa_id: str, db: Session):
    user=User(name=name,wa_id=wa_id)
    db.add(user)
    db.commit()
    return {"user":user.name,"wa_id":user.wa_id,}


