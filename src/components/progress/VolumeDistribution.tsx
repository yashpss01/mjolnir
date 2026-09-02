import React from 'react';
import { Layers } from 'lucide-react';
import { WorkoutSession, MuscleGroup } from '../../types';

interface VolumeDistributionProps {
  sessions: WorkoutSession[];
}

export const VolumeDistribution: React.FC<VolumeDistributionProps> = ({ sessions }) => {
  const muscleGroups: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
  const volumeMap: Record<MuscleGroup, number> = {
    Chest: 0,
    Back: 0,
    Legs: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0,
    'Full Body': 0,
  };

  const targetSetsPerWeek = 16; // Standard evidence-based weekly hypertrophy target

  sessions.forEach((s) => {
    if (s.exercises) {
      s.exercises.forEach((ex) => {
        const mg = ex.exercise.muscleGroup || 'Chest';
        const completedCount = ex.sets.filter((st) => st.isCompleted).length;
        if (volumeMap[mg] !== undefined) {
          volumeMap[mg] += completedCount;
        }
      });
    }
  });

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Muscle Set Volume Distribution</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Target: ~16 sets/wk</span>
      </div>

      <div className="space-y-2.5 pt-1">
        {muscleGroups.map((mg) => {
          const setsCount = volumeMap[mg] || 0;
          const percentage = Math.min(100, Math.round((setsCount / targetSetsPerWeek) * 100));

          return (
            <div key={mg} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">{mg}</span>
                <span className="font-mono font-semibold text-zinc-400">
                  {setsCount} <span className="text-[10px] text-zinc-600">/ {targetSetsPerWeek} sets</span>
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/60">
                <div
                  className={`h-full transition-all duration-300 ${
                    setsCount >= 10
                      ? 'bg-emerald-500'
                      : setsCount > 0
                      ? 'bg-blue-500'
                      : 'bg-zinc-800'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
