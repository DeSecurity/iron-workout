import { useState, useEffect, useCallback } from 'react';
import { WorkoutTrackerData, Profile, Exercise, WorkoutTemplate, WorkoutSession } from '@/types/workout';
import { generateDefaultExercises } from '@/data/defaultExercises';
import { generateDefaultTemplates } from '@/data/defaultTemplates';

const STORAGE_KEY = 'workoutTrackerData';
const CURRENT_VERSION = 1;

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultProfile(): Profile {
  const exercises = generateDefaultExercises();
  const templates = generateDefaultTemplates(exercises);
  
  return {
    id: generateId(),
    name: 'Default Profile',
    createdAt: new Date().toISOString(),
    exercises,
    templates,
    sessions: [],
  };
}

function getInitialData(): WorkoutTrackerData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as WorkoutTrackerData;
      if (data.profiles && data.profiles.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }

  const defaultProfile = createDefaultProfile();
  return {
    profiles: [defaultProfile],
    activeProfileId: defaultProfile.id,
    version: CURRENT_VERSION,
  };
}

function saveToStorage(data: WorkoutTrackerData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function useWorkoutStorage() {
  const [data, setData] = useState<WorkoutTrackerData>(getInitialData);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  const activeProfile = data.profiles.find(p => p.id === data.activeProfileId) || data.profiles[0];

  // Profile operations
  const createProfile = useCallback((name: string) => {
    const exercises = generateDefaultExercises();
    const templates = generateDefaultTemplates(exercises);
    
    const newProfile: Profile = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      exercises,
      templates,
      sessions: [],
    };

    setData(prev => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      activeProfileId: newProfile.id,
    }));

    return newProfile;
  }, []);

  const deleteProfile = useCallback((profileId: string) => {
    setData(prev => {
      const remainingProfiles = prev.profiles.filter(p => p.id !== profileId);
      if (remainingProfiles.length === 0) {
        const defaultProfile = createDefaultProfile();
        return {
          ...prev,
          profiles: [defaultProfile],
          activeProfileId: defaultProfile.id,
        };
      }
      return {
        ...prev,
        profiles: remainingProfiles,
        activeProfileId: prev.activeProfileId === profileId 
          ? remainingProfiles[0].id 
          : prev.activeProfileId,
      };
    });
  }, []);

  const renameProfile = useCallback((profileId: string, newName: string) => {
    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === profileId ? { ...p, name: newName } : p
      ),
    }));
  }, []);

  const switchProfile = useCallback((profileId: string) => {
    setData(prev => ({
      ...prev,
      activeProfileId: profileId,
    }));
  }, []);

  // Exercise operations
  const addExercise = useCallback((exercise: Omit<Exercise, 'id' | 'isCustom'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: generateId(),
      isCustom: true,
    };

    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === prev.activeProfileId
          ? { ...p, exercises: [...p.exercises, newExercise] }
          : p
      ),
    }));

    return newExercise;
  }, []);

  const updateExercise = useCallback((exerciseId: string, updates: Partial<Exercise>) => {
    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === prev.activeProfileId
          ? {
              ...p,
              exercises: p.exercises.map(e =>
                e.id === exerciseId ? { ...e, ...updates } : e
              ),
            }
          : p
      ),
    }));
  }, []);

  const deleteExercise = useCallback((exerciseId: string) => {
    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === prev.activeProfileId
          ? { ...p, exercises: p.exercises.filter(e => e.id !== exerciseId) }
          : p
      ),
    }));
  }, []);

  // Template operations
  const createTemplate = useCallback((template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTemplate: WorkoutTemplate = {
      ...template,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === prev.activeProfileId
          ? { ...p, templates: [...p.templates, newTemplate] }
          : p
      ),
    }));

    return newTemplate;
  }, []);

  const updateTemplate = useCallback((templateId: string, updates: Partial<WorkoutTemplate>) => {
    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === prev.activeProfileId
          ? {
              ...p,
              templates: p.templates.map(t =>
                t.id === templateId 
                  ? { ...t, ...updates, updatedAt: new Date().toISOString() } 
                  : t
              ),
            }
          : p
      ),
    }));
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === prev.activeProfileId
          ? { ...p, templates: p.templates.filter(t => t.id !== templateId) }
          : p
      ),
    }));
  }, []);

  // Session operations
  const saveSession = useCallback((session: Omit<WorkoutSession, 'id' | 'profileId'>) => {
    const newSession: WorkoutSession = {
      ...session,
      id: generateId(),
      profileId: data.activeProfileId || '',
    };

    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === prev.activeProfileId
          ? { ...p, sessions: [newSession, ...p.sessions] }
          : p
      ),
    }));

    return newSession;
  }, [data.activeProfileId]);

  const deleteSession = useCallback((sessionId: string) => {
    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === prev.activeProfileId
          ? { ...p, sessions: p.sessions.filter(s => s.id !== sessionId) }
          : p
      ),
    }));
  }, []);

  // Stats helper
  const getLastExerciseStats = useCallback((exerciseId: string) => {
    if (!activeProfile) return null;

    for (const session of activeProfile.sessions) {
      const exerciseLog = session.exercises.find(e => e.exerciseId === exerciseId);
      if (exerciseLog && exerciseLog.sets.some(s => s.completed)) {
        return {
          date: session.date,
          sets: exerciseLog.sets.filter(s => s.completed),
        };
      }
    }
    return null;
  }, [activeProfile]);

  const getExerciseHistory = useCallback((exerciseId: string) => {
    if (!activeProfile) return [];

    return activeProfile.sessions
      .filter(session => session.exercises.some(e => e.exerciseId === exerciseId))
      .map(session => ({
        date: session.date,
        exerciseLog: session.exercises.find(e => e.exerciseId === exerciseId)!,
      }))
      .filter(entry => entry.exerciseLog.sets.some(s => s.completed));
  }, [activeProfile]);

  return {
    data,
    profiles: data.profiles,
    activeProfile,
    
    // Profile operations
    createProfile,
    deleteProfile,
    renameProfile,
    switchProfile,

    // Exercise operations
    addExercise,
    updateExercise,
    deleteExercise,

    // Template operations
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Session operations
    saveSession,
    deleteSession,

    // Stats
    getLastExerciseStats,
    getExerciseHistory,
  };
}
