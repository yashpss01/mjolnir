import { db, initDatabase } from './index.js';

export function seedDatabase() {
  initDatabase();

  const existingExercisesCount = (db.prepare('SELECT count(*) as count FROM exercises').get() as { count: number }).count;
  if (existingExercisesCount > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding initial exercises and weekly workout templates...');

  // Seed Exercises
  const insertExercise = db.prepare(`
    INSERT OR IGNORE INTO exercises (id, name, muscle_group, secondary_muscles, equipment, instructions, default_rep_min, default_rep_max)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const exercisesData = [
    // Chest
    { id: 'ex-bench-press', name: 'Bench Press', muscleGroup: 'Chest', secondary: 'Triceps, Shoulders', equipment: 'Barbell', repMin: 5, repMax: 8 },
    { id: 'ex-incline-bench', name: 'Incline Bench Press', muscleGroup: 'Chest', secondary: 'Upper Chest, Triceps', equipment: 'Barbell', repMin: 6, repMax: 10 },
    { id: 'ex-db-bench', name: 'Dumbbell Bench Press', muscleGroup: 'Chest', secondary: 'Triceps', equipment: 'Dumbbell', repMin: 8, repMax: 12 },
    { id: 'ex-incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', secondary: 'Upper Chest, Shoulders', equipment: 'Dumbbell', repMin: 8, repMax: 10 },
    { id: 'ex-machine-chest-press', name: 'Machine Chest Press', muscleGroup: 'Chest', secondary: 'Triceps', equipment: 'Machine', repMin: 8, repMax: 12 },
    { id: 'ex-pec-deck', name: 'Pec Deck / Pec Fly', muscleGroup: 'Chest', secondary: 'Chest', equipment: 'Machine', repMin: 12, repMax: 15 },
    { id: 'ex-cable-fly', name: 'Cable Fly', muscleGroup: 'Chest', secondary: 'Inner Chest', equipment: 'Cable', repMin: 12, repMax: 15 },

    // Back
    { id: 'ex-lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', secondary: 'Biceps, Lats', equipment: 'Cable', repMin: 6, repMax: 10 },
    { id: 'ex-pullup', name: 'Pull-up', muscleGroup: 'Back', secondary: 'Biceps', equipment: 'Bodyweight', repMin: 6, repMax: 10 },
    { id: 'ex-seated-cable-row', name: 'Seated Cable Row', muscleGroup: 'Back', secondary: 'Rhomboids, Biceps', equipment: 'Cable', repMin: 8, repMax: 12 },
    { id: 'ex-chest-supported-row', name: 'Chest-Supported Row', muscleGroup: 'Back', secondary: 'Upper Back, Rear Delts', equipment: 'Machine', repMin: 6, repMax: 10 },
    { id: 'ex-db-row', name: 'One-Arm Dumbbell Row', muscleGroup: 'Back', secondary: 'Lats, Core', equipment: 'Dumbbell', repMin: 8, repMax: 12 },

    // Shoulders
    { id: 'ex-seated-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', secondary: 'Triceps', equipment: 'Dumbbell', repMin: 6, repMax: 10 },
    { id: 'ex-lateral-raise', name: 'Lateral Raise', muscleGroup: 'Shoulders', secondary: 'Side Delts', equipment: 'Dumbbell', repMin: 12, repMax: 15 },
    { id: 'ex-rear-delt-fly', name: 'Rear Delt Fly', muscleGroup: 'Shoulders', secondary: 'Rear Delts', equipment: 'Machine', repMin: 12, repMax: 15 },
    { id: 'ex-face-pull', name: 'Face Pull', muscleGroup: 'Shoulders', secondary: 'Rear Delts, Upper Back', equipment: 'Cable', repMin: 12, repMax: 15 },

    // Legs
    { id: 'ex-squat', name: 'Squat', muscleGroup: 'Legs', secondary: 'Quads, Glutes', equipment: 'Barbell', repMin: 5, repMax: 8 },
    { id: 'ex-smith-squat', name: 'Smith Squat', muscleGroup: 'Legs', secondary: 'Quads, Glutes', equipment: 'Smith Machine', repMin: 5, repMax: 8 },
    { id: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', secondary: 'Hamstrings, Glutes, Lower Back', equipment: 'Barbell', repMin: 6, repMax: 10 },
    { id: 'ex-bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', secondary: 'Quads, Glutes', equipment: 'Dumbbell', repMin: 8, repMax: 10 },
    { id: 'ex-walking-lunges', name: 'Walking Lunges', muscleGroup: 'Legs', secondary: 'Quads, Glutes', equipment: 'Dumbbell', repMin: 10, repMax: 12 },
    { id: 'ex-leg-extension', name: 'Leg Extension', muscleGroup: 'Legs', secondary: 'Quads', equipment: 'Machine', repMin: 12, repMax: 15 },
    { id: 'ex-leg-curl', name: 'Leg Curl', muscleGroup: 'Legs', secondary: 'Hamstrings', equipment: 'Machine', repMin: 8, repMax: 12 },
    { id: 'ex-calf-raise', name: 'Standing Calf Raise', muscleGroup: 'Legs', secondary: 'Calves', equipment: 'Machine', repMin: 10, repMax: 15 },
    { id: 'ex-seated-calf-raise', name: 'Seated Calf Raise', muscleGroup: 'Legs', secondary: 'Calves', equipment: 'Machine', repMin: 12, repMax: 20 },

    // Arms
    { id: 'ex-ez-bar-curl', name: 'EZ Bar Curl', muscleGroup: 'Arms', secondary: 'Biceps', equipment: 'EZ Bar', repMin: 8, repMax: 12 },
    { id: 'ex-db-curl', name: 'Dumbbell Curl', muscleGroup: 'Arms', secondary: 'Biceps', equipment: 'Dumbbell', repMin: 10, repMax: 12 },
    { id: 'ex-hammer-curl', name: 'Hammer Curl', muscleGroup: 'Arms', secondary: 'Brachialis, Forearms', equipment: 'Dumbbell', repMin: 10, repMax: 12 },
    { id: 'ex-rope-triceps-pushdown', name: 'Rope Triceps Pushdown', muscleGroup: 'Arms', secondary: 'Triceps', equipment: 'Cable', repMin: 8, repMax: 12 },
    { id: 'ex-triceps-pushdown', name: 'Triceps Pushdown', muscleGroup: 'Arms', secondary: 'Triceps', equipment: 'Cable', repMin: 10, repMax: 15 },
    { id: 'ex-overhead-cable-triceps-extension', name: 'Overhead Cable Triceps Extension', muscleGroup: 'Arms', secondary: 'Triceps Long Head', equipment: 'Cable', repMin: 10, repMax: 15 },

    // Core
    { id: 'ex-hanging-knee-raise', name: 'Hanging Knee Raise', muscleGroup: 'Core', secondary: 'Abs, Hip Flexors', equipment: 'Bodyweight', repMin: 10, repMax: 15 },
    { id: 'ex-cable-crunch', name: 'Cable Crunch', muscleGroup: 'Core', secondary: 'Abs', equipment: 'Cable', repMin: 12, repMax: 15 },
  ];

  // Seed 5 Workout Templates
  const insertTemplate = db.prepare(`
    INSERT OR IGNORE INTO workout_templates (id, name, target_day, notes)
    VALUES (?, ?, ?, ?)
  `);

  const insertTemplateExercise = db.prepare(`
    INSERT OR IGNORE INTO workout_template_exercises (id, template_id, exercise_id, order_index, target_sets, target_rep_min, target_rep_max, rest_seconds, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const templates = [
    {
      id: 'tpl-monday-upper',
      name: 'Monday — Upper Strength',
      targetDay: 'Monday',
      notes: 'Focus on heavy compound pressing and rowing with good form.',
      exercises: [
        { exId: 'ex-bench-press', sets: 4, minReps: 5, maxReps: 8, rest: 120 },
        { exId: 'ex-lat-pulldown', sets: 4, minReps: 6, maxReps: 10, rest: 120 },
        { exId: 'ex-chest-supported-row', sets: 3, minReps: 6, maxReps: 10, rest: 90 },
        { exId: 'ex-incline-db-press', sets: 3, minReps: 8, maxReps: 10, rest: 90 },
        { exId: 'ex-seated-db-shoulder-press', sets: 3, minReps: 6, maxReps: 10, rest: 90 },
        { exId: 'ex-ez-bar-curl', sets: 3, minReps: 8, maxReps: 12, rest: 60 },
        { exId: 'ex-rope-triceps-pushdown', sets: 3, minReps: 8, maxReps: 12, rest: 60 },
      ]
    },
    {
      id: 'tpl-tuesday-lower',
      name: 'Tuesday — Lower Strength',
      targetDay: 'Tuesday',
      notes: 'Focus on squat strength and hamstring hinge movement.',
      exercises: [
        { exId: 'ex-squat', sets: 4, minReps: 5, maxReps: 8, rest: 180 },
        { exId: 'ex-rdl', sets: 3, minReps: 6, maxReps: 10, rest: 120 },
        { exId: 'ex-bulgarian-split-squat', sets: 3, minReps: 8, maxReps: 10, rest: 90 },
        { exId: 'ex-leg-curl', sets: 3, minReps: 8, maxReps: 12, rest: 90 },
        { exId: 'ex-calf-raise', sets: 4, minReps: 10, maxReps: 15, rest: 60 },
        { exId: 'ex-hanging-knee-raise', sets: 3, minReps: 10, maxReps: 15, rest: 60 },
      ]
    },
    {
      id: 'tpl-wednesday-pull',
      name: 'Wednesday — Pull + Shoulders',
      targetDay: 'Wednesday',
      notes: 'Upper back width, rear delts, and biceps volume.',
      exercises: [
        { exId: 'ex-lat-pulldown', sets: 4, minReps: 8, maxReps: 10, rest: 120 },
        { exId: 'ex-seated-cable-row', sets: 3, minReps: 8, maxReps: 12, rest: 90 },
        { exId: 'ex-chest-supported-row', sets: 3, minReps: 10, maxReps: 12, rest: 90 },
        { exId: 'ex-lateral-raise', sets: 4, minReps: 12, maxReps: 15, rest: 60 },
        { exId: 'ex-rear-delt-fly', sets: 3, minReps: 12, maxReps: 15, rest: 60 },
        { exId: 'ex-hammer-curl', sets: 3, minReps: 10, maxReps: 12, rest: 60 },
        { exId: 'ex-face-pull', sets: 3, minReps: 12, maxReps: 15, rest: 60 },
      ]
    },
    {
      id: 'tpl-thursday-lower',
      name: 'Thursday — Lower Hypertrophy',
      targetDay: 'Thursday',
      notes: 'Higher rep quad isolation and leg hypertrophy focus.',
      exercises: [
        { exId: 'ex-squat', sets: 3, minReps: 8, maxReps: 12, rest: 120 },
        { exId: 'ex-rdl', sets: 3, minReps: 8, maxReps: 12, rest: 120 },
        { exId: 'ex-walking-lunges', sets: 3, minReps: 10, maxReps: 12, rest: 90 },
        { exId: 'ex-leg-extension', sets: 3, minReps: 12, maxReps: 15, rest: 60 },
        { exId: 'ex-leg-curl', sets: 3, minReps: 12, maxReps: 15, rest: 60 },
        { exId: 'ex-seated-calf-raise', sets: 4, minReps: 12, maxReps: 20, rest: 60 },
        { exId: 'ex-cable-crunch', sets: 3, minReps: 12, maxReps: 15, rest: 60 },
      ]
    },
    {
      id: 'tpl-friday-push',
      name: 'Friday — Push + Arms',
      targetDay: 'Friday',
      notes: 'Chest pump, side delts, and arm hypertrophy supersets.',
      exercises: [
        { exId: 'ex-incline-bench', sets: 4, minReps: 6, maxReps: 10, rest: 120 },
        { exId: 'ex-machine-chest-press', sets: 3, minReps: 8, maxReps: 12, rest: 90 },
        { exId: 'ex-cable-fly', sets: 3, minReps: 12, maxReps: 15, rest: 60 },
        { exId: 'ex-lateral-raise', sets: 4, minReps: 12, maxReps: 15, rest: 60 },
        { exId: 'ex-triceps-pushdown', sets: 3, minReps: 10, maxReps: 15, rest: 60 },
        { exId: 'ex-overhead-cable-triceps-extension', sets: 2, minReps: 10, maxReps: 15, rest: 60 },
        { exId: 'ex-db-curl', sets: 3, minReps: 10, maxReps: 12, rest: 60 },
      ]
    }
  ];

  db.transaction(() => {
    for (const ex of exercisesData) {
      insertExercise.run(
        ex.id,
        ex.name,
        ex.muscleGroup,
        ex.secondary,
        ex.equipment,
        `Focus on controlled movement and full range of motion.`,
        ex.repMin,
        ex.repMax
      );
    }

    for (const tpl of templates) {
      insertTemplate.run(tpl.id, tpl.name, tpl.targetDay, tpl.notes);
      tpl.exercises.forEach((item, idx) => {
        insertTemplateExercise.run(
          `tplex-${tpl.id}-${idx}`,
          tpl.id,
          item.exId,
          idx + 1,
          item.sets,
          item.minReps,
          item.maxReps,
          item.rest,
          null
        );
      });
    }
  })();

  console.log('Seeding completed successfully!');
}

// Allow direct CLI invocation `npm run db:seed`
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
