import React from 'react';
import { FaTimes, FaFire, FaDumbbell } from 'react-icons/fa';
import '../styles/WorkoutHistory.css';

const WorkoutHistoryModal = ({ isOpen, onClose, history }) => {
    if (!isOpen) return null;

    return (
        <div className="history-modal-overlay" onClick={onClose}>
            <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="history-modal-header">
                    <h3 className="history-modal-title">Workout History</h3>
                    <button className="history-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="history-list">
                    {history && history.length > 0 ? (
                        history.map((item, index) => (
                            <div key={index} className="history-item">
                                <div className="history-item-left">
                                    <div className="day-label">
                                        Day {item.day}
                                    </div>
                                    <div className="date-label">
                                        {item.date}
                                    </div>
                                </div>
                                <div className="history-item-right">
                                    <div className="calories-label">
                                        <FaFire size={14} /> {item.calories || 400} kcal
                                    </div>
                                    <div className="status-label">
                                        <FaDumbbell size={14} /> Completed
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="history-empty-state">
                            <p>No workout history found yet. Start your journey today!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutHistoryModal;
