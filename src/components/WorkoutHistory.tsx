import React, { useState } from 'react';
import { WorkoutSession, Exercise } from '@/types/workout';
import { Calendar, Clock, Dumbbell, Trash2, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

interface WorkoutHistoryProps {
  sessions: WorkoutSession[];
  exercises: Exercise[];
  onDelete: (sessionId: string) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(start: string, end?: string): string {
  if (!end) return '--';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

export function WorkoutHistory({ sessions, exercises, onDelete }: WorkoutHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getExerciseStats = () => {
    const stats: Record<string, {
      name: string;
      sessions: number;
      maxWeight: number;
      maxReps: number;
      totalVolume: number;
    }> = {};

    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        if (!stats[ex.exerciseId]) {
          stats[ex.exerciseId] = {
            name: ex.name,
            sessions: 0,
            maxWeight: 0,
            maxReps: 0,
            totalVolume: 0,
          };
        }
        stats[ex.exerciseId].sessions += 1;
        ex.sets.forEach(set => {
          if (set.weightLbs && set.weightLbs > stats[ex.exerciseId].maxWeight) {
            stats[ex.exerciseId].maxWeight = set.weightLbs;
          }
          if (set.reps && set.reps > stats[ex.exerciseId].maxReps) {
            stats[ex.exerciseId].maxReps = set.reps;
          }
          stats[ex.exerciseId].totalVolume += (set.weightLbs || 0) * (set.reps || 0);
        });
      });
    });

    return Object.entries(stats)
      .sort((a, b) => b[1].sessions - a[1].sessions)
      .slice(0, 5);
  };

  const topExercises = getExerciseStats();

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Workouts Yet</h3>
        <p className="text-muted-foreground">Complete your first workout to see it here</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-6">
      {/* Top Stats */}
      {topExercises.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Top Exercises
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {topExercises.map(([id, stat]) => (
              <div key={id} className="stat-card">
                <p className="font-medium text-sm truncate">{stat.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.sessions} sessions • {stat.maxWeight} lbs max
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Recent Workouts
        </h3>
        {sessions.map((session) => {
          const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
          const totalVolume = session.exercises.reduce((acc, ex) => {
            return acc + ex.sets.reduce((setAcc, set) => {
              return setAcc + (set.weightLbs || 0) * (set.reps || 0);
            }, 0);
          }, 0);
          
          return (
            <div
              key={session.id}
              className="bg-card rounded-xl overflow-hidden card-shadow"
            >
              <button
                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display text-lg">
                      {session.templateName || 'Quick Workout'}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.startTime, session.endTime)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">{totalSets} sets</p>
                      <p className="text-xs text-muted-foreground">
                        {totalVolume.toLocaleString()} lbs
                      </p>
                    </div>
                    {expandedId === session.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </button>

              {expandedId === session.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  {session.exercises.map((exercise, index) => (
                    <div key={index} className="space-y-2">
                      <p className="font-medium text-sm">{exercise.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {exercise.sets.map((set, setIndex) => (
                          <span
                            key={setIndex}
                            className="bg-muted px-2 py-1 rounded text-xs"
                          >
                            {exercise.type === 'time'
                              ? formatTime(set.timeSeconds || 0)
                              : `${set.weightLbs || 0} × ${set.reps || 0}`
                            }
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive mt-2"
                    onClick={() => setDeleteId(session.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Session
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This workout session will be permanently deleted from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
