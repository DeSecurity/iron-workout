import React from 'react';
import { Profile } from '@/types/workout';
import { User, Calendar, Dumbbell, ClipboardList, History, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProfileViewProps {
  profile: Profile;
}

export function ProfileView({ profile }: ProfileViewProps) {
  const totalWorkouts = profile.sessions.length;
  const totalSets = profile.sessions.reduce((acc, session) => 
    acc + session.exercises.reduce((exAcc, ex) => exAcc + ex.sets.length, 0), 0
  );
  const totalVolume = profile.sessions.reduce((acc, session) => 
    acc + session.exercises.reduce((exAcc, ex) => 
      exAcc + ex.sets.reduce((setAcc, set) => 
        setAcc + (set.weightLbs || 0) * (set.reps || 0), 0
      ), 0
    ), 0
  );

  const customExercises = profile.exercises.filter(e => e.isCustom).length;
  const customTemplates = profile.templates.length;

  const recentWorkout = profile.sessions[0];
  const streakDays = calculateStreak(profile.sessions.map(s => s.date));

  return (
    <div className="pb-24 space-y-6">
      {/* Profile Header */}
      <div className="text-center py-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display text-3xl">{profile.name}</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Member since {new Date(profile.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<History className="w-5 h-5" />}
          label="Workouts"
          value={totalWorkouts.toString()}
        />
        <StatCard
          icon={<Dumbbell className="w-5 h-5" />}
          label="Total Sets"
          value={totalSets.toString()}
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Total Volume"
          value={`${(totalVolume / 1000).toFixed(1)}K lbs`}
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Day Streak"
          value={streakDays.toString()}
        />
      </div>

      {/* Library Stats */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Your Library
        </h3>
        <div className="bg-card rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Custom Exercises</span>
            <span className="font-medium">{customExercises}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Workout Templates</span>
            <span className="font-medium">{customTemplates}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Exercises</span>
            <span className="font-medium">{profile.exercises.length}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentWorkout && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Last Workout
          </h3>
          <div className="bg-card rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{recentWorkout.templateName || 'Quick Workout'}</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(recentWorkout.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{recentWorkout.exercises.length} exercises</p>
                <p className="text-muted-foreground">
                  {recentWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} sets
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="stat-card flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="font-display text-xl">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = [...new Set(dates)].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastWorkout = new Date(sortedDates[0]);
  lastWorkout.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    const prev = new Date(sortedDates[i - 1]);
    current.setHours(0, 0, 0, 0);
    prev.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((prev.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }

  return streak;
}
