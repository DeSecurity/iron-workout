import React, { useState } from 'react';
import { WorkoutTemplate, Exercise, TemplateExercise } from '@/types/workout';
import { categoryLabels, categoryColors } from '@/data/defaultExercises';
import { Plus, Edit2, Trash2, Play, GripVertical, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

interface TemplateManagerProps {
  templates: WorkoutTemplate[];
  exercises: Exercise[];
  onCreate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<WorkoutTemplate>) => void;
  onDelete: (id: string) => void;
  onStartWorkout: (template: WorkoutTemplate) => void;
}

export function TemplateManager({
  templates,
  exercises,
  onCreate,
  onUpdate,
  onDelete,
  onStartWorkout,
}: TemplateManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const getExerciseName = (exerciseId: string) => {
    return exercises.find(e => e.id === exerciseId)?.name || 'Unknown Exercise';
  };

  return (
    <div className="pb-24">
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first workout template to get started</p>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-card rounded-xl overflow-hidden card-shadow"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
              >
                <div>
                  <h3 className="font-display text-xl">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {template.exercises.length} exercises
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartWorkout(template);
                    }}
                    className="gap-1"
                  >
                    <Play className="w-4 h-4" />
                    Start
                  </Button>
                  {expandedId === template.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedId === template.id && (
                <div className="border-t border-border px-4 py-3 space-y-3 slide-up">
                  <div className="space-y-2">
                    {template.exercises.map((te, index) => {
                      const exercise = exercises.find(e => e.id === te.exerciseId);
                      return (
                        <div key={index} className="flex items-center gap-3 py-2 px-3 bg-muted/30 rounded-lg">
                          <span className="text-muted-foreground text-sm w-6">{index + 1}</span>
                          <div className="flex-1">
                            <p className="font-medium">{getExerciseName(te.exerciseId)}</p>
                            <p className="text-sm text-muted-foreground">
                              {te.defaultSets} sets × {te.defaultReps || '--'} reps
                              {te.defaultWeight && ` @ ${te.defaultWeight} lbs`}
                              {te.defaultTimeSeconds && ` for ${te.defaultTimeSeconds}s`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{te.restBetweenSets}s</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditDialog(template)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteId(template.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <Button
        className="fixed right-4 bottom-24 h-14 w-14 rounded-full shadow-lg glow-primary"
        onClick={openCreateDialog}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Create/Edit Dialog */}
      <TemplateDialog
        open={isDialogOpen}
        template={editingTemplate}
        exercises={exercises}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTemplate(null);
        }}
        onSave={(data) => {
          if (editingTemplate) {
            onUpdate(editingTemplate.id, data);
          } else {
            onCreate(data);
          }
          setIsDialogOpen(false);
          setEditingTemplate(null);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This template will be permanently deleted. Your workout history will not be affected.
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

interface TemplateDialogProps {
  open: boolean;
  template: WorkoutTemplate | null;
  exercises: Exercise[];
  onClose: () => void;
  onSave: (data: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

function TemplateDialog({ open, template, exercises, onClose, onSave }: TemplateDialogProps) {
  const [name, setName] = useState(template?.name || '');
  const [restBetweenExercises, setRestBetweenExercises] = useState(template?.restBetweenExercises || 120);
  const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>(template?.exercises || []);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  React.useEffect(() => {
    if (template) {
      setName(template.name);
      setRestBetweenExercises(template.restBetweenExercises);
      setTemplateExercises(template.exercises);
    } else {
      setName('');
      setRestBetweenExercises(120);
      setTemplateExercises([]);
    }
  }, [template, open]);

  const addExercise = (exercise: Exercise) => {
    const newTemplateExercise: TemplateExercise = {
      exerciseId: exercise.id,
      defaultSets: exercise.type === 'time' ? 1 : 3,
      defaultReps: exercise.type === 'time' ? undefined : 10,
      defaultTimeSeconds: exercise.type === 'time' ? 60 : undefined,
      restBetweenSets: 90,
    };
    setTemplateExercises([...templateExercises, newTemplateExercise]);
    setShowExercisePicker(false);
    setExerciseSearch('');
  };

  const removeExercise = (index: number) => {
    setTemplateExercises(templateExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, updates: Partial<TemplateExercise>) => {
    setTemplateExercises(templateExercises.map((te, i) => 
      i === index ? { ...te, ...updates } : te
    ));
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= templateExercises.length) return;
    
    const newExercises = [...templateExercises];
    [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
    setTemplateExercises(newExercises);
  };

  const handleSave = () => {
    if (!name.trim() || templateExercises.length === 0) return;
    onSave({
      name: name.trim(),
      restBetweenExercises,
      exercises: templateExercises,
    });
  };

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) &&
    !templateExercises.some(te => te.exerciseId === e.id)
  );

  const getExerciseName = (exerciseId: string) => {
    return exercises.find(e => e.id === exerciseId)?.name || 'Unknown';
  };

  const getExercise = (exerciseId: string) => {
    return exercises.find(e => e.id === exerciseId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create Template'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Template Name</label>
            <Input
              placeholder="e.g., Push Day"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Rest Between Exercises (seconds)</label>
            <Input
              type="number"
              value={restBetweenExercises}
              onChange={(e) => setRestBetweenExercises(Number(e.target.value))}
              min={0}
              step={15}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Exercises</label>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowExercisePicker(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Exercise
              </Button>
            </div>

            {templateExercises.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground text-sm">
                No exercises added yet
              </p>
            ) : (
              <div className="space-y-3">
                {templateExercises.map((te, index) => {
                  const exercise = getExercise(te.exerciseId);
                  return (
                    <div key={index} className="bg-muted/50 rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveExercise(index, 'up')}
                              disabled={index === 0}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveExercise(index, 'down')}
                              disabled={index === templateExercises.length - 1}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-medium">{getExerciseName(te.exerciseId)}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeExercise(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Sets</label>
                          <Input
                            type="number"
                            value={te.defaultSets}
                            onChange={(e) => updateExercise(index, { defaultSets: Number(e.target.value) })}
                            className="h-8 text-sm"
                            min={1}
                          />
                        </div>
                        {exercise?.type !== 'time' && (
                          <>
                            <div>
                              <label className="text-xs text-muted-foreground">Reps</label>
                              <Input
                                type="number"
                                value={te.defaultReps || ''}
                                onChange={(e) => updateExercise(index, { defaultReps: Number(e.target.value) || undefined })}
                                className="h-8 text-sm"
                                min={1}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Weight</label>
                              <Input
                                type="number"
                                value={te.defaultWeight || ''}
                                onChange={(e) => updateExercise(index, { defaultWeight: Number(e.target.value) || undefined })}
                                className="h-8 text-sm"
                                min={0}
                                step={5}
                              />
                            </div>
                          </>
                        )}
                        {exercise?.type === 'time' && (
                          <div>
                            <label className="text-xs text-muted-foreground">Time (s)</label>
                            <Input
                              type="number"
                              value={te.defaultTimeSeconds || ''}
                              onChange={(e) => updateExercise(index, { defaultTimeSeconds: Number(e.target.value) || undefined })}
                              className="h-8 text-sm"
                              min={1}
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-xs text-muted-foreground">Rest (s)</label>
                          <Input
                            type="number"
                            value={te.restBetweenSets}
                            onChange={(e) => updateExercise(index, { restBetweenSets: Number(e.target.value) })}
                            className="h-8 text-sm"
                            min={0}
                            step={15}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || templateExercises.length === 0}>
            {template ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogFooter>

        {/* Exercise Picker */}
        <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
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
              {filteredExercises.map((exercise) => (
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
      </DialogContent>
    </Dialog>
  );
}
