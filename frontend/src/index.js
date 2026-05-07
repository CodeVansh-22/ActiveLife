import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client'; // Notice standard React 18 syntax
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

import { ProgressProvider } from './context/ProgressContext';

// Import all external stylesheets
import './styles/globals.css';
import './styles/glassmorphism.css';
import './styles/layout.css';

// Premium Loading Fallback for root level
const RootLoading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'var(--bg-gradient)',
    color: 'var(--accent-orange)'
  }}>
    <div className="spinner" style={{
      width: '50px',
      height: '50px',
      border: '5px solid rgba(255,255,255,0.1)',
      borderTopColor: 'var(--accent-orange)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<RootLoading />}>
        <AuthProvider>
          <ProgressProvider>
            <App />
          </ProgressProvider>
        </AuthProvider>
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);