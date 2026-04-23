import React, { useState, useEffect } from 'react';
import { WorkoutTemplate, Exercise, ExerciseLog, SetLog, WorkoutSession } from '@/types/workout';
import { categoryLabels, categoryColors } from '@/data/defaultExercises';
import { Timer, Plus, Check, X, Copy, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WorkoutLoggerProps {
  template: WorkoutTemplate | null;
  exercises: Exercise[];
  getLastExerciseStats: (exerciseId: string) => { date: string; sets: SetLog[] } | null;
  onStartTimer: (seconds: number, exerciseId?: string, setNumber?: number) => void;
  onSaveSession: (session: Omit<WorkoutSession, 'id' | 'profileId'>) => void;
  onCancel: () => void;
}

interface WorkoutExercise extends ExerciseLog {
  restBetweenSets: number;
  expanded: boolean;
  previousStats: { date: string; sets: SetLog[] } | null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function WorkoutLogger({
  template,
  exercises,
  getLastExerciseStats,
  onStartTimer,
  onSaveSession,
  onCancel,
}: WorkoutLoggerProps) {
  const [startTime] = useState(new Date().toISOString());
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  useEffect(() => {
    if (template) {
      const initialExercises: WorkoutExercise[] = template.exercises.map((te) => {
        const exercise = exercises.find(e => e.id === te.exerciseId);
        const previousStats = getLastExerciseStats(te.exerciseId);
        
        const sets: SetLog[] = Array.from({ length: te.defaultSets }, (_, i) => ({
          setNumber: i + 1,
          weightLbs: te.defaultWeight || previousStats?.sets[i]?.weightLbs || null,
          reps: te.defaultReps || previousStats?.sets[i]?.reps || null,
          timeSeconds: te.defaultTimeSeconds || previousStats?.sets[i]?.timeSeconds || null,
          completed: false,
        }));

        return {
          exerciseId: te.exerciseId,
          name: exercise?.name || 'Unknown',
          type: exercise?.type || 'weight_reps',
          sets,
          restBetweenSets: te.restBetweenSets,
          expanded: true,
          previousStats,
        };
      });
      setWorkoutExercises(initialExercises);
    }
  }, [template, exercises, getLastExerciseStats]);

  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<SetLog>) => {
    setWorkoutExercises(prev => prev.map((ex, ei) => {
      if (ei !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((set, si) => si === setIndex ? { ...set, ...updates } : set),
      };
    }));
  };

  const addSet = (exerciseIndex: number) => {
    setWorkoutExercises(prev => prev.map((ex, ei) => {
      if (ei !== exerciseIndex) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [
          ...ex.sets,
          {
            setNumber: ex.sets.length + 1,
            weightLbs: lastSet?.weightLbs || null,
            reps: lastSet?.reps || null,
            timeSeconds: lastSet?.timeSeconds || null,
            completed: false,
          },
        ],
      };
    }));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setWorkoutExercises(prev => prev.map((ex, ei) => {
      if (ei !== exerciseIndex || ex.sets.length <= 1) return ex;
      return {
        ...ex,
        sets: ex.sets.filter((_, si) => si !== setIndex).map((s, i) => ({ ...s, setNumber: i + 1 })),
      };
    }));
  };

  const copyPreviousSet = (exerciseIndex: number, setIndex: number) => {
    const exercise = workoutExercises[exerciseIndex];
    const prevSet = exercise.previousStats?.sets[setIndex];
    if (prevSet) {
      updateSet(exerciseIndex, setIndex, {
        weightLbs: prevSet.weightLbs,
        reps: prevSet.reps,
        timeSeconds: prevSet.timeSeconds,
      });
    }
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    updateSet(exerciseIndex, setIndex, { completed: true });
    const exercise = workoutExercises[exerciseIndex];
    if (exercise.restBetweenSets > 0) {
      onStartTimer(exercise.restBetweenSets, exercise.exerciseId, setIndex + 1);
    }
  };

  const toggleExpanded = (exerciseIndex: number) => {
    setWorkoutExercises(prev => prev.map((ex, i) => 
      i === exerciseIndex ? { ...ex, expanded: !ex.expanded } : ex
    ));
  };

  const addExercise = (exercise: Exercise) => {
    const previousStats = getLastExerciseStats(exercise.id);
    const newExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      type: exercise.type,
      sets: [{
        setNumber: 1,
        weightLbs: previousStats?.sets[0]?.weightLbs || null,
        reps: previousStats?.sets[0]?.reps || (exercise.type !== 'time' ? 10 : null),
        timeSeconds: exercise.type === 'time' ? (previousStats?.sets[0]?.timeSeconds || 60) : null,
        completed: false,
      }],
      restBetweenSets: 90,
      expanded: true,
      previousStats,
    };
    setWorkoutExercises(prev => [...prev, newExercise]);
    setShowAddExercise(false);
    setExerciseSearch('');
  };

  const removeExercise = (exerciseIndex: number) => {
    setWorkoutExercises(prev => prev.filter((_, i) => i !== exerciseIndex));
  };

  const handleFinish = () => {
    const completedExercises = workoutExercises.filter(ex => 
      ex.sets.some(s => s.completed)
    );

    if (completedExercises.length === 0) {
      setShowCancelDialog(true);
      return;
    }

    setShowFinishDialog(true);
  };

  const saveWorkout = () => {
    const session: Omit<WorkoutSession, 'id' | 'profileId'> = {
      templateId: template?.id || null,
      templateName: template?.name,
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime: new Date().toISOString(),
      exercises: workoutExercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        type: ex.type,
        sets: ex.sets.filter(s => s.completed),
      })).filter(ex => ex.sets.length > 0),
      completed: true,
    };

    onSaveSession(session);
  };

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) &&
    !workoutExercises.some(we => we.exerciseId === e.id)
  );

  const totalSets = workoutExercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const totalVolume = workoutExercises.reduce((acc, ex) => {
    return acc + ex.sets.filter(s => s.completed).reduce((setAcc, set) => {
      return setAcc + (set.weightLbs || 0) * (set.reps || 0);
    }, 0);
  }, 0);

  return (
    <div className="pb-32">
      {/* Header Stats */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-display text-2xl">
              {template?.name || 'Quick Workout'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {totalSets} sets completed • {totalVolume.toLocaleString()} lbs
            </p>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {workoutExercises.map((exercise, exerciseIndex) => {
          const exerciseData = exercises.find(e => e.id === exercise.exerciseId);
          const completedSets = exercise.sets.filter(s => s.completed).length;
          
          return (
            <div key={exerciseIndex} className="bg-card rounded-xl overflow-hidden card-shadow slide-up">
              <button
                onClick={() => toggleExpanded(exerciseIndex)}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {exerciseData && (
                    <span className={cn('exercise-chip', categoryColors[exerciseData.category])}>
                      {categoryLabels[exerciseData.category]}
                    </span>
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {completedSets}/{exercise.sets.length} sets
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExercise(exerciseIndex);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {exercise.expanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {exercise.expanded && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Previous Stats */}
                  {exercise.previousStats && (
                    <div className="bg-muted/30 rounded-lg p-2 text-xs">
                      <p className="text-muted-foreground mb-1">
                        Previous: {new Date(exercise.previousStats.date).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {exercise.previousStats.sets.slice(0, 5).map((set, i) => (
                          <span key={i} className="bg-muted px-2 py-0.5 rounded">
                            {exercise.type === 'time' 
                              ? formatTime(set.timeSeconds || 0)
                              : `${set.weightLbs || 0}×${set.reps || 0}`
                            }
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sets */}
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid gap-2 text-xs text-muted-foreground px-1" 
                      style={{ gridTemplateColumns: '2rem 1fr 1fr auto' }}>
                      <span>Set</span>
                      {exercise.type === 'time' ? (
                        <span className="col-span-2">Time</span>
                      ) : (
                        <>
                          <span>Weight (lbs)</span>
                          <span>Reps</span>
                        </>
                      )}
                      <span></span>
                    </div>

                    {exercise.sets.map((set, setIndex) => (
                      <div 
                        key={setIndex}
                        className={cn(
                          "grid gap-2 items-center p-2 rounded-lg",
                          set.completed ? "bg-success/10" : "bg-set-row"
                        )}
                        style={{ gridTemplateColumns: '2rem 1fr 1fr auto' }}
                      >
                        <span className={cn(
                          "text-center text-sm font-medium",
                          set.completed && "text-success"
                        )}>
                          {set.setNumber}
                        </span>

                        {exercise.type === 'time' ? (
                          <div className="col-span-2">
                            <Input
                              type="number"
                              value={set.timeSeconds || ''}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, { 
                                timeSeconds: Number(e.target.value) || null 
                              })}
                              placeholder="60"
                              className="number-input h-10"
                              disabled={set.completed}
                            />
                          </div>
                        ) : (
                          <>
                            <Input
                              type="number"
                              value={set.weightLbs || ''}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, { 
                                weightLbs: Number(e.target.value) || null 
                              })}
                              placeholder="0"
                              className="number-input h-10"
                              disabled={set.completed}
                              step={5}
                            />
                            <Input
                              type="number"
                              value={set.reps || ''}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, { 
                                reps: Number(e.target.value) || null 
                              })}
                              placeholder="0"
                              className="number-input h-10"
                              disabled={set.completed}
                            />
                          </>
                        )}

                        <div className="flex gap-1">
                          {exercise.previousStats?.sets[setIndex] && !set.completed && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-10 w-10"
                              onClick={() => copyPreviousSet(exerciseIndex, setIndex)}
                              title="Copy previous"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          {set.completed ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-10 w-10 text-success"
                            >
                              <Check className="w-5 h-5" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-10 w-10"
                              onClick={() => completeSet(exerciseIndex, setIndex)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          {!set.completed && exercise.sets.length > 1 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-10 w-10 text-destructive"
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addSet(exerciseIndex)}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Set
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStartTimer(exercise.restBetweenSets, exercise.exerciseId)}
                    >
                      <Timer className="w-4 h-4 mr-1" />
                      {exercise.restBetweenSets}s
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Exercise Button */}
      <Button
        variant="secondary"
        className="w-full mt-4"
        onClick={() => setShowAddExercise(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Exercise
      </Button>

      {/* Bottom Actions */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 glow-primary"
            onClick={handleFinish}
          >
            <Check className="w-4 h-4 mr-2" />
            Finish Workout
          </Button>
        </div>
      </div>

      {/* Add Exercise Dialog */}
      <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search exercises..."
            value={exerciseSearch}
            onChange={(e) => setExerciseSearch(e.target.value)}
          />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredExercises.slice(0, 20).map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => addExercise(exercise)}
                className="w-full text-left p-2 rounded-lg hover:bg-accent flex items-center gap-2"
              >
                <span className={cn('exercise-chip', categoryColors[exercise.category])}>
                  {categoryLabels[exercise.category]}
                </span>
                <span>{exercise.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will not be saved. Are you sure you want to cancel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Going</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onCancel}
            >
              Cancel Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finish Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              You completed {totalSets} sets with {totalVolume.toLocaleString()} lbs total volume. Save this workout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Going</AlertDialogCancel>
            <AlertDialogAction onClick={saveWorkout}>
              Save Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
