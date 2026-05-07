# ActiveLife 🏋️‍♂️

Your companion for a healthier, more active lifestyle.

## 🚀 Quick Start (For New Users/Friends)

If you are running this project for the first time, follow these steps:

### 1. Backend Setup
1. Navigate to the `backend/` directory: `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. **Configure Environment:** 
   - Copy the template: `cp .env.example .env` (or manually copy and rename)
   - Edit `.env` to add your specific keys if needed (like OpenRouter or Sarvam for AI features).
   - *Note:* The app will fallback to a local MongoDB (`mongodb://localhost:27017/ActiveLife`) if `.env` is missing or `MONGO_URI` is not set.
4. Run the server: `python app.py`

### 2. Frontend Setup
1. Navigate to the `frontend/` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm start`
4. Access the app at `http://localhost:3000`

---

ActiveLife is a comprehensive gym and fitness management application that provides users with tools to calculate BMI, generate AI-powered fitness plans, browse gym equipment, and book sessions. It also features a fully-functional admin dashboard.

## Features

### User Features
- **User Authentication:** Secure login and registration using JSON Web Tokens (JWT) and OTP flows.
- **Member Dashboard:** A personalized hub for users to view their stats and activities.
- **BMI Calculator:** Integrated tool to calculate and track Body Mass Index.
- **AI Fitness Plans:** Personalized workout and diet plans generated via AI based on user-provided physical data.
- **Equipment Browsing:** Explore available gym equipment and machines.
- **Bookings:** Seamlessly book physical sessions or reserve equipment for precise times.
- **User Profile Management:** View and update personal information securely.

### Admin Features
- **Admin Dashboard:** Centralized view for managing the gym application securely.
- **User Analytics & Management:** View and monitor registered members.

## Tech Stack

### Frontend
- **Framework:** React.js (Bootstrapped with Create React App)
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **UI Components:** React Icons, React Markdown

### Backend
- **Framework:** Python 3.x / Flask
- **Database:** MongoDB (using PyMongo)
- **Authentication:** JWT (PyJWT)
- **Other Tools:** Flask-CORS, python-dotenv, requests (for internal/external API calls)

## Getting Started (Manual for Developers)

### Prerequisites
- [Node.js](https://nodejs.org/) & npm (for frontend)
- [Python 3.x](https://www.python.org/) (for backend)
- [MongoDB](https://www.mongodb.com/) (Local instance or Mongo Atlas cloud URI)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   venv/bin/activate  
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `backend` directory and add the following configuration variables required by the services:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret_key
   ```
   *(Note: Ensure you include any exact API keys required by `ai_service.py` if AI generation hooks into third-party providers).*

5. **Run the development server:**
   ```bash
   python app.py
   ```
   The API will be available locally at `http://localhost:5000` and its health status can be checked at `/api/health`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The React app will launch automatically at `http://localhost:3000`.

## Project Structure

- `/frontend`: Contains the React UI. Important structural directories include:
  - `src/pages`: Top-level Page components (Home, Dashboard, AdminDashboard, etc.).
  - `src/components`: Reusable UI elements (`Navbar`, `BottomNav`, `ProtectedRoute`, etc.).
  - `src/services`: Code to interact with the backend API.
- `/backend`: Contains the Flask REST API. Key structure:
  - `app.py`: The entry point that sets up the server and registers the URL blueprints.
  - `/routes`: Blueprint controller definitions (auth, equipment, bmi, bookings, ai).
  - `/services` & `/models`: Business logic, AI integrations, data layers.
  - `/utils`: Database utility connections (`db.py`).

## Contributing
1. When adding new backend endpoints, always ensure that they are properly grouped into `blueprints` (in `backend/routes`) and registered in `app.py`.
2. For frontend changes, add any new member-only or private routes using the `<ProtectedRoute>` component wrap inside `frontend/src/App.js`.
