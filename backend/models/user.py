from utils.db import db
from datetime import datetime

class User:
    collection = db['users'] if db is not None else None

    @staticmethod
    def create_user(name, email, password_hash, dob, age, gender, role="member"):
        user_data = {
            "name": name,
            "email": email.lower(),
            "password": password_hash,
            "dob": dob, # Format: YYYY-MM-DD
            "age": int(age),
            "gender": gender, # 'Male' or 'Female'
            "role": role, # 'member' or 'admin'
            "height_cm": None,
            "weight_kg": None,
            "bmi": None,
            "profile_pic": None,
            "created_at": datetime.utcnow()
        }
        return User.collection.insert_one(user_data)

    @staticmethod
    def get_by_email(email):
        return User.collection.find_one({"email": email.lower()})

    @staticmethod
    def update_user(email, update_fields):
        return User.collection.update_one(
            {"email": email.lower()},
            {"$set": update_fields}
        )