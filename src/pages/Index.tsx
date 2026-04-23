import React, { useState } from 'react';
import { useWorkoutStorage } from '@/hooks/useWorkoutStorage';
import { useTimer } from '@/hooks/useTimer';
import { WorkoutTemplate } from '@/types/workout';
import { Navigation } from '@/components/Navigation';
import { ProfileSelector } from '@/components/ProfileSelector';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';
import { TemplateManager } from '@/components/TemplateManager';
import { WorkoutLogger } from '@/components/WorkoutLogger';
import { WorkoutHistory } from '@/components/WorkoutHistory';
import { ProfileView } from '@/components/ProfileView';
import { WorkoutStart } from '@/components/WorkoutStart';
import { RestTimer } from '@/components/RestTimer';
import { toast } from 'sonner';

type Tab = 'workout' | 'templates' | 'exercises' | 'history' | 'profile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('workout');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutTemplate | null>(null);
  const [isWorkoutInProgress, setIsWorkoutInProgress] = useState(false);

  const {
    profiles,
    activeProfile,
    createProfile,
    deleteProfile,
    renameProfile,
    switchProfile,
    addExercise,
    updateExercise,
    deleteExercise,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    saveSession,
    deleteSession,
    getLastExerciseStats,
  } = useWorkoutStorage();

  const {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    addTime,
  } = useTimer({
    onComplete: () => toast.success('Rest complete! Time to lift!'),
  });

  const handleStartWorkout = (template: WorkoutTemplate | null) => {
    setActiveWorkout(template);
    setIsWorkoutInProgress(true);
  };

  const handleFinishWorkout = () => {
    setActiveWorkout(null);
    setIsWorkoutInProgress(false);
    setActiveTab('history');
    toast.success('Workout saved!');
  };

  const handleCancelWorkout = () => {
    setActiveWorkout(null);
    setIsWorkoutInProgress(false);
    cancelTimer();
  };

  if (!activeProfile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="font-display text-2xl text-primary">IRON</h1>
          <ProfileSelector
            profiles={profiles}
            activeProfile={activeProfile}
            onSwitch={switchProfile}
            onCreate={createProfile}
            onRename={renameProfile}
            onDelete={deleteProfile}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {isWorkoutInProgress ? (
          <WorkoutLogger
            template={activeWorkout}
            exercises={activeProfile.exercises}
            getLastExerciseStats={getLastExerciseStats}
            onStartTimer={startTimer}
            onSaveSession={(session) => {
              saveSession(session);
              handleFinishWorkout();
            }}
            onCancel={handleCancelWorkout}
          />
        ) : (
          <>
            {activeTab === 'workout' && (
              <WorkoutStart
                templates={activeProfile.templates}
                exercises={activeProfile.exercises}
                onStartFromTemplate={handleStartWorkout}
                onStartQuickWorkout={() => handleStartWorkout(null)}
              />
            )}
            {activeTab === 'templates' && (
              <TemplateManager
                templates={activeProfile.templates}
                exercises={activeProfile.exercises}
                onCreate={createTemplate}
                onUpdate={updateTemplate}
                onDelete={deleteTemplate}
                onStartWorkout={handleStartWorkout}
              />
            )}
            {activeTab === 'exercises' && (
              <ExerciseLibrary
                exercises={activeProfile.exercises}
                onAdd={addExercise}
                onUpdate={updateExercise}
                onDelete={deleteExercise}
              />
            )}
            {activeTab === 'history' && (
              <WorkoutHistory
                sessions={activeProfile.sessions}
                exercises={activeProfile.exercises}
                onDelete={deleteSession}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileView profile={activeProfile} />
            )}
          </>
        )}
      </main>

      {/* Rest Timer */}
      {timerState.totalSeconds > 0 && (
        <RestTimer
          remainingSeconds={timerState.remainingSeconds}
          totalSeconds={timerState.totalSeconds}
          isRunning={timerState.isRunning}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onCancel={cancelTimer}
          onAddTime={addTime}
        />
      )}

      {/* Navigation */}
      {!isWorkoutInProgress && (
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
};

export default Index;
