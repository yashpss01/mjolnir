import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/exercises
router.get('/', (req, res) => {
  try {
    const { muscle, equipment, search } = req.query;
    let query = 'SELECT * FROM exercises WHERE 1=1';
    const params: any[] = [];

    if (muscle) {
      query += ' AND muscle_group = ?';
      params.push(muscle);
    }
    if (equipment) {
      query += ' AND equipment = ?';
      params.push(equipment);
    }
    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name ASC';
    const exercises = db.prepare(query).all(...params);

    const formatted = exercises.map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscle_group,
      secondaryMuscles: ex.secondary_muscles ? ex.secondary_muscles.split(', ') : [],
      equipment: ex.equipment,
      instructions: ex.instructions,
      defaultRepMin: ex.default_rep_min,
      defaultRepMax: ex.default_rep_max,
      isCustom: Boolean(ex.is_custom),
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/exercises (Custom Exercise creation)
router.post('/', (req, res) => {
  try {
    const { name, muscleGroup, equipment, secondaryMuscles, defaultRepMin, defaultRepMax, instructions } = req.body;
    if (!name || !muscleGroup || !equipment) {
      return res.status(400).json({ error: 'Name, muscle group, and equipment are required.' });
    }

    const id = `ex-custom-${Date.now()}`;
    const secondaryStr = Array.isArray(secondaryMuscles) ? secondaryMuscles.join(', ') : (secondaryMuscles || '');

    db.prepare(`
      INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, instructions, default_rep_min, default_rep_max, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, name, muscleGroup, secondaryStr, equipment, instructions || '', defaultRepMin || 6, defaultRepMax || 12);

    const created = db.prepare('SELECT * FROM exercises WHERE id = ?').get(id) as any;
    res.status(201).json({
      id: created.id,
      name: created.name,
      muscleGroup: created.muscle_group,
      secondaryMuscles: created.secondary_muscles ? created.secondary_muscles.split(', ') : [],
      equipment: created.equipment,
      instructions: created.instructions,
      defaultRepMin: created.default_rep_min,
      defaultRepMax: created.default_rep_max,
      isCustom: true,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
