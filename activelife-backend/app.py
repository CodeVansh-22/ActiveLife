from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv 
from werkzeug.security import generate_password_hash, check_password_hash 
from ai_parser import get_ai_fitness_plan

# 1. Import the db object and your models from the new database.py file
from database import db, User, Admin, AiPlan, Appointment, Feedback

# Load the environment variables
load_dotenv() 

app = Flask(__name__)
CORS(app)

# 2. Construct the TiDB Database URI
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")

db_uri = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}?ssl_verify_cert=true&ssl_verify_identity=true"

# 3. Apply Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 4. Bind the database to this specific Flask app
db.init_app(app)

# 5. Configure Gemini AI
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

# ==========================================
# API ROUTES
# ==========================================
# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    # 1. Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"status": "error", "message": "Email already registered"}), 400

    # 2. Hash the password for security
    hashed_password = generate_password_hash(password)

    # 3. Create the new user and save to database
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

    # 1. Find the user by email
    user = User.query.filter_by(email=email).first()

    # 2. Check if user exists AND password matches the hash
    if user and check_password_hash(user.password_hash, password):
        # In a production app, you would generate a JWT token here.
        # For now, we'll return a success status and the user's ID and Name.
        return jsonify({
            "status": "success", 
            "message": "Login successful",
            "user": {"id": user.id, "name": user.name, "email": user.email}
        }), 200
    else:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

# 2. Update the generate-plan route
# 2. Update the generate-plan route
@app.route('/api/generate-plan', methods=['POST'])
def generate_plan():
    data = request.json
    user_id = data.get('user_id') 
    user_bmi = data.get('bmi', 0)
    medical_conditions = data.get('medical_conditions', 'None')
    medication = data.get('medication', 'None')
    goal = data.get('goal', 'General Fitness')
    
    # Use your new parser file
    plan_text = get_ai_fitness_plan(user_bmi, medical_conditions, medication, goal)
    
    if plan_text:
        try:
            if user_id:
                # We update these names to match your database.py exactly!
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
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
        print("Database models synced from database.py successfully!")
        
    app.run(debug=True, port=5000)