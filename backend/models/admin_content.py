from utils.db import db
from datetime import datetime
from bson import ObjectId

class Competition:
    collection = db['competitions'] if db is not None else None

    @staticmethod
    def create(name, date, venue, category):
        data = {
            "name": name,
            "date": date,
            "venue": venue,
            "category": category,
            "created_at": datetime.utcnow()
        }
        return Competition.collection.insert_one(data)

    @staticmethod
    def get_all():
        cursor = Competition.collection.find().sort("created_at", -1)
        events = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            events.append(doc)
        return events

    @staticmethod
    def delete(event_id):
        return Competition.collection.delete_one({"_id": ObjectId(event_id)})

class LearningVideo:
    collection = db['learning_videos'] if db is not None else None

    @staticmethod
    def create(title, subtitle, link, category="Beginner"):
        data = {
            "title": title,
            "subtitle": subtitle,
            "link": link,
            "category": category,
            "created_at": datetime.utcnow()
        }
        return LearningVideo.collection.insert_one(data)

    @staticmethod
    def get_all():
        cursor = LearningVideo.collection.find().sort("created_at", -1)
        videos = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            videos.append(doc)
        return videos

    @staticmethod
    def delete(video_id):
        return LearningVideo.collection.delete_one({"_id": ObjectId(video_id)})

    @staticmethod
    def update(video_id, title, subtitle, link, category):
        return LearningVideo.collection.update_one(
            {"_id": ObjectId(video_id)},
            {"$set": {
                "title": title,
                "subtitle": subtitle,
                "link": link,
                "category": category,
                "updated_at": datetime.utcnow()
            }}
        )