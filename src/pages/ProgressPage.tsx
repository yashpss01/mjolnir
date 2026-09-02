import React, { useEffect, useState } from 'react';
import { Award, Scale, Plus } from 'lucide-react';
import { WorkoutSession } from '../types';
import { fetchSessions } from '../services/api';
import { StrengthChart } from '../components/progress/StrengthChart';
import { VolumeDistribution } from '../components/progress/VolumeDistribution';

interface BodyweightLog {
  date: string;
  weightKg: number;
}

export const ProgressPage: React.FC = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Bodyweight State (Persisted in LocalStorage)
  const [inputWeight, setInputWeight] = useState<string>('');
  const [bodyweightLogs, setBodyweightLogs] = useState<BodyweightLog[]>(() => {
    const saved = localStorage.getItem('mjolnir_bodyweight_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    fetchSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddWeight = () => {
    const val = parseFloat(inputWeight);
    if (!val || val <= 0) return;

    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newEntry: BodyweightLog = { date: todayStr, weightKg: val };
    const updated = [newEntry, ...bodyweightLogs];

    setBodyweightLogs(updated);
    localStorage.setItem('mjolnir_bodyweight_logs', JSON.stringify(updated));
    setInputWeight('');
  };

  // Compute 7-day bodyweight average
  const currentWeight = bodyweightLogs[0]?.weightKg || null;
  const avgWeight = bodyweightLogs.length > 0
    ? (bodyweightLogs.slice(0, 7).reduce((acc, l) => acc + l.weightKg, 0) / Math.min(bodyweightLogs.length, 7)).toFixed(1)
    : null;

  // Extract real PRs from completed sessions
  const prList: { exercise: string; pr: string; est1RM: string }[] = [];
  sessions.forEach((s) => {
    if (s.exercises) {
      s.exercises.forEach((ex) => {
        const completedSets = ex.sets.filter((st) => st.isCompleted && st.weightKg > 0);
        if (completedSets.length > 0) {
          const bestSet = completedSets.reduce((max, curr) => (curr.weightKg > max.weightKg ? curr : max), completedSets[0]);
          const est1RM = Math.round(bestSet.weightKg * (1 + bestSet.reps / 30));
          const existing = prList.find((p) => p.exercise === ex.exercise.name);
          if (!existing) {
            prList.push({
              exercise: ex.exercise.name,
              pr: `${bestSet.weightKg} kg × ${bestSet.reps}`,
              est1RM: `${est1RM} kg`,
            });
          }
        }
      });
    }
  });

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h2 className="text-xl font-black text-white">Progress Analytics</h2>
        <p className="text-xs text-zinc-400">Track lift trajectories, muscle volume, and bodyweight trends</p>
      </div>

      {/* SVG Lift Trajectory Strength Line Chart */}
      <StrengthChart sessions={sessions} />

      {/* Muscle Group Set Volume Distribution */}
      <VolumeDistribution sessions={sessions} />

      {/* Bodyweight Tracker Box */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-blue-400" />
            Bodyweight Logging
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Current Weight</span>
            <span className="text-xl font-extrabold font-mono text-white">
              {currentWeight ? `${currentWeight} kg` : '—'}
            </span>
          </div>
          <div className="flex-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">7-Day Avg</span>
            <span className="text-xl font-extrabold font-mono text-blue-400">
              {avgWeight ? `${avgWeight} kg` : '—'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            value={inputWeight}
            onChange={(e) => setInputWeight(e.target.value)}
            className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter weight in kg (e.g. 72.5)"
          />
          <button
            onClick={handleAddWeight}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Log Weight
          </button>
        </div>

        {bodyweightLogs.length > 0 && (
          <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap gap-2 text-xs text-zinc-400 font-mono">
            {bodyweightLogs.slice(0, 5).map((l, i) => (
              <span key={i} className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800/80">
                {l.date}: {l.weightKg} kg
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Lifts Benchmark PRs */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          Strength PR Benchmarks ({prList.length})
        </h3>

        {prList.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {prList.map((item) => (
              <div key={item.exercise} className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl">
                <span className="text-xs font-bold text-zinc-200 block truncate">{item.exercise}</span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-blue-400 font-mono">{item.pr}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">1RM ~{item.est1RM}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-center text-xs text-zinc-500">
            No logged PRs yet. Complete sets during a workout to build your strength records!
          </div>
        )}
      </div>
    </div>
  );
};
