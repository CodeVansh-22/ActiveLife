import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Profile.css';
import { FaUserCircle, FaDumbbell, FaUtensils, FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ProgressCard from '../components/ProgressCard';
import WorkoutHistoryModal from '../components/WorkoutHistoryModal';
import { FaHistory } from 'react-icons/fa';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [profilePlans, setProfilePlans] = useState({ diet: null, workout: null });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showDietPlan, setShowDietPlan] = useState(false);
  const [showWorkoutPlan, setShowWorkoutPlan] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const faqs = [
    { q: "How does the AI Coach generate plans?", a: "Our AI engine analyzes your onboarding quiz data, BMI, and goals to construct a bespoke 8-12 week transformation regime mapping both workouts and nutrition." },
    { q: "Can I adjust my transformation goal?", a: "Yes! You can retake the Smart Onboarding Quiz at any time to recalibrate your plan based on your evolving fitness needs." },
    { q: "How do I track my progress?", a: "Use the Tracking Dashboard to log your daily workouts, weight, and measurements. Your AI Coach will analyze this data to provide personalized feedback." },
    { q: "How accurately is the BMI Metric calculated?", a: "The BMI calculation strictly relies on the standard medical formula mapping your recorded weight against your squared height." },
    { q: "Are the plans home or gym based?", a: "Both! When you complete the quiz, we generate both Home and Gym variants so you can stay consistent regardless of where you train." }
  ];

  useEffect(() => {
    fetchProfileData();
    fetchProfilePlans();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfileData(res.data);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchProfilePlans = async () => {
    try {
      const res = await api.get('/ai/profile-plans');
      if (res.data.plans) {
        setProfilePlans(res.data.plans);
      }
    } catch (err) {
      console.error("Failed to load profile plans", err);
    } finally {
      setLoadingPlans(false);
    }
  };


  const formatHeight = (cm) => {
    if (!cm) return "";
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    if (inches === 12) return `${feet + 1}'0"`;
    return `${feet}'${inches}"`;
  };

  const baseURL = api.defaults.baseURL.replace('/api', '');
  const profilePicUrl = profileData?.profile_pic ? `${baseURL}${profileData.profile_pic}` : null;

  return (
    <div className="profile-container animate-fade-in">
      <div className="page-bg-image" />
      <div className="profile-header-section text-center mb-3">
        <div className="profile-pic-wrapper">
            {profilePicUrl ? (
                <img src={profilePicUrl} alt="Profile" className="profile-pic-img" />
            ) : (
                <FaUserCircle size={80} color="var(--accent-orange)" style={{ opacity: 0.8 }} />
            )}
        </div>
        
        <h1 className="profile-title">{profileData?.name || user?.name}'s Fitness Profile</h1>
      </div>

      <div className="profile-main-grid">
        
        {/* ── SECTION 1: Body Metrics ── */}
        <div className="metrics-card">
          <div className="metrics-header-row">
             <h3 className="plan-title">Body Metrics</h3>
             <button 
               className="history-btn-small" 
               onClick={() => setShowHistory(true)}
             >
               <FaHistory size={12} /> History
             </button>
          </div>
          {loadingProfile ? (
            <div className="text-center py-2">Loading metrics...</div>
          ) : profileData?.bmi ? (
            <>
              <div className="metrics-row">
                <div className="metric-item">
                  <span className="metric-label">Height</span>
                  <p className="metric-value">{formatHeight(profileData.height_cm)}</p>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Weight</span>
                  <p className="metric-value">{profileData.weight_kg} kg</p>
                </div>
              </div>
              <div className="bmi-full-width">
                <span className="metric-label">Latest AI Computed BMI</span>
                <p className="bmi-value-large">{profileData.bmi}</p>
                <div style={{ fontSize: '12px', color: 'rgba(255,122,32,0.8)', marginTop: '8px', fontWeight: 600 }}>
                   Health Category: {profileData.bmi < 18.5 ? 'Underweight' : profileData.bmi < 25 ? 'Normal' : profileData.bmi < 30 ? 'Overweight' : 'Obese'}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-2" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              No metrics recorded yet. Visit AI Plans to compute your BMI.
            </p>
          )}
        </div>

        {/* ── SECTION 1.5: Track Progress ── */}
        <ProgressCard onOpenTracker={() => navigate('/progress')} />

        {/* ── SECTION 2: AI Diet Plan ── */}
        <div className="plan-glass-card">
          <div className="plan-header">
            <h3 className="plan-title"><FaUtensils style={{ marginRight: '8px' }} /> Latest Diet Plan</h3>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Indian Nutrition</span>
          </div>
          {loadingPlans ? (
            <div className="text-center py-3">Loading plan...</div>
          ) : profilePlans.diet ? (
            <>
              <div className="plan-content-wrapper" style={{ maxHeight: showDietPlan ? '1000px' : '200px' }}>
                <div className="premium-markdown">
                  <ReactMarkdown>{profilePlans.diet.content}</ReactMarkdown>
                </div>
                {!showDietPlan && <div className="plan-fade-overlay" />}
              </div>
              <button onClick={() => setShowDietPlan(!showDietPlan)} className="btn-orange mt-2" style={{ width: '100%', padding: '12px', borderRadius: '12px' }}>
                {showDietPlan ? 'Collapse Plan' : 'View Full Strategic Plan'}
              </button>
            </>
          ) : (
            <p className="text-center py-3" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              No custom diet plan generated for this profile.
            </p>
          )}
        </div>

        {/* ── SECTION 3: AI Workout Plan ── */}
        <div className="plan-glass-card">
          <div className="plan-header">
            <h3 className="plan-title"><FaDumbbell style={{ marginRight: '8px' }} /> Latest Workout Plan</h3>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Regime</span>
          </div>
          {loadingPlans ? (
            <div className="text-center py-3">Loading plan...</div>
          ) : profilePlans.workout ? (
            <>
              <div className="plan-content-wrapper" style={{ maxHeight: showWorkoutPlan ? '1000px' : '200px' }}>
                <div className="premium-markdown">
                  <ReactMarkdown>{profilePlans.workout.content}</ReactMarkdown>
                </div>
                {!showWorkoutPlan && <div className="plan-fade-overlay" />}
              </div>
              <button onClick={() => setShowWorkoutPlan(!showWorkoutPlan)} className="btn-orange mt-2" style={{ width: '100%', padding: '12px', borderRadius: '12px' }}>
                {showWorkoutPlan ? 'Collapse Plan' : 'View Full Strategic Plan'}
              </button>
            </>
          ) : (
            <p className="text-center py-3" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              No custom workout plan generated for this profile.
            </p>
          )}
        </div>

        {/* ── SECTION 4: FAQs ── */}
        <div className="faq-container-full">
           <div className="performance-header">
              <h3 className="page-title-main text-orange"><FaQuestionCircle style={{ marginRight: '8px' }} /> Knowledge Hub</h3>
           </div>
           <div className="flex-col gap-1">
             {faqs.map((faq, index) => (
                <div key={index} className="faq-premium-item">
                  <div className="faq-header" onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                    <span style={{ fontSize: '14px', flex: 1, paddingRight: '10px' }}>{faq.q}</span>
                    {activeFaq === index ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </div>
                  {activeFaq === index && (
                    <div className="faq-answer">
                      {faq.a}
                    </div>
                  )}
                </div>
             ))}
           </div>
        </div>
      </div>

      <WorkoutHistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={profileData?.history || []} 
      />
    </div>
  );
};

export default Profile;
