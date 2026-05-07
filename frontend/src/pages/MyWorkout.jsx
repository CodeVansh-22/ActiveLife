import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useProgress } from '../context/ProgressContext';
import DayCard from '../components/DayCard';
import bgImage from '../assets/aiBG.webp';

/**
 * Normalises a raw plan day number from the stored plan.
 * "Day 1" -> 1, or already a number -> as-is.
 */
const getDayNumber = (dayValue) => {
    if (typeof dayValue === 'number') return dayValue;
    const match = String(dayValue).match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

const MyWorkout = () => {
    const { progressData, markExerciseComplete } = useProgress();

    const [workoutPlan, setWorkoutPlan] = useState(null); // null = not loaded yet
    const [loading, setLoading]         = useState(true);
    const [selectedWeek, setSelectedWeek] = useState(1);

    // Update selected week if progress changes (to auto-advance)
    useEffect(() => {
        if (!workoutPlan) return;
        const totalWeeks = Math.ceil((workoutPlan.plan || []).length / 7);
        const newWeek = Math.ceil(progressData.currentDay / 7);
        if (newWeek > selectedWeek && newWeek <= totalWeeks) {
            setSelectedWeek(newWeek);
        }
    }, [progressData.currentDay, workoutPlan, selectedWeek]);

    useEffect(() => {
        const loadPlan = async () => {
            setLoading(true);

            // 1. Try fetching from backend (source of truth)
            try {
                const res = await api.get('/ai/my-workout-plan');
                if (res.data.plan && res.data.plan.plan && res.data.plan.plan.length > 0) {
                    setWorkoutPlan(res.data.plan);
                    // Keep localStorage in sync with what the backend has
                    localStorage.setItem('workoutPlan', JSON.stringify(res.data.plan));
                    setLoading(false);
                    return;
                }
            } catch (apiErr) {
                console.warn('API fetch failed, falling back to localStorage:', apiErr.message);
            }

            // 2. Fallback: localStorage (works offline / if API is down)
            try {
                const cached = localStorage.getItem('workoutPlan');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.plan && parsed.plan.length > 0) {
                        setWorkoutPlan(parsed);
                        setLoading(false);
                        return;
                    }
                }
            } catch (parseErr) {
                console.error('Failed to parse cached workout plan:', parseErr);
            }

            // 3. No plan found anywhere
            setWorkoutPlan(null);
            setLoading(false);
        };

        loadPlan();
    }, []);

    // ─── Render States ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="animate-fade-in execution-page" style={{ paddingBottom: '100px', minHeight: '100vh' }}>
                <div className="page-bg-image" style={{ backgroundImage: `url(${bgImage})` }} />
                <div className="container mt-2" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="dashboard-header">
                        <h1 className="text-orange dashboard-title">Active Execution</h1>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <p style={{ fontSize: '1.1rem', opacity: 0.7 }}>Loading your workout plan...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!workoutPlan) {
        return (
            <div className="animate-fade-in execution-page" style={{ paddingBottom: '100px', minHeight: '100vh' }}>
                <div className="page-bg-image" style={{ backgroundImage: `url(${bgImage})` }} />
                <div className="container mt-2" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="dashboard-header">
                        <h1 className="text-orange dashboard-title">Active Execution</h1>
                        <p className="dashboard-subtitle">
                            Execute your daily plan. Complete all exercises to finish a day. (+10 XP per exercise)
                        </p>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                        <h3 className="text-orange mb-1">No Workout Plan Yet</h3>
                        <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
                            Generate a workout plan first using the AI Workout Generator.
                        </p>
                        <a
                            href="/workout-plan"
                            className="btn-orange"
                            style={{ display: 'inline-block', padding: '0.75rem 2rem', textDecoration: 'none' }}
                        >
                            Generate a Plan →
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Main Render ───────────────────────────────────────────────────────────
    const days = workoutPlan.plan || [];
    const totalWeeks = Math.max(Math.ceil(days.length / 7), Math.ceil(progressData.currentDay / 7));

    // Progress stats
    const totalExercises = days.reduce((sum, d) => sum + (d.exercises || []).length, 0);
    const doneExercises  = Object.values(progressData.completedExercises).flat().length;
    const progressPct    = totalExercises > 0 ? Math.round((doneExercises / totalExercises) * 100) : 0;

    // Filter days for the selected week
    const filteredDays = days.filter(d => {
        const dNum = getDayNumber(d.day);
        return Math.ceil(dNum / 7) === selectedWeek;
    });

    return (
        <div className="animate-fade-in execution-page" style={{ paddingBottom: '100px', minHeight: '100vh' }}>
            <div className="page-bg-image" style={{ backgroundImage: `url(${bgImage})` }} />

            <div className="container mt-2" style={{ position: 'relative', zIndex: 10 }}>
                <div className="dashboard-header">
                    <h1 className="text-orange dashboard-title">Active Execution</h1>
                    <p className="dashboard-subtitle">
                        Execute your daily plan. Complete all exercises to finish a day. (+10 XP per exercise)
                    </p>
                </div>

                {/* Progress Summary Bar */}
                <div className="glass-card mb-2" style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            Overall Progress — {doneExercises}/{totalExercises} exercises
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{progressPct}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                        <div
                            style={{
                                width: `${progressPct}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--accent-orange), #f7b733)',
                                borderRadius: '999px',
                                transition: 'width 0.4s ease',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.85rem', opacity: 0.75 }}>
                        <span>🔥 Streak: {progressData.streak} days</span>
                        <span>⚡ XP: {progressData.xp}</span>
                        <span>📅 Day {progressData.currentDay} of {days.length}</span>
                    </div>
                </div>

                {/* Week Selector */}
                <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    marginBottom: '1.5rem', 
                    overflowX: 'auto', 
                    paddingBottom: '0.5rem',
                    scrollbarWidth: 'none'
                }}>
                    {Array.from({ length: totalWeeks }).map((_, i) => {
                        const wNum = i + 1;
                        const isActive = selectedWeek === wNum;
                        const isUnlocked = progressData.currentDay >= (wNum - 1) * 7 + 1;
                        
                        return (
                            <button
                                key={wNum}
                                onClick={() => setSelectedWeek(wNum)}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '12px',
                                    border: `1px solid ${isActive ? 'var(--accent-orange)' : 'rgba(255,255,255,0.1)'}`,
                                    background: isActive ? 'rgba(244,122,32,0.15)' : 'rgba(255,255,255,0.05)',
                                    color: isActive ? 'var(--accent-orange)' : isUnlocked ? 'white' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontWeight: isActive ? 700 : 400,
                                    transition: 'all 0.2s ease',
                                    opacity: isUnlocked ? 1 : 0.6
                                }}
                            >
                                Week {wNum} {isActive ? '🎯' : !isUnlocked ? '🔒' : ''}
                            </button>
                        );
                    })}
                </div>

                {/* Day Cards — filtered by week */}
                <div className="workout-timeline flex-col gap-1">
                    {filteredDays.length > 0 ? (
                        filteredDays.map((dayPlan) => {
                            const dayNum              = getDayNumber(dayPlan.day);
                            const dayKey              = `day${dayNum}`;
                            const completedExerciseIds = progressData.completedExercises[dayKey] || [];
                            const isDayCompleted       = progressData.completedDays.includes(dayNum);
                            const isLocked             = dayNum > progressData.currentDay;

                            return (
                                <DayCard
                                    key={dayNum}
                                    day={dayNum}
                                    exercises={dayPlan.exercises || []}
                                    completedExerciseIds={completedExerciseIds}
                                    isLocked={isLocked}
                                    isCompleted={isDayCompleted}
                                    onMarkComplete={markExerciseComplete}
                                />
                            );
                        })
                    ) : (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ opacity: 0.6 }}>No days found for this week.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyWorkout;
