import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import ProgressCharts from '../components/ProgressCharts';
import WorkoutHistoryModal from '../components/WorkoutHistoryModal';
import { FaChevronLeft, FaFire, FaTrophy, FaHistory } from 'react-icons/fa';
import '../styles/ProgressPage.css';

const ProgressPage = () => {
    const navigate = useNavigate();
    const { progressData, getCompletionPercentage } = useProgress();
    const [showHistory, setShowHistory] = useState(false);

    const completionPercent = getCompletionPercentage(30); // 30 day plan default
    const currentWeek = Math.ceil(progressData.currentDay / 7);

    return (
        <div className="progress-page-container animate-fade-in">
            <header className="page-header-nav">
                <button className="back-btn" onClick={() => navigate('/profile')}>
                    <FaChevronLeft /> Back to Profile
                </button>
            </header>

            <div className="max-w-1200 mx-auto px-2 mt-2">
                <div className="performance-header">
                    <h1 className="page-title-main text-orange">Performance</h1>
                    <button className="history-btn-premium" onClick={() => setShowHistory(true)}>
                        <FaHistory /> View History
                    </button>
                </div>

                {/* Score & Header Stats */}
                <div className="glass-card mb-2 stats-summary-row">
                    <div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' }}>Journey</p>
                        <h2 style={{ margin: '0.2rem 0', fontSize: '1.8rem' }}>Day {progressData.currentDay}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.8rem' }}>Week {currentWeek}</p>
                    </div>
                    
                    <div style={{ padding: '0 2rem', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        <FaTrophy size={30} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                        <h2 style={{ margin: 0, fontSize: '2rem', color: '#f59e0b' }}>{progressData.xp}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' }}>Total XP</p>
                    </div>

                    <div>
                        <FaFire size={30} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
                        <h2 style={{ margin: 0, fontSize: '2rem', color: '#ef4444' }}>{progressData.streak}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' }}>Day Streak</p>
                    </div>
                </div>

                {/* Progress Bar Component */}
                <div className="glass-card mb-2">
                    <div className="flex-between mb-1">
                        <span style={{ fontWeight: 600 }}>30-Day Plan Completion</span>
                        <span className="text-orange">{completionPercent}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${completionPercent}%`, background: 'var(--accent-orange)', transition: 'width 0.5s ease' }}></div>
                    </div>
                    <div className="mt-1 flex-between" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                        <span>{progressData.completedDays.length} Days Complete</span>
                        <span>Longest Streak: {progressData.longestStreak}</span>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="glass-card mb-2">
                    <h3 className="text-orange mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>XP Progression Analytics</h3>
                    <div className="analytics-section">
                        {progressData.history && progressData.history.length > 0 ? (
                            <ProgressCharts data={progressData.history} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.5)' }}>
                                <p>Start marking your exercises complete to see your performance analytics.</p>
                                <button className="btn-orange mt-1" onClick={() => navigate('/my-workout')}>Go to My Workout</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Day Status Overview */}
                <div className="glass-card mb-2">
                    <h3 className="text-orange mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>30-Day Status Map</h3>
                    <div className="status-map-grid">
                        {Array.from({ length: 30 }).map((_, i) => {
                            const day = i + 1;
                            const isComplete = progressData.completedDays.includes(day);
                            const isActive = day === progressData.currentDay;
                            
                            return (
                                <div key={day} className={`status-day-box ${isComplete ? 'complete' : isActive ? 'active' : ''}`}>
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <WorkoutHistoryModal 
                isOpen={showHistory} 
                onClose={() => setShowHistory(false)} 
                history={progressData.history || []} 
            />
        </div>
    );
};

export default ProgressPage;
