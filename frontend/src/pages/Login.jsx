import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from "../services/api";
import bgVideo from '../assets/bg.webm';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Forgot Password state
  const [mode, setMode] = useState('login');
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpPassword, setFpPassword] = useState('');
  const [fpMsg, setFpMsg] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  // Show/hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    let errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateFpStep1 = () => {
    let errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fpEmail) errors.fpEmail = "Email is required";
    else if (!emailRegex.test(fpEmail)) errors.fpEmail = "Invalid email format";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateFpStep2 = () => {
    let errors = {};
    if (!fpOtp) errors.fpOtp = "OTP is required";
    else if (fpOtp.length < 6) errors.fpOtp = "Enter full 6-digit OTP";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateFpStep3 = () => {
    let errors = {};
    if (!fpPassword) errors.fpPassword = "New password is required";
    else if (fpPassword.length < 6) errors.fpPassword = "Minimum 6 characters required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data;
      login(user, token);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setIsSubmitting(false);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  // Step 1: Send OTP to Email
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!validateFpStep1()) return;
    setFpError(''); setFpMsg(''); setFpLoading(true);
    try {
      const res = await api.post('/otp/forgot-password', { email: fpEmail, method: 'email' });
      setFpMsg(res.data.message);
      setMode('otp');
    } catch (err) {
      setFpError(err.response?.data?.message || 'Something went wrong.');
    } finally { setFpLoading(false); }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateFpStep2()) return;
    setFpError(''); setFpLoading(true);
    try {
      await api.post('/otp/verify-otp', { email: fpEmail, otp: fpOtp });
      setFpMsg(''); // Clear the "OTP sent" message when proceeding to reset
      setMode('reset');
    } catch (err) {
      setFpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally { setFpLoading(false); }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateFpStep3()) return;
    setFpError(''); setFpLoading(true);
    try {
      const res = await api.post('/otp/reset-password', { email: fpEmail, new_password: fpPassword });
      console.log('[RESET] Success:', res.data);
      setFpMsg(res.data.message);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reset password.';
      console.error('[RESET] Error:', errMsg, err.response?.status);
      setFpError(errMsg);
    } finally { setFpLoading(false); }
  };

  const BackButton = ({ to }) => (
    <button onClick={() => { setMode(to); setFpError(''); setFpMsg(''); }}
      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.2rem', marginRight: '0.5rem' }}>←</button>
  );

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0A1E29', zIndex: -3 }}></div>
      <video autoPlay loop muted playsInline className="home-bg-video">
        <source src={bgVideo} type="video/webm" />
      </video>
      <div className="flex-center login-container">
        <div className="glass-card auth-card">

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <>
              <h2 className="text-orange text-center mb-2">Member Login</h2>
              <form onSubmit={handleSubmit} className="flex-col">
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className={`form-input ${fieldErrors.email ? 'input-error' : ''}`} 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" }));
                    }} 
                    required 
                  />
                  {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className={`form-input ${fieldErrors.password ? 'input-error' : ''}`} 
                      value={password} 
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }));
                      }} 
                      required 
                      style={{ paddingRight: '2.5rem' }} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
                </div>
                {error && <p className="error-text mb-1">{error}</p>}
                <button type="submit"
                  className={`btn-orange mt-1 ${isSubmitting ? 'btn-loading' : ''} ${isSuccess ? 'btn-success' : ''}`}
                  disabled={isSubmitting || isSuccess} style={{ transition: 'all 0.3s ease' }}>
                  <span className={isSubmitting ? 'btn-loading-text' : ''}>{isSuccess ? '✅ Login Successful!' : 'Login'}</span>
                </button>
              </form>
              <p className="text-center mt-1" style={{ fontSize: '0.9rem' }}>
                <button onClick={() => setMode('forgot')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
                  Forgot Password?
                </button>
              </p>
              <p className="text-center mt-1">
                Don't have an account? <Link to="/register" className="text-orange">Sign up</Link>
              </p>
            </>
          )}

          {/* ── STEP 1: ENTER EMAIL ── */}
          {mode === 'forgot' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <BackButton to="login" />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Step 1 of 3</span>
              </div>
              <h2 className="text-orange text-center mb-1">📧 Forgot Password</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                Enter your registered email. We'll send a 6-digit OTP to reset your password.
              </p>
              <form onSubmit={handleForgotSubmit} className="flex-col gap-1">
                <div className="form-group">
                  <label>Registered Email Address</label>
                  <input 
                    type="email" 
                    className={`form-input ${fieldErrors.fpEmail ? 'input-error' : ''}`} 
                    placeholder="your@email.com" 
                    value={fpEmail} 
                    onChange={(e) => {
                      setFpEmail(e.target.value);
                      if (fieldErrors.fpEmail) setFieldErrors(prev => ({ ...prev, fpEmail: "" }));
                    }} 
                    required 
                  />
                  {fieldErrors.fpEmail && <span className="field-error-msg">{fieldErrors.fpEmail}</span>}
                </div>
                {fpError && <p className="error-text">{fpError}</p>}
                {fpMsg && <p style={{ color: '#4ade80', fontSize: '0.9rem' }}>{fpMsg}</p>}
                <button type="submit" className="btn-orange mt-1" disabled={fpLoading}>
                  {fpLoading ? 'Sending OTP...' : 'Send OTP to Email'}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: VERIFY OTP ── */}
          {mode === 'otp' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <BackButton to="forgot" />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Step 2 of 3</span>
              </div>
              <h2 className="text-orange text-center mb-1">Enter OTP</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                Check your inbox at <strong style={{ color: 'white' }}>{fpEmail}</strong> for the 6-digit code.
              </p>
              <form onSubmit={handleVerifyOtp} className="flex-col gap-1">
                <div className="form-group">
                  <label>6-Digit OTP</label>
                  <input 
                    type="text" 
                    className={`form-input ${fieldErrors.fpOtp ? 'input-error' : ''}`} 
                    placeholder="• • • • • •" 
                    value={fpOtp}
                    onChange={(e) => {
                      setFpOtp(e.target.value.replace(/\D/, '').slice(0, 6));
                      if (fieldErrors.fpOtp) setFieldErrors(prev => ({ ...prev, fpOtp: "" }));
                    }}
                    maxLength={6} 
                    required 
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }} 
                  />
                  {fieldErrors.fpOtp && <span className="field-error-msg" style={{ textAlign: 'center' }}>{fieldErrors.fpOtp}</span>}
                </div>
                {fpError && <p className="error-text">{fpError}</p>}
                <button type="submit" className="btn-orange mt-1" disabled={fpLoading || fpOtp.length < 6}>
                  {fpLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" onClick={handleForgotSubmit} disabled={fpLoading}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.5rem', textDecoration: 'underline' }}>
                  Resend OTP
                </button>
              </form>
            </>
          )}

          {/* ── STEP 3: NEW PASSWORD ── */}
          {mode === 'reset' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Step 3 of 3</span>
              </div>
              <h2 className="text-orange text-center mb-1">🔒 New Password</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                Almost done! Set a strong new password for your account.
              </p>
              <form onSubmit={handleResetPassword} className="flex-col gap-1">
                <div className="form-group">
                  <label>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showNewPassword ? 'text' : 'password'} 
                      className={`form-input ${fieldErrors.fpPassword ? 'input-error' : ''}`} 
                      placeholder="Minimum 6 characters" 
                      value={fpPassword}
                      onChange={(e) => {
                        setFpPassword(e.target.value);
                        if (fieldErrors.fpPassword) setFieldErrors(prev => ({ ...prev, fpPassword: "" }));
                      }} 
                      required 
                      minLength={6} 
                      style={{ paddingRight: '2.5rem' }} 
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                      {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.fpPassword && <span className="field-error-msg">{fieldErrors.fpPassword}</span>}
                </div>
                {fpError && <p className="error-text">{fpError}</p>}
                {fpMsg ? (
                  <div className="flex-col gap-1 mt-1" style={{ textAlign: 'center' }}>
                    <p style={{ color: '#4ade80', fontSize: '0.95rem' }}>✅ {fpMsg}</p>
                    <button
                      type="button"
                      className="btn-orange mt-1"
                      onClick={() => { setMode('login'); setFpEmail(''); setFpOtp(''); setFpPassword(''); setFpMsg(''); setFpError(''); setFieldErrors({}); }}
                    >
                      Back to Login
                    </button>
                  </div>
                ) : (
                  <button type="submit" className="btn-orange mt-1" disabled={fpLoading || fpPassword.length < 6}>
                    {fpLoading ? 'Saving...' : 'Save New Password'}
                  </button>
                )}
              </form>
            </>
          )}

        </div>
      </div>
      <style>{`
        .login-container { min-height: 100vh; padding: 20px; margin-top: -60px; }
        .auth-card { width: 100%; max-width: 400px; padding: 2rem; position: relative; z-index: 1; }
        
        @media (max-width: 480px) {
          .login-container { min-height: 100vh; padding: 10px; margin-top: -40px; }
          .auth-card { padding: 1.5rem 1rem; }
          h2 { font-size: 1.8rem; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </>
  );
};

export default Login;