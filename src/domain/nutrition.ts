import { UserProfile, Macros, DayPlan, FastingType, CarbDayType } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user_1',
  name: 'كابتن أحمد',
  age: 28,
  gender: 'Male',
  heightCm: 178,
  weightKg: 82,
  activityLevel: 1.55, // Moderate workout 3-5 days/week
  goal: 'muscle',
  fastingType: '16:8',
  targetWeightKg: 78,
  bodyFatPct: 16,
  weeksInDeficit: 4,
  weeklyTrainingSets: 20,
  avgRPE: 8.5,
  notes: 'تركيز على بناء الكتلة العضلية وخفض نسبة الدهون بالتناوب'
};

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'خامل (عمل مكتبي، لا توجد تمارين)' },
  { value: 1.375, label: 'نشاط خفيف (تمارين 1-3 أيام في الأسبوع)' },
  { value: 1.55, label: 'نشاط متوسط (تمارين 3-5 أيام في الأسبوع)' },
  { value: 1.725, label: 'نشاط عالٍ (تمارين مكثفة 6-7 أيام)' },
  { value: 1.9, label: 'نشاط رياضي محترف (تدريب مرتين يومياً)' },
];

export const GOALS_MAP = {
  muscle: {
    label: 'بناء عضلي وتجميد الجليكوجين (Hypertrophy / Recomp)',
    color: '#4CAF50',
    bgColor: 'rgba(76, 175, 80, 0.15)',
    borderColor: '#4CAF50',
    proteinMultiplierLBM: 2.3, // g per kg of LBM (Lean Body Mass)
    proteinMultiplierTotal: 2.0, // fallback per kg total weight
    carbRatio: 0.50,
    fatRatio: 0.25,
    calorieDelta: 250, // Surplus +250 kcal
    scientificBasis: 'زيادة طفيفة في السعرات (+250) مع بناء البروتين على الكتلة الخالية من الدهون LBM وتغذية الجليكوجين في أيام التمرين.',
    description: 'تركيز على زيادة الكربوهيدرات في أيام التمرين لتعزيز البناء العضلي وتجديد الجليكوجين.'
  },
  fatloss: {
    label: 'خسارة دهون متوازنة (Fat Loss)',
    color: '#2196F3',
    bgColor: 'rgba(33, 150, 243, 0.15)',
    borderColor: '#2196F3',
    proteinMultiplierLBM: 2.5,
    proteinMultiplierTotal: 1.9,
    carbRatio: 0.35,
    fatRatio: 0.28,
    calorieDelta: -400, // Deficit -400 kcal
    scientificBasis: 'عجز متوسط (-400) لحماية العضلات مع تحديد البروتين بناءً على LBM وتدوير الكارب لتفادي هبوط هرمون اللبتين وتكيّف الأيض.',
    description: 'تخفيض السعرات مع الحفاظ على أيام مرتفعة الكارب لمنع هبوط الأيض (Metabolic Adaptation).'
  },
  cutting: {
    label: 'تنشيف قاسي وجاهزية (Aggressive Cutting)',
    color: '#F44336',
    bgColor: 'rgba(244, 67, 54, 0.15)',
    borderColor: '#F44336',
    proteinMultiplierLBM: 2.7, // High protein to prevent muscle loss in severe deficit
    proteinMultiplierTotal: 2.2,
    carbRatio: 0.25,
    fatRatio: 0.25,
    calorieDelta: -600, // Deficit -600 kcal
    scientificBasis: 'عجز حاد (-600 سعرة) مع رفع البروتين إلى 2.7g/kg LBM لمنع الهدم العضلي، وتوجيه الكارب حواش التمارين فقط.',
    description: 'رفع البروتين لحماية العضلات مع تقليل الكربوهيدرات لمعظم أيام الأسبوع.'
  },
  maintenance: {
    label: 'محافظة وتوازن صحي (Maintenance)',
    color: '#9C27B0',
    bgColor: 'rgba(156, 39, 176, 0.15)',
    borderColor: '#9C27B0',
    proteinMultiplierLBM: 2.1,
    proteinMultiplierTotal: 1.7,
    carbRatio: 0.45,
    fatRatio: 0.30,
    calorieDelta: 0, // Zero surplus/deficit
    scientificBasis: 'توازن تام في الطاقة مع تدوير خفيف للكربوهيدرات لتعزيز الحساسية للإنسولين وزيادة أداء التمارين.',
    description: 'توازن مستقر في السعرات مع تدوير متوسط للكربوهيدرات لزيادة النشاط واللياقة.'
  }
};

