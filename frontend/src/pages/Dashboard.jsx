import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaDumbbell, FaChartLine, FaRegCalendarAlt } from 'react-icons/fa';
import { MdOutlineScience } from 'react-icons/md';
import dashboardBg from '../assets/bgMain.webp';
import bmiGenrator from '../assets/DashboardImgs/bmiGenrator.webp';
import aiPlan from '../assets/DashboardImgs/aiPlan.webp';
import gymAndAiCoach from '../assets/DashboardImgs/GymAndAiCoach.webp';
import learnCompete from '../assets/DashboardImgs/Learn&Compete.webp';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  return (
    <>
      <div 
        className="page-bg-image" 
        style={{ backgroundImage: `url(${dashboardBg})` }}
      />
      <div className="dashboard-container mt-2 container-fluid">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Overview Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.name}! Manage your fitness journey.</p>
        </div>

        <div className="dashboard-grid">
          
          {/* ── CARD 1: BMI CALCULATOR ── */}
          <div className="gym-card dashboard-item">
            <img src={bmiGenrator} alt="Metrics" className="gym-card-img" />
            <div className="gym-card-icon"><FaChartLine /></div>
            <h3 className="text-orange gym-card-title">BMI Calculator</h3>
            <p className="gym-card-desc">Keep your basal physical statistics updated to ensure your AI recommendations remain highly accurate.</p>
            <Link to="/bmi" className="w-100"><button className="btn-orange btn-outline w-100">Update Stats</button></Link>
          </div>

          {/* ── CARD 2: AI DIET PLAN ── */}
          <div className="gym-card dashboard-item">
            <img src={aiPlan} alt="Diet" className="gym-card-img" />
            <div className="gym-card-icon"><MdOutlineScience /></div>
            <h3 className="text-orange gym-card-title">AI Diet Plan</h3>
            <p className="gym-card-desc">Generate a personalized Indian diet plan based on your BMI, age, and dietary preferences.</p>
            <Link to="/diet-plan" className="w-100"><button className="btn-orange w-100">Get Diet Plan</button></Link>
          </div>

          {/* ── CARD 3: AI WORKOUT PLAN ── */}
          <div className="gym-card dashboard-item">
            <img src={gymAndAiCoach} alt="Workout" className="gym-card-img" />
            <div className="gym-card-icon"><FaDumbbell /></div>
            <h3 className="text-orange gym-card-title">AI Workout Plan</h3>
            <p className="gym-card-desc">Get a custom weekly workout routine tailored to your fitness goals and physical profile.</p>
            <Link to="/workout-plan" className="w-100"><button className="btn-orange w-100">Get Workout Plan</button></Link>
          </div>

          {/* ── CARD 4: LEARN & COMPETE ── */}
          <div className="gym-card dashboard-item">
            <img src={learnCompete} alt="Events" className="gym-card-img" />
            <div className="gym-card-icon"><FaRegCalendarAlt /></div>
            <h3 className="text-orange gym-card-title">Learn & Compete</h3>
            <p className="gym-card-desc">Explore upcoming Indian shows, competitions, and master your form with curated tutorials.</p>
            <Link to="/learn-compete" className="w-100"><button className="btn-orange btn-outline w-100">Explore</button></Link>
          </div>

        </div>

      </div>
    </>
  );
};

export default Dashboard;
