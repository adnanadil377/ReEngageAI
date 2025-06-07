from sqlalchemy.orm import Session
from models.user import User
from models.user_category import UserCategory
from datetime import datetime, timezone

def is_user_in_category(user: User, category_criteria: dict) -> bool:
    '''
    Evaluates if a user meets the criteria for a given category.

    :param user: The User object.
    :param category_criteria: A dictionary containing the filter criteria.
                              Example: {"signup_date_before": "YYYY-MM-DD",
                                        "last_activity_after": "YYYY-MM-DD",
                                        "purchase_min_value": 100,
                                        "min_purchase_count": 5}
    :return: True if the user meets all criteria, False otherwise.
    '''
    if not user:
        return False

    # Check signup date
    if 'signup_date_before' in category_criteria:
        try:
            signup_date_before = datetime.strptime(category_criteria['signup_date_before'], '%Y-%m-%d').replace(tzinfo=timezone.utc)
            if user.created_at.replace(tzinfo=timezone.utc) >= signup_date_before:
                return False
        except ValueError:
            # Handle invalid date format in criteria if necessary
            pass

    if 'signup_date_after' in category_criteria:
        try:
            signup_date_after = datetime.strptime(category_criteria['signup_date_after'], '%Y-%m-%d').replace(tzinfo=timezone.utc)
            if user.created_at.replace(tzinfo=timezone.utc) <= signup_date_after:
                return False
        except ValueError:
            pass

    # Check last activity date
    if 'last_activity_before' in category_criteria:
        try:
            last_activity_before = datetime.strptime(category_criteria['last_activity_before'], '%Y-%m-%d').replace(tzinfo=timezone.utc)
            if user.last_activity_at is None or user.last_activity_at.replace(tzinfo=timezone.utc) >= last_activity_before:
                return False
        except ValueError:
            pass

    if 'last_activity_after' in category_criteria:
        try:
            last_activity_after = datetime.strptime(category_criteria['last_activity_after'], '%Y-%m-%d').replace(tzinfo=timezone.utc)
            if user.last_activity_at is None or user.last_activity_at.replace(tzinfo=timezone.utc) <= last_activity_after:
                return False
        except ValueError:
            pass

    # Check purchase history (example: minimum total purchase value)
    if 'purchase_min_value' in category_criteria:
        min_value = category_criteria['purchase_min_value']
        if not isinstance(user.purchase_history, dict) or user.purchase_history.get('total_value', 0) < min_value:
            return False

    if 'min_purchase_count' in category_criteria:
        min_count = category_criteria['min_purchase_count']
        if not isinstance(user.purchase_history, dict) or user.purchase_history.get('total_orders', 0) < min_count:
            return False

    # Add more criteria checks as needed (e.g., specific items purchased, etc.)

    return True # If all checks pass or no relevant criteria are defined for a check


def get_users_for_category(db: Session, category_id: int) -> list[User]:
    '''
    Retrieves all users that fall into a specific category.
    This is a potentially performance-intensive operation if done frequently for large user bases.
    Consider if dynamic checking or pre-assigning categories is better.
    '''
    category = db.query(UserCategory).filter(UserCategory.id == category_id).first()
    if not category:
        return []

    all_users = db.query(User).all()
    eligible_users = []
    for user in all_users:
        if is_user_in_category(user, category.filter_criteria):
            eligible_users.append(user)

    return eligible_users

# CRUD operations for UserCategory

def create_user_category(db: Session, name: str, description: str, filter_criteria: dict) -> UserCategory:
    db_category = UserCategory(name=name, description=description, filter_criteria=filter_criteria)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_user_category(db: Session, category_id: int) -> UserCategory | None:
    return db.query(UserCategory).filter(UserCategory.id == category_id).first()

def get_user_categories(db: Session, skip: int = 0, limit: int = 100) -> list[UserCategory]:
    return db.query(UserCategory).offset(skip).limit(limit).all()

def update_user_category(db: Session, category_id: int, update_data: dict) -> UserCategory | None:
    db_category = db.query(UserCategory).filter(UserCategory.id == category_id).first()
    if db_category:
        for key, value in update_data.items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_user_category(db: Session, category_id: int) -> bool:
    db_category = db.query(UserCategory).filter(UserCategory.id == category_id).first()
    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False

# Future considerations:
# - A service/task to periodically update a user's category membership (e.g., a 'current_category_id' field in User model)
#   or determine it dynamically at the time of campaign execution.
