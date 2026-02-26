from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize the db object here, but we will bind it to the app later in app.py
db = SQLAlchemy()

# ==========================================
# DATABASE MODELS
# ==========================================

class Admin(db.Model):
    __tablename__ = 'admin'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    bmi = db.Column(db.Float, nullable=True)
    medical_history = db.Column(db.Text, nullable=True)
    registered_on = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    ai_plans = db.relationship('AiPlan', backref='user', lazy=True)
    appointments = db.relationship('Appointment', backref='user', lazy=True)
    feedbacks = db.relationship('Feedback', backref='user', lazy=True)

class AiPlan(db.Model):
    __tablename__ = 'ai_plan'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    bmi_at_time = db.Column(db.Float, nullable=False)
    medical_conditions_considered = db.Column(db.Text, nullable=True)
    generated_plan = db.Column(db.Text, nullable=False) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Appointment(db.Model):
    __tablename__ = 'appointment_booking'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    trainer_name = db.Column(db.String(100), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default="Pending")

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False) 
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)