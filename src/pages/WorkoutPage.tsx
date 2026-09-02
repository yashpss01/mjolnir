import React, { useEffect, useState } from 'react';
import { Play, Calendar, Dumbbell, Clock, ChevronRight, Edit2, Plus } from 'lucide-react';
import { WorkoutTemplate } from '../types';
import { fetchTemplates } from '../services/api';
import { TemplateEditorModal } from '../components/templates/TemplateEditorModal';

interface WorkoutPageProps {
  onStartWorkout: (template: WorkoutTemplate) => void;
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({ onStartWorkout }) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  // Editor Modal State
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const loadData = () => {
    setLoading(true);
    fetchTemplates()
      .then((data) => {
        setTemplates(data);
        const todayMatch = data.find((t) => t.targetDay.toLowerCase() === todayName.toLowerCase());
        setSelectedTemplate(todayMatch || data[0] || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [todayName]);

  const handleEditClick = (e: React.MouseEvent, tpl: WorkoutTemplate) => {
    e.stopPropagation();
    setEditingTemplate(tpl);
    setShowEditor(true);
  };

  const handleCreateNewClick = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  return (
    <div className="space-y-6">
      {/* Today Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayName} — Recommended</span>
          </div>
          {selectedTemplate && (
            <button
              onClick={(e) => handleEditClick(e, selectedTemplate)}
              className="text-zinc-500 hover:text-zinc-300 p-1 transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {selectedTemplate ? selectedTemplate.name : 'No Routine Selected'}
          </h2>
          {selectedTemplate && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
              {selectedTemplate.notes || `${selectedTemplate.exercises.length} exercises scheduled.`}
            </p>
          )}
        </div>

        {/* Big Touch Action START WORKOUT Button */}
        {selectedTemplate && (
          <button
            onClick={() => onStartWorkout(selectedTemplate)}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold rounded-2xl shadow-lg shadow-blue-950/40 flex items-center justify-center gap-3 transition-all duration-150"
          >
            <Play className="w-5 h-5 fill-current" />
            <span className="text-sm uppercase tracking-wider">Start Workout</span>
          </button>
        )}
      </div>

      {/* Routine Templates List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            Weekly Program Templates ({templates.length})
          </h3>
          <button
            onClick={handleCreateNewClick}
            className="text-xs text-blue-400 font-bold flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            New Routine
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              const isToday = template.targetDay.toLowerCase() === todayName.toLowerCase();

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-blue-500/80 shadow-lg'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          isToday
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {template.targetDay} {isToday && '• Today'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-zinc-100 text-base mt-1.5">{template.name}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleEditClick(e, template)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-200 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Exercises Summary Pill list */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {template.exercises.map((e) => (
                      <span key={e.id} className="text-[11px] bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800/60 text-zinc-300">
                        {e.exercise?.name || 'Exercise'}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 mt-3 border-t border-zinc-800/50">
                    <span className="flex items-center gap-1 text-zinc-400 font-medium">
                      <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
                      {template.exercises.length} Exercises
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartWorkout(template);
                      }}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                    >
                      <span>Start</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      {showEditor && (
        <TemplateEditorModal
          template={editingTemplate}
          onClose={() => setShowEditor(false)}
          onSaved={() => {
            setShowEditor(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};
