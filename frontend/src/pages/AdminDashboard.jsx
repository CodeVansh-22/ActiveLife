import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaUser, FaTrophy, FaYoutube, FaTrash, FaCity, FaCalendar, FaTag, FaFire, FaChartLine, FaHistory, FaTimes, FaLink, FaEdit } from 'react-icons/fa';
import '../styles/admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'competitions' | 'videos'
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // For history modal
  
  // Form States
  const [compForm, setCompForm] = useState({ name: '', date: '', venue: '', category: '' });
  const [videoForm, setVideoForm] = useState({ title: '', subtitle: '', link: '', category: 'Beginner' });
  const [editingVideo, setEditingVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'competitions') fetchCompetitions();
    if (activeTab === 'videos') fetchVideos();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users.filter(u => u.role !== 'admin'));
    } catch (err) { console.error(err); }
  };

  const fetchCompetitions = async () => {
    try {
      const res = await api.get('/content/competitions');
      setCompetitions(res.data.events || []);
    } catch (err) { console.error(err); }
  };

  const fetchVideos = async () => {
    try {
      const res = await api.get('/content/videos');
      setVideos(res.data.videos || []);
    } catch (err) { console.error(err); }
  };

  const handleAddCompetition = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/competitions', compForm);
      setMessage({ type: 'success', text: 'Competition added!' });
      setCompForm({ name: '', date: '', venue: '', category: '' });
      fetchCompetitions();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add competition' });
    } finally { setLoading(false); }
  };

  const handleDeleteCompetition = async (id) => {
    if (!window.confirm("Delete this competition?")) return;
    try {
      await api.delete(`/admin/competitions/${id}`);
      fetchCompetitions();
    } catch (err) { console.error(err); }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingVideo) {
        await api.put(`/admin/videos/${editingVideo._id}`, videoForm);
        setMessage({ type: 'success', text: 'Video updated!' });
      } else {
        await api.post('/admin/videos', videoForm);
        setMessage({ type: 'success', text: 'Video added!' });
      }
      setVideoForm({ title: '', subtitle: '', link: '', category: 'Beginner' });
      setEditingVideo(null);
      fetchVideos();
    } catch (err) {
      setMessage({ type: 'error', text: editingVideo ? 'Failed to update video' : 'Failed to add video' });
    } finally { setLoading(false); }
  };

  const startEditVideo = (v) => {
    setEditingVideo(v);
    setVideoForm({ title: v.title, subtitle: v.subtitle, link: v.link, category: v.category || 'Beginner' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await api.delete(`/admin/videos/${id}`);
      fetchVideos();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="admin-container animate-fade-in" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>

      <h1 className="text-orange mb-2 admin-title text-center" style={{ fontSize: '2.5rem', letterSpacing: '2px' }}>
        ADMIN CONTROL CENTER
      </h1>

      {/* Global Analytics Cards */}
      {activeTab === 'users' && (
        <div className="admin-stats-grid">
          <div className="stat-card members stagger-1">
            <div className="stat-icon" style={{ color: 'var(--primary-cyan)' }}><FaUser /></div>
            <div className="stat-info">
              <h3>{users.length}</h3>
              <p>Total Members</p>
            </div>
          </div>
          <div className="stat-card streak stagger-2">
            <div className="stat-icon" style={{ color: 'var(--accent-orange)' }}><FaFire /></div>
            <div className="stat-info">
              <h3>{users.filter(u => (u.progress?.streak || 0) > 0).length}</h3>
              <p>Active Streaks</p>
            </div>
          </div>
          <div className="stat-card score stagger-3">
            <div className="stat-icon" style={{ color: '#4CAF50' }}><FaChartLine /></div>
            <div className="stat-info">
              <h3>
                {users.length > 0 
                  ? Math.round(users.reduce((acc, u) => acc + (u.progress?.score || 0), 0) / users.length)
                  : 0}%
              </h3>
              <p>Community Score</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs animate-fade-in">
        <button onClick={() => setActiveTab('users')} className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}>
          <FaUser /> Users
        </button>
        <button onClick={() => setActiveTab('competitions')} className={`tab-btn ${activeTab === 'competitions' ? 'active' : ''}`}>
          <FaTrophy /> Competitions
        </button>
        <button onClick={() => setActiveTab('videos')} className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}>
          <FaYoutube /> Tutorials
        </button>
      </div>

      {message.text && (
        <div className={`admin-alert ${message.type} animate-fade-in`}>
          {message.type === 'success' ? '✓' : '⚠'} {message.text}
        </div>
      )}


      <div className="glass-card admin-card">
        
        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <h3 className="mb-2"><FaUser /> Registered Members</h3>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th><FaFire /> Streak</th>
                    <th><FaChartLine /> Score</th>
                    <th>History</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="admin-user-row">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className="user-avatar">{u.name.charAt(0)}</div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong>{u.name}</strong>
                            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>ID: ...{u._id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{u.email}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Joined: {new Date(u.created_at).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <span className="badge-streak">
                          {u.progress?.streak || 0} Days
                        </span>
                      </td>
                      <td>
                        <span className="badge-score" style={{ 
                          color: (u.progress?.score || 0) > 70 ? '#4CAF50' : '#FFC107',
                          background: (u.progress?.score || 0) > 70 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                          border: `1px solid ${(u.progress?.score || 0) > 70 ? '#4CAF50' : '#FFC107'}`
                        }}>
                          {u.progress?.score || 0}%
                        </span>
                      </td>
                      <td>
                        <button className="view-journey-btn" onClick={() => setSelectedUser(u)}>
                          <FaHistory /> Journey
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Journey Modal */}
        {selectedUser && (
          <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setSelectedUser(null)}><FaTimes /></button>
              
              <h2 className="text-orange mb-1">{selectedUser.name}'s Journey</h2>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '0.5rem 1rem', flex: 1, textAlign: 'center' }}>
                  <small style={{ opacity: 0.6 }}>Workouts</small>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedUser.progress?.completed_days || 0}</div>
                </div>
                <div className="glass-card" style={{ padding: '0.5rem 1rem', flex: 1, textAlign: 'center' }}>
                  <small style={{ opacity: 0.6 }}>Consistency</small>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedUser.progress?.score || 0}%</div>
                </div>
              </div>

              <h4 className="mb-1"><FaHistory /> Recent Activity</h4>
              <div className="history-timeline">
                {selectedUser.progress?.history?.length > 0 ? (
                  selectedUser.progress.history.slice().reverse().map((h, i) => (
                    <div key={i} className="history-item">
                      <div className="history-date">{h.date}</div>
                      <div className="history-card">
                        Day {h.day} - {h.calories} kcal burned
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ opacity: 0.5 }}>No activity recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── COMPETITIONS TAB ── */}
        {activeTab === 'competitions' && (
          <div className="admin-section">
            <h3 className="mb-2"><FaTrophy /> Manage Competitions</h3>
            
            <div className="admin-manage-grid">
              <div className="admin-form-col">
                <form onSubmit={handleAddCompetition} className="admin-form">
                  <div className="input-group">
                    <label><FaTag /> Name</label>
                    <input type="text" className="kit-input" required placeholder="IHFF Delhi" value={compForm.name} onChange={e => setCompForm({...compForm, name: e.target.value})} />
                  </div>
                  <div className="input-group mt-1">
                    <label><FaCalendar /> Date</label>
                    <input type="text" className="kit-input" required placeholder="Oct 14, 2026" value={compForm.date} onChange={e => setCompForm({...compForm, date: e.target.value})} />
                  </div>
                  <div className="input-group mt-1">
                    <label><FaCity /> Venue</label>
                    <input type="text" className="kit-input" required placeholder="New Delhi" value={compForm.venue} onChange={e => setCompForm({...compForm, venue: e.target.value})} />
                  </div>
                  <div className="input-group mt-1">
                    <label><FaTrophy /> Category</label>
                    <input type="text" className="kit-input" required placeholder="Pro Qualifier" value={compForm.category} onChange={e => setCompForm({...compForm, category: e.target.value})} />
                  </div>
                  <button type="submit" className="submit-btn-hub mt-2" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Competition'}
                  </button>
                </form>
              </div>

              <div className="admin-list-col">
                <div className="items-list">
                  {competitions.length > 0 ? competitions.map(c => (
                    <div key={c._id} className="admin-item animate-fade-in">
                      <div style={{ fontSize: '0.9rem' }}>
                        <strong>{c.name}</strong>
                        <span style={{ opacity: 0.6 }}>{c.date} · {c.venue}</span>
                      </div>
                      <button onClick={() => handleDeleteCompetition(c._id)} className="delete-action-btn" title="Delete Competition">
                        <FaTrash />
                      </button>
                    </div>
                  )) : <div className="no-items">No competitions scheduled.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── VIDEOS TAB ── */}
        {activeTab === 'videos' && (
          <div className="admin-section">
            <h3 className="mb-2"><FaYoutube /> Manage Learning Videos</h3>
            
            <div className="admin-manage-grid">
              <div className="admin-form-col">
                <form onSubmit={handleAddVideo} className="admin-form">
                  <div className="input-group">
                    <label><FaTag /> Title</label>
                    <input type="text" className="kit-input" required placeholder="Posing Tutorial" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} />
                  </div>
                  <div className="input-group mt-1">
                    <label><FaYoutube /> Subtitle</label>
                    <input type="text" className="kit-input" required placeholder="Master the front double bicep" value={videoForm.subtitle} onChange={e => setVideoForm({...videoForm, subtitle: e.target.value})} />
                  </div>
                  <div className="input-group mt-1">
                    <label><FaLink /> Link</label>
                    <input type="text" className="kit-input" required placeholder="https://youtube.com/..." value={videoForm.link} onChange={e => setVideoForm({...videoForm, link: e.target.value})} />
                  </div>
                  <div className="input-group mt-1">
                    <label><FaFire /> Level / Category</label>
                    <select className="kit-input" value={videoForm.category} onChange={e => setVideoForm({...videoForm, category: e.target.value})}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Core/Advanced">Core/Advanced</option>
                    </select>
                  </div>
                  <button type="submit" className="submit-btn-hub mt-2" disabled={loading}>
                    {loading ? (editingVideo ? 'Updating...' : 'Adding...') : (editingVideo ? 'Update Video Link' : 'Add Video Link')}
                  </button>
                  {editingVideo && (
                    <button 
                      type="button" 
                      className="btn-orange-outline mt-1 w-100" 
                      onClick={() => { setEditingVideo(null); setVideoForm({ title: '', subtitle: '', link: '', category: 'Beginner' }); }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>

              <div className="admin-list-col">
                <div className="items-list">
                  {videos.length > 0 ? videos.map(v => (
                    <div key={v._id} className="admin-item animate-fade-in">
                      <div style={{ fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>{v.title}</strong>
                          <span className="badge-category">{v.category || 'Beginner'}</span>
                        </div>
                        <span style={{ opacity: 0.6 }}>{v.subtitle}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => startEditVideo(v)} className="edit-action-btn" title="Edit Video">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDeleteVideo(v._id)} className="delete-action-btn" title="Delete Video">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )) : <div className="no-items">No tutorial videos found.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>


    </div>
  );
};

export default AdminDashboard;