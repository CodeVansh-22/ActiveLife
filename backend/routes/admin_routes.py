from flask import Blueprint, request, jsonify
from utils.auth_middleware import admin_required
from models.user import User
from models.admin_content import Competition, LearningVideo
from models.progress import Progress

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users(current_user):
    users_cursor = User.collection.find({}, {"password": 0})
    
    all_users = []
    for u in users_cursor:
        u['_id'] = str(u['_id'])
        if 'created_at' in u:
            u['created_at'] = u['created_at'].isoformat()
        
        # Fetch progress info
        progress = Progress.get_user_progress(u['_id'])
        u['progress'] = {
            "streak": progress.get('streak', 0),
            "score": progress.get('score', 100),
            "completed_days": len(progress.get('completed_days', [])),
            "history": progress.get('history', [])
        }
        
        all_users.append(u)
        
    return jsonify({"users": all_users}), 200

# ── COMPETITIONS ──
@admin_bp.route('/competitions', methods=['POST'])
@admin_required
def add_competition(current_user):
    data = request.get_json()
    name = data.get('name')
    date = data.get('date')
    venue = data.get('venue')
    category = data.get('category')
    
    if not all([name, date, venue, category]):
        return jsonify({"message": "Missing fields"}), 400
        
    Competition.create(name, date, venue, category)
    return jsonify({"message": "Competition added successfully"}), 201

@admin_bp.route('/competitions/<cid>', methods=['DELETE'])
@admin_required
def delete_competition(current_user, cid):
    Competition.delete(cid)
    return jsonify({"message": "Competition deleted"}), 200

# ── LEARNING VIDEOS ──
@admin_bp.route('/videos', methods=['POST'])
@admin_required
def add_video(current_user):
    data = request.get_json()
    title = data.get('title')
    subtitle = data.get('subtitle')
    link = data.get('link')
    category = data.get('category', 'Beginner')
    
    if not all([title, subtitle, link]):
        return jsonify({"message": "Missing fields"}), 400
        
    LearningVideo.create(title, subtitle, link, category)
    return jsonify({"message": "Video added successfully"}), 201

@admin_bp.route('/videos/<vid>', methods=['DELETE'])
@admin_required
def delete_video(current_user, vid):
    LearningVideo.delete(vid)
    return jsonify({"message": "Video deleted"}), 200

@admin_bp.route('/videos/<vid>', methods=['PUT'])
@admin_required
def update_video(current_user, vid):
    data = request.get_json()
    title = data.get('title')
    subtitle = data.get('subtitle')
    link = data.get('link')
    category = data.get('category', 'Beginner')
    
    if not all([title, subtitle, link]):
        return jsonify({"message": "Missing fields"}), 400
        
    LearningVideo.update(vid, title, subtitle, link, category)
    return jsonify({"message": "Video updated successfully"}), 200