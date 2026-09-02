import React, { useState } from 'react';
import { TrendingUp, Award, Calendar, Scale, Plus } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const [bodyweight, setBodyweight] = useState('72.4');
  const [entries, setEntries] = useState([
    { date: 'Today, Sep 2', weight: 72.4 },
    { date: 'Sep 1', weight: 72.3 },
    { date: 'Aug 31', weight: 72.1 },
    { date: 'Aug 30', weight: 71.9 },
  ]);

  const handleAddWeight = () => {
    const val = parseFloat(bodyweight);
    if (!val) return;
    setEntries([{ date: 'Just Now', weight: val }, ...entries]);
  };

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h2 className="text-xl font-black text-white">Progress Analytics</h2>
        <p className="text-xs text-zinc-400">Track key strength PRs, training volume, and bodyweight trends</p>
      </div>

      {/* Bodyweight Tracker Box */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-blue-400" />
            Bodyweight Logging
          </span>
          <span className="text-xs text-emerald-400 font-medium">↑ 0.2 kg / week trend</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Current Weight</span>
            <span className="text-xl font-extrabold font-mono text-white">72.4 kg</span>
          </div>
          <div className="flex-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">7-Day Avg</span>
            <span className="text-xl font-extrabold font-mono text-blue-400">72.1 kg</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-blue-500"
            placeholder="72.5 kg"
          />
          <button
            onClick={handleAddWeight}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Log Weight
          </button>
        </div>
      </div>

      {/* Main Lifts Benchmark PRs */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          Strength PR Benchmarks
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {[
            { exercise: 'Bench Press', pr: '65 kg × 6', est1RM: '76 kg' },
            { exercise: 'Squat', pr: '100 kg × 5', est1RM: '115 kg' },
            { exercise: 'Romanian Deadlift', pr: '90 kg × 8', est1RM: '111 kg' },
            { exercise: 'Lat Pulldown', pr: '65 kg × 8', est1RM: '80 kg' },
          ].map((item) => (
            <div key={item.exercise} className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl">
              <span className="text-xs font-bold text-zinc-200 block truncate">{item.exercise}</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-sm font-extrabold text-blue-400 font-mono">{item.pr}</span>
                <span className="text-[10px] text-zinc-500 font-mono">1RM ~{item.est1RM}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Training Volume Summary */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Weekly Volume
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/50">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Workouts</span>
            <span className="text-lg font-bold font-mono text-white">4 / 5</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/50">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Total Sets</span>
            <span className="text-lg font-bold font-mono text-white">88</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/50">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Volume</span>
            <span className="text-lg font-bold font-mono text-blue-400">33.4k kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};
