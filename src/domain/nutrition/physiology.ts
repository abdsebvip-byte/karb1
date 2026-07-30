import { UserProfile, Macros } from '../../types';
import { getEffectiveProfile, GOALS_MAP } from './validation';

export type BodyFatTier = 'essential' | 'lean' | 'moderate' | 'high';
export type ActivityTier = 'sedentary' | 'moderate' | 'intense';

export function getBodyFatTier(gender: 'Male' | 'Female', bodyFatPct: number): BodyFatTier {
  if (gender === 'Male') {
    if (bodyFatPct < 10) return 'essential';
    if (bodyFatPct <= 16) return 'lean';
    if (bodyFatPct <= 22) return 'moderate';
    return 'high';
  } else {
    if (bodyFatPct < 18) return 'essential';
    if (bodyFatPct <= 24) return 'lean';
    if (bodyFatPct <= 30) return 'moderate';
    return 'high';
  }
}

export function getActivityTier(activityLevel: number): ActivityTier {
  if (activityLevel < 1.4) return 'sedentary';
  if (activityLevel <= 1.65) return 'moderate';
  return 'intense';
}

/**
 * Exercise Physiology Engine - Energy Availability (EA), Adaptive Metabolism, & Glycogen Dynamics
 */
export interface PhysiologicalEngineState {
  lbmKg: number;
  fatMassKg: number;
  bmrKatch: number;
  bmrMifflin: number;
  rawTdee: number;
  adaptiveFactor: number; // 0.82 to 1.0 (Metabolic Adaptation from weeks in deficit)
  adaptiveTdee: number; // TDEE corrected for adaptive thermogenesis
  muscleGlycogenCapacityG: number; // ~15g per kg LBM
  liverGlycogenCapacityG: number;  // ~90g
  totalGlycogenCapacityG: number;
  basalBrainGlucoseNeedG: number;  // ~120g/day
  heavyLegWorkoutDepletionG: number;
  upperBodyWorkoutDepletionG: number;
  energyAvailabilityTarget: number; // kcal/kg LBM/day
  eaStatusLabel: string;
  dietFatigueScore: number; // 0 - 100
  refeedRecommendation: 'none' | '1_day_refeed' | '2_day_refeed' | 'diet_break_1week';
  obesityInsulinCapActive: boolean;
  projectedWeeklyFatLossKg: number;
  projectedWeeklyMuscleMassKg: number;
  estimatedWeeksToGoal: number;
}

export function calculatePhysiologicalEngineState(profile: UserProfile): PhysiologicalEngineState {
  const effective = getEffectiveProfile(profile);
  const lbmKg = Math.round(effective.weightKg * (1 - effective.bodyFatPct! / 100) * 10) / 10;
  const fatMassKg = Math.round((effective.weightKg - lbmKg) * 10) / 10;

  const bmrKatch = Math.round(370 + (21.6 * lbmKg));
  const bmrMifflin = calculateBMRMifflin(effective);
  const rawTdee = Math.round(bmrKatch * effective.activityLevel);

  // Metabolic Adaptation model based on weeks in deficit
  const weeks = effective.weeksInDeficit || 0;
  // Thyroid T3/NEAT drops ~1.2% per week in deficit down to max 18% reduction
  const adaptiveFactor = Math.max(0.82, Math.round((1.0 - (weeks * 0.012)) * 100) / 100);
  const adaptiveTdee = Math.round(rawTdee * adaptiveFactor);

  // Glycogen capacities
  const muscleGlycogenCapacityG = Math.round(lbmKg * 15);
  const liverGlycogenCapacityG = 90;
  const totalGlycogenCapacityG = muscleGlycogenCapacityG + liverGlycogenCapacityG;
  const basalBrainGlucoseNeedG = 120;

  // Training volume & RPE specific glycogen depletion
  const setsPerSession = Math.round((effective.weeklyTrainingSets || 20) / 4);
  const rpe = effective.avgRPE || 8.5;

  const heavyLegWorkoutDepletionG = Math.round(lbmKg * 1.45 * (setsPerSession / 6) * (rpe / 8.5));
  const upperBodyWorkoutDepletionG = Math.round(lbmKg * 1.05 * (setsPerSession / 6) * (rpe / 8.5));

  // Goal & Energy Availability (EA)
  const goalConfig = GOALS_MAP[effective.goal] || GOALS_MAP.muscle;
  const targetCalories = Math.max(1200, adaptiveTdee + goalConfig.calorieDelta);
  const avgEEE = Math.round(lbmKg * 3.8); // Average exercise energy expenditure kcal

  const eaVal = Math.round(((targetCalories - avgEEE) / lbmKg) * 10) / 10;

  let eaStatusLabel = 'ملاَءة طاقة ممتازة للبناء العضلي (EA > 45)';
  if (eaVal < 30) {
    eaStatusLabel = '⚠️ عجز طاقة حاد (Low Energy Availability < 30) - خطر هبوط هرموني RED-S';
  } else if (eaVal <= 45) {
    eaStatusLabel = 'عجز طاقة مثالي لخسارة الدهون مع حماية الغدد (EA 30-45)';
  }

  // Diet Fatigue Score (0 - 100)
  const fatTier = getBodyFatTier(effective.gender, effective.bodyFatPct!);
  let fatigueScore = Math.min(100, Math.round((weeks * 5) + (45 - Math.min(45, eaVal)) * 1.5 + (fatTier === 'essential' ? 25 : 0)));

  let refeedRecommendation: 'none' | '1_day_refeed' | '2_day_refeed' | 'diet_break_1week' = 'none';
  if (fatigueScore >= 80 || eaVal < 28) {
    refeedRecommendation = 'diet_break_1week';
  } else if (fatigueScore >= 60 || (weeks >= 6 && fatTier === 'lean')) {
    refeedRecommendation = '2_day_refeed';
  } else if (weeks >= 4 && fatTier !== 'high') {
    refeedRecommendation = '1_day_refeed';
  }

  const obesityInsulinCapActive = fatTier === 'high';

  // Body Composition Projections (Forbes / Hall model)
  const dailyCalorieDeficit = adaptiveTdee - targetCalories;
  const projectedWeeklyFatLossKg = dailyCalorieDeficit > 0 
    ? Math.round(((dailyCalorieDeficit * 7 * 0.85) / 7700) * 100) / 100 
    : 0;
  const projectedWeeklyMuscleMassKg = dailyCalorieDeficit < 0 
    ? Math.round((((Math.abs(dailyCalorieDeficit) * 7 * 0.45)) / 7700) * 100) / 100 
    : 0;

  const weightDiffKg = Math.max(0, effective.weightKg - (effective.targetWeightKg || effective.weightKg));
  const estimatedWeeksToGoal = projectedWeeklyFatLossKg > 0 ? Math.ceil(weightDiffKg / projectedWeeklyFatLossKg) : 0;

  return {
    lbmKg,
    fatMassKg,
    bmrKatch,
    bmrMifflin,
    rawTdee,
    adaptiveFactor,
    adaptiveTdee,
    muscleGlycogenCapacityG,
    liverGlycogenCapacityG,
    totalGlycogenCapacityG,
    basalBrainGlucoseNeedG,
    heavyLegWorkoutDepletionG,
    upperBodyWorkoutDepletionG,
    energyAvailabilityTarget: eaVal,
    eaStatusLabel,
    dietFatigueScore: fatigueScore,
    refeedRecommendation,
    obesityInsulinCapActive,
    projectedWeeklyFatLossKg,
    projectedWeeklyMuscleMassKg,
    estimatedWeeksToGoal
  };
}

