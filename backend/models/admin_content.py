from utils.db import db
from datetime import datetime
from bson import ObjectId

class Competition:
    @staticmethod
    def get_collection():
        if db is None:
            raise RuntimeError("Database connection is not established! Please check your MONGO_URI in environment variables and verify that MongoDB Atlas allows access from all IPs (0.0.0.0/0).")
        return db['competitions']

    @staticmethod
    def create(name, date, venue, category):
        data = {
            "name": name,
            "date": date,
            "venue": venue,
            "category": category,
            "created_at": datetime.utcnow()
        }
        return Competition.get_collection().insert_one(data)

    @staticmethod
    def get_all():
        cursor = Competition.get_collection().find().sort("created_at", -1)
        events = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            events.append(doc)
        return events

    @staticmethod
    def delete(event_id):
        return Competition.get_collection().delete_one({"_id": ObjectId(event_id)})

class LearningVideo:
    @staticmethod
    def get_collection():
        if db is None:
            raise RuntimeError("Database connection is not established! Please check your MONGO_URI in environment variables and verify that MongoDB Atlas allows access from all IPs (0.0.0.0/0).")
        return db['learning_videos']

    @staticmethod
    def create(title, subtitle, link, category="Beginner"):
        data = {
            "title": title,
            "subtitle": subtitle,
            "link": link,
            "category": category,
            "created_at": datetime.utcnow()
        }
        return LearningVideo.get_collection().insert_one(data)

    @staticmethod
    def get_all():
        cursor = LearningVideo.get_collection().find().sort("created_at", -1)
        videos = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            videos.append(doc)
        return videos

    @staticmethod
    def delete(video_id):
        return LearningVideo.get_collection().delete_one({"_id": ObjectId(video_id)})

    @staticmethod
    def update(video_id, title, subtitle, link, category):
        return LearningVideo.get_collection().update_one(
            {"_id": ObjectId(video_id)},
            {"$set": {
                "title": title,
                "subtitle": subtitle,
                "link": link,
                "category": category,
                "updated_at": datetime.utcnow()
            }}
        )