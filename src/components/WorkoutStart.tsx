import React from 'react';
import { WorkoutTemplate, Exercise } from '@/types/workout';
import { Play, Plus, ClipboardList, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkoutStartProps {
  templates: WorkoutTemplate[];
  exercises: Exercise[];
  onStartFromTemplate: (template: WorkoutTemplate) => void;
  onStartQuickWorkout: () => void;
}

export function WorkoutStart({
  templates,
  exercises,
  onStartFromTemplate,
  onStartQuickWorkout,
}: WorkoutStartProps) {
  const getExerciseName = (exerciseId: string) => {
    return exercises.find(e => e.id === exerciseId)?.name || 'Unknown';
  };

  return (
    <div className="pb-24 space-y-6">
      {/* Quick Start */}
      <div>
        <Button
          onClick={onStartQuickWorkout}
          className="w-full h-auto py-6 flex flex-col items-center gap-2 glow-primary"
        >
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <span className="font-display text-xl">Quick Workout</span>
          <span className="text-primary-foreground/80 text-sm font-normal">
            Start empty, add exercises as you go
          </span>
        </Button>
      </div>

      {/* Templates */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Your Templates
        </h3>

        {templates.length === 0 ? (
          <div className="bg-card rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-2">No templates yet</p>
            <p className="text-sm text-muted-foreground">
              Create templates in the Templates tab for quick access here
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onStartFromTemplate(template)}
                className="bg-card rounded-xl p-4 text-left hover:bg-accent/50 transition-colors group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-display text-lg group-hover:text-primary transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.exercises.length} exercises
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.exercises.slice(0, 3).map((te, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                          {getExerciseName(te.exerciseId)}
                        </span>
                      ))}
                      {template.exercises.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{template.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Play className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
