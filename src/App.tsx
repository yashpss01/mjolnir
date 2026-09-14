import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { TabType, WorkoutTemplate } from './types';
import { WorkoutPage } from './pages/WorkoutPage';
import { HistoryPage } from './pages/HistoryPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { ActiveWorkoutScreen } from './components/workout/ActiveWorkoutScreen';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const saved = localStorage.getItem('mjolnir_active_tab');
      if (saved && ['workout', 'history', 'exercises', 'progress', 'settings'].includes(saved)) {
        return saved as TabType;
      }
    } catch (e) {}
    return 'workout';
  });

  const [activeWorkoutTemplate, setActiveWorkoutTemplate] = useState<WorkoutTemplate | null>(() => {
    try {
      const saved = localStorage.getItem('mjolnir_active_workout');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.name && Array.isArray(parsed.exercises)) {
          return parsed;
        }
      }
    } catch (err) {}
    return null;
  });

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('mjolnir_active_tab', tab);
    } catch (e) {}
  };

  const handleStartWorkout = (template: WorkoutTemplate) => {
    if (!template || !Array.isArray(template.exercises)) return;
    setActiveWorkoutTemplate(template);
    try {
      localStorage.setItem('mjolnir_active_workout', JSON.stringify(template));
    } catch (e) {}
  };

  const handleFinishWorkout = () => {
    setActiveWorkoutTemplate(null);
    try {
      localStorage.removeItem('mjolnir_active_workout');
    } catch (e) {}
    handleSelectTab('history');
  };

  const handleDiscardWorkout = () => {
    setActiveWorkoutTemplate(null);
    try {
      localStorage.removeItem('mjolnir_active_workout');
    } catch (e) {}
  };

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      isWorkoutActive={Boolean(activeWorkoutTemplate)}
      activeWorkoutName={activeWorkoutTemplate?.name}
      onReturnToWorkout={() => handleSelectTab('workout')}
    >
      {/* If a workout is currently active and user is on the Workout tab, render ActiveWorkoutScreen */}
      {activeTab === 'workout' && activeWorkoutTemplate ? (
        <ActiveWorkoutScreen
          template={activeWorkoutTemplate}
          onFinishWorkout={handleFinishWorkout}
          onDiscardWorkout={handleDiscardWorkout}
        />
      ) : (
        <>
          {activeTab === 'workout' && <WorkoutPage onStartWorkout={handleStartWorkout} />}
          {activeTab === 'history' && <HistoryPage />}
          {activeTab === 'exercises' && <ExercisesPage />}
          {activeTab === 'progress' && <ProgressPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </>
      )}
    </AppShell>
  );
}

export default App;
