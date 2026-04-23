// Exercise types
export type ExerciseType = 'weight_reps' | 'time' | 'bodyweight_reps';

export type ExerciseCategory = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'arms' 
  | 'legs' 
  | 'core' 
  | 'cardio' 
  | 'full_body';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  type: ExerciseType;
  isCustom?: boolean;
}

// Template types
export interface TemplateExercise {
  exerciseId: string;
  defaultSets: number;
  defaultReps?: number;
  defaultWeight?: number;
  defaultTimeSeconds?: number;
  restBetweenSets: number; // seconds
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  restBetweenExercises: number; // seconds
  createdAt: string;
  updatedAt: string;
}

// Session types
export interface SetLog {
  setNumber: number;
  weightLbs?: number | null;
  reps?: number | null;
  timeSeconds?: number | null;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  type: ExerciseType;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  profileId: string;
  templateId?: string | null;
  templateName?: string;
  date: string;
  startTime: string;
  endTime?: string;
  exercises: ExerciseLog[];
  completed: boolean;
}

// Profile types
export interface Profile {
  id: string;
  name: string;
  createdAt: string;
  exercises: Exercise[];
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
}

// App state
export interface WorkoutTrackerData {
  profiles: Profile[];
  activeProfileId: string | null;
  version: number;
}

// Timer state
export interface TimerState {
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  exerciseId?: string;
  setNumber?: number;
}
