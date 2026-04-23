import { useState, useCallback, useEffect, useRef } from 'react';
import { TimerState } from '@/types/workout';

interface UseTimerProps {
  onComplete?: () => void;
}

export function useTimer({ onComplete }: UseTimerProps = {}) {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    remainingSeconds: 0,
    totalSeconds: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not available');
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback((seconds: number, exerciseId?: string, setNumber?: number) => {
    clearTimer();
    
    setTimerState({
      isRunning: true,
      remainingSeconds: seconds,
      totalSeconds: seconds,
      exerciseId,
      setNumber,
    });

    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (prev.remainingSeconds <= 1) {
          clearTimer();
          playBeep();
          onComplete?.();
          return {
            ...prev,
            isRunning: false,
            remainingSeconds: 0,
          };
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);
  }, [clearTimer, playBeep, onComplete]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, [clearTimer]);

  const resumeTimer = useCallback(() => {
    if (timerState.remainingSeconds > 0) {
      setTimerState(prev => ({ ...prev, isRunning: true }));
      
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          if (prev.remainingSeconds <= 1) {
            clearTimer();
            playBeep();
            onComplete?.();
            return {
              ...prev,
              isRunning: false,
              remainingSeconds: 0,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    }
  }, [timerState.remainingSeconds, clearTimer, playBeep, onComplete]);

  const cancelTimer = useCallback(() => {
    clearTimer();
    setTimerState({
      isRunning: false,
      remainingSeconds: 0,
      totalSeconds: 0,
    });
  }, [clearTimer]);

  const addTime = useCallback((seconds: number) => {
    setTimerState(prev => ({
      ...prev,
      remainingSeconds: Math.max(0, prev.remainingSeconds + seconds),
      totalSeconds: Math.max(0, prev.totalSeconds + seconds),
    }));
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    addTime,
    isRunning: timerState.isRunning,
    remainingSeconds: timerState.remainingSeconds,
    totalSeconds: timerState.totalSeconds,
    progress: timerState.totalSeconds > 0 
      ? (timerState.totalSeconds - timerState.remainingSeconds) / timerState.totalSeconds 
      : 0,
  };
}
