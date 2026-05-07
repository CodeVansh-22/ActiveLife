import os
import re
import json
import requests

def call_openrouter(messages, max_tokens=200):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {os.environ.get('OPENROUTER_API_KEY')}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "openai/gpt-3.5-turbo",
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content']
    else:
        raise Exception(f"OpenRouter API Error: {response.text}")

def parse_json_from_response(raw_text):
    if not raw_text: return None
    try: return json.loads(raw_text.strip())
    except: pass
    code_block = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', raw_text)
    if code_block:
        try: return json.loads(code_block.group(1).strip())
        except: pass
    brace_match = re.search(r'(\{[\s\S]*\})', raw_text)
    if brace_match:
        try: return json.loads(brace_match.group(1))
        except: pass
    return None

def json_plan_to_markdown(plan_data):
    lines = ["# 💪 Your Personalized 7-Day Workout Routine\n"]
    exp = plan_data.get("explanation", "")
    if exp: lines.append(f"> {exp}\n")
    for day_obj in plan_data.get("plan", []):
        day, focus = day_obj.get("day", "Day"), day_obj.get("focus", "")
        lines.append(f"## 🗓️ {day} - {focus}\n")
        for ex in day_obj.get("exercises", []):
            name = ex.get("name", "Exercise")
            sets = ex.get("sets", "3")
            reps = ex.get("reps", "12")
            rest = ex.get("rest", "45s")
            target = ex.get("target", "")
            target_str = f" ({target})" if target else ""
            lines.append(f"**{name}**{target_str}\n- {sets} Sets × {reps} Reps | Rest: {rest}\n")
        lines.append("---")
    return "\n".join(lines)

def generate_diet_plan(user, medical_conditions, diet_preference='vegetarian', age=None, gender='male', activity_level=None, fitness_goal='General Fitness'):
    # Safety Check
    if age and int(age) <= 12:
        return "I'm sorry, ActiveLife requires users to be over 12 years old for personalized diet planning."

    bmi = user.get('bmi', 'Not calculated yet')
    weight = user.get('weight_kg', 'Not specified')
    height = user.get('height_cm', 'Not specified')
    
    prompt = f"""You are a professional nutritionist. Generate a goal-specific Indian diet plan for this user:
- BMI: {bmi}
- Age: {age if age else 'Not specified'}
- Gender: {gender.capitalize()}
- Activity Level: {activity_level if activity_level else 'Not specified'}
- Medical Conditions: {medical_conditions}
- Fitness Goal: {fitness_goal}
- Diet Preference: {diet_preference.capitalize()}

STRICT RULES:
1. ALIGN WITH GOAL: 
   - Weight Loss -> Calorie deficit, high fiber.
   - Muscle Gain -> High protein, calorie surplus.
   - Endurance -> Balanced carbs + protein.
   - Strength -> High protein, moderate carbs.
   - Flexibility -> Nutrient-dense, anti-inflammatory foods.
   - General Fitness -> Balanced macros.
2. STRICTLY follow the Diet Preference: {diet_preference.capitalize()}. If Vegetarian or Vegan, DO NOT include any meat, chicken, fish, or eggs. If Vegan, exclude all dairy products (milk, paneer, curd, etc.) as well. Use simple, affordable Indian-friendly foods based on the preference.
3. Include: Breakfast, Lunch, Dinner, and 1-2 Snacks.
4. Keep the entire response under 400 words.

Format in clean Markdown with clear headings."""

    messages = [
        {"role": "system", "content": "You are a senior nutrition AI assistant specializing in Indian diets and goal-based nutrition."},
        {"role": "user", "content": prompt}
    ]

    return call_openrouter(messages, max_tokens=1000)
def generate_workout_plan(user, goal, medical_conditions, age=None, gender='male', activity_level=None):
    # Safety Check
    if age and int(age) <= 12:
        return "ActiveLife workout plans are restricted to users above 12 years old for safety reasons.", None

    weight = user.get('weight_kg', 'Not specified')
    height = user.get('height_cm', 'Not specified')

    prompt = f"""Generate a highly personalized 7-day HOME workout plan for a {gender} aged {age}.
    
    The user's SPECIFIC FITNESS GOAL is: "{goal}". 
    You MUST tailor every single exercise, focus, and intensity to directly help achieve this goal: {goal}.
    
    Activity Level: {activity_level}. 
    User weight: {weight}kg, height: {height}cm.
    Medical Conditions/Injuries to avoid aggravating: {medical_conditions}.
    
    Format: PURE JSON only. Structure: {{ "explanation": "Briefly explain how this plan targets the goal: {goal}", "plan": [ {{ "day": "Day 1", "focus": "...", "exercises": [ {{ "name": "...", "sets": 3, "reps": "15", "rest": "60s", "target": "...", "instructions": ["..."] }} ] }} ] }}.
    
    Guidelines:
    1. If the goal is specific (e.g., '6-pack abs'), ensure daily or frequent focus on that area.
    2. Adjust the difficulty level based on activity level ({activity_level}).
    3. Ensure no exercises conflict with the reported medical conditions: {medical_conditions}.
    4. Provide the response ONLY as a valid JSON object."""
    
    messages = [
        {"role": "system", "content": f"You are a master fitness AI coach. Your mission is to create a workout plan that specifically helps the user achieve their goal: {goal}. Reply ONLY with valid JSON."},
        {"role": "user", "content": prompt}
    ]
    
    raw_response = call_openrouter(messages, max_tokens=3000)
    parsed = parse_json_from_response(raw_response)
    
    if parsed and "plan" in parsed:
        markdown = json_plan_to_markdown(parsed)
        weekly = parsed["plan"]
        full_30 = []
        for i in range(30):
            day_cycle = weekly[i % len(weekly)]
            full_30.append({ "day": f"Day {i + 1}", "focus": day_cycle.get("focus", ""), "exercises": day_cycle.get("exercises", []) })
        parsed["plan"] = full_30
        return markdown, parsed
    return raw_response, None