import { WorkoutTemplate } from '@/types/workout';

export function generateDefaultTemplates(exercises: { id: string; name: string }[]): WorkoutTemplate[] {
  const findExercise = (name: string) => exercises.find(e => e.name === name);
  
  const now = new Date().toISOString();

  const pushDay: WorkoutTemplate = {
    id: 'template_push',
    name: 'Push Day',
    restBetweenExercises: 120,
    createdAt: now,
    updatedAt: now,
    exercises: [
      {
        exerciseId: findExercise('Barbell Bench Press')?.id || '',
        defaultSets: 4,
        defaultReps: 8,
        defaultWeight: 135,
        restBetweenSets: 90,
      },
      {
        exerciseId: findExercise('Incline Dumbbell Press')?.id || '',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 50,
        restBetweenSets: 90,
      },
      {
        exerciseId: findExercise('Overhead Press')?.id || '',
        defaultSets: 4,
        defaultReps: 8,
        defaultWeight: 95,
        restBetweenSets: 90,
      },
      {
        exerciseId: findExercise('Lateral Raise')?.id || '',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 20,
        restBetweenSets: 60,
      },
      {
        exerciseId: findExercise('Tricep Pushdown')?.id || '',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 50,
        restBetweenSets: 60,
      },
    ].filter(e => e.exerciseId),
  };

  const pullDay: WorkoutTemplate = {
    id: 'template_pull',
    name: 'Pull Day',
    restBetweenExercises: 120,
    createdAt: now,
    updatedAt: now,
    exercises: [
      {
        exerciseId: findExercise('Deadlift')?.id || '',
        defaultSets: 4,
        defaultReps: 5,
        defaultWeight: 225,
        restBetweenSets: 180,
      },
      {
        exerciseId: findExercise('Barbell Row')?.id || '',
        defaultSets: 4,
        defaultReps: 8,
        defaultWeight: 135,
        restBetweenSets: 90,
      },
      {
        exerciseId: findExercise('Lat Pulldown')?.id || '',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 120,
        restBetweenSets: 90,
      },
      {
        exerciseId: findExercise('Face Pull')?.id || '',
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 40,
        restBetweenSets: 60,
      },
      {
        exerciseId: findExercise('Barbell Curl')?.id || '',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 65,
        restBetweenSets: 60,
      },
    ].filter(e => e.exerciseId),
  };

  const legDay: WorkoutTemplate = {
    id: 'template_legs',
    name: 'Leg Day',
    restBetweenExercises: 120,
    createdAt: now,
    updatedAt: now,
    exercises: [
      {
        exerciseId: findExercise('Barbell Squat')?.id || '',
        defaultSets: 4,
        defaultReps: 6,
        defaultWeight: 185,
        restBetweenSets: 180,
      },
      {
        exerciseId: findExercise('Romanian Deadlift')?.id || '',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 135,
        restBetweenSets: 90,
      },
      {
        exerciseId: findExercise('Leg Press')?.id || '',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 270,
        restBetweenSets: 90,
      },
      {
        exerciseId: findExercise('Leg Curl')?.id || '',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 80,
        restBetweenSets: 60,
      },
      {
        exerciseId: findExercise('Calf Raises')?.id || '',
        defaultSets: 4,
        defaultReps: 15,
        defaultWeight: 100,
        restBetweenSets: 45,
      },
    ].filter(e => e.exerciseId),
  };

  return [pushDay, pullDay, legDay];
}
