import React, { useState } from 'react';
import { FaCheckCircle, FaLock, FaRegCircle } from 'react-icons/fa';

const DayCard = ({ day, status, onInitiateComplete }) => {
    return (
        <div className={`page-day-card ${status}`}>
            <div className="day-card-header-main">
                <span className="day-label">Day {day.day}</span>
                {status === 'completed' && <FaCheckCircle className="status-svg completed" />}
                {status === 'active' && <FaRegCircle className="status-svg current" />}
                {status === 'locked' && <FaLock className="status-svg locked-icon" />}
            </div>
            
            <div className="day-card-body">
                <h4 className="day-activity-title">{day.title}</h4>
                <div className="day-exercises-preview">
                    {day.exercises.slice(0, 3).join(', ')} {day.exercises.length > 3 ? '...' : ''}
                </div>
            </div>

            <div className="day-card-footer">
                {status === 'active' ? (
                    <button className="btn-mark-done" onClick={() => onInitiateComplete(day.day)}>
                        Mark as Completed
                    </button>
                ) : status === 'completed' ? (
                    <span className="completion-date">Completed</span>
                ) : (
                    <span className="locked-msg">Locked</span>
                )}
            </div>
        </div>
    );
};

const WeeklyTracker = ({ parsedPlan, completedDayIds, skippedDayIds, onMarkComplete }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [isCompleting, setIsCompleting] = useState(false);

    // Strict sequential logic
    const allMilestones = [...completedDayIds, ...skippedDayIds];
    const activeDay = allMilestones.length > 0 ? Math.max(...allMilestones) + 1 : 1;

    // Group into weeks
    const weeks = [];
    for (let i = 0; i < parsedPlan.length; i += 7) {
        weeks.push(parsedPlan.slice(i, i + 7));
    }

    const getStatus = (dayNum) => {
        if (completedDayIds.includes(dayNum)) return 'completed';
        if (dayNum === activeDay) return 'active';
        return 'locked';
    };

    const handleInitiateComplete = (dayNum) => {
        if (dayNum !== activeDay) return;
        setSelectedDay(dayNum);
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        if (!selectedDay) return;
        setIsCompleting(true);
        await onMarkComplete(selectedDay);
        setIsCompleting(false);
        setShowConfirm(false);
        setSelectedDay(null);
    };

    const handleCancel = () => {
        setShowConfirm(false);
        setSelectedDay(null);
    };

    return (
        <div className="weekly-tracker-grid">
            {weeks.map((weekDays, wIdx) => (
                <div key={wIdx} className="week-block">
                    <h3 className="week-heading-text">Week {wIdx + 1}</h3>
                    <div className="day-cards-responsive-grid">
                        {weekDays.map((day) => (
                            <DayCard 
                                key={day.day} 
                                day={day} 
                                status={getStatus(day.day)} 
                                onInitiateComplete={handleInitiateComplete}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {showConfirm && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal-box">
                        <h3>Confirm Completion</h3>
                        <p>Are you sure you want to mark Day {selectedDay} as complete? This action cannot be undone.</p>
                        <div className="confirm-modal-actions">
                            <button className="btn-cancel" onClick={handleCancel} disabled={isCompleting}>
                                Cancel
                            </button>
                            <button className="btn-confirm" onClick={handleConfirm} disabled={isCompleting}>
                                {isCompleting ? 'Completing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyTracker;

