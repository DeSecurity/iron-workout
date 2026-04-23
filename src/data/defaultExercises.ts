import { Exercise, ExerciseCategory, ExerciseType } from '@/types/workout';

interface ExerciseDefinition {
  name: string;
  category: ExerciseCategory;
  type: ExerciseType;
}

const exerciseDefinitions: ExerciseDefinition[] = [
  // Chest
  { name: 'Barbell Bench Press', category: 'chest', type: 'weight_reps' },
  { name: 'Incline Barbell Bench Press', category: 'chest', type: 'weight_reps' },
  { name: 'Decline Barbell Bench Press', category: 'chest', type: 'weight_reps' },
  { name: 'Dumbbell Bench Press', category: 'chest', type: 'weight_reps' },
  { name: 'Incline Dumbbell Press', category: 'chest', type: 'weight_reps' },
  { name: 'Dumbbell Fly', category: 'chest', type: 'weight_reps' },
  { name: 'Cable Crossover', category: 'chest', type: 'weight_reps' },
  { name: 'Push Ups', category: 'chest', type: 'bodyweight_reps' },
  { name: 'Chest Dips', category: 'chest', type: 'bodyweight_reps' },
  { name: 'Machine Chest Press', category: 'chest', type: 'weight_reps' },
  { name: 'Pec Deck Machine', category: 'chest', type: 'weight_reps' },

  // Back
  { name: 'Pull Ups', category: 'back', type: 'bodyweight_reps' },
  { name: 'Chin Ups', category: 'back', type: 'bodyweight_reps' },
  { name: 'Lat Pulldown', category: 'back', type: 'weight_reps' },
  { name: 'Barbell Row', category: 'back', type: 'weight_reps' },
  { name: 'Dumbbell Row', category: 'back', type: 'weight_reps' },
  { name: 'Cable Row', category: 'back', type: 'weight_reps' },
  { name: 'T-Bar Row', category: 'back', type: 'weight_reps' },
  { name: 'Deadlift', category: 'back', type: 'weight_reps' },
  { name: 'Rack Pull', category: 'back', type: 'weight_reps' },
  { name: 'Face Pull', category: 'back', type: 'weight_reps' },
  { name: 'Straight Arm Pulldown', category: 'back', type: 'weight_reps' },
  { name: 'Inverted Row', category: 'back', type: 'bodyweight_reps' },

  // Shoulders
  { name: 'Overhead Press', category: 'shoulders', type: 'weight_reps' },
  { name: 'Seated Dumbbell Press', category: 'shoulders', type: 'weight_reps' },
  { name: 'Arnold Press', category: 'shoulders', type: 'weight_reps' },
  { name: 'Lateral Raise', category: 'shoulders', type: 'weight_reps' },
  { name: 'Front Raise', category: 'shoulders', type: 'weight_reps' },
  { name: 'Rear Delt Fly', category: 'shoulders', type: 'weight_reps' },
  { name: 'Upright Row', category: 'shoulders', type: 'weight_reps' },
  { name: 'Shrugs', category: 'shoulders', type: 'weight_reps' },
  { name: 'Cable Lateral Raise', category: 'shoulders', type: 'weight_reps' },
  { name: 'Machine Shoulder Press', category: 'shoulders', type: 'weight_reps' },

  // Arms
  { name: 'Barbell Curl', category: 'arms', type: 'weight_reps' },
  { name: 'Dumbbell Curl', category: 'arms', type: 'weight_reps' },
  { name: 'Hammer Curl', category: 'arms', type: 'weight_reps' },
  { name: 'Preacher Curl', category: 'arms', type: 'weight_reps' },
  { name: 'Concentration Curl', category: 'arms', type: 'weight_reps' },
  { name: 'Cable Curl', category: 'arms', type: 'weight_reps' },
  { name: 'Tricep Pushdown', category: 'arms', type: 'weight_reps' },
  { name: 'Tricep Rope Pushdown', category: 'arms', type: 'weight_reps' },
  { name: 'Skull Crushers', category: 'arms', type: 'weight_reps' },
  { name: 'Overhead Tricep Extension', category: 'arms', type: 'weight_reps' },
  { name: 'Close Grip Bench Press', category: 'arms', type: 'weight_reps' },
  { name: 'Tricep Dips', category: 'arms', type: 'bodyweight_reps' },
  { name: 'Diamond Push Ups', category: 'arms', type: 'bodyweight_reps' },
  { name: 'Wrist Curls', category: 'arms', type: 'weight_reps' },

  // Legs
  { name: 'Barbell Squat', category: 'legs', type: 'weight_reps' },
  { name: 'Front Squat', category: 'legs', type: 'weight_reps' },
  { name: 'Goblet Squat', category: 'legs', type: 'weight_reps' },
  { name: 'Leg Press', category: 'legs', type: 'weight_reps' },
  { name: 'Hack Squat', category: 'legs', type: 'weight_reps' },
  { name: 'Bulgarian Split Squat', category: 'legs', type: 'weight_reps' },
  { name: 'Lunges', category: 'legs', type: 'weight_reps' },
  { name: 'Walking Lunges', category: 'legs', type: 'weight_reps' },
  { name: 'Romanian Deadlift', category: 'legs', type: 'weight_reps' },
  { name: 'Stiff Leg Deadlift', category: 'legs', type: 'weight_reps' },
  { name: 'Leg Curl', category: 'legs', type: 'weight_reps' },
  { name: 'Leg Extension', category: 'legs', type: 'weight_reps' },
  { name: 'Calf Raises', category: 'legs', type: 'weight_reps' },
  { name: 'Seated Calf Raises', category: 'legs', type: 'weight_reps' },
  { name: 'Hip Thrust', category: 'legs', type: 'weight_reps' },
  { name: 'Glute Bridge', category: 'legs', type: 'bodyweight_reps' },

  // Core
  { name: 'Plank', category: 'core', type: 'time' },
  { name: 'Side Plank', category: 'core', type: 'time' },
  { name: 'Crunches', category: 'core', type: 'bodyweight_reps' },
  { name: 'Sit Ups', category: 'core', type: 'bodyweight_reps' },
  { name: 'Hanging Leg Raise', category: 'core', type: 'bodyweight_reps' },
  { name: 'Lying Leg Raise', category: 'core', type: 'bodyweight_reps' },
  { name: 'Russian Twist', category: 'core', type: 'weight_reps' },
  { name: 'Cable Crunch', category: 'core', type: 'weight_reps' },
  { name: 'Ab Wheel Rollout', category: 'core', type: 'bodyweight_reps' },
  { name: 'Mountain Climbers', category: 'core', type: 'time' },
  { name: 'Dead Bug', category: 'core', type: 'bodyweight_reps' },
  { name: 'Bird Dog', category: 'core', type: 'bodyweight_reps' },

  // Cardio
  { name: 'Treadmill Run', category: 'cardio', type: 'time' },
  { name: 'Treadmill Walk', category: 'cardio', type: 'time' },
  { name: 'Stationary Bike', category: 'cardio', type: 'time' },
  { name: 'Rowing Machine', category: 'cardio', type: 'time' },
  { name: 'Elliptical', category: 'cardio', type: 'time' },
  { name: 'Stair Climber', category: 'cardio', type: 'time' },
  { name: 'Jump Rope', category: 'cardio', type: 'time' },
  { name: 'Jumping Jacks', category: 'cardio', type: 'time' },
  { name: 'Burpees', category: 'cardio', type: 'bodyweight_reps' },
  { name: 'Box Jumps', category: 'cardio', type: 'bodyweight_reps' },

  // Full Body
  { name: 'Clean and Press', category: 'full_body', type: 'weight_reps' },
  { name: 'Power Clean', category: 'full_body', type: 'weight_reps' },
  { name: 'Thrusters', category: 'full_body', type: 'weight_reps' },
  { name: 'Kettlebell Swing', category: 'full_body', type: 'weight_reps' },
  { name: 'Turkish Get Up', category: 'full_body', type: 'weight_reps' },
  { name: 'Man Makers', category: 'full_body', type: 'weight_reps' },
  { name: 'Farmers Walk', category: 'full_body', type: 'time' },
];

export function generateDefaultExercises(): Exercise[] {
  return exerciseDefinitions.map((def, index) => ({
    id: `exercise_${index + 1}`,
    name: def.name,
    category: def.category,
    type: def.type,
    isCustom: false,
  }));
}

export const categoryLabels: Record<ExerciseCategory, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  core: 'Core',
  cardio: 'Cardio',
  full_body: 'Full Body',
};

export const categoryColors: Record<ExerciseCategory, string> = {
  chest: 'bg-red-500/20 text-red-400',
  back: 'bg-blue-500/20 text-blue-400',
  shoulders: 'bg-purple-500/20 text-purple-400',
  arms: 'bg-yellow-500/20 text-yellow-400',
  legs: 'bg-green-500/20 text-green-400',
  core: 'bg-orange-500/20 text-orange-400',
  cardio: 'bg-pink-500/20 text-pink-400',
  full_body: 'bg-cyan-500/20 text-cyan-400',
};
