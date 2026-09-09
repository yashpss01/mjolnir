import { supabase } from './supabase.js';

export async function seedSupabaseDatabase() {
  if (!supabase) {
    console.log('Supabase client not initialized, skipping Supabase seeding.');
    return;
  }

  console.log('Seeding / checking Supabase exercises and 5 weekly workout templates...');

  const exercisesData = [
    // Chest
    { id: 'ex-bench-press', name: 'Bench Press', muscle_group: 'Chest', secondary_muscles: 'Triceps, Shoulders', equipment: 'Barbell', default_rep_min: 5, default_rep_max: 8 },
    { id: 'ex-incline-bench', name: 'Incline Bench Press', muscle_group: 'Chest', secondary_muscles: 'Upper Chest, Triceps', equipment: 'Barbell', default_rep_min: 6, default_rep_max: 10 },
    { id: 'ex-db-bench', name: 'Dumbbell Bench Press', muscle_group: 'Chest', secondary_muscles: 'Triceps', equipment: 'Dumbbell', default_rep_min: 8, default_rep_max: 12 },
    { id: 'ex-incline-db-press', name: 'Incline Dumbbell Press', muscle_group: 'Chest', secondary_muscles: 'Upper Chest, Shoulders', equipment: 'Dumbbell', default_rep_min: 8, default_rep_max: 10 },
    { id: 'ex-machine-chest-press', name: 'Machine Chest Press', muscle_group: 'Chest', secondary_muscles: 'Triceps', equipment: 'Machine', default_rep_min: 8, default_rep_max: 12 },
    { id: 'ex-pec-deck', name: 'Pec Deck / Pec Fly', muscle_group: 'Chest', secondary_muscles: 'Chest', equipment: 'Machine', default_rep_min: 12, default_rep_max: 15 },
    { id: 'ex-cable-fly', name: 'Cable Fly', muscle_group: 'Chest', secondary_muscles: 'Inner Chest', equipment: 'Cable', default_rep_min: 12, default_rep_max: 15 },

    // Back
    { id: 'ex-lat-pulldown', name: 'Lat Pulldown', muscle_group: 'Back', secondary_muscles: 'Biceps, Lats', equipment: 'Cable', default_rep_min: 6, default_rep_max: 10 },
    { id: 'ex-pullup', name: 'Pull-up', muscle_group: 'Back', secondary_muscles: 'Biceps', equipment: 'Bodyweight', default_rep_min: 6, default_rep_max: 10 },
    { id: 'ex-seated-cable-row', name: 'Seated Cable Row', muscle_group: 'Back', secondary_muscles: 'Rhomboids, Biceps', equipment: 'Cable', default_rep_min: 8, default_rep_max: 12 },
    { id: 'ex-chest-supported-row', name: 'Chest-Supported Row', muscle_group: 'Back', secondary_muscles: 'Upper Back, Rear Delts', equipment: 'Machine', default_rep_min: 6, default_rep_max: 10 },
    { id: 'ex-db-row', name: 'One-Arm Dumbbell Row', muscle_group: 'Back', secondary_muscles: 'Lats, Core', equipment: 'Dumbbell', default_rep_min: 8, default_rep_max: 12 },

    // Shoulders
    { id: 'ex-seated-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscle_group: 'Shoulders', secondary_muscles: 'Triceps', equipment: 'Dumbbell', default_rep_min: 6, default_rep_max: 10 },
    { id: 'ex-lateral-raise', name: 'Lateral Raise', muscle_group: 'Shoulders', secondary_muscles: 'Side Delts', equipment: 'Dumbbell', default_rep_min: 12, default_rep_max: 15 },
    { id: 'ex-rear-delt-fly', name: 'Rear Delt Fly', muscle_group: 'Shoulders', secondary_muscles: 'Rear Delts', equipment: 'Machine', default_rep_min: 12, default_rep_max: 15 },
    { id: 'ex-face-pull', name: 'Face Pull', muscle_group: 'Shoulders', secondary_muscles: 'Rear Delts, Upper Back', equipment: 'Cable', default_rep_min: 12, default_rep_max: 15 },

    // Legs
    { id: 'ex-squat', name: 'Squat', muscle_group: 'Legs', secondary_muscles: 'Quads, Glutes', equipment: 'Barbell', default_rep_min: 5, default_rep_max: 8 },
    { id: 'ex-smith-squat', name: 'Smith Squat', muscle_group: 'Legs', secondary_muscles: 'Quads, Glutes', equipment: 'Smith Machine', default_rep_min: 5, default_rep_max: 8 },
    { id: 'ex-rdl', name: 'Romanian Deadlift', muscle_group: 'Legs', secondary_muscles: 'Hamstrings, Glutes, Lower Back', equipment: 'Barbell', default_rep_min: 6, default_rep_max: 10 },
    { id: 'ex-bulgarian-split-squat', name: 'Bulgarian Split Squat', muscle_group: 'Legs', secondary_muscles: 'Quads, Glutes', equipment: 'Dumbbell', default_rep_min: 8, default_rep_max: 10 },
    { id: 'ex-walking-lunges', name: 'Walking Lunges', muscle_group: 'Legs', secondary_muscles: 'Quads, Glutes', equipment: 'Dumbbell', default_rep_min: 10, default_rep_max: 12 },
    { id: 'ex-leg-extension', name: 'Leg Extension', muscle_group: 'Legs', secondary_muscles: 'Quads', equipment: 'Machine', default_rep_min: 12, default_rep_max: 15 },
    { id: 'ex-leg-curl', name: 'Leg Curl', muscle_group: 'Legs', secondary_muscles: 'Hamstrings', equipment: 'Machine', default_rep_min: 8, default_rep_max: 12 },
    { id: 'ex-calf-raise', name: 'Standing Calf Raise', muscle_group: 'Legs', secondary_muscles: 'Calves', equipment: 'Machine', default_rep_min: 10, default_rep_max: 15 },
    { id: 'ex-seated-calf-raise', name: 'Seated Calf Raise', muscle_group: 'Legs', secondary_muscles: 'Calves', equipment: 'Machine', default_rep_min: 12, default_rep_max: 20 },

    // Arms
    { id: 'ex-ez-bar-curl', name: 'EZ Bar Curl', muscle_group: 'Arms', secondary_muscles: 'Biceps', equipment: 'EZ Bar', default_rep_min: 8, default_rep_max: 12 },
    { id: 'ex-db-curl', name: 'Dumbbell Curl', muscle_group: 'Arms', secondary_muscles: 'Biceps', equipment: 'Dumbbell', default_rep_min: 10, default_rep_max: 12 },
    { id: 'ex-hammer-curl', name: 'Hammer Curl', muscle_group: 'Arms', secondary_muscles: 'Brachialis, Forearms', equipment: 'Dumbbell', default_rep_min: 10, default_rep_max: 12 },
    { id: 'ex-rope-triceps-pushdown', name: 'Rope Triceps Pushdown', muscle_group: 'Arms', secondary_muscles: 'Triceps', equipment: 'Cable', default_rep_min: 8, default_rep_max: 12 },
    { id: 'ex-triceps-pushdown', name: 'Triceps Pushdown', muscle_group: 'Arms', secondary_muscles: 'Triceps', equipment: 'Cable', default_rep_min: 10, default_rep_max: 15 },
    { id: 'ex-overhead-cable-triceps-extension', name: 'Overhead Cable Triceps Extension', muscle_group: 'Arms', secondary_muscles: 'Triceps Long Head', equipment: 'Cable', default_rep_min: 10, default_rep_max: 15 },

    // Core
    { id: 'ex-hanging-knee-raise', name: 'Hanging Knee Raise', muscle_group: 'Core', secondary_muscles: 'Abs, Hip Flexors', equipment: 'Bodyweight', default_rep_min: 10, default_rep_max: 15 },
    { id: 'ex-cable-crunch', name: 'Cable Crunch', muscle_group: 'Core', secondary_muscles: 'Abs', equipment: 'Cable', default_rep_min: 12, default_rep_max: 15 },
  ];

  const { error: exErr } = await supabase.from('exercises').upsert(exercisesData);
  if (exErr) {
    console.error('Error seeding Supabase exercises:', exErr.message);
  }

  const templates = [
    {
      id: 'tpl-monday-upper',
      name: 'Monday — Upper Strength',
      target_day: 'Monday',
      notes: 'Focus on heavy compound pressing and rowing with good form.',
    },
    {
      id: 'tpl-tuesday-lower',
      name: 'Tuesday — Lower Strength',
      target_day: 'Tuesday',
      notes: 'Focus on squat strength and hamstring hinge movement.',
    },
    {
      id: 'tpl-wednesday-pull',
      name: 'Wednesday — Pull + Shoulders',
      target_day: 'Wednesday',
      notes: 'Upper back width, rear delts, and biceps volume.',
    },
    {
      id: 'tpl-thursday-lower',
      name: 'Thursday — Lower Hypertrophy',
      target_day: 'Thursday',
      notes: 'Higher rep quad isolation and leg hypertrophy focus.',
    },
    {
      id: 'tpl-friday-push',
      name: 'Friday — Push + Arms',
      target_day: 'Friday',
      notes: 'Chest pump, side delts, and arm hypertrophy supersets.',
    }
  ];

  await supabase.from('workout_templates').upsert(templates);

  const tplExercises = [
    // Monday — Upper Strength
    { id: 'tplex-tpl-monday-upper-0', template_id: 'tpl-monday-upper', exercise_id: 'ex-bench-press', order_index: 1, target_sets: 4, target_rep_min: 5, target_rep_max: 8, rest_seconds: 120 },
    { id: 'tplex-tpl-monday-upper-1', template_id: 'tpl-monday-upper', exercise_id: 'ex-lat-pulldown', order_index: 2, target_sets: 4, target_rep_min: 6, target_rep_max: 10, rest_seconds: 120 },
    { id: 'tplex-tpl-monday-upper-2', template_id: 'tpl-monday-upper', exercise_id: 'ex-chest-supported-row', order_index: 3, target_sets: 3, target_rep_min: 6, target_rep_max: 10, rest_seconds: 90 },
    { id: 'tplex-tpl-monday-upper-3', template_id: 'tpl-monday-upper', exercise_id: 'ex-incline-db-press', order_index: 4, target_sets: 3, target_rep_min: 8, target_rep_max: 10, rest_seconds: 90 },
    { id: 'tplex-tpl-monday-upper-4', template_id: 'tpl-monday-upper', exercise_id: 'ex-seated-db-shoulder-press', order_index: 5, target_sets: 3, target_rep_min: 6, target_rep_max: 10, rest_seconds: 90 },
    { id: 'tplex-tpl-monday-upper-5', template_id: 'tpl-monday-upper', exercise_id: 'ex-ez-bar-curl', order_index: 6, target_sets: 3, target_rep_min: 8, target_rep_max: 12, rest_seconds: 60 },
    { id: 'tplex-tpl-monday-upper-6', template_id: 'tpl-monday-upper', exercise_id: 'ex-rope-triceps-pushdown', order_index: 7, target_sets: 3, target_rep_min: 8, target_rep_max: 12, rest_seconds: 60 },

    // Tuesday — Lower Strength
    { id: 'tplex-tpl-tuesday-lower-0', template_id: 'tpl-tuesday-lower', exercise_id: 'ex-squat', order_index: 1, target_sets: 4, target_rep_min: 5, target_rep_max: 8, rest_seconds: 180 },
    { id: 'tplex-tpl-tuesday-lower-1', template_id: 'tpl-tuesday-lower', exercise_id: 'ex-rdl', order_index: 2, target_sets: 3, target_rep_min: 6, target_rep_max: 10, rest_seconds: 120 },
    { id: 'tplex-tpl-tuesday-lower-2', template_id: 'tpl-tuesday-lower', exercise_id: 'ex-bulgarian-split-squat', order_index: 3, target_sets: 3, target_rep_min: 8, target_rep_max: 10, rest_seconds: 90 },
    { id: 'tplex-tpl-tuesday-lower-3', template_id: 'tpl-tuesday-lower', exercise_id: 'ex-leg-curl', order_index: 4, target_sets: 3, target_rep_min: 8, target_rep_max: 12, rest_seconds: 90 },
    { id: 'tplex-tpl-tuesday-lower-4', template_id: 'tpl-tuesday-lower', exercise_id: 'ex-calf-raise', order_index: 5, target_sets: 4, target_rep_min: 10, target_rep_max: 15, rest_seconds: 60 },
    { id: 'tplex-tpl-tuesday-lower-5', template_id: 'tpl-tuesday-lower', exercise_id: 'ex-hanging-knee-raise', order_index: 6, target_sets: 3, target_rep_min: 10, target_rep_max: 15, rest_seconds: 60 },

    // Wednesday — Pull + Shoulders
    { id: 'tplex-tpl-wednesday-pull-0', template_id: 'tpl-wednesday-pull', exercise_id: 'ex-lat-pulldown', order_index: 1, target_sets: 4, target_rep_min: 8, target_rep_max: 10, rest_seconds: 120 },
    { id: 'tplex-tpl-wednesday-pull-1', template_id: 'tpl-wednesday-pull', exercise_id: 'ex-seated-cable-row', order_index: 2, target_sets: 3, target_rep_min: 8, target_rep_max: 12, rest_seconds: 90 },
    { id: 'tplex-tpl-wednesday-pull-2', template_id: 'tpl-wednesday-pull', exercise_id: 'ex-chest-supported-row', order_index: 3, target_sets: 3, target_rep_min: 10, target_rep_max: 12, rest_seconds: 90 },
    { id: 'tplex-tpl-wednesday-pull-3', template_id: 'tpl-wednesday-pull', exercise_id: 'ex-lateral-raise', order_index: 4, target_sets: 4, target_rep_min: 12, target_rep_max: 15, rest_seconds: 60 },
    { id: 'tplex-tpl-wednesday-pull-4', template_id: 'tpl-wednesday-pull', exercise_id: 'ex-rear-delt-fly', order_index: 5, target_sets: 3, target_rep_min: 12, target_rep_max: 15, rest_seconds: 60 },
    { id: 'tplex-tpl-wednesday-pull-5', template_id: 'tpl-wednesday-pull', exercise_id: 'ex-hammer-curl', order_index: 6, target_sets: 3, target_rep_min: 10, target_rep_max: 12, rest_seconds: 60 },
    { id: 'tplex-tpl-wednesday-pull-6', template_id: 'tpl-wednesday-pull', exercise_id: 'ex-face-pull', order_index: 7, target_sets: 3, target_rep_min: 12, target_rep_max: 15, rest_seconds: 60 },

    // Thursday — Lower Hypertrophy
    { id: 'tplex-tpl-thursday-lower-0', template_id: 'tpl-thursday-lower', exercise_id: 'ex-squat', order_index: 1, target_sets: 3, target_rep_min: 8, target_rep_max: 12, rest_seconds: 120 },
    { id: 'tplex-tpl-thursday-lower-1', template_id: 'tpl-thursday-lower', exercise_id: 'ex-rdl', order_index: 2, target_sets: 3, target_rep_min: 8, target_rep_max: 12, rest_seconds: 120 },
    { id: 'tplex-tpl-thursday-lower-2', template_id: 'tpl-thursday-lower', exercise_id: 'ex-walking-lunges', order_index: 3, target_sets: 3, target_rep_min: 10, target_rep_max: 12, rest_seconds: 90 },
    { id: 'tplex-tpl-thursday-lower-3', template_id: 'tpl-thursday-lower', exercise_id: 'ex-leg-extension', order_index: 4, target_sets: 3, target_rep_min: 12, target_rep_max: 15, rest_seconds: 60 },
    { id: 'tplex-tpl-thursday-lower-4', template_id: 'tpl-thursday-lower', exercise_id: 'ex-leg-curl', order_index: 5, target_sets: 3, target_rep_min: 12, target_rep_max: 15, rest_seconds: 60 },
    { id: 'tplex-tpl-thursday-lower-5', template_id: 'tpl-thursday-lower', exercise_id: 'ex-seated-calf-raise', order_index: 6, target_sets: 4, target_rep_min: 12, target_rep_max: 20, rest_seconds: 60 },
    { id: 'tplex-tpl-thursday-lower-6', template_id: 'tpl-thursday-lower', exercise_id: 'ex-cable-crunch', order_index: 7, target_sets: 3, target_rep_min: 12, target_rep_max: 15, rest_seconds: 60 },

    // Friday — Push + Arms
    { id: 'tplex-tpl-friday-push-0', template_id: 'tpl-friday-push', exercise_id: 'ex-incline-bench', order_index: 1, target_sets: 4, target_rep_min: 6, target_rep_max: 10, rest_seconds: 120 },
    { id: 'tplex-tpl-friday-push-1', template_id: 'tpl-friday-push', exercise_id: 'ex-machine-chest-press', order_index: 2, target_sets: 3, target_rep_min: 8, target_rep_max: 12, rest_seconds: 90 },
    { id: 'tplex-tpl-friday-push-2', template_id: 'tpl-friday-push', exercise_id: 'ex-cable-fly', order_index: 3, target_sets: 3, target_rep_min: 12, target_rep_max: 15, rest_seconds: 60 },
    { id: 'tplex-tpl-friday-push-3', template_id: 'tpl-friday-push', exercise_id: 'ex-lateral-raise', order_index: 4, target_sets: 4, target_rep_min: 12, target_rep_max: 15, rest_seconds: 60 },
    { id: 'tplex-tpl-friday-push-4', template_id: 'tpl-friday-push', exercise_id: 'ex-triceps-pushdown', order_index: 5, target_sets: 3, target_rep_min: 10, target_rep_max: 15, rest_seconds: 60 },
    { id: 'tplex-tpl-friday-push-5', template_id: 'tpl-friday-push', exercise_id: 'ex-overhead-cable-triceps-extension', order_index: 6, target_sets: 2, target_rep_min: 10, target_rep_max: 15, rest_seconds: 60 },
    { id: 'tplex-tpl-friday-push-6', template_id: 'tpl-friday-push', exercise_id: 'ex-db-curl', order_index: 7, target_sets: 3, target_rep_min: 10, target_rep_max: 12, rest_seconds: 60 },
  ];

  const { error: tplexErr } = await supabase.from('workout_template_exercises').upsert(tplExercises);
  if (tplexErr) {
    console.error('Error seeding Supabase template exercises:', tplexErr.message);
  }

  console.log('Supabase database seeded with all 5 routines & exercises successfully!');
}

seedSupabaseDatabase().catch(console.error);
