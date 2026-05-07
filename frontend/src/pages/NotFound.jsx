import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/glassmorphism.css';

const NotFound = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: '2rem',
            background: 'radial-gradient(circle at center, #1a3a4a 0%, #050a0d 100%)'
        }}>
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ maxWidth: '500px' }}
            >
                <h1 style={{ fontSize: '6rem', margin: 0, color: 'var(--accent-orange)' }}>404</h1>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Oops! Page Not Found</h2>
                <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link to="/" className="btn-orange" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    Return to Home
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