/**
 * Validation Interface and Function to enforce zero missing data and strict scientific bounds
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProfileForNutrition(profile: UserProfile): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!profile.weightKg || profile.weightKg < 30 || profile.weightKg > 250) {
    errors.push('وزن الجسم غير مكتمل أو غير منطقي (يجب أن يكون بين 30 كجم و 250 كجم)');
  }
  if (!profile.heightCm || profile.heightCm < 100 || profile.heightCm > 230) {
    errors.push('طول القامة غير مكتمل أو غير منطقي (يجب أن يكون بين 100 سم و 230 سم)');
  }
  if (!profile.age || profile.age < 12 || profile.age > 90) {
    errors.push('العمر غير مكتمل (يجب أن يكون بين 12 و 90 سنة)');
  }
  if (!profile.gender || (profile.gender !== 'Male' && profile.gender !== 'Female')) {
    errors.push('الجنس البيولوجي غير محدد');
  }
  if (!profile.activityLevel || profile.activityLevel < 1.0 || profile.activityLevel > 2.5) {
    errors.push('مستوى النشاط البدني غير محدد بشكل صحيح');
  }
  if (!profile.goal || !['muscle', 'fatloss', 'cutting', 'maintenance'].includes(profile.goal)) {
    errors.push('الهدف التدريبي الرياضي غير محدد');
  }
  if (profile.bodyFatPct === undefined || profile.bodyFatPct === null || profile.bodyFatPct <= 0) {
    errors.push('نسبة الدهون في الجسم (bodyFatPct) مطلوبة إجبارياً لحسابات Katch-McArdle العلمية الدقيقة');
  } else if (profile.bodyFatPct < 3 || profile.bodyFatPct > 60) {
    errors.push('نسبة الدهون في الجسم غير منطقية (يجب أن تكون بين 3% و 60%)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function hasRequiredDataForKatchMcArdle(profile: UserProfile): boolean {
  return (
    Boolean(profile) &&
    typeof profile.weightKg === 'number' &&
    profile.weightKg > 0 &&
    typeof profile.bodyFatPct === 'number' &&
    profile.bodyFatPct > 0
  );
}

export function getEffectiveProfile(profile: UserProfile): UserProfile {
  const p = profile || DEFAULT_USER_PROFILE;
  const gender = p.gender === 'Female' ? 'Female' : 'Male';
  const weightKg = (typeof p.weightKg === 'number' && p.weightKg > 0) ? p.weightKg : 80;
  const bodyFatPct = (typeof p.bodyFatPct === 'number' && p.bodyFatPct > 0)
    ? p.bodyFatPct
    : (gender === 'Female' ? 23 : 15);
  const heightCm = (typeof p.heightCm === 'number' && p.heightCm > 0) ? p.heightCm : 175;
  const age = (typeof p.age === 'number' && p.age > 0) ? p.age : 28;
  const activityLevel = (typeof p.activityLevel === 'number' && p.activityLevel > 0) ? p.activityLevel : 1.55;
  const weeksInDeficit = (typeof p.weeksInDeficit === 'number' && p.weeksInDeficit >= 0) ? p.weeksInDeficit : 4;
  const weeklyTrainingSets = (typeof p.weeklyTrainingSets === 'number' && p.weeklyTrainingSets > 0) ? p.weeklyTrainingSets : 20;
  const avgRPE = (typeof p.avgRPE === 'number' && p.avgRPE >= 5) ? p.avgRPE : 8.5;

  return {
    ...p,
    weightKg,
    gender,
    bodyFatPct,
    heightCm,
    age,
    activityLevel,
    weeksInDeficit,
    weeklyTrainingSets,
    avgRPE,
    goal: p.goal || 'muscle'
  };
}

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

export interface CarbLookupEntry {
  baseCarbRatioPct: number;
  highCarbMultiplier: number;
  mediumCarbMultiplier: number;
  lowCarbMultiplier: number;
  refeedCarbMultiplier: number;
  description: string;
}

export const CARB_REQUIREMENT_LOOKUP_TABLE: Record<BodyFatTier, Record<ActivityTier, CarbLookupEntry>> = {
  essential: {
    sedentary: { baseCarbRatioPct: 45, highCarbMultiplier: 1.35, mediumCarbMultiplier: 1.0, lowCarbMultiplier: 0.60, refeedCarbMultiplier: 1.40, description: 'دهون منخفضة جداً + نشاط خامل: حساسية إنسولين أقصاها، تدوير معتدل.' },
    moderate: { baseCarbRatioPct: 50, highCarbMultiplier: 1.45, mediumCarbMultiplier: 1.0, lowCarbMultiplier: 0.55, refeedCarbMultiplier: 1.50, description: 'دهون منخفضة جداً + نشاط متوسط: شحن جليكوجين ممتاز للبناء دون تخزين دهون.' },
    intense: { baseCarbRatioPct: 55, highCarbMultiplier: 1.55, mediumCarbMultiplier: 1.0, lowCarbMultiplier: 0.50, refeedCarbMultiplier: 1.60, description: 'دهون منخفضة جداً + نشاط مكثف: أقصى كمية كربوهيدرات للأداء الرياضي الفائق.' }
  },
  lean: {
    sedentary: { baseCarbRatioPct: 40, highCarbMultiplier: 1.30, mediumCarbMultiplier: 1.0, lowCarbMultiplier: 0.55, refeedCarbMultiplier: 1.35, description: 'جسم ممشوق + نشاط خامل: توازن كربوهيدرات مع ضبط الفائض.' },
    moderate: { baseCarbRatioPct: 45, highCarbMultiplier: 1.40, mediumCarbMultiplier: 1.0, lowCarbMultiplier: 0.50, refeedCarbMultiplier: 1.45, description: 'جسم ممشوق + نشاط متوسط: تدوير كارب مثالي لدعم الاستشفاء وتجديد الجليكوجين.' },
    intense: { baseCarbRatioPct: 50, highCarbMultiplier: 1.50, mediumCarbMultiplier: 1.0, lowCarbMultiplier: 0.45, refeedCarbMultiplier: 1.55, description: 'جسم ممشوق + نشاط مكثف: كربوهيدرات مرتفعة في التمرين مع انخفاض موجه بالراحة.' }
  },
  moderate: {
    sedentary: { baseCarbRatioPct: 35, highCarbMultiplier: 1.25, mediumCarbMultiplier: 0.95, lowCarbMultiplier: 0.50, refeedCarbMultiplier: 1.30, description: 'دهون متوسطة + نشاط خامل: تقليل الكارب بالراحة لتنشيط أكسدة الشحوم.' },
    moderate: { baseCarbRatioPct: 40, highCarbMultiplier: 1.35, mediumCarbMultiplier: 0.95, lowCarbMultiplier: 0.45, refeedCarbMultiplier: 1.40, description: 'دهون متوسطة + نشاط متوسط: تدوير متوازن بين التمرين والاستشفاء.' },
    intense: { baseCarbRatioPct: 45, highCarbMultiplier: 1.40, mediumCarbMultiplier: 0.95, lowCarbMultiplier: 0.40, refeedCarbMultiplier: 1.45, description: 'دهون متوسطة + نشاط مكثف: كربوهيدرات موجهة خصيصاً للتمرين للحفاظ على العضلات.' }
  },
  high: {
    sedentary: { baseCarbRatioPct: 25, highCarbMultiplier: 1.15, mediumCarbMultiplier: 0.85, lowCarbMultiplier: 0.40, refeedCarbMultiplier: 1.20, description: 'دهون مرتفعة + نشاط خامل: تقييد الكارب لإعادة رفع حساسية الإنسولين وأكسدة الدهون.' },
    moderate: { baseCarbRatioPct: 30, highCarbMultiplier: 1.25, mediumCarbMultiplier: 0.85, lowCarbMultiplier: 0.40, refeedCarbMultiplier: 1.25, description: 'دهون مرتفعة + نشاط متوسط: كربوهيدرات مركزة حول التمرين فقط مع سقف حماية لحرق الدهون.' },
    intense: { baseCarbRatioPct: 35, highCarbMultiplier: 1.30, mediumCarbMultiplier: 0.85, lowCarbMultiplier: 0.35, refeedCarbMultiplier: 1.35, description: 'دهون مرتفعة + نشاط مكثف: كربوهيدرات محسوبة بدقة لدعم التمارين الثقيلة دون تعطيل العجز.' }
  }
};

export function getCarbLookupEntry(profile: UserProfile): CarbLookupEntry {
  const effective = getEffectiveProfile(profile);
  const fatTier = getBodyFatTier(effective.gender, effective.bodyFatPct!);
  const actTier = getActivityTier(effective.activityLevel);
  return CARB_REQUIREMENT_LOOKUP_TABLE[fatTier][actTier];
}

export interface CarbMatrixRule {
  highCarbFactor: number;
  mediumCarbFactor: number;
  lowCarbFactor: number;
  highCalorieAdj: number;
  lowCalorieAdj: number;
  bodyFatCategoryLabel: string;
  activityCategoryLabel: string;
  matrixRuleRationale: string;
}

export function getCarbMatrixRules(profile: UserProfile): CarbMatrixRule {
  const effective = getEffectiveProfile(profile);
  const lookup = getCarbLookupEntry(effective);
  const fatTier = getBodyFatTier(effective.gender, effective.bodyFatPct!);
  const actTier = getActivityTier(effective.activityLevel);

  const fatTierLabels: Record<BodyFatTier, string> = {
    essential: 'نسبة دهون منخفضة جداً (رياضي محترف / منافسات)',
    lean: 'نسبة دهون مثالية وممشوقة (Lean Body Comp)',
    moderate: 'نسبة دهون متوسطة (Moderate Body Comp)',
    high: 'نسبة دهون مرتفعة / سمنة (High Body Fat - Obese Cap Active)'
  };

  const actTierLabels: Record<ActivityTier, string> = {
    sedentary: 'نشاط خامل إلى مجهد خفيف',
    moderate: 'نشاط تمرين متوسط (3-5 أيام أسبوعياً)',
    intense: 'نشاط رياضي مكثف وساعات تمرين طويلة'
  };

  return {
    highCarbFactor: lookup.highCarbMultiplier,
    mediumCarbFactor: lookup.mediumCarbMultiplier,
    lowCarbFactor: lookup.lowCarbMultiplier,
    highCalorieAdj: 250,
    lowCalorieAdj: -250,
    bodyFatCategoryLabel: fatTierLabels[fatTier],
    activityCategoryLabel: actTierLabels[actTier],
    matrixRuleRationale: lookup.description
  };
}

/**
 * Generate 7-Day Carb Cycling Plan based on Muscle Group Glycogen Depletion & Energy Availability
 */
