import React from 'react';
import ExerciseCard from './ExerciseCard';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import '../styles/components.css';

const DayCard = ({ day, exercises, completedExerciseIds, onMarkComplete, isLocked, isCompleted }) => {
    return (
        <div className={`day-card-container mb-2 ${isLocked ? 'locked-day' : ''} ${isCompleted ? 'completed-day' : ''}`}>
            <div className="day-card-header mb-1">
                <h3 className={`day-card-title flex-center gap-1 ${isCompleted ? 'completed' : ''}`}>
                    {isLocked && <FaLock size={16} color="rgba(255,255,255,0.5)" />}
                    Day {day} 
                    {isCompleted && <span className="day-card-xp">
                        <FaCheckCircle /> +50 XP
                    </span>}
                </h3>
                <span className={`day-card-exercises-count ${isCompleted ? 'completed' : ''}`}>
                    {completedExerciseIds.length}/{exercises.length} Exercises
                </span>
            </div>
            
            {isLocked ? (
                <div className="day-card-locked-content">
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>🔒 Complete previous days to unlock this workout.</p>
                </div>
            ) : (
                <div className="day-card-exercises-list">
                    {exercises.map((ex) => (
                        <ExerciseCard 
                            key={ex.id} 
                            exercise={ex} 
                            isCompleted={completedExerciseIds.includes(ex.id)}
                            onMarkComplete={(exId) => onMarkComplete(`day${day}`, exId, exercises.length)} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DayCard;
