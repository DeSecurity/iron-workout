import React, { useState, useMemo } from 'react';
import { Exercise, ExerciseCategory } from '@/types/workout';
import { categoryLabels, categoryColors } from '@/data/defaultExercises';
import { Search, Plus, Edit2, Trash2, Filter, X } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface ExerciseLibraryProps {
  exercises: Exercise[];
  onAdd: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => void;
  onUpdate: (id: string, updates: Partial<Exercise>) => void;
  onDelete: (id: string) => void;
  onViewHistory?: (exercise: Exercise) => void;
}

const categories: ExerciseCategory[] = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full_body'
];

export function ExerciseLibrary({
  exercises,
  onAdd,
  onUpdate,
  onDelete,
  onViewHistory,
}: ExerciseLibraryProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'chest' as ExerciseCategory,
    type: 'weight_reps' as Exercise['type'],
  });

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [exercises, search, categoryFilter]);

  const groupedExercises = useMemo(() => {
    const groups: Record<ExerciseCategory, Exercise[]> = {
      chest: [], back: [], shoulders: [], arms: [], legs: [], core: [], cardio: [], full_body: [],
    };
    filteredExercises.forEach((exercise) => {
      groups[exercise.category].push(exercise);
    });
    return groups;
  }, [filteredExercises]);

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingExercise) {
      onUpdate(editingExercise.id, formData);
    } else {
      onAdd(formData);
    }
    
    setFormData({ name: '', category: 'chest', type: 'weight_reps' });
    setEditingExercise(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      category: exercise.category,
      type: exercise.type,
    });
    setIsAddDialogOpen(true);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingExercise(null);
    setFormData({ name: '', category: 'chest', type: 'weight_reps' });
  };

  return (
    <div className="pb-24">
      {/* Search and Filter */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
            className="shrink-0"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setCategoryFilter(category)}
              className="shrink-0"
            >
              {categoryLabels[category]}
            </Button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-6">
        {categoryFilter === 'all' ? (
          categories.map((category) => {
            const categoryExercises = groupedExercises[category];
            if (categoryExercises.length === 0) return null;
            
            return (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {categoryLabels[category]} ({categoryExercises.length})
                </h3>
                <div className="grid gap-2">
                  {categoryExercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onEdit={() => openEditDialog(exercise)}
                      onDelete={() => setDeleteId(exercise.id)}
                      onViewHistory={onViewHistory ? () => onViewHistory(exercise) : undefined}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid gap-2">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onEdit={() => openEditDialog(exercise)}
                onDelete={() => setDeleteId(exercise.id)}
                onViewHistory={onViewHistory ? () => onViewHistory(exercise) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Button */}
      <Button
        className="fixed right-4 bottom-24 h-14 w-14 rounded-full shadow-lg glow-primary"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input
                placeholder="Exercise name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as ExerciseCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as Exercise['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_reps">Weight & Reps</SelectItem>
                  <SelectItem value="bodyweight_reps">Bodyweight & Reps</SelectItem>
                  <SelectItem value="time">Time-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingExercise ? 'Save' : 'Add Exercise'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise?</AlertDialogTitle>
            <AlertDialogDescription>
              This exercise will be removed from your library. It will still appear in historical workout sessions.
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

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: () => void;
  onDelete: () => void;
  onViewHistory?: () => void;
}

function ExerciseCard({ exercise, onEdit, onDelete, onViewHistory }: ExerciseCardProps) {
  return (
    <div 
      className="bg-card rounded-lg p-3 flex items-center justify-between group hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onViewHistory}
    >
      <div className="flex items-center gap-3">
        <div className={cn('exercise-chip', categoryColors[exercise.category])}>
          {categoryLabels[exercise.category]}
        </div>
        <div>
          <p className="font-medium">{exercise.name}</p>
          <p className="text-xs text-muted-foreground">
            {exercise.type === 'weight_reps' ? 'Weight & Reps' : 
             exercise.type === 'bodyweight_reps' ? 'Bodyweight' : 'Time'}
            {exercise.isCustom && ' • Custom'}
          </p>
        </div>
      </div>
      {exercise.isCustom && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
