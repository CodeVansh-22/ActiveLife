
from flask import Blueprint, request, jsonify
from utils.auth_middleware import token_required
from models.progress import Progress

progress_bp = Blueprint('progress_bp', __name__)

@progress_bp.route('/', methods=['GET'])
@token_required
def get_progress(current_user):
    try:
        progress = Progress.get_user_progress(current_user['_id'])
        return jsonify(progress), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@progress_bp.route('/start', methods=['POST'])
@token_required
def start_plan(current_user):
    data = request.get_json()
    duration = data.get('duration', 30)
    try:
        progress = Progress.start_plan(current_user['_id'], duration)
        return jsonify({
            "message": "Plan started successfully!",
            "progress": progress
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@progress_bp.route('/complete-day', methods=['POST'])
@token_required
def complete_day(current_user):
    data = request.get_json()
    day_num = data.get('day_num')
    calories = data.get('calories', 400)

    if day_num is None:
        return jsonify({"message": "day_num is required"}), 400

    try:
        updated_progress = Progress.mark_day_complete(current_user['_id'], day_num, calories)
        return jsonify({
            "message": f"Day {day_num} marked as complete!",
            "progress": updated_progress
        }), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@progress_bp.route('/skip-day', methods=['POST'])
@token_required
def skip_day(current_user):
    data = request.get_json()
    day_num = data.get('day_num')
    try:
        updated_progress = Progress.skip_day(current_user['_id'], day_num)
        return jsonify({
            "message": f"Day {day_num} marked as skipped.",
            "progress": updated_progress
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@progress_bp.route('/complete-exercise', methods=['POST'])
@token_required
def complete_exercise(current_user):
    data = request.get_json()
    day_num = data.get('day_num')
    exercise_id = data.get('exercise_id')
    
    if day_num is None or not exercise_id:
        return jsonify({"message": "day_num and exercise_id are required"}), 400
        
    try:
        updated_progress = Progress.mark_exercise_complete(current_user['_id'], day_num, exercise_id)
        return jsonify({
            "message": "Exercise marked as complete!",
            "progress": updated_progress
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
