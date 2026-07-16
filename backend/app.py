import os
import logging
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.exceptions import HTTPException

# Import Blueprints
from routes.auth_routes import auth_bp
from routes.bmi_routes import bmi_bp
from routes.ai_routes import ai_bp
from routes.admin_routes import admin_bp         
from routes.otp_routes import otp_bp
from routes.content_routes import content_bp
from routes.progress_routes import progress_bp
# Initialize DB connection when app starts
from utils.db import db 

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)
logger = logging.getLogger(__name__)

# Validate JWT Secret and handle fallbacks safely
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    if os.environ.get('FLASK_ENV') == 'production':
        raise ValueError("CRITICAL: JWT_SECRET environment variable is required in production!")
    else:
        logger.warning("⚠️ WARNING: JWT_SECRET not found in environment. Using a default development key.")
        # Fallback to dev secret in development so it doesn't crash on local startup
        os.environ['JWT_SECRET'] = 'dev-secret-key-for-local-development-only'
        JWT_SECRET = os.environ['JWT_SECRET']

app = Flask(__name__)

# Set Secret Key for Flask sessions / signed cookies if needed
app.secret_key = os.environ.get('SECRET_KEY', JWT_SECRET)

# Configure CORS dynamically based on deployed frontend URL or fallback
frontend_url = os.environ.get('FRONTEND_URL')
if frontend_url:
    origins = [origin.strip() for origin in frontend_url.split(',') if origin.strip()]
    logger.info(f"CORS configured for production frontend origins: {origins}")
else:
    # Compile regex pattern to match localhost and private network LAN IPs for local development
    import re
    origins = [
        re.compile(r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$")
    ]
    logger.info("CORS configured with fallback pattern for local development and LAN access")

CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=True)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(bmi_bp, url_prefix='/api/bmi')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(content_bp, url_prefix='/api/content')
app.register_blueprint(otp_bp, url_prefix='/api/otp')
app.register_blueprint(progress_bp, url_prefix='/api/progress')

# Global Error Handlers
@app.errorhandler(Exception)
def handle_exception(e):
    # Log the full exception traceback
    app.logger.error(f"Unhandled Server Error: {str(e)}", exc_info=True)
    return jsonify({
        "error": "Internal Server Error",
        "message": "An unexpected error occurred on the server. Please try again later."
    }), 500

@app.errorhandler(HTTPException)
def handle_http_exception(e):
    # Log HTTP warnings
    app.logger.warning(f"HTTP Exception: {e.code} - {e.description}")
    return jsonify({
        "error": e.name,
        "message": e.description
    }), e.code

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(os.path.join(app.root_path, 'uploads'), filename)

@app.route('/api/health', methods=['GET'])
def health_check():
    db_status = "Connected" if db is not None else "Disconnected"
    return jsonify({
        "status": "success",
        "message": "ActiveLife API is running smoothly!",
        "database": db_status
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting ActiveLife server in debug mode on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)