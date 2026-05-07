import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
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

load_dotenv()
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev_secret_key_not_for_production')

if not os.environ.get('JWT_SECRET'):
    print("⚠️ WARNING: JWT_SECRET not found in .env. Using a default development key.")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
#Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(bmi_bp, url_prefix='/api/bmi')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(content_bp, url_prefix='/api/content')
app.register_blueprint(otp_bp, url_prefix='/api/otp')
app.register_blueprint(progress_bp, url_prefix='/api/progress')

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
    app.run(host='0.0.0.0', port=port, debug=True)