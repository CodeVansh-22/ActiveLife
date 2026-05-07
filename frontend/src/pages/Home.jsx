  import React from 'react';
  import { Link } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';
  import bgVideo from '../assets/bg.webm';
  import aiCoachImg from '../assets/aiCoach.webp';
  import cardioDeck from '../assets/cardioDeck.webp';
  import healthTracking from '../assets/healthTrack.webp';
  import gymSpace from '../assets/DashboardImgs/GymAndAiCoach.webp';
  import { FaDumbbell, FaMicrochip, FaYoutube, FaTrophy, FaPlay } from 'react-icons/fa';
  import '../styles/Home.css';

  const Home = () => {
    useAuth();

    return (
      <div className="home-container">
        {/* Dark Background for Video */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0A1E29', zIndex: -3 }}></div>
        {/* Background Video */}
        <video autoPlay loop muted playsInline className="home-bg-video">
          <source src={bgVideo} type="video/webm" />
        </video>

        <div className="home-content flex-center flex-col">

          {/* ── HERO SECTION ── */}
          <div className="hero-section text-center animate-scale-in">
            <h1 className="hero-title">THE NEW ERA OF FITNESS</h1>
            <p className="hero-desc">ActiveLife is your premium AI-integrated gym facility. Experience precision training and elite recovery.</p>
            <Link to="/dashboard">
              <button className="btn-orange" style={{ fontSize: '1.2rem', padding: '0.8rem 3rem', borderRadius: '12px' }}>
                Enter Dashboard
              </button>
            </Link>
          </div>

          {/* ── FACILITIES SECTION ── */}
          <div className="text-center mb-1 intro-section">
            <h2 className="section-title">OUR ELITE FACILITIES</h2>
          </div>

          <div className="facilities-grid">

            {/* Facility 1: AI coaching Lab */}
            <div className="gym-card">
              <img src={aiCoachImg} alt="AI Lab" className="gym-card-img" />
              <div className="gym-card-icon"><FaMicrochip /></div>
              <h3 className="gym-card-title text-orange" style={{ fontSize: '1.8rem' }}>AI Coaching Lab</h3>
              <p className="gym-card-desc">State-of-the-art diagnostic zone where our AI ecosystem generates your perfect diet and workout protocols.</p>
            </div>

            {/* Facility 2: Zero to Hero Exercises */}
            <div className="gym-card">
              <img src={cardioDeck} alt="Learning" className="gym-card-img" />
              <div className="gym-card-icon"><FaYoutube /></div>
              <h3 className="gym-card-title text-orange" style={{ fontSize: '1.8rem' }}>Zero to Hero Exercises</h3>
              <p className="gym-card-desc">Master every movement with our curated video tutorials. From beginner basics to professional techniques.</p>
            </div>

            {/* Facility 3: Strength Zone */}
            <div className="gym-card">
              <img src={gymSpace} alt="Strength" className="gym-card-img" />
              <div className="gym-card-icon"><FaDumbbell /></div>
              <h3 className="gym-card-title text-orange" style={{ fontSize: '1.8rem' }}>Strength Zone</h3>
              <p className="gym-card-desc">Equipped with premium bodybuilding machines and Olympic-grade free weights for maximum strength gains.</p>
            </div>

            {/* Facility 4: Nearby Competitions */}
            <div className="gym-card">
              <img src={healthTracking} alt="Competitions" className="gym-card-img" />
              <div className="gym-card-icon"><FaTrophy /></div>
              <h3 className="gym-card-title text-orange" style={{ fontSize: '1.8rem' }}>Nearby Competitions</h3>
              <p className="gym-card-desc">Showcase your skills in general competitions nearby you. Compete, participate, and win at the local and national level.</p>
            </div>
          </div>

          {/* ── FEATURED VIDEO SECTION ── */}
          <div className="featured-video-section animate-slide-up mt-2">
            <div className="video-header text-center mb-1">
              <h2 className="section-title"><FaYoutube color="#FF0000" /> FEATURED TUTORIAL</h2>
              <p className="video-subtitle">Master the fundamentals of the Deadlift with our elite coaches.</p>
            </div>
            <div className="home-video-wrapper glass-card">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/cbKkB3POqaY"
                title="Deadlift Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="text-center mt-1">
              <Link to="/learn-compete">
                <button className="btn-orange-outline">
                  Explore All Tutorials <FaPlay style={{ fontSize: '0.8rem', marginLeft: '8px' }} />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <footer className="text-center mobile-footer">
          © {new Date().getFullYear()} ACTIVELIFE ELITE FACILITIES · SMART GYM ECOSYSTEM
        </footer>
      </div>
    );
  };

  export default Home;