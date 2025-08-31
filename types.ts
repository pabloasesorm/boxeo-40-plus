export interface Exercise {
  name: string;
  shortDescription?: string;
  details: string;
  durationSeconds?: number;
  restDurationSeconds?: number;
  explanation?: string;
}

export interface WorkoutDay {
  day: number;
  focus: string;
  warmup: Exercise[];
  mainWorkout: Exercise[];
  cooldown: Exercise[];
}

export interface ProgressionPrinciple {
    principle: string;
    description: string;
}

export interface WeeklyPlan {
  weeklyPlan: WorkoutDay[];
  progressionPrinciples: ProgressionPrinciple[];
}

// --- NEW/MODIFIED TYPES ---

export const availableEquipment = [
    'Clubbells',
    'Kettlebells',
    'Dumbbells',
    'Resistance Bands',
] as const;

export type Equipment = typeof availableEquipment[number];

export interface UserProfile {
    experience: string;
    goal: string;
    equipment: Equipment[];
}
