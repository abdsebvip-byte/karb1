export type Gender = 'Male' | 'Female';

export type Goal = 'muscle' | 'fatloss' | 'cutting' | 'maintenance';

export type FastingType = '16:8' | '14:10' | '18:6' | '12:12' | 'none';

export type CarbDayType = 'high' | 'medium' | 'low' | 'refeed';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: number; // 1.2, 1.375, 1.55, 1.725, 1.9
  goal: Goal;
  fastingType: FastingType;
  carbCycleStrategy?: 'classic_3tier' | 'refeed_matrix' | 'high_low_2tier';
  targetWeightKg?: number;
  bodyFatPct?: number;
  workoutDays?: number[]; // indices 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
  heavyWorkoutDays?: number[]; // indices of high-intensity / heavy leg/back days
  notes?: string;
}

export interface Macros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DayPlan {
  dayName: string; // e.g. "السبت"
  type: CarbDayType;
  carbs: number; // in grams
  protein: number; // in grams
  fat: number; // in grams
  calories: number;
  workoutFocus: string;
  recommendedCarbSources: string[];
  isWorkout?: boolean;
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  quantity: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
}

export interface ProgressEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPct?: number;
  waistCm?: number;
  notes?: string;
  completedFastingHours?: number;
}

export interface FastingSession {
  id: string;
  startTime: string;
  endTime?: string;
  targetHours: number;
  completedHours: number;
  fastingType: FastingType;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
  suggestedMeals?: {
    title: string;
    description: string;
    carbs: number;
    protein: number;
    fat: number;
    calories: number;
  }[];
}

export interface ClientProfile extends UserProfile {
  clientCode: string;
  startDate: string;
  status: 'active' | 'paused' | 'completed';
  coachNotes?: string;
}
