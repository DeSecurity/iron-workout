import { useState, useEffect, useCallback, useRef } from "react";
import { WorkoutTrackerData, Profile, Exercise, WorkoutTemplate, WorkoutSession } from "@/types/workout";
import { generateDefaultExercises } from "@/data/defaultExercises";
import { generateDefaultTemplates } from "@/data/defaultTemplates";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CURRENT_VERSION = 1;

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultProfile(): Profile {
  const exercises = generateDefaultExercises();
  const templates = generateDefaultTemplates(exercises);
  return {
    id: generateId(),
    name: "Default Profile",
    createdAt: new Date().toISOString(),
    exercises,
    templates,
    sessions: [],
  };
}

function createDefaultData(): WorkoutTrackerData {
  const p = createDefaultProfile();
  return { profiles: [p], activeProfileId: p.id, version: CURRENT_VERSION };
}

export function useWorkoutStorage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<WorkoutTrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadRef = useRef(true);

  // Load data from cloud when user is available
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    isInitialLoadRef.current = true;
    setLoading(true);

    (async () => {
      const { data: row, error } = await supabase
        .from("workout_data")
        .select("data")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Failed to load workout data:", error);
        setData(createDefaultData());
        setLoading(false);
        return;
      }

      const stored = row?.data as unknown as WorkoutTrackerData | null;
      if (stored && stored.profiles?.length) {
        setData(stored);
      } else {
        const fresh = createDefaultData();
        setData(fresh);
        await supabase.from("workout_data").upsert({ user_id: user.id, data: fresh as never });
      }
      setLoading(false);
      // Allow saves on next tick
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 0);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  // Debounced save to cloud
  useEffect(() => {
    if (!user || !data || isInitialLoadRef.current) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from("workout_data")
        .upsert({ user_id: user.id, data: data as never });
      if (error) console.error("Failed to save workout data:", error);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, user]);

  const activeProfile = data?.profiles.find((p) => p.id === data.activeProfileId) || data?.profiles[0];

  // ---- Profile operations ----
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
    setData((prev) =>
      prev
        ? { ...prev, profiles: [...prev.profiles, newProfile], activeProfileId: newProfile.id }
        : prev
    );
    return newProfile;
  }, []);

  const deleteProfile = useCallback((profileId: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const remaining = prev.profiles.filter((p) => p.id !== profileId);
      if (remaining.length === 0) {
        const def = createDefaultProfile();
        return { ...prev, profiles: [def], activeProfileId: def.id };
      }
      return {
        ...prev,
        profiles: remaining,
        activeProfileId: prev.activeProfileId === profileId ? remaining[0].id : prev.activeProfileId,
      };
    });
  }, []);

  const renameProfile = useCallback((profileId: string, newName: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            profiles: prev.profiles.map((p) => (p.id === profileId ? { ...p, name: newName } : p)),
          }
        : prev
    );
  }, []);

  const switchProfile = useCallback((profileId: string) => {
    setData((prev) => (prev ? { ...prev, activeProfileId: profileId } : prev));
  }, []);

  // ---- Exercise operations ----
  const addExercise = useCallback((exercise: Omit<Exercise, "id" | "isCustom">) => {
    const newExercise: Exercise = { ...exercise, id: generateId(), isCustom: true };
    setData((prev) =>
      prev
        ? {
            ...prev,
            profiles: prev.profiles.map((p) =>
              p.id === prev.activeProfileId ? { ...p, exercises: [...p.exercises, newExercise] } : p
            ),
          }
        : prev
    );
    return newExercise;
  }, []);

  const updateExercise = useCallback((exerciseId: string, updates: Partial<Exercise>) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            profiles: prev.profiles.map((p) =>
              p.id === prev.activeProfileId
                ? { ...p, exercises: p.exercises.map((e) => (e.id === exerciseId ? { ...e, ...updates } : e)) }
                : p
            ),
          }
        : prev
    );
  }, []);

  const deleteExercise = useCallback((exerciseId: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            profiles: prev.profiles.map((p) =>
              p.id === prev.activeProfileId ? { ...p, exercises: p.exercises.filter((e) => e.id !== exerciseId) } : p
            ),
          }
        : prev
    );
  }, []);

  // ---- Template operations ----
  const createTemplate = useCallback((template: Omit<WorkoutTemplate, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newTemplate: WorkoutTemplate = { ...template, id: generateId(), createdAt: now, updatedAt: now };
    setData((prev) =>
      prev
        ? {
            ...prev,
            profiles: prev.profiles.map((p) =>
              p.id === prev.activeProfileId ? { ...p, templates: [...p.templates, newTemplate] } : p
            ),
          }
        : prev
    );
    return newTemplate;
  }, []);

  const updateTemplate = useCallback((templateId: string, updates: Partial<WorkoutTemplate>) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            profiles: prev.profiles.map((p) =>
              p.id === prev.activeProfileId
                ? {
                    ...p,
                    templates: p.templates.map((t) =>
                      t.id === templateId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
                    ),
                  }
                : p
            ),
          }
        : prev
    );
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            profiles: prev.profiles.map((p) =>
              p.id === prev.activeProfileId ? { ...p, templates: p.templates.filter((t) => t.id !== templateId) } : p
            ),
          }
        : prev
    );
  }, []);

  // ---- Session operations ----
  const saveSession = useCallback(
    (session: Omit<WorkoutSession, "id" | "profileId">) => {
      const newSession: WorkoutSession = {
        ...session,
        id: generateId(),
        profileId: data?.activeProfileId || "",
      };
      setData((prev) =>
        prev
          ? {
              ...prev,
              profiles: prev.profiles.map((p) =>
                p.id === prev.activeProfileId ? { ...p, sessions: [newSession, ...p.sessions] } : p
              ),
            }
          : prev
      );
      return newSession;
    },
    [data?.activeProfileId]
  );

  const deleteSession = useCallback((sessionId: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            profiles: prev.profiles.map((p) =>
              p.id === prev.activeProfileId ? { ...p, sessions: p.sessions.filter((s) => s.id !== sessionId) } : p
            ),
          }
        : prev
    );
  }, []);

  // ---- Import / Export ----
  const exportData = useCallback(() => {
    if (!data) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      app: "Iron-Workout",
      version: CURRENT_VERSION,
      data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iron-workout-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback(async (file: File, mode: "replace" | "merge" = "replace") => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    // Accept either the wrapped payload or raw WorkoutTrackerData
    const incoming: WorkoutTrackerData = parsed?.data?.profiles ? parsed.data : parsed;
    if (!incoming || !Array.isArray(incoming.profiles) || incoming.profiles.length === 0) {
      throw new Error("Invalid backup file: no profiles found");
    }
    setData((prev) => {
      if (mode === "replace" || !prev) {
        return {
          profiles: incoming.profiles,
          activeProfileId: incoming.activeProfileId || incoming.profiles[0].id,
          version: CURRENT_VERSION,
        };
      }
      // merge: append profiles with new ids to avoid collisions
      const existingIds = new Set(prev.profiles.map((p) => p.id));
      const merged = incoming.profiles.map((p) =>
        existingIds.has(p.id) ? { ...p, id: generateId(), name: `${p.name} (imported)` } : p
      );
      return { ...prev, profiles: [...prev.profiles, ...merged] };
    });
  }, []);

  // ---- Stats helpers ----
  const getLastExerciseStats = useCallback(
    (exerciseId: string) => {
      if (!activeProfile) return null;
      for (const session of activeProfile.sessions) {
        const log = session.exercises.find((e) => e.exerciseId === exerciseId);
        if (log && log.sets.some((s) => s.completed)) {
          return { date: session.date, sets: log.sets.filter((s) => s.completed) };
        }
      }
      return null;
    },
    [activeProfile]
  );

  const getExerciseHistory = useCallback(
    (exerciseId: string) => {
      if (!activeProfile) return [];
      return activeProfile.sessions
        .filter((s) => s.exercises.some((e) => e.exerciseId === exerciseId))
        .map((s) => ({ date: s.date, exerciseLog: s.exercises.find((e) => e.exerciseId === exerciseId)! }))
        .filter((entry) => entry.exerciseLog.sets.some((s) => s.completed));
    },
    [activeProfile]
  );

  return {
    data,
    loading,
    profiles: data?.profiles ?? [],
    activeProfile,

    // Profile ops
    createProfile,
    deleteProfile,
    renameProfile,
    switchProfile,

    // Exercise ops
    addExercise,
    updateExercise,
    deleteExercise,

    // Template ops
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Session ops
    saveSession,
    deleteSession,

    // Stats
    getLastExerciseStats,
    getExerciseHistory,
  };
}
