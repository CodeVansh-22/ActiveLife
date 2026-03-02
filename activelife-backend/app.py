from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv 
from werkzeug.security import generate_password_hash, check_password_hash 
from ai_parser import get_ai_fitness_plan

# 1. Import the db object and your models from database.py
from database import db, User, Admin, AiPlan, Appointment, Feedback

# Load the environment variables
load_dotenv() 

app = Flask(__name__)
CORS(app)

# 2. Construct the Local MySQL Database URI strictly from .env
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS") 
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")

# Standard PyMySQL connection string (No SSL required for local MySQL)
db_uri = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

# 3. Apply Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
}

# 4. Bind the database to this specific Flask app
db.init_app(app)

# 5. Configure Gemini AI
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# ==========================================
# API ROUTES
# ==========================================

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"status": "error", "message": "Email already registered"}), 400

    hashed_password = generate_password_hash(password)

    new_user = User(
        name=name, 
        email=email, 
        password_hash=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"status": "success", "message": "User registered successfully!"}), 201


@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password_hash, password):
        return jsonify({
            "status": "success", 
            "message": "Login successful",
            "user": {"id": user.id, "name": user.name, "email": user.email}
        }), 200
    else:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401


@app.route('/api/generate-plan', methods=['POST'])
def generate_plan():
    data = request.json
    user_id = data.get('user_id') 
    user_bmi = data.get('bmi', 0)
    medical_conditions = data.get('medical_conditions', 'None')
    medication = data.get('medication', 'None')
    goal = data.get('goal', 'General Fitness')
    
    plan_text = get_ai_fitness_plan(user_bmi, medical_conditions, medication, goal)
    
    if plan_text:
        try:
            if user_id:
                new_plan = AiPlan(
                    user_id=user_id,
                    bmi_at_time=user_bmi,
                    medical_conditions_considered=medical_conditions,
                    generated_plan=plan_text 
                )
                db.session.add(new_plan)
                db.session.commit()
            
            return jsonify({"status": "success", "ai_plan": plan_text})
        except Exception as e:
            print(f"DATABASE SAVE ERROR: {e}")
            return jsonify({"status": "error", "message": str(e)})
    else:
        return jsonify({"status": "error", "message": "AI failed to generate."})

# ==========================================
# SERVER START
# ==========================================

if __name__ == '__main__':
    # Ensure you have manually created the 'activelife_db' database in MySQL first!
    with app.app_context():
        db.create_all()
        print("Database models synced from database.py successfully!")
        
    app.run(debug=True, port=5000)