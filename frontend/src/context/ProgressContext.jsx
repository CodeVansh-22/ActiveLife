import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export const useProgress = () => {
    return useContext(ProgressContext);
};

export const ProgressProvider = ({ children }) => {
    const { user } = useAuth();
    // Initial state matching the exact user structure request
    const initialState = {
        planStartDate: new Date().toISOString(),
        completedExercises: {
            day1: [],
        },
        completedDays: [],
        currentDay: 1,
        streak: 0,
        xp: 0,
        longestStreak: 0,
        history: []
    };

    const [progressData, setProgressData] = useState(() => {
        const saved = localStorage.getItem('progressData');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return initialState;
            }
        }
        return initialState;
    });

    // Sync with Backend only when User is Authenticated
    useEffect(() => {
        if (!user) return;

        const syncWithBackend = async () => {
            try {
                console.log("Checking progress sync with backend...");
                const res = await api.get('/progress/');
                const backendData = res.data;
                const backendCompletedDays = backendData.completed_days || [];
                
                // Read fresh from localStorage to avoid closure issues with state
                const saved = localStorage.getItem('progressData');
                const localData = saved ? JSON.parse(saved) : null;
                
                if (!localData) {
                    updateStateFromBackend(backendData);
                    return;
                }

                // 1. Detect if local storage is ahead of backend
                const missingOnBackend = (localData.completedDays || []).filter(
                    d => !backendCompletedDays.includes(d)
                ).sort((a, b) => a - b);

                if (missingOnBackend.length > 0) {
                    console.log("Catching up backend with missing days:", missingOnBackend);
                    for (const dayNum of missingOnBackend) {
                        try {
                            await api.post('/progress/complete-day', { 
                                day_num: dayNum,
                                calories: 400 
                            });
                        } catch (syncErr) {
                            console.error(`Failed to sync day ${dayNum}:`, syncErr.response?.data || syncErr.message);
                            break; 
                        }
                    }
                    const refreshedRes = await api.get('/progress/');
                    updateStateFromBackend(refreshedRes.data);
                } else {
                    updateStateFromBackend(backendData);
                }
            } catch (err) {
                console.warn("Could not sync with backend progress.", err);
            }
        };

        const updateStateFromBackend = (data) => {
            const backendCompletedDays = (data.completed_days || []).map(d => 
                typeof d === 'object' ? d.day : d
            );
            
            setProgressData(prev => ({
                ...prev,
                streak: data.streak || 0,
                completedDays: backendCompletedDays,
                completedExercises: data.completed_exercises || {},
                history: data.history || [],
                currentDay: data.unlocked_day || 1
            }));
            console.log("Sync complete. Current unlocked day:", data.unlocked_day);
        };

        syncWithBackend();
    }, [user]);

    useEffect(() => {
        localStorage.setItem('progressData', JSON.stringify(progressData));
    }, [progressData]);

    const markExerciseComplete = async (dayKey, exerciseId, totalExercisesInDay) => {
        const dayNum = parseInt(dayKey.replace('day', ''));
        
        // Find if this specific marking will complete the day
        const currentCompletedInDay = progressData.completedExercises[dayKey] || [];
        const willCompleteDay = !currentCompletedInDay.includes(exerciseId) && 
                               (currentCompletedInDay.length + 1 === totalExercisesInDay);

        // Update local state first for responsiveness
        setProgressData(prev => {
            const currentCompleted = prev.completedExercises[dayKey] || [];
            if (currentCompleted.includes(exerciseId)) return prev;

            const newCompletedExercises = [...currentCompleted, exerciseId];
            let newXp = prev.xp + 10;
            let newCompletedDays = [...prev.completedDays];
            let newStreak = prev.streak;
            let newHistory = [...prev.history];
            let newCurrentDay = prev.currentDay;

            if (willCompleteDay) {
                if (!newCompletedDays.includes(dayNum)) {
                    newCompletedDays.push(dayNum);
                    newXp += 50;
                    newStreak += 1;
                    newCurrentDay = Math.max(newCurrentDay, dayNum + 1);
                    newHistory.push({
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        xpEarned: 60 + ((totalExercisesInDay - 1) * 10),
                        day: dayNum
                    });
                }
            }

            return {
                ...prev,
                completedExercises: { ...prev.completedExercises, [dayKey]: newCompletedExercises },
                completedDays: newCompletedDays,
                streak: newStreak,
                xp: newXp,
                history: newHistory,
                currentDay: newCurrentDay
            };
        });

        // Always sync the individual exercise completion
        try {
            await api.post('/progress/complete-exercise', {
                day_num: dayNum,
                exercise_id: exerciseId
            });
            console.log(`Exercise ${exerciseId} synced.`);
        } catch (err) {
            console.error("Failed to sync exercise completion:", err);
        }

        // If day completed, sync the day milestone
        if (willCompleteDay) {
            try {
                await api.post('/progress/complete-day', { 
                    day_num: dayNum,
                    calories: 300 + (Math.random() * 200) 
                });
                console.log("Day completion synced to backend.");
            } catch (err) {
                console.error("Failed to sync day completion to backend:", err);
            }
        }
    };

    const resetProgress = async () => {
        const fresh = {
            ...initialState,
            planStartDate: new Date().toISOString(),
        };
        setProgressData(fresh);
        localStorage.setItem('progressData', JSON.stringify(fresh));

        try {
            await api.post('/progress/start', { duration: 30 });
        } catch (err) {
            console.error("Failed to reset progress on backend:", err);
        }
    };

    const getCompletionPercentage = (totalDays = 7) => {
        if (!progressData.completedDays.length) return 0;
        return Math.min(Math.round((progressData.completedDays.length / totalDays) * 100), 100);
    };

    return (
        <ProgressContext.Provider value={{ progressData, markExerciseComplete, getCompletionPercentage, resetProgress }}>
            {children}
        </ProgressContext.Provider>
    );
};
