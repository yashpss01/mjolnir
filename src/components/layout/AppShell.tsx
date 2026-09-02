import React from 'react';
import { BottomNav } from './BottomNav';
import { TabType } from '../../types';
import { Dumbbell, Play } from 'lucide-react';

interface AppShellProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isWorkoutActive?: boolean;
  activeWorkoutName?: string;
  onReturnToWorkout?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onSelectTab,
  isWorkoutActive,
  activeWorkoutName,
  onReturnToWorkout,
  children,
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600">
      {/* Top Mobile Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                Mjolnir <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">Gym</span>
              </h1>
            </div>
          </div>

          {/* Active Workout Floating Banner Header indicator */}
          {isWorkoutActive && (
            <button
              onClick={onReturnToWorkout}
              className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-600/20 active:scale-95 transition"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="truncate max-w-[110px] font-medium">{activeWorkoutName || 'In Progress'}</span>
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto pb-28 px-4 pt-4 overflow-y-auto">
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={onSelectTab} />
    </div>
  );
};
