import React from 'react';

const ProgressBar = ({ percentage }) => {
    return (
        <div className="dashboard-progress-section">
            <div className="progress-bar-outer">
                <div 
                    className="progress-bar-inner animate-width" 
                    style={{ width: `${percentage}%` }}
                >
                    <span className="percent-indicator">{percentage}%</span>
                </div>
            </div>
            <p className="progress-caption">
                {percentage === 100 ? "Transformation Complete!" : `${100 - percentage}% remaining until target completion.`}
            </p>
        </div>
    );
};

export default ProgressBar;
