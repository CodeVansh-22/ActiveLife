import React from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/aiBG.webp';
import { FaUtensils, FaDumbbell } from 'react-icons/fa';

const AIFitnessPlanPage = () => {
  return (
    <>
      <div 
        className="page-bg-image" 
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="mt-2" style={{ paddingBottom: '100px', padding: '0 20px' }}>
        <div className="text-center mb-2" style={{ marginTop: '2rem' }}>
          <h1 className="text-orange" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AI Fitness Solutions</h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>Choose a specialized AI module to optimize your health and performance.</p>
        </div>

        <div className="modern-grid max-w-1200" style={{ margin: '0 auto', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          <div className="gym-card">
            <div className="gym-card-icon" style={{ top: '20px', left: '20px', transform: 'none' }}><FaUtensils /></div>
            <div style={{ height: '150px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
              🥗
            </div>
            <h3 className="text-orange gym-card-title mt-1">AI Diet Plan</h3>
            <p className="gym-card-desc">Receive a personalized nutritional breakdown and daily meal schedule tailored to your dietary needs and BMI.</p>
            <Link to="/diet-plan" className="w-100"><button className="btn-orange w-100">Generate Diet Plan</button></Link>
          </div>

          <div className="gym-card">
            <div className="gym-card-icon" style={{ top: '20px', left: '20px', transform: 'none' }}><FaDumbbell /></div>
             <div style={{ height: '150px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
              🏋️
            </div>
            <h3 className="text-orange gym-card-title mt-1">AI Workout Plan</h3>
            <p className="gym-card-desc">Construct a scientific weekly training regimen based on your specific fitness objectives and physical capacity.</p>
            <Link to="/workout-plan" className="w-100"><button className="btn-orange w-100">Generate Workout Plan</button></Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default AIFitnessPlanPage;