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

export async function deleteTemplate(templateId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/templates/${templateId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete workout template');
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

function getDeletedSessionKeys(): Set<string> {
  const saved = localStorage.getItem('mjolnir_deleted_sessions');
  if (saved) {
    try { return new Set(JSON.parse(saved)); } catch (e) {}
  }
  return new Set();
}

function markSessionAsDeleted(sessionId?: string, startTime?: string) {
  const deletedKeys = getDeletedSessionKeys();
  if (sessionId) deletedKeys.add(sessionId);
  if (startTime) deletedKeys.add(startTime);
  localStorage.setItem('mjolnir_deleted_sessions', JSON.stringify(Array.from(deletedKeys)));

  // Clean local backup
  const existing = getLocalSessions();
  const updated = existing.filter((s: any) => s.id !== sessionId && s.startTime !== startTime);
  localStorage.setItem('mjolnir_sessions_backup', JSON.stringify(updated));
}

function saveLocalSession(sessionData: any) {
  const existing = getLocalSessions();
  const updated = [sessionData, ...existing.filter((s: any) => s.startTime !== sessionData.startTime && (s.id ? s.id !== sessionData.id : true))];
  localStorage.setItem('mjolnir_sessions_backup', JSON.stringify(updated));
}

export async function fetchSessions(): Promise<WorkoutSession[]> {
  const deletedKeys = getDeletedSessionKeys();
  const rawLocalSessions = getLocalSessions();
  const localSessions = rawLocalSessions.filter((s: any) => !deletedKeys.has(s.id) && !deletedKeys.has(s.startTime));

  try {
    const res = await fetch(`${API_BASE}/sessions`);
    if (!res.ok) throw new Error('Failed to fetch workout sessions');
    const apiSessions: WorkoutSession[] = await res.json();

    // Filter out any API sessions that were marked deleted locally
    const filteredApiSessions = apiSessions.filter((s) => !deletedKeys.has(s.id) && !deletedKeys.has(s.startTime));

    // Auto-restore valid local sessions to API only if container restarted and wiped DB
    if (localSessions.length > filteredApiSessions.length) {
      for (const localSess of localSessions) {
        const existsInApi = filteredApiSessions.some((s) => s.startTime === localSess.startTime || s.id === localSess.id);
        if (!existsInApi && !deletedKeys.has(localSess.id) && !deletedKeys.has(localSess.startTime)) {
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
      if (syncedRes.ok) {
        const reFetched: WorkoutSession[] = await syncedRes.json();
        return reFetched.filter((s) => !deletedKeys.has(s.id) && !deletedKeys.has(s.startTime));
      }
    }

    return filteredApiSessions;
  } catch (err) {
    // If backend offline, return valid local backup
    return localSessions as any;
  }
}

export async function saveSession(sessionData: any): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  });
  if (!res.ok) throw new Error('Failed to save workout session');
  const result = await res.json();

  // Save local backup with actual returned session ID
  saveLocalSession({ ...sessionData, id: result.id });
  return result;
}

export async function deleteSession(sessionId: string, startTime?: string): Promise<any> {
  // Mark deleted locally first so auto-sync never re-posts it
  markSessionAsDeleted(sessionId, startTime);

  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete workout session');
  return res.json();
}
