import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/sessions — Fetch workout history
router.get('/', (req, res) => {
  try {
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

// GET /api/sessions/previous/:exerciseId — Fetch previous performance for an exercise
router.get('/previous/:exerciseId', (req, res) => {
  try {
    const { exerciseId } = req.params;

    // Find last completed session containing this exercise
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
router.post('/', (req, res) => {
  try {
    const { templateId, name, startTime, endTime, durationSeconds, totalVolumeKg, totalSets, prCount, notes, exercises } = req.body;

    if (!name || !exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Name and exercises array are required.' });
    }

    const sessionId = `sess-${Date.now()}`;
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

            // PR Check: Track heaviest weight for exercise
            if (setItem.isCompleted && setItem.weightKg > 0) {
              const currentMaxPr = db.prepare(`
                SELECT value FROM personal_records WHERE exercise_id = ? AND record_type = 'max_weight'
              `).get(exItem.exerciseId) as any;

              if (!currentMaxPr || setItem.weightKg > currentMaxPr.value) {
                const prId = `pr-${Date.now()}-${exItem.exerciseId}`;
                if (currentMaxPr) {
                  db.prepare(`
                    UPDATE personal_records SET previous_value = value, value = ?, achieved_at = CURRENT_TIMESTAMP WHERE exercise_id = ? AND record_type = 'max_weight'
                  `).run(setItem.weightKg, exItem.exerciseId);
                } else {
                  db.prepare(`
                    INSERT INTO personal_records (id, exercise_id, record_type, value, achieved_at) VALUES (?, ?, 'max_weight', ?, CURRENT_TIMESTAMP)
                  `).run(prId, exItem.exerciseId, setItem.weightKg);
                }
              }
            }
          });
        }
      });
    })();

    res.status(201).json({ id: sessionId, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
