import React from 'react';
import { FaFire, FaChartLine } from 'react-icons/fa';
import { useProgress } from '../context/ProgressContext';
import '../styles/components.css';

const ProgressCard = ({ onOpenTracker }) => {
  const { progressData } = useProgress();
  
  const currentStreak = progressData?.streak || 0;
  const isPlanStarted = true;
  const totalCompletedCount = progressData?.completedDays?.length || 0;
  const xp = progressData?.xp || 0;

  return (
    <div className="metrics-card progress-summary-card">
      <div className="progress-card-header">
         <h3 className="plan-title">Track Progress</h3>
         {isPlanStarted && <span className="score-badge-mini">{xp} Pts</span>}
      </div>
      
      <div className="progress-mini-stats mb-2">
        <div className="mini-stat-item">
            <FaFire className="icon-orange" size={24} />
            <div className="stat-info">
                <span className="stat-label">Current Streak</span>
                <p className="stat-value">{currentStreak} Days</p>
            </div>
        </div>
        <div className="mini-stat-item">
            <FaChartLine className="icon-blue" size={24} />
            <div className="stat-info">
                <span className="stat-label">Total Workouts</span>
                <p className="stat-value">{totalCompletedCount}</p>
            </div>
        </div>
      </div>

      <button className="btn-orange progress-card-button mt-2" onClick={onOpenTracker}>
        {isPlanStarted ? 'View Progress Dashboard' : 'Start Your Fitness Journey'}
      </button>
    </div>
  );
};

export default ProgressCard;
