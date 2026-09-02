import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, Dumbbell } from 'lucide-react';
import { Exercise, MuscleGroup } from '../types';
import { fetchExercises, createCustomExercise } from '../services/api';

export const ExercisesPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New exercise form state
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('Chest');
  const [newEquipment, setNewEquipment] = useState('Dumbbell');

  const muscleGroups = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];

  const loadData = () => {
    setLoading(true);
    fetchExercises({
      muscle: selectedMuscle !== 'All' ? selectedMuscle : undefined,
      search: search || undefined,
    })
      .then(setExercises)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedMuscle, search]);

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createCustomExercise({
        name: newName,
        muscleGroup: newMuscle,
        equipment: newEquipment as any,
      });
      setShowAddModal(false);
      setNewName('');
      loadData();
    } catch (err) {
      alert('Failed to add custom exercise');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Search & Add CTA */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-white">Exercise Library</h2>
          <p className="text-xs text-zinc-400">Search movement database or add custom movements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl shadow-md flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bench press, squat, curl..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Muscle Filter Pill Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {muscleGroups.map((mg) => {
          const isActive = selectedMuscle === mg;
          return (
            <button
              key={mg}
              onClick={() => setSelectedMuscle(mg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {mg}
            </button>
          );
        })}
      </div>

      {/* Exercise List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-zinc-100">{ex.name}</h4>
                  {ex.isCustom && (
                    <span className="text-[9px] font-semibold bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                  <span className="text-blue-400 font-medium">{ex.muscleGroup}</span>
                  <span>•</span>
                  <span>{ex.equipment}</span>
                  {ex.defaultRepMin && ex.defaultRepMax && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-zinc-500">{ex.defaultRepMin}–{ex.defaultRepMax} reps</span>
                    </>
                  )}
                </div>
              </div>
              <Dumbbell className="w-4 h-4 text-zinc-600" />
            </div>
          ))}
          {exercises.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No exercises match your search criteria.
            </div>
          )}
        </div>
      )}

      {/* Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="text-lg font-bold text-white">Create Custom Exercise</h3>
            <form onSubmit={handleCreateExercise} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Exercise Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Pendlay Row"
                  required
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Primary Muscle Group</label>
                <select
                  value={newMuscle}
                  onChange={(e) => setNewMuscle(e.target.value as MuscleGroup)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Equipment</label>
                <select
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Smith Machine', 'EZ Bar', 'Other'].map((eq) => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
