import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.webp";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = user ? (
    <>
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
      {user.role?.toString().trim().toLowerCase() !== "admin" ? (
        <>
          <Link to="/diet-plan">Diet Plan</Link>
          <Link to="/workout-plan">AI Workout</Link>
          <Link to="/my-workout">My Workout</Link>
          <Link to="/learn-compete">Learn & Compete</Link>
          <Link to="/profile">Profile</Link>
        </>
      ) : (
        <Link to="/admin" className="nav-admin-link">Admin Control</Link>
      )}
    </>
  ) : (
    <>
      <Link to="/login">Login</Link>
      <Link to="/register">
        <button className="btn-orange" style={{ width: '100%', marginTop: '10px' }}>Sign Up</button>
      </Link>
    </>
  );

  return (
    <nav className="glass-nav flex-between relative" style={{ marginBottom: '2rem', marginTop: '1rem' }}>

      <div className="nav-brand">
        <Link to="/" className="flex-center">
          <img src={logo} alt="ActiveLife Logo" className="nav-logo" />
        </Link>
        <h2><Link to="/" className="text-orange nav-brand-text">ActiveLife</Link></h2>
      </div>

      {/* Desktop Links */}
      <div className="flex-center gap-1 desktop-only">
        <div className="flex-center gap-1 desktop-nav-links">
          {navLinks}
        </div>
        {user && (
          <button onClick={handleLogout} className="btn-orange">
            Logout
          </button>
        )}
      </div>

      {/* Mobile Actions (No Hamburger) */}
      <div className="mobile-only-flex gap-1" style={{ alignItems: 'center' }}>
        {user ? (
          <button 
            onClick={handleLogout} 
            className="btn-orange" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px' }}
          >
            Logout
          </button>
        ) : (
          <Link to="/login">
            <button className="btn-orange" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px' }}>Login</button>
          </Link>
        )}
      </div>

    </nav>
  );
};


export default Navbar;
