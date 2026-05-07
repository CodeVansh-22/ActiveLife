import React from 'react';
import { FaCheckCircle, FaDumbbell } from 'react-icons/fa';
import '../styles/ProgressPage.css';
import '../styles/components.css';

const ExerciseCard = ({ exercise, onMarkComplete, isCompleted }) => {
    return (
        <div className={`exercise-card glass-card mb-1 ${isCompleted ? 'completed-exercise' : ''}`}>
            <div className="exercise-card-main gap-1">
                <div className={`exercise-icon-wrapper ${isCompleted ? 'completed' : ''}`}>
                    <FaDumbbell size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 className={`exercise-title ${isCompleted ? 'completed' : ''}`}>{exercise.name}</h4>
                    <p className="exercise-subtitle">
                        {exercise.sets} Sets • {exercise.reps} Reps
                    </p>
                </div>
            </div>

            <div className="flex-center" style={{ marginTop: '1rem' }}>
                <button 
                    className={`btn-action-custom ${isCompleted ? 'btn-completed' : ''}`}
                    onClick={() => onMarkComplete(exercise.id)}
                    disabled={isCompleted}
                    style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                    {isCompleted ? <><FaCheckCircle /> Done</> : "Mark Complete"}
                </button>
            </div>
        </div>
    );
};

export default ExerciseCard;
