import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import bgImage from '../assets/aiBG.webp';
import '../styles/WorkoutPlan.css';

const GOAL_OPTIONS = [
  "Weight Loss (Fat Burn)",
  "Muscle Gain (Bulking)",
  "Strength Training",
  "General Fitness (Stay Active)",
  "Endurance Improvement",
  "Core Strength & Abs",
  "Full Body Toning",
  "Flexibility & Mobility",
  "Home Beginner Fitness",
  "Athletic Performance"
];

const WorkoutPlanPage = () => {
  const { user } = useAuth();
  const [goal, setGoal]                   = useState('');
  const [medicalConditions, setMedical]   = useState('');
  const [activityLevel, setActivityLevel] = useState('Moderately Active');
  const [fieldErrors, setFieldErrors]     = useState({});
  const [plan, setPlan]                   = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [saved, setSaved]                 = useState(false);

  const { resetProgress } = useProgress();
  const navigate = useNavigate();

  const selectStyle = {
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
  };

  const validateForm = () => {
    let errors = {};
    if (!goal) {
      errors.goal = "Please select a fitness goal";
    }
    if (medicalConditions.length > 500) {
      errors.medical = "Medical conditions should be under 500 characters";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setPlan('');
    setSaved(false);

    try {
      const workoutRes = await api.post('/ai/generate-workout-plan', {
        goal,
        medical_conditions: medicalConditions || 'None',
        activity_level: activityLevel,
      });

      const { plan: markdownPlan, structured_plan } = workoutRes.data;
      setPlan(markdownPlan);

      // Save structured plan to localStorage for instant MyWorkout sync
      if (structured_plan && structured_plan.plan && structured_plan.plan.length > 0) {
        localStorage.setItem('workoutPlan', JSON.stringify(structured_plan));
        // Reset all exercise completion — new plan means fresh start
        resetProgress();
        setSaved(true);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate your personalized plans.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-bg-image" style={{ backgroundImage: `url(${bgImage})` }} />

      <div className="mt-2" style={{ paddingBottom: '120px', padding: '0 20px' }}>
        <div className="glass-card mb-2 animate-fade-in">
          <h2 className="text-orange mb-1">AI Workout Plan Generator</h2>
          <p className="mb-2">Personalized home workouts powered by AI.</p>

          <form onSubmit={handleGenerate}>
            {/* Display Age & Gender from Profile */}
            <div className="grid-2 gap-1 mb-2">
              <div className="form-group">
                <label style={{ opacity: 0.7, fontSize: '0.85rem' }}>Age (From Profile)</label>
                <div className="form-input" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent-orange)', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  {user?.age || 'N/A'} Years
                </div>
              </div>
              <div className="form-group">
                <label style={{ opacity: 0.7, fontSize: '0.85rem' }}>Gender (From Profile)</label>
                <div className="form-input" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent-orange)', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  {user?.gender || 'N/A'}
                </div>
              </div>
            </div>

            {/* Fitness Goal Dropdown */}
            <div className="form-group mb-2">
              <label className="form-label">Primary Fitness Goal</label>
              <select
                id="fitness-goal-dropdown"
                className={`form-input ${fieldErrors.goal ? 'input-error' : ''}`}
                style={selectStyle}
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value);
                  if (fieldErrors.goal) setFieldErrors(prev => ({ ...prev, goal: "" }));
                }}
                required
              >
                <option value="" disabled>Select your fitness goal</option>
                {GOAL_OPTIONS.map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>
              {fieldErrors.goal && <span className="field-error-msg">{fieldErrors.goal}</span>}
            </div>

            {/* Activity Level */}
            <div className="form-group mb-2">
              <label>Activity Level</label>
              <select
                className="form-input"
                style={selectStyle}
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
              >
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Moderately Active">Moderately Active</option>
                <option value="Very Active">Very Active</option>
                <option value="Extra Active">Extra Active</option>
              </select>
            </div>

            {/* Medical Conditions */}
            <div className="form-group mb-2">
              <label>Medical Conditions / Injuries</label>
              <textarea
                className={`form-input ${fieldErrors.medical ? 'input-error' : ''}`}
                placeholder="e.g., Back pain, bad knees, or None"
                rows="2"
                value={medicalConditions}
                onChange={(e) => {
                  setMedical(e.target.value);
                  if (fieldErrors.medical) setFieldErrors(prev => ({ ...prev, medical: "" }));
                }}
              />
              {fieldErrors.medical && <span className="field-error-msg">{fieldErrors.medical}</span>}
            </div>

            <div className="form-group">
              <button
                type="submit"
                id="btn-generate-plan"
                className="btn-orange w-100"
                disabled={loading}
              >
                {loading ? 'Generating Your Plan...' : 'Generate Workout Plan'}
              </button>
              {error && <p className="error-text mt-1">{error}</p>}
            </div>
          </form>
        </div>

        {/* Success Banner */}
        {saved && (
          <div
            className="glass-card mb-2 animate-fade-in"
            style={{
              border: '1px solid rgba(72, 199, 116, 0.5)',
              background: 'rgba(72, 199, 116, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <p style={{ margin: 0, color: '#48c774', fontWeight: 600 }}>
              ✅ Plan saved! Your My Workout page has been updated.
            </p>
            <button
              onClick={() => navigate('/my-workout')}
              className="btn-orange"
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            >
              View Plan →
            </button>
          </div>
        )}

        {/* Results Section */}
        {plan && (
          <div className="results-container animate-slide-up mt-2">
            <div className="glass-card single-result">
              <h3 className="text-orange mb-2">🏠 Your Custom Workout Plan</h3>
              <div className="markdown-content ai-plan-output">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkoutPlanPage;
