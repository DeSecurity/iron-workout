import React from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onAddTime: (seconds: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function RestTimer({
  remainingSeconds,
  totalSeconds,
  isRunning,
  onPause,
  onResume,
  onCancel,
  onAddTime,
}: RestTimerProps) {
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  if (totalSeconds === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center p-4 fade-in">
      <div className={cn(
        "bg-card border border-border rounded-2xl p-6 shadow-lg flex items-center gap-6",
        isRunning && "animate-pulse-glow"
      )}>
        {/* Timer Circle */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
                transition: 'stroke-dashoffset 0.5s ease-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "text-2xl font-bold font-display tracking-wider",
              remainingSeconds <= 5 && "text-primary animate-countdown"
            )}>
              {formatTime(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => onAddTime(-15)}
              disabled={remainingSeconds <= 15}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant={isRunning ? "secondary" : "default"}
              onClick={isRunning ? onPause : onResume}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => onAddTime(15)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
