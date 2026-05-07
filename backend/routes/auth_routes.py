import os
import jwt
import datetime
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models.user import User
from utils.auth_middleware import token_required

# Create a Blueprint for auth routes
auth_bp = Blueprint('auth_bp', __name__)

def calculate_age(dob_str):
    try:
        birth_date = datetime.datetime.strptime(dob_str, "%Y-%m-%d")
        today = datetime.datetime.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return age
    except Exception:
        return 0

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    dob = data.get('dob') # YYYY-MM-DD
    gender = data.get('gender')

    if not all([name, email, password, dob, gender]):
        return jsonify({"message": "Missing required fields"}), 400

    # Age Validation Logic
    age = calculate_age(dob)
    if age <= 12:
        return jsonify({"message": "You must be above 12 years old to use ActiveLife."}), 403

    # Check if user already exists
    if User.get_by_email(email):
        return jsonify({"message": "User already exists"}), 409

    # Hash the password for security
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    
    # Save to database
    User.create_user(name, email, hashed_password, dob, age, gender)
    
    return jsonify({"message": "User registered successfully!"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.get_by_email(email)

    # Verify user exists and password matches the hash
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"message": "Invalid email or password"}), 401

    # Generate JWT token valid for 24 hours
    token = jwt.encode({
        'email': user['email'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, os.environ.get('JWT_SECRET'), algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "name": user['name'],
            "email": user['email'],
            "age": user.get('age'),
            "gender": user.get('gender'),
            "role": user.get('role', 'member')
        }
    }), 200

# Profile Routes
@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    from models.progress import Progress
    progress = Progress.get_user_progress(current_user['_id'])
    
    return jsonify({
        "name": current_user['name'],
        "email": current_user['email'],
        "age": current_user.get('age'),
        "gender": current_user.get('gender'),
        "height_cm": current_user.get('height_cm'),
        "weight_kg": current_user.get('weight_kg'),
        "bmi": current_user.get('bmi'),
        "profile_pic": current_user.get('profile_pic'),
        "role": current_user.get('role', 'member'),
        "history": progress.get('history', [])
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    name = request.form.get('name', current_user['name'])
    height_cm = request.form.get('height_cm')
    weight_kg = request.form.get('weight_kg')
    
    update_fields = {"name": name}
    
    if height_cm: update_fields["height_cm"] = float(height_cm)
    if weight_kg: update_fields["weight_kg"] = float(weight_kg)
        
    new_height = update_fields.get('height_cm', current_user.get('height_cm'))
    new_weight = update_fields.get('weight_kg', current_user.get('weight_kg'))
    
    if new_height and new_weight:
        height_m = float(new_height) / 100
        bmi = float(new_weight) / (height_m ** 2)
        update_fields["bmi"] = round(bmi, 2)

    if 'profile_pic' in request.files:
        file = request.files['profile_pic']
        if file and file.filename != '':
            filename = secure_filename(f"{current_user['email']}_{file.filename}")
            upload_path = os.path.join('backend', 'uploads', 'profile_pics', filename)
            os.makedirs(os.path.dirname(upload_path), exist_ok=True)
            file.save(upload_path)
            update_fields["profile_pic"] = f"/uploads/profile_pics/{filename}"

    User.update_user(current_user['email'], update_fields)
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "name": name,
            "profile_pic": update_fields.get("profile_pic", current_user.get("profile_pic")),
            "bmi": update_fields.get("bmi", current_user.get("bmi"))
        }
    }), 200