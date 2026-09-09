import { Router } from 'express';
import { db } from '../db/index.js';
import { supabase, isSupabaseConfigured } from '../db/supabase.js';

const router = Router();

// GET /api/sessions — Fetch workout history
router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const sb = supabase;
      const { data: sessions, error: sessErr } = await sb
        .from('workout_sessions')
        .select(`
          *,
          workout_session_exercises (
            id,
            session_id,
            exercise_id,
            order_index,
            notes,
            exercises ( id, name, muscle_group, equipment ),
            exercise_sets ( id, session_exercise_id, set_number, weight_kg, reps, is_completed, rpe, rest_seconds_taken )
          )
        `)
        .order('start_time', { ascending: false });

      if (sessErr) throw sessErr;

      const result = (sessions || []).map((sess: any) => {
        const sortedExercises = (sess.workout_session_exercises || []).sort((a: any, b: any) => a.order_index - b.order_index);

        const exercisesWithSets = sortedExercises.map((se: any) => {
          const sortedSets = (se.exercise_sets || []).sort((a: any, b: any) => a.set_number - b.set_number);
          return {
            id: se.id,
            sessionId: se.session_id,
            exerciseId: se.exercise_id,
            orderIndex: se.order_index,
            notes: se.notes,
            exercise: {
              id: se.exercise_id,
              name: se.exercises?.name || 'Exercise',
              muscleGroup: se.exercises?.muscle_group || 'Chest',
              equipment: se.exercises?.equipment || 'Barbell',
            },
            sets: sortedSets.map((s: any) => ({
              id: s.id,
              sessionExerciseId: s.session_exercise_id,
              setNumber: s.set_number,
              weightKg: s.weight_kg,
              reps: s.reps,
              isCompleted: Boolean(s.is_completed),
              rpe: s.rpe,
              restSecondsTaken: s.rest_seconds_taken,
            })),
          };
        });

        return {
          id: sess.id,
          templateId: sess.template_id,
          name: sess.name,
          startTime: sess.start_time,
          endTime: sess.end_time,
          durationSeconds: sess.duration_seconds,
          totalVolumeKg: sess.total_volume_kg,
          totalSets: sess.total_sets,
          prCount: sess.pr_count,
          status: sess.status,
          notes: sess.notes,
          exercises: exercisesWithSets,
        };
      });

      return res.json(result);
    }

    // SQLite Fallback
    const sessions = db.prepare(`
      SELECT * FROM workout_sessions 
      WHERE status = 'completed'
      ORDER BY start_time DESC
    `).all() as any[];

    const result = sessions.map((sess) => {
      const sessionExercises = db.prepare(`
        SELECT wse.*, e.name as exercise_name, e.muscle_group, e.equipment
        FROM workout_session_exercises wse
        JOIN exercises e ON wse.exercise_id = e.id
        WHERE wse.session_id = ?
        ORDER BY wse.order_index ASC
      `).all(sess.id) as any[];

      const exercisesWithSets = sessionExercises.map((se) => {
        const sets = db.prepare(`
          SELECT * FROM exercise_sets
          WHERE session_exercise_id = ?
          ORDER BY set_number ASC
        `).all(se.id) as any[];

        return {
          id: se.id,
          sessionId: se.session_id,
          exerciseId: se.exercise_id,
          orderIndex: se.order_index,
          notes: se.notes,
          exercise: {
            id: se.exercise_id,
            name: se.exercise_name,
            muscleGroup: se.muscle_group,
            equipment: se.equipment,
          },
          sets: sets.map((s) => ({
            id: s.id,
            sessionExerciseId: s.session_exercise_id,
            setNumber: s.set_number,
            weightKg: s.weight_kg,
            reps: s.reps,
            isCompleted: Boolean(s.is_completed),
            rpe: s.rpe,
            restSecondsTaken: s.rest_seconds_taken,
          })),
        };
      });

      return {
        id: sess.id,
        templateId: sess.template_id,
        name: sess.name,
        startTime: sess.start_time,
        endTime: sess.end_time,
        durationSeconds: sess.duration_seconds,
        totalVolumeKg: sess.total_volume_kg,
        totalSets: sess.total_sets,
        prCount: sess.pr_count,
        status: sess.status,
        notes: sess.notes,
        exercises: exercisesWithSets,
      };
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sessions/previous/:exerciseId
router.get('/previous/:exerciseId', async (req, res) => {
  try {
    const { exerciseId } = req.params;

    if (isSupabaseConfigured && supabase) {
      const sb = supabase;
      const { data: lastSe } = await sb
        .from('workout_session_exercises')
        .select('id, workout_sessions(start_time)')
        .eq('exercise_id', exerciseId)
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (!lastSe) return res.json({ sets: [] });

      const { data: sets } = await sb
        .from('exercise_sets')
        .select('set_number, weight_kg, reps')
        .eq('session_exercise_id', lastSe.id)
        .eq('is_completed', true)
        .order('set_number', { ascending: true });

      return res.json({
        date: (lastSe as any).workout_sessions?.start_time,
        sets: (sets || []).map((s: any) => ({
          setNumber: s.set_number,
          weightKg: s.weight_kg,
          reps: s.reps,
        })),
      });
    }

    // SQLite Fallback
    const lastSessionExercise = db.prepare(`
      SELECT wse.id, ws.start_time
      FROM workout_session_exercises wse
      JOIN workout_sessions ws ON wse.session_id = ws.id
      WHERE wse.exercise_id = ? AND ws.status = 'completed'
      ORDER BY ws.start_time DESC
      LIMIT 1
    `).get(exerciseId) as any;

    if (!lastSessionExercise) {
      return res.json({ sets: [] });
    }

    const sets = db.prepare(`
      SELECT set_number, weight_kg, reps
      FROM exercise_sets
      WHERE session_exercise_id = ? AND is_completed = 1
      ORDER BY set_number ASC
    `).all(lastSessionExercise.id) as any[];

    res.json({
      date: lastSessionExercise.start_time,
      sets: sets.map((s) => ({
        setNumber: s.set_number,
        weightKg: s.weight_kg,
        reps: s.reps,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sessions — Complete and save workout session
router.post('/', async (req, res) => {
  try {
    const { templateId, name, startTime, endTime, durationSeconds, totalVolumeKg, totalSets, prCount, notes, exercises } = req.body;

    if (!name || !exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Name and exercises array are required.' });
    }

    const sessionId = `sess-${Date.now()}`;

    if (isSupabaseConfigured && supabase) {
      const sb = supabase;
      await sb.from('workout_sessions').insert({
        id: sessionId,
        template_id: templateId || null,
        name,
        start_time: startTime || new Date().toISOString(),
        end_time: endTime || new Date().toISOString(),
        duration_seconds: durationSeconds || 0,
        total_volume_kg: totalVolumeKg || 0,
        total_sets: totalSets || 0,
        pr_count: prCount || 0,
        status: 'completed',
        notes: notes || '',
      });

      for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
        const exItem = exercises[exIdx];
        const seId = `se-${sessionId}-${exIdx}`;
        await sb.from('workout_session_exercises').insert({
          id: seId,
          session_id: sessionId,
          exercise_id: exItem.exerciseId,
          order_index: exIdx + 1,
          notes: exItem.notes || '',
        });

        if (Array.isArray(exItem.sets)) {
          const setRows = exItem.sets.map((setItem: any, setIdx: number) => ({
            id: `set-${seId}-${setIdx}`,
            session_exercise_id: seId,
            set_number: setIdx + 1,
            weight_kg: setItem.weightKg || 0,
            reps: setItem.reps || 0,
            is_completed: Boolean(setItem.isCompleted),
            rpe: setItem.rpe || null,
            rest_seconds_taken: setItem.restSecondsTaken || null,
          }));
          await sb.from('exercise_sets').insert(setRows);
        }
      }

      return res.status(201).json({ id: sessionId, success: true });
    }

    // SQLite Fallback
    const insertSession = db.prepare(`
      INSERT INTO workout_sessions (id, template_id, name, start_time, end_time, duration_seconds, total_volume_kg, total_sets, pr_count, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
    `);

    const insertSessionExercise = db.prepare(`
      INSERT INTO workout_session_exercises (id, session_id, exercise_id, order_index, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertSet = db.prepare(`
      INSERT INTO exercise_sets (id, session_exercise_id, set_number, weight_kg, reps, is_completed, rpe, rest_seconds_taken)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
      insertSession.run(
        sessionId,
        templateId || null,
        name,
        startTime || new Date().toISOString(),
        endTime || new Date().toISOString(),
        durationSeconds || 0,
        totalVolumeKg || 0,
        totalSets || 0,
        prCount || 0,
        notes || ''
      );

      exercises.forEach((exItem: any, exIdx: number) => {
        const seId = `se-${sessionId}-${exIdx}`;
        insertSessionExercise.run(seId, sessionId, exItem.exerciseId, exIdx + 1, exItem.notes || '');

        if (Array.isArray(exItem.sets)) {
          exItem.sets.forEach((setItem: any, setIdx: number) => {
            insertSet.run(
              `set-${seId}-${setIdx}`,
              seId,
              setIdx + 1,
              setItem.weightKg || 0,
              setItem.reps || 0,
              setItem.isCompleted ? 1 : 0,
              setItem.rpe || null,
              setItem.restSecondsTaken || null
            );
          });
        }
      });
    })();

    res.status(201).json({ id: sessionId, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sessions/:id — Delete completed workout session log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured && supabase) {
      const sb = supabase;
      const { error } = await sb.from('workout_sessions').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true, id });
    }

    // SQLite Fallback
    db.prepare('DELETE FROM workout_sessions WHERE id = ?').run(id);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
