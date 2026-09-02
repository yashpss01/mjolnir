import React, { useEffect, useState } from 'react';
import { X, Trophy, Calendar, Dumbbell, TrendingUp } from 'lucide-react';
import { Exercise } from '../../types';
import { fetchPreviousPerformance, fetchSessions } from '../../services/api';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, onClose }) => {
  const [history, setHistory] = useState<{ date: string; sets: { setNumber: number; weightKg: number; reps: number }[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions()
      .then((allSessions) => {
        const matching: { date: string; sets: { setNumber: number; weightKg: number; reps: number }[] }[] = [];
        allSessions.forEach((s) => {
          if (s.exercises) {
            const exMatch = s.exercises.find((e) => e.exercise.id === exercise.id);
            if (exMatch) {
              const completed = exMatch.sets
                .filter((st) => st.isCompleted)
                .map((st) => ({
                  setNumber: st.setNumber,
                  weightKg: st.weightKg,
                  reps: st.reps,
                }));
              if (completed.length > 0) {
                matching.push({
                  date: new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  sets: completed,
                });
              }
            }
          }
        });
        setHistory(matching);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [exercise]);

  // Compute all time best set & estimated 1RM
  let bestWeight = 0;
  let bestReps = 0;
  history.forEach((h) => {
    h.sets.forEach((s) => {
      if (s.weightKg > bestWeight) {
        bestWeight = s.weightKg;
        bestReps = s.reps;
      }
    });
  });

  const est1RM = bestWeight > 0 ? Math.round(bestWeight * (1 + bestReps / 30)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-5 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-white text-lg">{exercise.name}</h3>
            <span className="text-xs text-blue-400 font-semibold">{exercise.muscleGroup} • {exercise.equipment}</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PR Benchmark Box */}
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">All-Time Best</span>
              <span className="text-lg font-extrabold font-mono text-white">
                {bestWeight > 0 ? `${bestWeight} kg × ${bestReps}` : 'No PR logged'}
              </span>
            </div>
          </div>
          {est1RM > 0 && (
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Est. 1RM</span>
              <span className="text-sm font-extrabold font-mono text-amber-400">~{est1RM} kg</span>
            </div>
          )}
        </div>

        {/* History Log */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider px-1">
            Session Log History ({history.length})
          </h4>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-zinc-950 rounded-xl animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-2">
              {history.map((h, idx) => (
                <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1.5 text-xs">
                  <span className="text-[11px] font-mono text-zinc-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    {h.date}
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {h.sets.map((s) => (
                      <span key={s.setNumber} className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200">
                        {s.weightKg}kg × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No session logs recorded for this movement yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
