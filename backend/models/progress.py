from utils.db import db
from datetime import datetime

class Progress:
    @staticmethod
    def get_collection():
        if db is None:
            raise RuntimeError("Database connection is not established! Please check your MONGO_URI in environment variables and verify that MongoDB Atlas allows access from all IPs (0.0.0.0/0).")
        return db['progress']

    @staticmethod
    def get_user_progress(user_id):
        progress = Progress.get_collection().find_one({"user_id": str(user_id)})
        if not progress:
            progress = {
                "user_id": str(user_id),
                "plan_start_date": None,
                "plan_duration": 30,
                "streak": 0,
                "last_active_date": None,
                "completed_days": [], # List of {day, date}
                "completed_exercises": {}, # { 'day1': [id1, id2], ... }
                "unlocked_day": 1,
                "history": [],
                "score": 100,
                "created_at": datetime.utcnow()
            }
            Progress.get_collection().insert_one(progress)
        
        if "_id" in progress:
            progress["_id"] = str(progress["_id"])
        
        # Ensure new fields exist for old records
        if "completed_exercises" not in progress:
            progress["completed_exercises"] = {}
        if "unlocked_day" not in progress:
            # Derive unlocked_day for legacy records
            if "completed_days" in progress and len(progress["completed_days"]) > 0:
                # Handle both old list of ints and new list of dicts
                days = []
                for d in progress["completed_days"]:
                    if isinstance(d, dict): days.append(d['day'])
                    else: days.append(d)
                progress["unlocked_day"] = max(days) + 1
            else:
                progress["unlocked_day"] = 1

        # STREAK RESET LOGIC: If missed more than 1 day, reset to 0
        last_active = progress.get('last_active_date')
        if last_active and progress.get('streak', 0) > 0:
            if isinstance(last_active, str):
                last_active = datetime.fromisoformat(last_active)
            
            now = datetime.utcnow()
            days_diff = (now.date() - last_active.date()).days
            if days_diff > 1:
                Progress.get_collection().update_one(
                    {"user_id": str(user_id)},
                    {"$set": {"streak": 0}}
                )
                progress['streak'] = 0

        return progress

    @staticmethod
    def start_plan(user_id, duration=30):
        now = datetime.utcnow()
        Progress.get_collection().update_one(
            {"user_id": str(user_id)},
            {
                "$set": {
                    "plan_start_date": now,
                    "plan_duration": duration,
                    "completed_days": [],
                    "completed_exercises": {},
                    "unlocked_day": 1,
                    "streak": 0,
                    "score": 100,
                    "last_active_date": None
                }
            }
        )
        return Progress.get_user_progress(user_id)

    @staticmethod
    def mark_day_complete(user_id, day_num, calories=400):
        now = datetime.utcnow()
        progress = Progress.get_user_progress(user_id)
        
        # Check if already completed (handle both formats)
        completed_nums = []
        for d in progress.get('completed_days', []):
            if isinstance(d, dict): completed_nums.append(d['day'])
            else: completed_nums.append(d)

        if day_num in completed_nums:
            return progress

        # Strict Milestone Validation
        # Use explicit unlocked_day for validation
        unlocked_day = progress.get('unlocked_day', 1)
        
        if day_num > unlocked_day:
            raise ValueError(f"Cannot skip ahead to Day {day_num}. You must complete previous days first.")

        # Calculate streak
        streak = progress.get('streak', 0)
        last_active = progress.get('last_active_date')
        
        if last_active:
            # Pymongo might return datetime objects
            if isinstance(last_active, str):
                last_active = datetime.fromisoformat(last_active)
            
            delta = (now.date() - last_active.date()).days
            if delta == 1:
                streak += 1
            elif delta > 1:
                streak = 1
            # if delta == 0, streak remains same as already updated today
        else:
            streak = 1

        # Scoring logic (simplified: calculate days elapsed since start vs day_num)
        score = 100
        if progress.get('plan_start_date'):
            start_date = progress['plan_start_date']
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date)
            
            days_elapsed = (now.date() - start_date.date()).days + 1
            if days_elapsed > day_num:
                # User is completing Day X on chronological Day Y (Y > X)
                penalty = days_elapsed - day_num
                # Each day of delay reduces score slightly (up to a point)
                score = max(0, 100 - penalty)

        history_entry = {
            "date": now.strftime("%Y-%m-%d"),
            "calories": calories,
            "completed": 1,
            "day": day_num
        }

        Progress.get_collection().update_one(
            {"user_id": str(user_id)},
            {
                "$set": {
                    "streak": streak,
                    "last_active_date": now,
                    "score": score,
                    "unlocked_day": max(unlocked_day, day_num + 1)
                },
                "$push": {
                    "completed_days": {"day": day_num, "date": now},
                    "history": history_entry
                }
            }
        )
        
        return Progress.get_user_progress(user_id)

    @staticmethod
    def mark_exercise_complete(user_id, day_num, exercise_id):
        day_key = f"day{day_num}"
        Progress.get_collection().update_one(
            {"user_id": str(user_id)},
            {"$addToSet": {f"completed_exercises.{day_key}": exercise_id}}
        )
        return Progress.get_user_progress(user_id)

    @staticmethod
    def skip_day(user_id, day_num):
        Progress.get_collection().update_one(
            {"user_id": str(user_id)},
            {
                "$set": { "streak": 0 },
                "$push": { "skipped_days": day_num }
            }
        )
        return Progress.get_user_progress(user_id)
