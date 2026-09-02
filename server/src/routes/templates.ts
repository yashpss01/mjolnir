import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/templates
router.get('/', (req, res) => {
  try {
    const templates = db.prepare(`
      SELECT * FROM workout_templates 
      ORDER BY CASE target_day 
        WHEN 'Monday' THEN 1 
        WHEN 'Tuesday' THEN 2 
        WHEN 'Wednesday' THEN 3 
        WHEN 'Thursday' THEN 4 
        WHEN 'Friday' THEN 5 
        WHEN 'Saturday' THEN 6 
        WHEN 'Sunday' THEN 7 
        ELSE 8 
      END
    `).all() as any[];

    const result = templates.map((tpl) => {
      const exercises = db.prepare(`
        SELECT wte.*, e.name as exercise_name, e.muscle_group, e.equipment
        FROM workout_template_exercises wte
        JOIN exercises e ON wte.exercise_id = e.id
        WHERE wte.template_id = ?
        ORDER BY wte.order_index ASC
      `).all(tpl.id) as any[];

      return {
        id: tpl.id,
        name: tpl.name,
        targetDay: tpl.target_day,
        notes: tpl.notes,
        exercises: exercises.map((item) => ({
          id: item.id,
          templateId: item.template_id,
          exerciseId: item.exercise_id,
          orderIndex: item.order_index,
          targetSets: item.target_sets,
          targetRepMin: item.target_rep_min,
          targetRepMax: item.target_rep_max,
          restSeconds: item.rest_seconds,
          notes: item.notes,
          exercise: {
            id: item.exercise_id,
            name: item.exercise_name,
            muscleGroup: item.muscle_group,
            equipment: item.equipment,
          },
        })),
      };
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/templates — Create new template
router.post('/', (req, res) => {
  try {
    const { name, targetDay, notes, exercises } = req.body;
    if (!name || !targetDay) {
      return res.status(400).json({ error: 'Name and target day are required.' });
    }

    const templateId = `tpl-custom-${Date.now()}`;
    const insertTemplate = db.prepare(`
      INSERT INTO workout_templates (id, name, target_day, notes)
      VALUES (?, ?, ?, ?)
    `);

    const insertTemplateExercise = db.prepare(`
      INSERT INTO workout_template_exercises (id, template_id, exercise_id, order_index, target_sets, target_rep_min, target_rep_max, rest_seconds, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
      insertTemplate.run(templateId, name, targetDay, notes || '');
      if (Array.isArray(exercises)) {
        exercises.forEach((item: any, idx: number) => {
          insertTemplateExercise.run(
            `tplex-${templateId}-${idx}`,
            templateId,
            item.exerciseId,
            idx + 1,
            item.targetSets || 3,
            item.targetRepMin || 6,
            item.targetRepMax || 10,
            item.restSeconds || 90,
            item.notes || null
          );
        });
      }
    })();

    res.status(201).json({ id: templateId, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/templates/:id — Edit existing template
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, targetDay, notes, exercises } = req.body;

    db.transaction(() => {
      db.prepare(`
        UPDATE workout_templates SET name = ?, target_day = ?, notes = ? WHERE id = ?
      `).run(name, targetDay, notes || '', id);

      // Refresh template exercises
      db.prepare(`DELETE FROM workout_template_exercises WHERE template_id = ?`).run(id);

      if (Array.isArray(exercises)) {
        const insertTemplateExercise = db.prepare(`
          INSERT INTO workout_template_exercises (id, template_id, exercise_id, order_index, target_sets, target_rep_min, target_rep_max, rest_seconds, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        exercises.forEach((item: any, idx: number) => {
          insertTemplateExercise.run(
            `tplex-${id}-${idx}-${Date.now()}`,
            id,
            item.exerciseId,
            idx + 1,
            item.targetSets || 3,
            item.targetRepMin || 6,
            item.targetRepMax || 10,
            item.restSeconds || 90,
            item.notes || null
          );
        });
      }
    })();

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
