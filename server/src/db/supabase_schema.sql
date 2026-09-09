-- Supabase PostgreSQL Schema for Mjolnir Gym Tracker

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  muscle_group TEXT NOT NULL,
  secondary_muscles TEXT,
  equipment TEXT NOT NULL,
  instructions TEXT,
  default_rep_min INTEGER DEFAULT 6,
  default_rep_max INTEGER DEFAULT 12,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_day TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_template_exercises (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  target_sets INTEGER NOT NULL DEFAULT 3,
  target_rep_min INTEGER NOT NULL DEFAULT 6,
  target_rep_max INTEGER NOT NULL DEFAULT 10,
  rest_seconds INTEGER NOT NULL DEFAULT 90,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,
  template_id TEXT REFERENCES workout_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  total_volume_kg REAL DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  pr_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_session_exercises (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS exercise_sets (
  id TEXT PRIMARY KEY,
  session_exercise_id TEXT NOT NULL REFERENCES workout_session_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight_kg REAL NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  rpe REAL,
  rest_seconds_taken INTEGER
);

CREATE TABLE IF NOT EXISTS personal_records (
  id TEXT PRIMARY KEY,
  exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  value REAL NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  previous_value REAL
);

CREATE TABLE IF NOT EXISTS bodyweight_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  weight_kg REAL NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) policies allowing public access for personal gym tracker
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bodyweight_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Allow public insert exercises" ON exercises FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read workout_templates" ON workout_templates FOR SELECT USING (true);
CREATE POLICY "Allow public insert workout_templates" ON workout_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update workout_templates" ON workout_templates FOR UPDATE USING (true);

CREATE POLICY "Allow public read workout_template_exercises" ON workout_template_exercises FOR SELECT USING (true);
CREATE POLICY "Allow public insert workout_template_exercises" ON workout_template_exercises FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete workout_template_exercises" ON workout_template_exercises FOR DELETE USING (true);

CREATE POLICY "Allow public read workout_sessions" ON workout_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert workout_sessions" ON workout_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read workout_session_exercises" ON workout_session_exercises FOR SELECT USING (true);
CREATE POLICY "Allow public insert workout_session_exercises" ON workout_session_exercises FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read exercise_sets" ON exercise_sets FOR SELECT USING (true);
CREATE POLICY "Allow public insert exercise_sets" ON exercise_sets FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read personal_records" ON personal_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert personal_records" ON personal_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update personal_records" ON personal_records FOR UPDATE USING (true);

CREATE POLICY "Allow public read bodyweight_entries" ON bodyweight_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert bodyweight_entries" ON bodyweight_entries FOR INSERT WITH CHECK (true);
