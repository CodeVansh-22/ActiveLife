from flask import Blueprint, jsonify
from utils.auth_middleware import token_required
from models.admin_content import Competition, LearningVideo

content_bp = Blueprint('content_bp', __name__)

@content_bp.route('/competitions', methods=['GET'])
@token_required
def get_competitions(current_user):
    events = Competition.get_all()
    return jsonify({"events": events}), 200

@content_bp.route('/videos', methods=['GET'])
@token_required
def get_videos(current_user):
    videos = LearningVideo.get_all()
    return jsonify({"videos": videos}), 200