export function generateWeeklyCarbPlan(profile: UserProfile): DayPlan[] {
  const validation = validateProfileForNutrition(profile);
  if (!validation.isValid) {
    throw new Error(`خطأ في بيانات الملف الشخصي: ${validation.errors.join(' | ')}`);
  }

  const effective = getEffectiveProfile(profile);
  const phys = calculatePhysiologicalEngineState(effective);
  const matrixRules = getCarbMatrixRules(effective);

  const daysConfig = [
    { name: 'السبت', isWorkout: true, muscle: 'أرجل + سمانة (شدة عالية)' },
    { name: 'الأحد', isWorkout: true, muscle: 'ظهر + بايسبس + بطن' },
    { name: 'الإثنين', isWorkout: false, muscle: 'راحة واستشفاء عضلات' },
    { name: 'الثلاثاء', isWorkout: true, muscle: 'صدر + ترايسبس + أكتاف' },
    { name: 'الأربعاء', isWorkout: true, muscle: 'أرجل كواذ + خلفيات' },
    { name: 'الخميس', isWorkout: true, muscle: 'ذراعين + أكتاف جانبي' },
    { name: 'الجمعة', isWorkout: false, muscle: 'راحة واستشفاء تام' }
  ];

  const assignedDays = daysConfig.map((d, index) => {
    let isWorkout = d.isWorkout;
    if (effective.workoutDays && Array.isArray(effective.workoutDays) && effective.workoutDays.length > 0) {
      isWorkout = effective.workoutDays.includes(index);
    }

    let isHeavy = index === 0 || index === 3;
    if (effective.heavyWorkoutDays && Array.isArray(effective.heavyWorkoutDays) && effective.heavyWorkoutDays.length > 0) {
      isHeavy = effective.heavyWorkoutDays.includes(index);
    }

    let type: CarbDayType = 'medium';
    let workoutFocus = d.muscle;

    if (effective.goal === 'muscle') {
      if (isHeavy) {
        type = 'high';
      } else if (isWorkout) {
        type = 'medium';
      } else {
        type = 'low';
      }
    } else if (effective.goal === 'fatloss') {
      if (isHeavy) {
        type = 'high';
      } else if (isWorkout) {
        type = 'medium';
      } else {
        type = 'low';
      }
    } else if (effective.goal === 'cutting') {
      if (index === 0 && phys.refeedRecommendation !== 'none') {
        type = 'refeed';
        workoutFocus = 'يوم Refeed شحن الجليكوجين + تمرين أرجل حاد';
      } else if (isHeavy || isWorkout) {
        type = 'medium';
      } else {
        type = 'low';
      }
    } else {
      if (isHeavy) {
        type = 'high';
      } else if (isWorkout) {
        type = 'medium';
      } else {
        type = 'low';
      }
    }

    if (effective.carbCycleStrategy === 'high_low_2tier') {
      type = isWorkout ? 'high' : 'low';
    } else if (effective.carbCycleStrategy === 'refeed_matrix') {
      type = (index === 0 && phys.refeedRecommendation !== 'none') ? 'refeed' : 'low';
    }

    return { name: d.name, isWorkout, type, workoutFocus, targetMuscleGroup: d.muscle };
  });

  return assignedDays.map((d) => {
    let carbsPerLbmRate = 2.5;
    let fatPerLbmRate = 0.8;
    let proteinPerLbmRate = GOALS_MAP[effective.goal]?.proteinMultiplierLBM || 2.4;
    let estimatedDepletion = 0;
    let eee = 0;

    const isLegsOrBack = d.workoutFocus.includes('أرجل') || d.workoutFocus.includes('ظهر');

    if (d.type === 'high') {
      carbsPerLbmRate = phys.obesityInsulinCapActive ? 2.4 : (isLegsOrBack ? 4.2 : 3.6);
      fatPerLbmRate = 0.60;
      estimatedDepletion = isLegsOrBack ? phys.heavyLegWorkoutDepletionG : phys.upperBodyWorkoutDepletionG;
      eee = Math.round(phys.lbmKg * 4.8);
    } else if (d.type === 'medium') {
      carbsPerLbmRate = phys.obesityInsulinCapActive ? 1.8 : 2.8;
      fatPerLbmRate = 0.80;
      estimatedDepletion = phys.upperBodyWorkoutDepletionG;
      eee = Math.round(phys.lbmKg * 3.6);
    } else if (d.type === 'low') {
      carbsPerLbmRate = phys.obesityInsulinCapActive ? 1.0 : 1.3;
      fatPerLbmRate = 1.15; // Fat elevated on low carb days for hormone/androgen support
      proteinPerLbmRate += 0.15;
      estimatedDepletion = 0;
      eee = Math.round(phys.lbmKg * 1.5);
    } else if (d.type === 'refeed') {
      carbsPerLbmRate = phys.obesityInsulinCapActive ? 3.0 : 5.4;
      fatPerLbmRate = 0.40; // Minimal fat during refeed to drive insulin & glycogen storage
      proteinPerLbmRate -= 0.2;
      estimatedDepletion = phys.heavyLegWorkoutDepletionG;
      eee = Math.round(phys.lbmKg * 4.2);
    }

    let dayCarbs = Math.round(phys.lbmKg * carbsPerLbmRate);
    let dayProtein = Math.round(phys.lbmKg * proteinPerLbmRate);
    let dayFat = Math.round(phys.lbmKg * fatPerLbmRate);

    if (phys.obesityInsulinCapActive && dayCarbs > 250) {
      dayCarbs = 250;
    }

    dayCarbs = Math.max(30, dayCarbs);

    const finalCalories = (dayProtein * 4) + (dayCarbs * 4) + (dayFat * 9);

    // Calculate Energy Availability (EA) for this day
    const dayEA = Math.round(((finalCalories - eee) / phys.lbmKg) * 10) / 10;
    let eaCat: 'low' | 'optimal_fatloss' | 'hypertrophy' = 'optimal_fatloss';
    if (dayEA < 30) eaCat = 'low';
    else if (dayEA > 45) eaCat = 'hypertrophy';

    // Calculate food portions in grams
    const cookedRicePortionG = Math.round((dayCarbs * 0.40) / 0.28);
    const sweetPotatoPortionG = Math.round((dayCarbs * 0.30) / 0.20);
    const oatsPortionG = Math.round((dayCarbs * 0.25) / 0.66);
    const chickenPortionG = Math.round((dayProtein * 0.45) / 0.31);

    const sources = (d.type === 'high' || d.type === 'refeed')
      ? [
          `${cookedRicePortionG}g أرز أبيض/بني مطبوخ`,
          `${sweetPotatoPortionG}g بطاطس حلوة مشوية`,
          `${oatsPortionG}g شوفان جاف`,
          'موزة متوسطة (27g carb)',
          `${chickenPortionG}g صدر دجاج مشوي`
        ]
      : d.type === 'medium'
      ? [
          `${Math.round(cookedRicePortionG * 0.75)}g أرز بني مسلوق`,
          `${Math.round(sweetPotatoPortionG * 0.75)}g بطاطس مسلوقة`,
          `${Math.round(oatsPortionG * 0.8)}g شوفان بالحليب`,
          'تفاح / توت',
          `${chickenPortionG}g صدر دجاج / تونة`
        ]
      : [
          'أفوكادو (50g)',
          'مكسرات نية (25g)',
          'خضروات ورقية وبروكلي مفتوح',
          'بذور الشيا والكتان',
          `${Math.round(cookedRicePortionG * 0.25)}g أرز مسلوق فقط`
        ];

    const carbMultiplier = Math.round((carbsPerLbmRate / 2.5) * 100) / 100;

    const scientificRationale = `تم حساب الكارب (${dayCarbs}g = ${carbsPerLbmRate}g/kg LBM) بناءً على الكتلة الخالية من الدهون (${phys.lbmKg}kg)، مستهدف العضلة (${d.workoutFocus})، ومعدل استهلاك الجليكوجين (${estimatedDepletion}g). ملاَءة الطاقة EA = ${dayEA} kcal/kg LBM.` + (phys.obesityInsulinCapActive ? ' [تم تطبيق سقف حماية الدهون].' : '');

    const refeedStatus = phys.refeedRecommendation !== 'none'
      ? `موصى بـ Refeed: ${phys.refeedRecommendation}`
      : 'الـ Refeed غير مطلوب حالياً (مستوى الإجهاد متزن)';

    return {
      dayName: d.name,
      type: d.type,
      carbs: dayCarbs,
      protein: dayProtein,
      fat: dayFat,
      calories: finalCalories,
      workoutFocus: d.workoutFocus,
      targetMuscleGroup: d.targetMuscleGroup,
      recommendedCarbSources: sources,
      isWorkout: d.isWorkout,
      carbMultiplier,
      scientificRationale,
      bodyFatTierLabel: matrixRules.bodyFatCategoryLabel,
      activityTierLabel: matrixRules.activityCategoryLabel,
      carbsPerLbmKg: carbsPerLbmRate,
      proteinPerLbmKg: Math.round(proteinPerLbmRate * 10) / 10,
      fatPerLbmKg: Math.round(fatPerLbmRate * 10) / 10,
      estimatedGlycogenDepletionG: estimatedDepletion,
      glycogenRestorationTargetG: dayCarbs,
      refeedEligibilityStatus: refeedStatus,
      energyAvailability: dayEA,
      eaCategory: eaCat,
      adaptiveTdee: phys.adaptiveTdee,
      exerciseEnergyExpenditure: eee
    };
  });
}

