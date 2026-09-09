import { Router } from 'express';
import { db } from '../db/index.js';
import { supabase, isSupabaseConfigured } from '../db/supabase.js';

const router = Router();

// GET /api/exercises
router.get('/', async (req, res) => {
  try {
    const { muscle, equipment, search } = req.query;

    if (isSupabaseConfigured && supabase) {
      const sb = supabase;
      let query = sb.from('exercises').select('*');
      if (muscle) query = query.eq('muscle_group', String(muscle));
      if (equipment) query = query.eq('equipment', String(equipment));
      if (search) query = query.ilike('name', `%${search}%`);

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;

      const formatted = (data || []).map((ex: any) => ({
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
      return res.json(formatted);
    }

    // SQLite Fallback
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
router.post('/', async (req, res) => {
  try {
    const { name, muscleGroup, equipment, secondaryMuscles, defaultRepMin, defaultRepMax, instructions } = req.body;
    if (!name || !muscleGroup || !equipment) {
      return res.status(400).json({ error: 'Name, muscle group, and equipment are required.' });
    }

    const id = `ex-custom-${Date.now()}`;
    const secondaryStr = Array.isArray(secondaryMuscles) ? secondaryMuscles.join(', ') : (secondaryMuscles || '');

    if (isSupabaseConfigured && supabase) {
      const sb = supabase;
      const { data, error } = await sb.from('exercises').insert({
        id,
        name,
        muscle_group: muscleGroup,
        secondary_muscles: secondaryStr,
        equipment,
        instructions: instructions || '',
        default_rep_min: defaultRepMin || 6,
        default_rep_max: defaultRepMax || 12,
        is_custom: true,
      }).select().single();

      if (error) throw error;
      return res.status(201).json({
        id: data.id,
        name: data.name,
        muscleGroup: data.muscle_group,
        secondaryMuscles: data.secondary_muscles ? data.secondary_muscles.split(', ') : [],
        equipment: data.equipment,
        instructions: data.instructions,
        defaultRepMin: data.default_rep_min,
        defaultRepMax: data.default_rep_max,
        isCustom: true,
      });
    }

    // SQLite Fallback
    db.prepare(`
      INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, instructions, default_rep_min, default_rep_max, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, name, muscleGroup, secondaryStr, equipment, instructions || '', defaultRepMin || 6, defaultRepMax || 12);

    res.status(201).json({ id, name, muscleGroup, equipment, isCustom: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
