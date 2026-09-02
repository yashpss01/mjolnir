import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, Dumbbell, Save } from 'lucide-react';
import { WorkoutTemplate, Exercise } from '../../types';
import { fetchExercises, saveTemplate } from '../../services/api';

interface TemplateEditorModalProps {
  template?: WorkoutTemplate | null; // null if creating new
  onClose: () => void;
  onSaved: () => void;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  template,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState(template?.name || '');
  const [targetDay, setTargetDay] = useState(template?.targetDay || 'Monday');
  const [notes, setNotes] = useState(template?.notes || '');
  const [exercises, setExercises] = useState<
    {
      exerciseId: string;
      exerciseName: string;
      targetSets: number;
      targetRepMin: number;
      targetRepMax: number;
      restSeconds: number;
    }[]
  >(
    template?.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      exerciseName: e.exercise?.name || 'Exercise',
      targetSets: e.targetSets || 3,
      targetRepMin: e.targetRepMin || 6,
      targetRepMax: e.targetRepMax || 10,
      restSeconds: e.restSeconds || 90,
    })) || []
  );

  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExercises().then(setAvailableExercises).catch(console.error);
  }, []);

  const handleAddExerciseToTemplate = (ex: Exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetSets: 3,
        targetRepMin: ex.defaultRepMin || 6,
        targetRepMax: ex.defaultRepMax || 10,
        restSeconds: 90,
      },
    ]);
    setShowPicker(false);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await saveTemplate({
        id: template?.id,
        name,
        targetDay: targetDay as any,
        notes,
        exercises: exercises as any,
      });
      onSaved();
    } catch (err) {
      alert('Failed to save workout template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-5 space-y-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-lg">
            {template ? 'Edit Workout Template' : 'Create Workout Template'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Template Name Input */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Routine Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Upper Strength"
              required
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Target Day Input */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Target Day</label>
            <select
              value={targetDay}
              onChange={(e) => setTargetDay(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Flexible'].map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Exercises List in Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-400">Exercises ({exercises.length})</label>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="text-xs text-blue-400 font-bold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Exercise
              </button>
            </div>

            <div className="space-y-2">
              {exercises.map((ex, idx) => (
                <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-100">{ex.exerciseName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block">Sets</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={ex.targetSets}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 1;
                          setExercises((prev) => {
                            const u = [...prev];
                            u[idx].targetSets = val;
                            return u;
                          });
                        }}
                        className="w-full py-1 px-2 bg-zinc-900 border border-zinc-800 rounded font-mono text-center text-white"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block">Reps</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={ex.targetRepMin}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 1;
                            setExercises((prev) => {
                              const u = [...prev];
                              u[idx].targetRepMin = val;
                              return u;
                            });
                          }}
                          className="w-full py-1 px-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-center text-white text-xs"
                        />
                        <span className="text-zinc-500">-</span>
                        <input
                          type="number"
                          value={ex.targetRepMax}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 1;
                            setExercises((prev) => {
                              const u = [...prev];
                              u[idx].targetRepMax = val;
                              return u;
                            });
                          }}
                          className="w-full py-1 px-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-center text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block">Rest (sec)</span>
                      <input
                        type="number"
                        step="15"
                        value={ex.restSeconds}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 60;
                          setExercises((prev) => {
                            const u = [...prev];
                            u[idx].restSeconds = val;
                            return u;
                          });
                        }}
                        className="w-full py-1 px-2 bg-zinc-900 border border-zinc-800 rounded font-mono text-center text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>

        {/* Inner Exercise Selector Overlay */}
        {showPicker && (
          <div className="absolute inset-0 bg-zinc-900 rounded-3xl p-4 flex flex-col space-y-3 z-20">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Select Exercise</h4>
              <button onClick={() => setShowPicker(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
            />
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {availableExercises
                .filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => handleAddExerciseToTemplate(e)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-left font-bold text-xs text-zinc-200 hover:bg-zinc-800 flex justify-between items-center"
                  >
                    <span>{e.name}</span>
                    <span className="text-zinc-500 font-normal">{e.muscleGroup}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
