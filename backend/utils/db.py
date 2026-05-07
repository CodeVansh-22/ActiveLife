import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env variables to ensure we have the URI
load_dotenv()

# Get the MongoDB URI from the environment variables
# Fallback to local MongoDB if not provided
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/ActiveLife")

# Initialize the MongoClient
# We use a try-except block to catch connection errors early
try:
    if not MONGO_URI:
        raise ValueError("MONGO_URI is not set and no fallback available.")
        
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Select the database (it will be created automatically if it doesn't exist)
    db = client.get_database() 
    # Trigger a command to check connection
    client.admin.command('ping')
    print(f"Successfully connected to MongoDB at: {MONGO_URI.split('@')[-1] if '@' in MONGO_URI else MONGO_URI}")
except Exception as e:
    print(f"Failed to connect to MongoDB. Error: {e}")
    print("Please ensure MongoDB is running locally or check your MONGO_URI in .env")
    db = None