export function calculateBMR(profile: UserProfile): number {
  const phys = calculatePhysiologicalEngineState(profile);
  return phys.bmrKatch;
}

export function calculateBMRMifflin(profile: UserProfile): number {
  const effective = getEffectiveProfile(profile);
  const { weightKg, heightCm, age, gender } = effective;
  if (gender === 'Male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

export function calculateTDEE(profile: UserProfile): number {
  const phys = calculatePhysiologicalEngineState(profile);
  return phys.adaptiveTdee;
}

export function calculateLeanBodyMass(profile: UserProfile): number {
  const phys = calculatePhysiologicalEngineState(profile);
  return phys.lbmKg;
}

/**
 * Calculates Baseline Macros using strict Lean Body Mass (LBM) anchoring
 */
export function calculateBaselineMacros(profile: UserProfile): Macros {
  const effective = getEffectiveProfile(profile);
  const phys = calculatePhysiologicalEngineState(effective);
  const goalConfig = GOALS_MAP[effective.goal] || GOALS_MAP.muscle;

  const targetCalories = Math.max(1200, phys.adaptiveTdee + goalConfig.calorieDelta);

  // Protein anchored strictly to LBM
  const proteinG = Math.round(phys.lbmKg * goalConfig.proteinMultiplierLBM);
  const proteinCal = proteinG * 4;

  // Fat anchored to LBM (0.85g per kg LBM baseline)
  let fatG = Math.round(phys.lbmKg * 0.85);
  const minFatG = Math.round((targetCalories * 0.20) / 9);
  const maxFatG = Math.round((targetCalories * 0.35) / 9);
  fatG = Math.max(minFatG, Math.min(maxFatG, fatG));
  const fatCal = fatG * 9;

  // Remaining calories allocated to Carbs
  let carbCal = targetCalories - (proteinCal + fatCal);
  let carbG = Math.round(carbCal / 4);

  // Safety Cap for Obese / Insulin Resistant Profiles
  if (phys.obesityInsulinCapActive) {
    const maxCarbCapG = Math.round(phys.lbmKg * 2.5);
    if (carbG > maxCarbCapG) {
      carbG = maxCarbCapG;
      carbCal = carbG * 4;
      fatG = Math.max(minFatG, Math.round((targetCalories - (proteinCal + carbCal)) / 9));
    }
  }

  carbG = Math.max(30, carbG);
  const actualCalories = Math.round((proteinG * 4) + (fatG * 9) + (carbG * 4));

  return {
    calories: actualCalories,
    protein: proteinG,
    fat: fatG,
    carbs: carbG
  };
}

export const calculateMacros = calculateBaselineMacros;
