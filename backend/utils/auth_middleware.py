import os
import jwt
from functools import wraps
from flask import request, jsonify
from models.user import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check if the token is in the headers
        if 'Authorization' in request.headers:
            # Format is usually "Bearer <token>"
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing! Unauthorized access."}), 401

        try:
            # Decode the token using our secret key
            data = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=["HS256"])
            # Fetch the user from the database
            current_user = User.get_by_email(data['email'])
            if not current_user:
                raise Exception("User not found")
        except Exception as e:
            return jsonify({"message": "Token is invalid or expired!"}), 401

        # Pass the current_user object to the route
        return f(current_user, *args, **kwargs)

    return decorated

#For Admins
def admin_required(f):
    @wraps(f)
    @token_required # Chain the decorators! Must be logged in FIRST.
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return jsonify({"message": "Admin privileges required!"}), 403
        
        return f(current_user, *args, **kwargs)
    return decorated