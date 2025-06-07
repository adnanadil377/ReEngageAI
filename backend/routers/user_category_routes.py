from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
from backend.db.session import get_db # Assuming get_db is in backend.db.session
from backend.controller import user_category_controller
from backend.schemas import user_category_schema # Imports from __init__.py

router = APIRouter(prefix="/user-categories", tags=["User Categories"])

@router.post("/", response_model=user_category_schema.UserCategoryResponse, status_code=201)
def create_category(category: user_category_schema.UserCategoryCreate, db: Session = Depends(get_db)):
    return user_category_controller.create_user_category(db=db, name=category.name, description=category.description, filter_criteria=category.filter_criteria)

@router.get("/{category_id}", response_model=user_category_schema.UserCategoryResponse)
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = user_category_controller.get_user_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="User category not found")
    return db_category

@router.get("/", response_model=List[user_category_schema.UserCategoryResponse])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return user_category_controller.get_user_categories(db, skip=skip, limit=limit)

@router.put("/{category_id}", response_model=user_category_schema.UserCategoryResponse)
def update_category(category_id: int, category: user_category_schema.UserCategoryUpdate, db: Session = Depends(get_db)):
    update_data = category.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    updated_category = user_category_controller.update_user_category(db, category_id=category_id, update_data=update_data)
    if updated_category is None:
        raise HTTPException(status_code=404, detail="User category not found")
    return updated_category

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    if not user_category_controller.delete_user_category(db, category_id=category_id):
        raise HTTPException(status_code=404, detail="User category not found")
    return Response(status_code=204) # Return No Content response directly
