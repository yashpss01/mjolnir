import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Dumbbell, Trophy, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { WorkoutSession } from '../types';
import { fetchSessions, deleteSession } from '../services/api';

export const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${name}" from your history?`)) return;

    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete workout log.');
    }
  };

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-xl font-black text-white">Workout History</h2>
        <p className="text-xs text-zinc-400">Review logged training sessions and performance history</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((item) => {
            const isExpanded = expandedSessionId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setExpandedSessionId(isExpanded ? null : item.id)}
                className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    {formatDate(item.startTime)}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.prCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {item.prCount} PR{item.prCount > 1 ? 's' : ''}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteSession(e, item.id, item.name)}
                      title="Delete workout log"
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-zinc-100 text-base">{item.name}</h3>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Time</span>
                    <span className="font-mono font-medium text-zinc-200 flex items-center justify-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {formatTime(item.durationSeconds)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Sets</span>
                    <span className="font-mono font-medium text-zinc-200 flex items-center justify-center gap-1 mt-0.5">
                      <Dumbbell className="w-3 h-3 text-zinc-500" />
                      {item.totalSets}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Volume</span>
                    <span className="font-mono font-bold text-blue-400 mt-0.5 block">
                      {item.totalVolumeKg.toLocaleString()} kg
                    </span>
                  </div>
                </div>

                {/* Expanded Exercises Breakdown */}
                {isExpanded && item.exercises && (
                  <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                    <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Logged Exercises
                    </span>
                    <div className="space-y-1.5">
                      {item.exercises.map((ex) => (
                        <div key={ex.id} className="p-2 bg-zinc-950 rounded-xl border border-zinc-800/50 text-xs">
                          <span className="font-bold text-zinc-200 block">{ex.exercise.name}</span>
                          <div className="flex flex-wrap gap-1.5 mt-1 text-zinc-400 font-mono text-[11px]">
                            {ex.sets.map((s) => (
                              <span key={s.id} className={`px-1.5 py-0.5 rounded ${s.isCompleted ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-zinc-900 text-zinc-500'}`}>
                                {s.weightKg}kg × {s.reps}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {sessions.length === 0 && (
            <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 space-y-2">
              <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-300">No Logged Sessions Yet</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Go to the Workout tab and tap "Start Workout" to log your first training session!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
