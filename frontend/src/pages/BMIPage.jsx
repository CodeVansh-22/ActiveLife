import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/BMIPage.css';



const BMIPage = () => {
  const { user } = useAuth();
  const [height, setHeight]   = useState('');  // format: 5.10 = 5 ft 10 in
  const [weight, setWeight]   = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  const validateForm = () => {
    let errors = {};
    
    // Height validation
    if (!height) {
      errors.height = "Height is required";
    } else {
      const heightVal = parseFloat(height);
      if (isNaN(heightVal) || heightVal <= 0) {
        errors.height = "Please enter a valid height";
      } else if (heightVal > 8) {
        errors.height = "Height seems too high (max 8.11 ft)";
      }
    }

    // Weight validation
    if (!weight) {
      errors.weight = "Weight is required";
    } else {
      const weightVal = parseFloat(weight);
      if (isNaN(weightVal) || weightVal <= 0) {
        errors.weight = "Weight must be a positive number";
      } else if (weightVal < 20 || weightVal > 300) {
        errors.weight = "Weight should be between 20kg and 300kg";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!validateForm()) return;

    // Parse "5.10" → 5 ft 10 in → cm
    const parts      = String(height).split('.');
    const ft         = parseFloat(parts[0]) || 0;
    const inch       = parseFloat(parts[1]) || 0;
    const heightInCm = ft * 30.48 + inch * 2.54;

    try {
      const response = await api.post('/bmi/calculate', {
        height_cm: heightInCm,
        weight_kg: parseFloat(weight),
        age: user?.age,
        gender: user?.gender,
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate BMI.');
    }
  };

  return (
    <div className="bmi-container">
      <div className="page-bg-image" />
      <div className="glass-card bmi-card">
        <h2 className="text-orange text-center mb-2">BMI Calculator</h2>
        <form onSubmit={handleCalculate} className="flex-col gap-1">

          {/* Age & Gender from Profile (Read Only) */}
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

          {/* Height - single input */}
          <div className="form-group">
            <label>Height (e.g. 5.10 for 5 ft 10 in)</label>
            <input
              type="text"
              className={`form-input ${fieldErrors.height ? 'input-error' : ''}`}
              placeholder="e.g. 5.10"
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                if (fieldErrors.height) setFieldErrors(prev => ({ ...prev, height: "" }));
              }}
              required
            />
            {fieldErrors.height && <span className="field-error-msg">{fieldErrors.height}</span>}
          </div>

          {/* Weight */}
          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              className={`form-input ${fieldErrors.weight ? 'input-error' : ''}`}
              placeholder="e.g., 70"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                if (fieldErrors.weight) setFieldErrors(prev => ({ ...prev, weight: "" }));
              }}
              required
              step="0.1"
            />
            {fieldErrors.weight && <span className="field-error-msg">{fieldErrors.weight}</span>}
          </div>

          {error && <p className="error-text mb-1">{error}</p>}
          <button type="submit" className="btn-orange mt-1">Calculate &amp; Save</button>
        </form>

        {result && (
          <div className="bmi-result-area">
            <hr className="bmi-divider" />
            <h3>Your BMI: <span className="text-orange">{result.bmi}</span></h3>
            <p>Category: <strong>{result.category}</strong></p>
            <p className="text-orange">
              Your stats have been securely updated for your AI Coach!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BMIPage;