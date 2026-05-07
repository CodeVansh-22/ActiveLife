from flask import Blueprint, request, jsonify
from utils.auth_middleware import token_required
from models.user import User

bmi_bp = Blueprint('bmi_bp', __name__)

@bmi_bp.route('/calculate', methods=['POST'])
@token_required
def calculate_bmi(current_user):
    data = request.get_json()
    height_cm = data.get('height_cm')
    weight_kg = data.get('weight_kg')
    age       = data.get('age')
    gender    = data.get('gender', 'male')

    if not height_cm or not weight_kg:
        return jsonify({"message": "Height (cm) and weight are required"}), 400

    try:
        height_cm = float(height_cm)
        weight_kg = float(weight_kg)
    except ValueError:
        return jsonify({"message": "Invalid input format"}), 400

    # BMI calculation logic based on feet/inches internally
    # 1. Convert height_cm to total inches
    total_inches = height_cm / 2.54
    height_ft = int(total_inches // 12)
    height_in = round(total_inches % 12, 1)
    
    # 2. Use height in meters for formula: weight(kg) / height(m)^2
    height_m = height_cm / 100
    bmi_value = weight_kg / (height_m ** 2)
    bmi_rounded = round(bmi_value, 2)

    # Determine category
    if bmi_rounded < 18.5:
        category = "Underweight"
    elif 18.5 <= bmi_rounded < 24.9:
        category = "Normal weight"
    elif 25 <= bmi_rounded < 29.9:
        category = "Overweight"
    else:
        category = "Obese"

    # Build update fields
    update_fields = {
        "height_cm": height_cm,
        "height_ft": height_ft,
        "height_in": height_in,
        "weight_kg": weight_kg,
        "bmi":       bmi_rounded,
        "gender":    gender,
    }
    if age:
        update_fields["age"] = int(age)

    # Save to MongoDB
    User.collection.update_one(
        {"email": current_user['email']},
        {"$set": update_fields}
    )

    return jsonify({
        "message":  "BMI calculated and saved successfully",
        "bmi":      bmi_rounded,
        "category": category
    }), 200