/**
 * Detailed Scientific Breakdown for UI Transparency & Zero Hallucination
 */
export interface ScientificBreakdown {
  validation: ValidationResult;
  matrixRules: CarbMatrixRule;
  phys: PhysiologicalEngineState;
  bmrFormula: string;
  bmrValue: number;
  bmrKatchValue: number;
  bmrMifflinValue: number;
  lbmKg: number;
  bodyFatPctUsed: number;
  activityLabel: string;
  activityMultiplier: number;
  tdeeValue: number;
  adaptiveTdeeValue: number;
  goalName: string;
  goalCalorieDelta: number;
  targetCalories: number;
  proteinGrams: number;
  proteinMultiplierLBM: number;
  proteinCalories: number;
  fatGrams: number;
  fatRatioPct: number;
  fatCalories: number;
  baseCarbGrams: number;
  scientificBasisText: string;
  highCarbRule: string;
  mediumCarbRule: string;
  lowCarbRule: string;
}

export function getScientificBreakdownDetails(profile: UserProfile): ScientificBreakdown {
  const validation = validateProfileForNutrition(profile);
  const matrixRules = getCarbMatrixRules(profile);
  const phys = calculatePhysiologicalEngineState(profile);

  const lbmKg = phys.lbmKg;
  const bodyFatPctUsed = profile.bodyFatPct && profile.bodyFatPct > 0 
    ? profile.bodyFatPct 
    : (profile.gender === 'Male' ? 15 : 23);

  const goalConfig = GOALS_MAP[profile.goal] || GOALS_MAP.muscle;
  const act = ACTIVITY_LEVELS.find((a) => a.value === profile.activityLevel) || ACTIVITY_LEVELS[2];

  const targetCalories = Math.max(1200, phys.adaptiveTdee + goalConfig.calorieDelta);
  const proteinGrams = Math.round(lbmKg * goalConfig.proteinMultiplierLBM);
  const proteinCalories = proteinGrams * 4;

  const fatGrams = Math.round(lbmKg * 0.85);
  const fatCalories = fatGrams * 9;

  const carbCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const baseCarbGrams = Math.round(carbCalories / 4);

  const highCarbRule = `ماتريكس LBM (${Math.round(phys.obesityInsulinCapActive ? 2.4 : 3.8)}g/kg LBM): كربوهيدرات عالية لشحن مخزن الجليكوجين العضلي (سعة ${phys.muscleGlycogenCapacityG}g) في أيام التمارين المركبة`;
  const mediumCarbRule = `ماتريكس LBM (${Math.round(phys.obesityInsulinCapActive ? 1.8 : 2.8)}g/kg LBM): كربوهيدرات متوسطة لتأمين طاقة التمارين العامة دون فائض`;
  const lowCarbRule = `ماتريكس LBM (${Math.round(phys.obesityInsulinCapActive ? 1.0 : 1.3)}g/kg LBM): كربوهيدرات منخفضة بالراحة لتأمين طاقة الدماغ الأساسية (${phys.basalBrainGlucoseNeedG}g) وتحفيز أكسدة الدهون`;

  return {
    validation,
    matrixRules,
    phys,
    bmrFormula: `370 + (21.6 × LBM ${lbmKg}kg)`,
    bmrValue: phys.bmrKatch,
    bmrKatchValue: phys.bmrKatch,
    bmrMifflinValue: phys.bmrMifflin,
    lbmKg,
    bodyFatPctUsed,
    activityLabel: act.label,
    activityMultiplier: profile.activityLevel,
    tdeeValue: phys.rawTdee,
    adaptiveTdeeValue: phys.adaptiveTdee,
    goalName: goalConfig.label,
    goalCalorieDelta: goalConfig.calorieDelta,
    targetCalories,
    proteinGrams,
    proteinMultiplierLBM: goalConfig.proteinMultiplierLBM,
    proteinCalories,
    fatGrams,
    fatRatioPct: Math.round((fatCalories / targetCalories) * 100),
    fatCalories,
    baseCarbGrams,
    scientificBasisText: goalConfig.scientificBasis,
    highCarbRule,
    mediumCarbRule,
    lowCarbRule,
  };
}

