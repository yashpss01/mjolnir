import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { WorkoutSession } from '../../types';

interface StrengthChartProps {
  sessions: WorkoutSession[];
}

export const StrengthChart: React.FC<StrengthChartProps> = ({ sessions }) => {
  // Collect all unique exercise names from logged sessions
  const exerciseNames: string[] = [];
  const exerciseDataMap: Record<string, { date: string; weightKg: number; reps: number; est1RM: number }[]> = {};

  sessions.forEach((s) => {
    const dateStr = new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (s.exercises) {
      s.exercises.forEach((ex) => {
        const name = ex.exercise.name;
        const completed = ex.sets.filter((st) => st.isCompleted && st.weightKg > 0);
        if (completed.length > 0) {
          const maxSet = completed.reduce((max, curr) => (curr.weightKg > max.weightKg ? curr : max), completed[0]);
          const est1RM = Math.round(maxSet.weightKg * (1 + maxSet.reps / 30));

          if (!exerciseNames.includes(name)) {
            exerciseNames.push(name);
            exerciseDataMap[name] = [];
          }
          exerciseDataMap[name].push({
            date: dateStr,
            weightKg: maxSet.weightKg,
            reps: maxSet.reps,
            est1RM,
          });
        }
      });
    }
  });

  const [selectedExercise, setSelectedExercise] = useState<string>(exerciseNames[0] || 'Bench Press');

  const history = exerciseDataMap[selectedExercise] || [];
  const points = history.reverse(); // chronological order

  if (points.length === 0) {
    return (
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3 text-center py-8">
        <TrendingUp className="w-8 h-8 text-zinc-600 mx-auto" />
        <h4 className="text-xs font-bold text-zinc-400">No Lift History Yet</h4>
        <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
          Complete sets in your workouts to see your strength progression charts over time.
        </p>
      </div>
    );
  }

  // Calculate SVG Chart Dimensions
  const chartHeight = 140;
  const chartWidth = 320;
  const padding = 24;

  const weights = points.map((p) => p.weightKg);
  const minWeight = Math.max(0, Math.min(...weights) - 5);
  const maxWeight = Math.max(...weights) + 5;
  const weightRange = maxWeight - minWeight || 1;

  const getX = (index: number) => {
    if (points.length === 1) return chartWidth / 2;
    return padding + (index / (points.length - 1)) * (chartWidth - padding * 2);
  };

  const getY = (weight: number) => {
    return chartHeight - padding - ((weight - minWeight) / weightRange) * (chartHeight - padding * 2);
  };

  // Generate SVG path string
  const pathD = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.weightKg)}`)
    .join(' ');

  // Gradient fill path
  const areaD = points.length > 1
    ? `${pathD} L ${getX(points.length - 1)} ${chartHeight - padding} L ${getX(0)} ${chartHeight - padding} Z`
    : '';

  const latest = points[points.length - 1];
  const first = points[0];
  const diff = latest.weightKg - first.weightKg;

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span>Strength Trajectory</span>
        </div>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-xs font-bold text-blue-400 px-2.5 py-1 rounded-xl focus:outline-none focus:border-blue-500"
        >
          {exerciseNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="text-2xl font-black font-mono text-white tracking-tight">{latest.weightKg} kg</span>
          <span className="text-xs text-zinc-500 font-mono ml-2">({latest.reps} reps • 1RM ~{latest.est1RM}kg)</span>
        </div>
        {diff !== 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${
            diff > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {diff > 0 ? `↑ +${diff} kg` : `${diff} kg`}
          </span>
        )}
      </div>

      {/* SVG Chart Render */}
      <div className="relative pt-2">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#27272a" strokeDasharray="3 3" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#27272a" strokeDasharray="3 3" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#27272a" strokeWidth="1" />

          {/* Area Fill */}
          {points.length > 1 && (
            <path d={areaD} fill="url(#chartGradient)" />
          )}

          {/* Line Path */}
          {points.length > 1 && (
            <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Data Points */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p.weightKg);
            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="5" fill="#3b82f6" stroke="#09090b" strokeWidth="2" />
                <text x={cx} y={chartHeight - 6} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">
                  {p.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
