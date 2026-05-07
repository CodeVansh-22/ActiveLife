import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ProgressHeader = ({ daysElapsed, week, score, lastActive }) => {
    const showWarning = () => {
        if (!lastActive) return false;
        const last = new Date(lastActive);
        const today = new Date();
        const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
        return diff >= 2;
    };

    return (
        <div className="progress-header-dashboard">
            <div className="header-top-row">
                <div className="journey-info">
                    <h2 className="journey-title">Journey: Day {daysElapsed}</h2>
                    <span className="week-tag">Week {week} Progress</span>
                </div>
                <div className="score-badge-large">
                    <span className="score-label">Fitness Score</span>
                    <p className="score-val">{score || 100}</p>
                </div>
            </div>

            {showWarning() && (
                <div className="page-warning-banner">
                    <FaExclamationTriangle />
                    <span>Inactivity Alert: 2+ days missed. Your score is being impacted!</span>
                </div>
            )}
        </div>
    );
};

export default ProgressHeader;