export interface IntradayCarbTiming {
  preWorkoutCarbsG: number;
  preWorkoutPct: number;
  postWorkoutCarbsG: number;
  postWorkoutPct: number;
  otherMealsCarbsG: number;
  otherMealsPct: number;
  preWorkoutWindowText: string;
  postWorkoutWindowText: string;
  otherMealsWindowText: string;
  insulinSensitivityFactor: string;
  scientificRationale: string;
}

export function calculateIntradayCarbDistribution(dayPlan: DayPlan, profile: UserProfile): IntradayCarbTiming {
  const effective = getEffectiveProfile(profile);
  const totalCarbs = dayPlan.carbs;
  const isWorkout = dayPlan.isWorkout !== undefined ? dayPlan.isWorkout : !dayPlan.workoutFocus?.includes('راحة');
  const dayType = dayPlan.type;
  const bodyFat = effective.bodyFatPct || 15;

  let insulinSensitivityText = 'حساسية إنسولين عالية (توجيه ممتاز للماكروز نحو الخلايا العضلية عبر GLUT4)';
  if (bodyFat > 22) {
    insulinSensitivityText = 'حساسية إنسولين منخفضة (تركيز الكارب حول نافذة التمرين فقط لمنع التخزين في النسيج الدهني)';
  } else if (bodyFat > 16) {
    insulinSensitivityText = 'حساسية إنسولين معتدلة (توزيع متوازن وتوجيه جليكوجيني جيد)';
  }

  let prePct = 30;
  let postPct = 45;
  let rationale = '';

  if (isWorkout) {
    if (dayType === 'high' || dayType === 'refeed') {
      if (bodyFat <= 15) {
        prePct = 35;
        postPct = 45;
      } else {
        prePct = 30;
        postPct = 50;
      }
      rationale = `في أيام الكارب المرتفع (${totalCarbs}g)، يُوجه ${postPct}% من الكارب في نافذة الاستشفاء بعد التمرين مباشرة لشحن الجليكوجين عبر مستقبلات GLUT4 البنائية.`;
    } else if (dayType === 'medium') {
      prePct = 30;
      postPct = 40;
      rationale = `في أيام الكارب المتوسط (${totalCarbs}g)، يُوزع الكارب بنسبة ${prePct}% قبل التمرين لتأمين طاقة التدريب و ${postPct}% بعد التمرين لإيقاف الهدم وتجديد المخازن.`;
    } else {
      prePct = 25;
      postPct = 45;
      rationale = `في أيام الكارب المنخفض مع التمرين (${totalCarbs}g)، يُركز معظم الكارب حول التمرين توفيراً للجلوكوز العضلي مع تحفيز أكسدة الشحوم بقية اليوم.`;
    }
  } else {
    if (dayType === 'high' || dayType === 'refeed') {
      prePct = 35;
      postPct = 40;
      rationale = `في يوم الراحة ذو الكارب المرتفع (${totalCarbs}g)، تُقسم الكميات بين وجبات نافذة الأكل لإعادة تعبئة الجليكوجين الكبدي والعضلي ببطء مع دعم هرمون اللبتين.`;
    } else {
      prePct = 35;
      postPct = 35;
      rationale = `في يوم الراحة المنخفض الكارب (${totalCarbs}g)، يُوزع الكارب بالتساوي على وجبات نافذة الأكل مع التركيز على الكارب المعقد الخضراوي ذو المؤشر الجلايسيمي المنخفض (Low GI).`;
    }
  }

  const preWorkoutCarbsG = Math.round((totalCarbs * prePct) / 100);
  const postWorkoutCarbsG = Math.round((totalCarbs * postPct) / 100);
  const otherMealsPct = Math.max(0, 100 - (prePct + postPct));
  const otherMealsCarbsG = Math.max(0, totalCarbs - (preWorkoutCarbsG + postWorkoutCarbsG));

  let preWindow = isWorkout ? 'قبل التمرين بـ 1.5 - 2 ساعة (وجبة الشحن)' : 'وجبة كسر الصيام الأولى';
  let postWindow = isWorkout ? 'خلال 45 دقيقة بعد التمرين (النافذة البنائية)' : 'الوجبة الرئيسية الثانية';
  let otherWindow = isWorkout ? 'الوجبة الثالثة / ختام نافذة الأكل' : 'الوجبة الأخيرة في النافذة';

  return {
    preWorkoutCarbsG,
    preWorkoutPct: prePct,
    postWorkoutCarbsG,
    postWorkoutPct: postPct,
    otherMealsCarbsG,
    otherMealsPct,
    preWorkoutWindowText: preWindow,
    postWorkoutWindowText: postWindow,
    otherMealsWindowText: otherWindow,
    insulinSensitivityFactor: insulinSensitivityText,
    scientificRationale: rationale
  };
}

export function recommendFasting(profile: UserProfile): FastingType {
  if (profile.age > 60) return '12:12';
  if (profile.goal === 'muscle') return '14:10';
  if (profile.goal === 'fatloss') return '16:8';
  if (profile.goal === 'cutting') return '18:6';
  return '16:8';
}
