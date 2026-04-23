import React from 'react';
import { Dumbbell, ClipboardList, Play, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'workout' | 'templates' | 'exercises' | 'history' | 'profile';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'workout', label: 'Workout', icon: <Play className="w-5 h-5" /> },
  { id: 'templates', label: 'Templates', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'exercises', label: 'Exercises', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-nav-bg border-t border-border z-50 safe-area-pb">
      <div className="flex justify-around items-center py-2 px-2 max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'nav-item flex-1',
              activeTab === item.id && 'active'
            )}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
