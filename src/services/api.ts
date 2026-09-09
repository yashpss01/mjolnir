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
  const data = await res.json();

  // Fallback to local storage if API has no previous data
  if ((!data.sets || data.sets.length === 0)) {
    const local = getLocalSessions();
    for (const sess of local) {
      if (sess.exercises) {
        const exMatch = sess.exercises.find((e: any) => e.exerciseId === exerciseId || e.exercise?.id === exerciseId);
        if (exMatch && exMatch.sets) {
          return {
            date: sess.startTime,
            sets: exMatch.sets.map((s: any, idx: number) => ({
              setNumber: idx + 1,
              weightKg: s.weightKg,
              reps: s.reps,
            })),
          };
        }
      }
    }
  }

  return data;
}

// LocalStorage Helper for Session Backup Protection
function getLocalSessions(): any[] {
  const saved = localStorage.getItem('mjolnir_sessions_backup');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
}

function saveLocalSession(sessionData: any) {
  const existing = getLocalSessions();
  const updated = [sessionData, ...existing.filter((s: any) => s.startTime !== sessionData.startTime)];
  localStorage.setItem('mjolnir_sessions_backup', JSON.stringify(updated));
}

export async function fetchSessions(): Promise<WorkoutSession[]> {
  const localSessions = getLocalSessions();
  try {
    const res = await fetch(`${API_BASE}/sessions`);
    if (!res.ok) throw new Error('Failed to fetch workout sessions');
    const apiSessions: WorkoutSession[] = await res.json();

    // Auto-restore local sessions to API if container restarted and wiped DB
    if (localSessions.length > apiSessions.length) {
      for (const localSess of localSessions) {
        const existsInApi = apiSessions.some((s) => s.startTime === localSess.startTime || s.id === localSess.id);
        if (!existsInApi) {
          try {
            await fetch(`${API_BASE}/sessions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localSess),
            });
          } catch (err) {}
        }
      }
      // Re-fetch after syncing
      const syncedRes = await fetch(`${API_BASE}/sessions`);
      if (syncedRes.ok) return syncedRes.json();
    }

    return apiSessions.length >= localSessions.length ? apiSessions : (localSessions as any);
  } catch (err) {
    // If backend offline, return local backup
    return localSessions as any;
  }
}

export async function deleteTemplate(templateId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/templates/${templateId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete workout template');
  return res.json();
}

export async function saveSession(sessionData: any): Promise<{ id: string }> {
  // Always save local backup first for guaranteed zero data loss
  saveLocalSession(sessionData);

  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  });
  if (!res.ok) throw new Error('Failed to save workout session');
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<any> {
  // Remove from localStorage backup
  const existing = getLocalSessions();
  const updated = existing.filter((s: any) => s.id !== sessionId);
  localStorage.setItem('mjolnir_sessions_backup', JSON.stringify(updated));

  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete workout session');
  return res.json();
}
