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
    const saved = localStorage.getItem('mjolnir_active_tab');
    if (saved && ['workout', 'history', 'exercises', 'progress', 'settings'].includes(saved)) {
      return saved as TabType;
    }
    return 'workout';
  });

  const [activeWorkoutTemplate, setActiveWorkoutTemplate] = useState<WorkoutTemplate | null>(() => {
    const saved = localStorage.getItem('mjolnir_active_workout');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {}
    }
    return null;
  });

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('mjolnir_active_tab', tab);
  };

  const handleStartWorkout = (template: WorkoutTemplate) => {
    setActiveWorkoutTemplate(template);
    localStorage.setItem('mjolnir_active_workout', JSON.stringify(template));
  };

  const handleFinishWorkout = () => {
    setActiveWorkoutTemplate(null);
    localStorage.removeItem('mjolnir_active_workout');
    handleSelectTab('history');
  };

  const handleDiscardWorkout = () => {
    setActiveWorkoutTemplate(null);
    localStorage.removeItem('mjolnir_active_workout');
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
