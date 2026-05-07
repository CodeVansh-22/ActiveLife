import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FaYoutube, FaTrophy, FaArrowRight,
  FaWhatsapp, FaEnvelope, FaUser, FaCity, FaCheckCircle, FaTimes, FaPlay
} from 'react-icons/fa';
import '../styles/LearnCompete.css';

const LearnCompete = () => {
  const [activeCard, setActiveCard] = useState(null); // 'learn' | 'compete'
  const [selectedEvent, setSelectedEvent] = useState(null); // the event user wants to register for
  const [selectedVideo, setSelectedVideo] = useState(null); // the video to embed
  const [videoCategory, setVideoCategory] = useState('Beginner'); // 'Beginner' | 'Intermediate' | 'Core/Advanced'
  const [formData, setFormData] = useState({ name: '', city: 'Mumbai', email: '', whatsapp: '' });
  const [submitted, setSubmitted] = useState(false);

  // Dynamic Data States
  const [learnResources, setLearnResources] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [videoRes, eventRes] = await Promise.all([
        api.get('/content/videos'),
        api.get('/content/competitions')
      ]);
      
      // Use fetched data if available, else fall back to some defaults if empty
      setLearnResources(videoRes.data.videos?.length > 0 ? videoRes.data.videos : [
        { title: 'Gym Basics', subtitle: 'Beginner fundamentals', link: 'https://youtu.be/cbKkB3POqaY', category: 'Beginner' },
        { title: 'Deadlift Form', subtitle: 'Intermediate pull technique', link: 'https://youtu.be/cbKkB3POqaY', category: 'Intermediate' },
        { title: 'Posing Tutorials', subtitle: 'Master stage poses', link: 'https://youtu.be/CbVPqT2xC6I', category: 'Core/Advanced' }
      ]);
      
      setUpcomingEvents(eventRes.data.events?.length > 0 ? eventRes.data.events : [
        { id: 'def1', name: 'Sherlock Classic', date: 'Dec 05, 2026', venue: 'Mumbai', category: 'Bodybuilding' }
      ]);
    } catch (err) {
      console.error("Failed to fetch dynamic content", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="learn-compete-container animate-fade-in">

      {/* ── HUB VIEW ── */}
      {!activeCard ? (
        <div className="hub-view">

          <h1 className="lc-headline">Learn &amp; Compete</h1>
          <p className="lc-subtitle">Level up your gym knowledge · Take your physique to the stage</p>

          <div className="hub-grid">

            {/* LEARN card */}
            <div
              className="hub-card hub-card--learn"
              onClick={() => setActiveCard('learn')}
            >
              <div className="hub-card-icon-wrap hub-card-icon-wrap--learn">
                <FaYoutube size={40} color="#F47A20" />
              </div>
              <h2 className="hub-card-title" style={{ color: '#F47A20' }}>Learn From Home</h2>
              <p className="hub-card-body">
                Master gym basics, posing, and stage presentation with expert-led YouTube tutorials.
                Build your knowledge one rep at a time.
              </p>
              <div className="hub-card-cta hub-card-cta--learn">
                Explore Tutorials <FaArrowRight />
              </div>
            </div>

            {/* COMPETE card */}
            <div
              className="hub-card hub-card--compete"
              onClick={() => setActiveCard('compete')}
            >
              <div className="hub-card-icon-wrap hub-card-icon-wrap--compete">
                <FaTrophy size={40} color="#13A8C7" />
              </div>
              <h2 className="hub-card-title" style={{ color: '#13A8C7' }}>Compete In India</h2>
              <p className="hub-card-body">
                Take your physique to the stage. Get notified about upcoming outdoor competitions
                in cities like Mumbai, Delhi, Haryana, and more.
              </p>
              <div className="hub-card-cta hub-card-cta--compete">
                Check Competitions <FaArrowRight />
              </div>
            </div>

          </div>
        </div>

      ) : (

        /* ── DETAIL VIEW ── */
        <div className="detail-wrapper">

          <div className="back-nav">
            <button className="back-btn" onClick={() => { setActiveCard(null); setSelectedEvent(null); setSubmitted(false); }}>
              ← Back to Hub
            </button>
            {activeCard === 'compete' && selectedEvent && !submitted && (
              <button className="back-btn back-btn--sub" onClick={() => setSelectedEvent(null)}>
                ← Back to Events
              </button>
            )}
          </div>

          {activeCard === 'learn' ? (

            /* ── LEARN DETAIL ── */
            <div className="lc-detail-panel animate-slide-up">

              <h2 className="lc-detail-heading lc-detail-heading--learn">
                <FaYoutube /> Curated Learning Path
              </h2>

              <div className="category-tabs">
                {['Beginner', 'Intermediate', 'Core/Advanced'].map(cat => (
                  <button 
                    key={cat} 
                    className={`cat-tab ${videoCategory === cat ? 'active' : ''}`}
                    onClick={() => setVideoCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="resources-grid">
                {learnResources.filter(r => (r.category || 'Beginner') === videoCategory).map((r, i) => (
                  <div
                    key={i}
                    className="video-resource-card animate-fade-in"
                    onClick={() => setSelectedVideo(r)}
                  >
                    <div className="video-card-top">
                      <div className="video-card-icon">
                        <FaYoutube size={40} />
                      </div>
                      <span className="v-badge">{videoCategory}</span>
                    </div>
                    
                    <div className="video-card-content">
                      <div className="video-card-info">
                        <h3 className="v-title">{r.title}</h3>
                        <p className="v-subtitle">{r.subtitle}</p>
                      </div>
                      <div className="video-card-footer">
                        <div className="v-watch-btn">
                          Watch Tutorial <FaPlay size={10} />
                        </div>
                        <FaArrowRight className="v-arrow" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="lc-coming-soon">
                More tutorials coming soon — keep practicing daily 💪
              </p>
            </div>

          ) : (

            /* ── COMPETE DETAIL ── */
            <div className="lc-detail-panel animate-slide-up">

              <h2 className="lc-detail-heading lc-detail-heading--compete">
                <FaTrophy /> {selectedEvent ? `Participate: ${selectedEvent.name}` : 'Upcoming Indian Shows'}
              </h2>

              {!selectedEvent ? (
                /* ── EVENTS LIST ── */
                <div className="events-grid">
                  {upcomingEvents.map((ev) => (
                    <div key={ev.id} className="event-card">
                      <div className="event-date-badge">{ev.date.split(',')[0]}</div>
                      <h3 className="event-name">{ev.name}</h3>
                      <div className="event-info">
                        <span className="event-tag">{ev.category}</span>
                        <div className="event-venue"><FaCity /> {ev.venue}</div>
                      </div>
                      <button
                        className="event-participate-btn"
                        onClick={() => setSelectedEvent(ev)}
                      >
                        Participate <FaArrowRight />
                      </button>
                    </div>
                  ))}
                  <p className="lc-coming-soon" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    More outdoor competitions being added soon 🏟️
                  </p>
                </div>
              ) : !submitted ? (
                /* ── REGISTRATION FORM ── */
                <div>
                  <p className="compete-intro">
                    Register your interest for <strong>{selectedEvent.name}</strong>.
                    We'll notify you about registration dates, athlete meetings, and venue details.
                  </p>

                  <form onSubmit={handleSubmit} className="hub-form">

                    <div className="input-group">
                      <label><FaUser /> Name</label>
                      <input
                        type="text" required className="kit-input"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label><FaCity /> City</label>
                      <select
                        className="kit-input"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      >
                        <option>Mumbai</option>
                        <option>Kolkata</option>
                        <option>Delhi</option>
                        <option>Haryana</option>
                        <option>Punjab</option>
                        <option>Bengaluru</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label><FaEnvelope /> Email</label>
                      <input
                        type="email" required className="kit-input"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label><FaWhatsapp /> WhatsApp</label>
                      <input
                        type="tel" required className="kit-input"
                        placeholder="+91 98765 43210"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="submit-btn-hub">
                      Proceed to Participate
                    </button>
                  </form>
                </div>
              ) : (
                /* ── SUCCESS VIEW ── */
                <div className="success-view animate-scale-in">
                  <div className="success-icon"><FaCheckCircle /></div>
                  <h3 className="success-title">Application Received!</h3>
                  <p className="success-msg">
                    You've successfully shown interest in <strong>{selectedEvent.name}</strong>.
                    Our team will reach out to you on WhatsApp (<strong>{formData.whatsapp}</strong>).
                  </p>
                  <button onClick={() => { setSubmitted(false); setSelectedEvent(null); }} className="btn-reregister">
                    View other competitions
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <footer className="hub-footer">
        <h3>ACTIVELIFE · INDIA'S ELITE ECOSYSTEM</h3>
      </footer>

      {/* ── VIDEO MODAL ── */}
      {selectedVideo && (
        <div className="modal-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="video-modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedVideo(null)}><FaTimes /></button>
            <div className="video-embed-container">
              <iframe
                src={`${getEmbedUrl(selectedVideo.link)}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-info-overlay">
              <h3>{selectedVideo.title}</h3>
              <p>{selectedVideo.subtitle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnCompete;
