export type EquipmentType = 
  | 'Barbell' 
  | 'Dumbbell' 
  | 'Cable' 
  | 'Machine' 
  | 'Bodyweight' 
  | 'Smith Machine'
  | 'EZ Bar'
  | 'Other';

export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Shoulders' 
  | 'Legs' 
  | 'Arms' 
  | 'Core' 
  | 'Full Body';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: string[];
  equipment: EquipmentType;
  instructions?: string;
  defaultRepMin?: number;
  defaultRepMax?: number;
  isCustom?: boolean;
}

export interface WorkoutTemplateExercise {
  id: string;
  templateId: string;
  exerciseId: string;
  exercise?: Exercise;
  orderIndex: number;
  targetSets: number;
  targetRepMin: number;
  targetRepMax: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  targetDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Flexible';
  notes?: string;
  exercises: WorkoutTemplateExercise[];
}

export interface ExerciseSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  isCompleted: boolean;
  rpe?: number;
  restSecondsTaken?: number;
  previousPerformance?: string; // e.g. "55 kg × 10"
}

export interface WorkoutSessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  exercise: Exercise;
  orderIndex: number;
  notes?: string;
  sets: ExerciseSet[];
  previousSets?: { weightKg: number; reps: number }[];
}

export interface WorkoutSession {
  id: string;
  templateId?: string;
  name: string;
  startTime: string; // ISO date string
  endTime?: string;
  durationSeconds: number;
  totalVolumeKg: number;
  totalSets: number;
  prCount: number;
  status: 'active' | 'completed' | 'discarded';
  notes?: string;
  exercises?: WorkoutSessionExercise[];
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  recordType: 'max_weight' | 'max_reps' | 'max_volume' | 'estimated_1rm';
  value: number;
  unit: string;
  achievedAt: string;
  previousValue?: number;
}

export interface BodyweightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
}

export type TabType = 'workout' | 'history' | 'exercises' | 'progress' | 'settings';
