import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Use a verified model version to prevent the error
model = genai.GenerativeModel('gemini-2.5-flash')

def get_ai_fitness_plan(bmi, conditions, medication, goal):
    """
    Handles communication with Google Gemini AI.
    """
    prompt = f"""
    You are an expert, medically aware fitness trainer for the Activelife app.
    A user has a BMI of {bmi} and the following medical conditions: {conditions}.
    Current medication: {medication}.
    Goal: {goal}.
    
    Provide a structured, safe workout program and a personalized diet plan.
    Strictly restrict any unsafe exercises based on their medical condition.
    Keep the response formatted cleanly with numbered lists.
    CRITICAL: DO NOT use any Markdown formatting like ** or ###. Output only clean, plain text.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        # This will print the specific error in your VS Code terminal
        print(f"AI PARSER ERROR: {e}")
        return None