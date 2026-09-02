import React, { useEffect, useState } from 'react';
import { Check, Plus, Trash2, Clock, Dumbbell, X, Trophy, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react';
import { calculateProgression } from '../../utils/progression';
import { WorkoutTemplate, Exercise, ExerciseSet } from '../../types';
import { fetchPreviousPerformance, fetchExercises, saveSession } from '../../services/api';
import { RestTimerBar } from './RestTimerBar';
import { WorkoutSummaryModal } from './WorkoutSummaryModal';

interface ActiveWorkoutExercise {
  exercise: Exercise;
  restSeconds: number;
  notes: string;
  previousSets?: { weightKg: number; reps: number }[];
  sets: {
    id: string;
    setNumber: number;
    weightKg: number;
    reps: number;
    isCompleted: boolean;
    previousPerformance?: string;
  }[];
}

interface ActiveWorkoutScreenProps {
  template: WorkoutTemplate;
  onFinishWorkout: () => void;
  onDiscardWorkout: () => void;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  template,
  onFinishWorkout,
  onDiscardWorkout,
}) => {
  const [startTime] = useState<string>(() => new Date().toISOString());
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [exercises, setExercises] = useState<ActiveWorkoutExercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [currentRestExercise, setCurrentRestExercise] = useState<string>('');

  // Exercise Picker Modal State
  const [showExercisePicker, setShowExercisePicker] = useState<boolean>(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Summary Modal State
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  // 1. Live Workout Stopwatch
  useEffect(() => {
    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Initialize Active Exercises & Load Previous Performance
  useEffect(() => {
    let isMounted = true;

    async function initWorkout() {
      setLoading(true);
      const activeExList: ActiveWorkoutExercise[] = [];

      for (const tplEx of template.exercises) {
        if (!tplEx.exercise) continue;

        let prevSets: { weightKg: number; reps: number }[] = [];
        try {
          const prevData = await fetchPreviousPerformance(tplEx.exerciseId);
          prevSets = prevData.sets || [];
        } catch (err) {
          console.error('Failed to load previous performance', err);
        }

        const setsCount = tplEx.targetSets || 3;
        const setsArr = Array.from({ length: setsCount }, (_, i) => {
          const prevSet = prevSets[i];
          const prevStr = prevSet ? `${prevSet.weightKg} × ${prevSet.reps}` : '—';
          return {
            id: `set-${tplEx.exerciseId}-${i}-${Date.now()}`,
            setNumber: i + 1,
            weightKg: prevSet ? prevSet.weightKg : 0,
            reps: tplEx.targetRepMax || 10,
            isCompleted: false,
            previousPerformance: prevStr,
          };
        });

        activeExList.push({
          exercise: tplEx.exercise,
          restSeconds: tplEx.restSeconds || 90,
          notes: '',
          previousSets: prevSets,
          sets: setsArr,
        });
      }

      if (isMounted) {
        setExercises(activeExList);
        setLoading(false);
      }
    }

    initWorkout();
    return () => {
      isMounted = false;
    };
  }, [template]);

  // Handle Set Field Changes
  const handleSetChange = (exIndex: number, setIndex: number, field: 'weightKg' | 'reps', value: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const targetSet = { ...updated[exIndex].sets[setIndex], [field]: Math.max(0, value) };
      updated[exIndex].sets[setIndex] = targetSet;
      return updated;
    });
  };

  // Toggle Set Complete & Trigger Rest Timer
  const handleToggleComplete = (exIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const targetSet = updated[exIndex].sets[setIndex];
      const isNowCompleted = !targetSet.isCompleted;
      targetSet.isCompleted = isNowCompleted;

      if (isNowCompleted) {
        // Auto-start rest timer
        setRestTimerSeconds(updated[exIndex].restSeconds || 90);
        setCurrentRestExercise(updated[exIndex].exercise.name);
      }

      return updated;
    });
  };

  // Add Set to Exercise
  const handleAddSet = (exIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = updated[exIndex];
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSetNum = ex.sets.length + 1;
      const prevSet = ex.previousSets?.[newSetNum - 1];

      ex.sets.push({
        id: `set-${ex.exercise.id}-${newSetNum}-${Date.now()}`,
        setNumber: newSetNum,
        weightKg: lastSet ? lastSet.weightKg : (prevSet ? prevSet.weightKg : 0),
        reps: lastSet ? lastSet.reps : 10,
        isCompleted: false,
        previousPerformance: prevSet ? `${prevSet.weightKg} × ${prevSet.reps}` : '—',
      });
      return updated;
    });
  };

  // Remove Set from Exercise
  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = updated[exIndex];
      if (ex.sets.length <= 1) return prev; // Keep at least 1 set
      ex.sets.splice(setIndex, 1);
      // Re-number sets
      ex.sets.forEach((s, idx) => {
        s.setNumber = idx + 1;
      });
      return updated;
    });
  };

  // Add Exercise Modal Launcher
  const handleOpenExercisePicker = async () => {
    try {
      const list = await fetchExercises();
      setAvailableExercises(list);
      setShowExercisePicker(true);
    } catch (err) {
      alert('Failed to load exercises');
    }
  };

  const handleSelectAdditionalExercise = async (ex: Exercise) => {
    setShowExercisePicker(false);
    let prevSets: { weightKg: number; reps: number }[] = [];
    try {
      const prevData = await fetchPreviousPerformance(ex.id);
      prevSets = prevData.sets || [];
    } catch (err) {}

    const newEx: ActiveWorkoutExercise = {
      exercise: ex,
      restSeconds: 90,
      notes: '',
      previousSets: prevSets,
      sets: Array.from({ length: 3 }, (_, i) => {
        const p = prevSets[i];
        return {
          id: `set-${ex.id}-${i}-${Date.now()}`,
          setNumber: i + 1,
          weightKg: p ? p.weightKg : 0,
          reps: ex.defaultRepMax || 10,
          isCompleted: false,
          previousPerformance: p ? `${p.weightKg} × ${p.reps}` : '—',
        };
      }),
    };

    setExercises((prev) => [...prev, newEx]);
  };

  // Finish Workout Action
  const handleFinishWorkoutClick = async () => {
    let totalSetsLogged = 0;
    let totalVolume = 0;
    let prCount = 0;

    const formattedExercises = exercises.map((exItem) => {
      const completedSets = exItem.sets.filter((s) => s.isCompleted);
      totalSetsLogged += completedSets.length;

      completedSets.forEach((s) => {
        totalVolume += s.weightKg * s.reps;
        if (exItem.previousSets && exItem.previousSets.length > 0) {
          const maxPrevWeight = Math.max(...exItem.previousSets.map((p) => p.weightKg));
          if (s.weightKg > maxPrevWeight) {
            prCount++;
          }
        }
      });

      return {
        exerciseId: exItem.exercise.id,
        notes: exItem.notes,
        sets: exItem.sets.map((s) => ({
          weightKg: s.weightKg,
          reps: s.reps,
          isCompleted: s.isCompleted,
        })),
      };
    });

    const payload = {
      templateId: template.id,
      name: template.name,
      startTime,
      endTime: new Date().toISOString(),
      durationSeconds,
      totalVolumeKg: Math.round(totalVolume),
      totalSets: totalSetsLogged,
      prCount,
      exercises: formattedExercises,
    };

    try {
      await saveSession(payload);
      setSummaryData({
        name: template.name,
        durationSeconds,
        totalExercises: exercises.length,
        totalSets: totalSetsLogged,
        totalVolumeKg: Math.round(totalVolume),
        prCount,
      });
      setShowSummary(true);
    } catch (err) {
      alert('Failed to save workout session');
    }
  };

  const formatStopwatch = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(remM).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(remM).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Active Workout Sticky Header Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 sticky top-14 z-30 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">Active Workout</span>
            <h2 className="text-lg font-black text-white leading-snug">{template.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Discard current workout session?')) onDiscardWorkout();
              }}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 text-xs font-bold rounded-xl transition"
            >
              Discard
            </button>
            <button
              onClick={handleFinishWorkoutClick}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              Finish
            </button>
          </div>
        </div>

        {/* Stopwatch & Metrics Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs font-mono">
          <span className="text-zinc-300 font-extrabold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            {formatStopwatch(durationSeconds)}
          </span>
          <span className="text-zinc-400">
            {exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length, 0)} sets logged
          </span>
        </div>
      </div>

      {/* Exercises List & Set Tables */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {exercises.map((exItem, exIdx) => (
            <div key={exItem.exercise.id} className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-4 space-y-3">
              {/* Exercise Title Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">{exItem.exercise.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span className="text-blue-400 font-semibold">{exItem.exercise.muscleGroup}</span>
                    <span>•</span>
                    <span>{exItem.exercise.equipment}</span>
                  </div>
                </div>
              </div>

              {/* Previous Performance & Progression Overload Recommendation */}
              {exItem.previousSets && exItem.previousSets.length > 0 && (
                <div className="bg-zinc-950/80 border border-zinc-800/60 p-3 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Last Session</span>
                    {(() => {
                      const rec = calculateProgression(10, exItem.previousSets);
                      if (!rec) return null;
                      return rec.shouldIncrease ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          ↑ Try {rec.recommendedWeightKg} kg next
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Goal: {rec.recommendedWeightKg} kg
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex flex-wrap gap-2 text-zinc-300 font-mono text-[11px]">
                    {exItem.previousSets.map((ps, idx) => (
                      <span key={idx} className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        Set {idx + 1}: {ps.weightKg} kg × {ps.reps}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Set Logging Table Grid */}
              <div className="space-y-1.5 pt-1">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center px-1">
                  <span className="col-span-2 text-left">Set</span>
                  <span className="col-span-3">Previous</span>
                  <span className="col-span-3">Kg</span>
                  <span className="col-span-3">Reps</span>
                  <span className="col-span-1">✓</span>
                </div>

                {/* Table Rows */}
                {exItem.sets.map((set, setIdx) => {
                  const isDone = set.isCompleted;

                  return (
                    <div
                      key={set.id}
                      className={`grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                          : 'bg-zinc-950 border-zinc-800/80 text-zinc-200'
                      }`}
                    >
                      {/* Set Number */}
                      <span className="col-span-2 font-mono font-bold text-xs pl-1">
                        {set.setNumber}
                      </span>

                      {/* Previous Performance */}
                      <span className="col-span-3 text-[11px] font-mono text-zinc-400 text-center truncate">
                        {set.previousPerformance}
                      </span>

                      {/* Weight Input */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.5"
                          value={set.weightKg === 0 ? '' : set.weightKg}
                          onChange={(e) => handleSetChange(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full py-1.5 px-2 bg-zinc-900 border border-zinc-700/80 rounded-lg font-mono text-sm text-center text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Reps Input */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={set.reps === 0 ? '' : set.reps}
                          onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)}
                          placeholder="0"
                          className="w-full py-1.5 px-2 bg-zinc-900 border border-zinc-700/80 rounded-lg font-mono text-sm text-center text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Large Checkmark Touch Target */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => handleToggleComplete(exIdx, setIdx)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-90 ${
                            isDone
                              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          <Check className={`w-5 h-5 ${isDone ? 'stroke-[3px]' : 'stroke-[2px]'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Set Actions: Add Set & Remove Set */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => handleAddSet(exIdx)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Set
                </button>
                {exItem.sets.length > 1 && (
                  <button
                    onClick={() => handleRemoveSet(exIdx, exItem.sets.length - 1)}
                    className="text-zinc-500 hover:text-red-400 text-xs font-medium p-1 transition"
                  >
                    Delete Set
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Exercise CTA */}
          <button
            onClick={handleOpenExercisePicker}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 text-zinc-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            Add Exercise To Workout
          </button>
        </div>
      )}

      {/* Floating Rest Timer Bar */}
      {restTimerSeconds > 0 && (
        <RestTimerBar
          secondsRemaining={restTimerSeconds}
          exerciseName={currentRestExercise}
          onTimerTick={(s) => setRestTimerSeconds(s)}
          onAdd30Seconds={() => setRestTimerSeconds((prev) => prev + 30)}
          onSkip={() => setRestTimerSeconds(0)}
        />
      )}

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-4 max-h-[80vh] flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Select Exercise</h3>
              <button onClick={() => setShowExercisePicker(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {availableExercises
                .filter((ex) => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleSelectAdditionalExercise(ex)}
                    className="w-full p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl text-left flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-sm text-zinc-100 block">{ex.name}</span>
                      <span className="text-xs text-zinc-400">{ex.muscleGroup} • {ex.equipment}</span>
                    </div>
                    <Plus className="w-4 h-4 text-blue-400" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Workout Summary Modal */}
      {showSummary && summaryData && (
        <WorkoutSummaryModal
          name={summaryData.name}
          durationSeconds={summaryData.durationSeconds}
          totalExercises={summaryData.totalExercises}
          totalSets={summaryData.totalSets}
          totalVolumeKg={summaryData.totalVolumeKg}
          prCount={summaryData.prCount}
          onFinish={onFinishWorkout}
        />
      )}
    </div>
  );
};
