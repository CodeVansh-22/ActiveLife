import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import PageTransition from './components/PageTransition';

// Lazy load all page components for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const BMIPage = lazy(() => import('./pages/BMIPage'));
const AIFitnessPlanPage = lazy(() => import('./pages/AIFitnessPlanPage'));
const DietPlanPage = lazy(() => import('./pages/DietPlanPage'));
const WorkoutPlanPage = lazy(() => import('./pages/WorkoutPlanPage'));
const MyWorkout = lazy(() => import('./pages/MyWorkout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const LearnCompete = lazy(() => import('./pages/LearnCompete'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Premium Loading Fallback
const LoadingFallback = () => (
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
    }}></div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

          {/* Protected Member Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
          <Route path="/bmi" element={<ProtectedRoute><PageTransition><BMIPage /></PageTransition></ProtectedRoute>} />
          <Route path="/diet-plan" element={<ProtectedRoute><PageTransition><DietPlanPage /></PageTransition></ProtectedRoute>} />
          <Route path="/workout-plan" element={<ProtectedRoute><PageTransition><WorkoutPlanPage /></PageTransition></ProtectedRoute>} />
          <Route path="/ai-plans" element={<ProtectedRoute><PageTransition><AIFitnessPlanPage /></PageTransition></ProtectedRoute>} />
          <Route path="/learn-compete" element={<ProtectedRoute><PageTransition><LearnCompete /></PageTransition></ProtectedRoute>} />
          <Route path="/my-workout" element={<ProtectedRoute><PageTransition><MyWorkout /></PageTransition></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><PageTransition><ProgressPage /></PageTransition></ProtectedRoute>} />

          {/* Protected Admin Route */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />

          {/* 404 Catch-all Route */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="container">
        <Navbar />
        <AnimatedRoutes />
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;