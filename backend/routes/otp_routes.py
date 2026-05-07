import os
import random
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models.user import User
from utils.db import db

otp_bp = Blueprint('otp_bp', __name__)

# Use a separate MongoDB collection to temporarily store OTPs
otp_store = db['otp_store'] if db is not None else None

def send_otp_email(recipient_email, otp_code, phone_number):
    """Send OTP to recipient email via Gmail SMTP."""
    sender_email = os.environ.get('EMAIL_SENDER', '')
    sender_password = os.environ.get('EMAIL_PASSWORD', '')

    if not sender_email or not sender_password:
        print(f"[DEV MODE] OTP for {recipient_email}: {otp_code}")
        return True  # In dev mode without email config, just log it

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'ActiveLife — Your Password Reset OTP'
        msg['From'] = sender_email
        msg['To'] = recipient_email

        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a1e29; color: white; padding: 2rem; border-radius: 12px;">
            <h2 style="color: #f47a20;">🏋️ ActiveLife — Password Reset</h2>
            <p>We received a request to reset your password for the account associated with:</p>
            <ul>
                <li><strong>Email:</strong> {recipient_email}</li>
            </ul>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="text-align: center; background: #f47a20; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <h1 style="color: white; letter-spacing: 0.5rem; margin: 0;">{otp_code}</h1>
            </div>
            <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
            <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">If you did not request this, you can safely ignore this email.</p>
        </div>
        """

        msg.attach(MIMEText(html_body, 'html'))

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())

        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False


def send_otp_sms(phone_number, otp_code):
    """Send OTP via Fast2SMS Quick SMS API (no DLT required)."""
    api_key = os.environ.get('FAST2SMS_API_KEY', '').strip()
    print(f"[SMS] Using API key prefix: {api_key[:8]}... | Phone: {phone_number} | OTP: {otp_code}")

    if not api_key:
        print(f"[DEV MODE] No FAST2SMS_API_KEY found. OTP: {otp_code}")
        return True

    try:
        url = "https://www.fast2sms.com/dev/bulkV2"
        params = {
            "authorization": api_key,
            "route": "q",
            "message": f"Your ActiveLife password reset OTP is: {otp_code}. Valid for 10 minutes. Do not share.",
            "language": "english",
            "flash": "0",
            "numbers": phone_number
        }
        response = requests.get(url, params=params)
        result = response.json()
        print(f"[SMS] Fast2SMS response: {result}")
        if result.get('return'):
            return True
        else:
            print(f"[SMS] Fast2SMS error: {result}")
            return False
    except Exception as e:
        print(f"[SMS] Exception: {str(e)}")
        return False


@otp_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    method = data.get('method', 'email')  # 'email' or 'phone'

    if not email:
        return jsonify({"message": "Email is required."}), 400
    if method == 'phone' and not phone:
        return jsonify({"message": "Phone number is required."}), 400

    # Check user exists
    user = User.get_by_email(email)
    if not user:
        return jsonify({"message": "If this email is registered, an OTP will be sent."}), 200

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    otp_store.update_one(
        {"email": email},
        {"$set": {
            "email": email,
            "phone": phone,
            "otp": otp_code,
            "expires_at": expires_at,
            "verified": False
        }},
        upsert=True
    )

    if method == 'phone':
        send_otp_sms(phone, otp_code)
        return jsonify({"message": f"OTP sent to +91{phone} via SMS."}), 200
    else:
        send_otp_email(email, otp_code, phone)
        return jsonify({"message": f"OTP sent to {email} via email."}), 200


@otp_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    otp_input = data.get('otp', '').strip()

    if not email or not otp_input:
        return jsonify({"message": "Email and OTP are required."}), 400

    record = otp_store.find_one({"email": email})

    if not record:
        return jsonify({"message": "No OTP request found for this email."}), 400

    if datetime.utcnow() > record['expires_at']:
        return jsonify({"message": "OTP has expired. Please request a new one."}), 400

    if record['otp'] != otp_input:
        return jsonify({"message": "Incorrect OTP. Please try again."}), 400

    # Mark as verified so reset-password step can proceed
    otp_store.update_one({"email": email}, {"$set": {"verified": True}})

    return jsonify({"message": "OTP verified successfully."}), 200


@otp_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    new_password = data.get('new_password', '').strip()

    print(f"[RESET] Attempting reset for email: '{email}'")

    if not email or not new_password:
        return jsonify({"message": "Email and new password are required."}), 400

    if len(new_password) < 6:
        return jsonify({"message": "Password must be at least 6 characters."}), 400

    record = otp_store.find_one({"email": email})
    print(f"[RESET] OTP record: {record}")

    if not record:
        return jsonify({"message": "No OTP request found. Please request a new OTP."}), 400

    if not record.get('verified'):
        return jsonify({"message": "OTP has not been verified yet. Please enter the OTP first."}), 403

    # Use db directly instead of User.collection static reference
    users_col = db['users']
    user = users_col.find_one({"email": email})
    print(f"[RESET] User in DB: {user is not None} | email queried: '{email}'")

    if not user:
        return jsonify({"message": "No account found with this email address."}), 404

    hashed = generate_password_hash(new_password, method='pbkdf2:sha256')
    result = users_col.update_one({"email": email}, {"$set": {"password": hashed}})
    print(f"[RESET] Update matched={result.matched_count} modified={result.modified_count}")

    if result.matched_count == 0:
        return jsonify({"message": "Could not find account to update. Please try again."}), 500

    # Clean up the OTP record
    otp_store.delete_one({"email": email})

    return jsonify({"message": "Password reset successfully! You can now log in."}), 200
