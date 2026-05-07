from flask import Blueprint, request, jsonify
from utils.auth_middleware import token_required
from services.ai_service import generate_diet_plan, generate_workout_plan
from models.ai_plan import AIPlan

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/generate-diet-plan', methods=['POST'])
@token_required
def generate_diet_route(current_user):
    data = request.get_json()
    medical_conditions = data.get('medical_conditions', 'None')
    diet_preference = data.get('diet_preference', 'vegetarian')
    activity_level = data.get('activity_level', 'Moderately Active')
    fitness_goal = data.get('fitness_goal', 'General Fitness')
    
    # Use verified data from current_user
    age = current_user.get('age')
    gender = current_user.get('gender', 'male')

    try:
        plan_content = generate_diet_plan(
            current_user, medical_conditions, diet_preference, 
            age, gender, activity_level, fitness_goal
        )
        
        # Check for safety rejection
        if isinstance(plan_content, str) and "I'm sorry" in plan_content:
            return jsonify({"message": plan_content}), 403

        AIPlan.save_plan(current_user['_id'], 'diet', plan_content)

        return jsonify({
            "message": "Diet plan generated successfully",
            "plan": plan_content
        }), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


@ai_bp.route('/generate-workout-plan', methods=['POST'])
@token_required
def generate_workout_route(current_user):
    data = request.get_json()
    goal = data.get('goal', 'General Fitness')
    medical_conditions = data.get('medical_conditions', 'None')
    activity_level = data.get('activity_level', 'Moderately Active')
    
    # Use verified data from current_user
    age = current_user.get('age')
    gender = current_user.get('gender', 'male')

    try:
        markdown_plan, structured_plan = generate_workout_plan(
            current_user, goal, medical_conditions, age, gender, activity_level
        )

        # Check for safety rejection
        if markdown_plan and "restricted" in markdown_plan.lower():
            return jsonify({"message": markdown_plan}), 403

        # Save the raw markdown
        AIPlan.save_plan(current_user['_id'], 'workout', markdown_plan)

        # If JSON parsing succeeded, enrich exercises and save
        if structured_plan and isinstance(structured_plan.get("plan"), list):
            for day_idx, day_obj in enumerate(structured_plan["plan"]):
                day_num = day_idx + 1
                for ex_idx, exercise in enumerate(day_obj.get("exercises", [])):
                    exercise["id"] = f"d{day_num}-e{ex_idx + 1}"
                    exercise["completed"] = False

            AIPlan.save_workout_plan(current_user['_id'], structured_plan)

        return jsonify({
            "message": "Workout plan generated successfully",
            "plan": markdown_plan,
            "structured_plan": structured_plan
        }), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


@ai_bp.route('/my-workout-plan', methods=['GET'])
@token_required
def get_my_workout_plan(current_user):
    try:
        structured_plan = AIPlan.get_workout_plan(current_user['_id'])
        if not structured_plan:
            return jsonify({"plan": None, "message": "No workout plan found. Generate one first."}), 200
        return jsonify({"plan": structured_plan}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@ai_bp.route('/latest-plan', methods=['GET'])
@token_required
def get_latest_plan_route(current_user):
    try:
        plan = AIPlan.get_latest_plan(current_user['_id'])
        if not plan:
            return jsonify({"plan": None, "message": "No plans found."}), 200
        plan['_id'] = str(plan['_id'])
        return jsonify({"plan": plan}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@ai_bp.route('/profile-plans', methods=['GET'])
@token_required
def get_profile_plans_route(current_user):
    try:
        plans = AIPlan.get_plans_by_type(current_user['_id'])
        return jsonify({"plans": plans}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500