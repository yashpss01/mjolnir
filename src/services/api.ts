import { Exercise, WorkoutTemplate, WorkoutSession } from '../types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchExercises(params?: { muscle?: string; equipment?: string; search?: string }): Promise<Exercise[]> {
  const query = new URLSearchParams();
  if (params?.muscle) query.set('muscle', params.muscle);
  if (params?.equipment) query.set('equipment', params.equipment);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${API_BASE}/exercises?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch exercises');
  return res.json();
}

export async function createCustomExercise(data: Partial<Exercise>): Promise<Exercise> {
  const res = await fetch(`${API_BASE}/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create exercise');
  return res.json();
}

export async function fetchTemplates(): Promise<WorkoutTemplate[]> {
  const res = await fetch(`${API_BASE}/templates`);
  if (!res.ok) throw new Error('Failed to fetch workout templates');
  return res.json();
}

export async function saveTemplate(data: Partial<WorkoutTemplate>): Promise<any> {
  const isEdit = Boolean(data.id);
  const url = isEdit ? `${API_BASE}/templates/${data.id}` : `${API_BASE}/templates`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save workout template');
  return res.json();
}

export async function fetchPreviousPerformance(exerciseId: string): Promise<{ date?: string; sets: { setNumber: number; weightKg: number; reps: number }[] }> {
  const res = await fetch(`${API_BASE}/sessions/previous/${exerciseId}`);
  if (!res.ok) return { sets: [] };
  return res.json();
}

export async function fetchSessions(): Promise<WorkoutSession[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error('Failed to fetch workout sessions');
  return res.json();
}

export async function saveSession(sessionData: any): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  });
  if (!res.ok) throw new Error('Failed to save workout session');
  return res.json();
}
