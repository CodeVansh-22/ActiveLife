import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from "react-markdown";
import bgImage from '../assets/aiBG.webp';

const DietPlanPage = () => {
  const { user } = useAuth();
  const [medicalConditions, setMedicalConditions] = useState('');
  const [dietPreference, setDietPreference]       = useState('vegetarian');
  const [activityLevel, setActivityLevel]         = useState('Moderately Active');
  const [fitnessGoal, setFitnessGoal]             = useState('General Fitness');
  const [fieldErrors, setFieldErrors]             = useState({});
  const [plan, setPlan]                           = useState('');
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState('');

  const selectStyle = {
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
  };

  const validateForm = () => {
    let errors = {};
    if (!fitnessGoal) {
      errors.goal = "Please specify your fitness goal";
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

    try {
      const response = await api.post('/ai/generate-diet-plan', {
        medical_conditions: medicalConditions || 'None',
        diet_preference: dietPreference,
        activity_level: activityLevel,
        fitness_goal: fitnessGoal,
      });
      setPlan(response.data.plan);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-bg-image" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="mt-2" style={{ paddingBottom: '100px', padding: '0 20px' }}>
        <div className="glass-card mb-2">
          <h2 className="text-orange mb-1">Generate AI Diet Plan</h2>
          <p className="mb-2">Get a customized daily Indian diet plan tailored to your BMI and preferences.</p>

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
            {/* Activity Level */}
            <div className="form-group mb-2">
              <label>Activity Level</label>
              <select
                className="form-input"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                style={selectStyle}
              >
                <option value="Sedentary">Sedentary (Little/no exercise)</option>
                <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                <option value="Very Active">Very Active (6-7 days/week)</option>
                <option value="Extra Active">Extra Active (Hard exercise/job)</option>
              </select>
            </div>

            {/* Fitness Goal Dropdown */}
            <div className="form-group mb-2">
              <label className="form-label">Fitness Goal</label>
              <select
                className="form-input"
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                style={selectStyle}
              >
                <option value="General Fitness">General Fitness</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Endurance">Endurance</option>
                <option value="Strength">Strength</option>
                <option value="Flexibility">Flexibility</option>
              </select>
              {fieldErrors.goal && <span className="field-error-msg">{fieldErrors.goal}</span>}
            </div>

            {/* Medical */}
            <div className="form-group mb-2">
              <label>Medical Conditions / Allergies (Optional)</label>
              <input
                type="text"
                className={`form-input ${fieldErrors.medical ? 'input-error' : ''}`}
                placeholder="e.g., Diabetes, Peanut allergy, None"
                value={medicalConditions}
                onChange={(e) => {
                  setMedicalConditions(e.target.value);
                  if (fieldErrors.medical) setFieldErrors(prev => ({ ...prev, medical: "" }));
                }}
              />
              {fieldErrors.medical && <span className="field-error-msg">{fieldErrors.medical}</span>}
            </div>

            {/* Diet Preference */}
            <div className="form-group mb-2">
              <label>Diet Preference</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                {[
                  { value: 'vegetarian',     label: 'Vegetarian',     icon: '🥦' },
                  { value: 'non-vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
                  { value: 'vegan',          label: 'Vegan',          icon: '🌱' },
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => setDietPreference(opt.value)}
                    style={{
                      flex: 1, padding: '0.8rem', borderRadius: '10px',
                      cursor: 'pointer', textAlign: 'center',
                      border: `2px solid ${dietPreference === opt.value ? 'var(--accent-orange)' : 'rgba(255,255,255,0.15)'}`,
                      background: dietPreference === opt.value ? 'rgba(244,122,32,0.12)' : 'rgba(255,255,255,0.05)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>{opt.icon}</div>
                    <div style={{
                      fontSize: '0.85rem', marginTop: '0.3rem',
                      fontWeight: dietPreference === opt.value ? 700 : 400,
                      color: dietPreference === opt.value ? 'var(--accent-orange)' : 'rgba(255,255,255,0.7)',
                    }}>{opt.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <button type="submit" className="btn-orange" disabled={loading}>
                {loading ? 'Generating AI Diet Plan...' : 'Generate Diet Plan'}
              </button>
              {error && <p className="error-text mt-1">{error}</p>}
            </div>
          </form>
        </div>

        {plan && (
          <div className="glass-card mt-2">
            <h3 className="text-orange mb-2">Your Custom Diet Plan</h3>
            <div className="ai-plan-output">
              <ReactMarkdown>{plan}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DietPlanPage;