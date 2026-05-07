import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import bgVideo from '../assets/bg.webm';
import { FaEye, FaEyeSlash, FaCalendarAlt, FaUser, FaEnvelope, FaLock, FaTransgender } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    gender: 'Male'
  });
  
  const [age, setAge] = useState(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  // Calculate age whenever DOB changes
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
      
      if (calculatedAge <= 12) {
        setFieldErrors(prev => ({ ...prev, dob: "Only users above 12 years are allowed." }));
      } else {
        setFieldErrors(prev => ({ ...prev, dob: "" }));
      }
    }
  }, [formData.dob]);

  const validateForm = () => {
    let errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = "Full Name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email address";
    }
    
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Min 6 characters required";
    }

    if (!formData.dob) {
      errors.dob = "Date of Birth is required";
    } else if (age <= 12) {
      errors.dob = "Only users above 12 years are allowed.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.post('/auth/register', formData);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setIsSubmitting(false);
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0A1E29', zIndex: -3 }}></div>
      <video autoPlay loop muted playsInline className="home-bg-video">
        <source src={bgVideo} type="video/webm" />
      </video>
      <div className="flex-center register-page-container">
        <div className="glass-card auth-card animate-slide-up">
          <h2 className="text-orange text-center mb-1">Join ActiveLife</h2>
          <p className="text-center mb-2" style={{ opacity: 0.7, fontSize: '0.9rem' }}>Start your personalized fitness journey</p>
          
          <form onSubmit={handleSubmit} className="flex-col">
            {/* Full Name */}
            <div className="form-group">
              <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                <FaUser size={12} className="text-orange" /> Full Name
              </label>
              <input 
                type="text" 
                name="name"
                className={`form-input ${fieldErrors.name ? 'input-error' : ''}`} 
                placeholder="Vansh Sharma"
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
              {fieldErrors.name && <span className="field-error-msg">{fieldErrors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                <FaEnvelope size={12} className="text-orange" /> Email Address
              </label>
              <input 
                type="email" 
                name="email"
                className={`form-input ${fieldErrors.email ? 'input-error' : ''}`} 
                placeholder="vansh@example.com"
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
              {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                <FaLock size={12} className="text-orange" /> Create Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  className={`form-input ${fieldErrors.password ? 'input-error' : ''}`} 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  minLength="6"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
            </div>

            <div className="grid-2 gap-1 mb-1">
              {/* DOB */}
              <div className="form-group">
                <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                  <FaCalendarAlt size={12} className="text-orange" /> DOB
                </label>
                <input 
                  type="date" 
                  name="dob"
                  className={`form-input ${fieldErrors.dob ? 'input-error' : ''}`} 
                  value={formData.dob} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                  <FaTransgender size={12} className="text-orange" /> Gender
                </label>
                <select 
                  name="gender"
                  className="form-input" 
                  value={formData.gender} 
                  onChange={handleChange}
                  style={{ height: '45px' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer Not To Say">Prefer Not To Say</option>
                </select>
              </div>
            </div>

            {fieldErrors.dob && <p className="error-text mb-1" style={{ fontSize: '0.8rem', textAlign: 'center' }}>{fieldErrors.dob}</p>}
            
            {error && <p className="error-text mb-1 text-center">{error}</p>}

            <button 
              type="submit" 
              className={`btn-orange mt-1 ${isSubmitting ? 'btn-loading' : ''} ${isSuccess ? 'btn-success' : ''}`}
              disabled={isSubmitting || isSuccess || (age !== null && age <= 12)}
              style={{ padding: '1rem', borderRadius: '14px' }}
            >
              <span>{isSuccess ? '✅ Account Created!' : 'Create My Account'}</span>
            </button>
          </form>

          <p className="text-center mt-2" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
            Already have an account? <span onClick={() => navigate('/login')} className="text-orange" style={{ cursor: 'pointer', fontWeight: 'bold' }}>Login here</span>
          </p>
        </div>
      </div>
      <style>{`
        .register-page-container { min-height: 100vh; padding: 40px 20px; margin-top: -40px; }
        .auth-card { width: 100%; max-width: 450px; padding: 2.5rem; position: relative; z-index: 1; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
        @media (max-width: 480px) {
          .register-page-container { padding: 20px 10px; margin-top: -20px; }
          .auth-card { padding: 1.5rem; }
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default Register;