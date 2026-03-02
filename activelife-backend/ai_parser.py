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
    You are a medically aware nutrition expert for the Active Life app.

A user has a BMI of {bmi}.
Medical conditions: {conditions}.
Current medication: {medication}.
Goal: {goal}.

Create a safe, condition-aware 7-day personalized Indian diet plan only.
Do NOT include workout plans.
Do NOT explain BMI.
Do NOT add long descriptions.

Strict Rules:
1. Keep the response short, clear, and practical.
2. Provide only a 7-day structured diet plan.
3. Each day must include: Breakfast, Lunch, Evening Snack, Dinner.
4. Adjust food choices strictly according to medical conditions and medications.
5. Avoid any contraindicated foods.
6. No crash dieting or extreme calorie restriction.
7. No medical advice about stopping medicines.
8. Use simple numbered formatting.
9. Output must be clean plain text only (no markdown symbols like **, ###, etc.).
10. End immediately after Day 7 dinner.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        # This will print the specific error in your VS Code terminal
        print(f"AI PARSER ERROR: {e}")
        return None