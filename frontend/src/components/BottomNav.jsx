import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaYoutube, FaRobot, FaUser, FaTachometerAlt, FaUserShield, FaDumbbell } from 'react-icons/fa';

const BottomNav = () => {
  const { user } = useAuth();

  // If the user is not logged in, don't show the bottom nav
  if (!user) return null;

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")} end>
        <FaHome />
        <span>Home</span>
      </NavLink>
      <NavLink to="/learn-compete" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
        <FaYoutube />
        <span>Learn</span>
      </NavLink>
      <NavLink to="/ai-plans" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
        <FaRobot />
        <span>AI Plans</span>
      </NavLink>
      <NavLink to="/my-workout" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
        <FaDumbbell />
        <span>Workout</span>
      </NavLink>
      <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
        <FaTachometerAlt />
        <span>Dashboard</span>
      </NavLink>
      {user.role !== 'admin' && (
        <NavLink to="/profile" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <FaUser />
          <span>Profile</span>
        </NavLink>
      )}
      {user.role === 'admin' && (
        <NavLink to="/admin" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <FaUserShield />
          <span>Admin</span>
        </NavLink>
      )}
    </nav>
  );
};

export default BottomNav;
