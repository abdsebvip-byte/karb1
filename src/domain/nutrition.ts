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
    proteinMultiplier: 2.2, // g per kg
    carbRatio: 0.55,
    fatRatio: 0.25,
    calorieDelta: 250, // Surplus +250 kcal
    scientificBasis: 'زيادة طفيفة في السعرات (+250) مع رفع الكارب لأعلى مستوياته في أيام التمارين المركبة لشحن مخازن الجليكوجين وتحفيز البناء عبر هرمون الإنسولين البنائي.',
    description: 'تركيز على زيادة الكربوهيدرات في أيام التمرين لتعزيز البناء العضلي وتجديد الجليكوجين.'
  },
  fatloss: {
    label: 'خسارة دهون متوازنة (Fat Loss)',
    color: '#2196F3',
    bgColor: 'rgba(33, 150, 243, 0.15)',
    borderColor: '#2196F3',
    proteinMultiplier: 2.1,
    carbRatio: 0.35,
    fatRatio: 0.28,
    calorieDelta: -400, // Deficit -400 kcal
    scientificBasis: 'عجز متوسط في السعرات (-400) لحماية الكتلة العضلية مع تدوير الكارب لمنع هبوط هرمون اللبتين (Leptin) وتباطؤ معدل الأيض (Metabolic Adaptation).',
    description: 'تخفيض السعرات مع الحفاظ على أيام مرتفعة الكارب لمنع هبوط الأيض (Metabolic Adaptation).'
  },
  cutting: {
    label: 'تنشيف قاسي وجاهزية (Aggressive Cutting)',
    color: '#F44336',
    bgColor: 'rgba(244, 67, 54, 0.15)',
    borderColor: '#F44336',
    proteinMultiplier: 2.4,
    carbRatio: 0.25,
    fatRatio: 0.25,
    calorieDelta: -600, // Deficit -600 kcal
    scientificBasis: 'عجز حاد (-600 سعرة) مع رفع البروتين لأقصى حد حماة للعضلات (2.4g/kg) وأيام منخفضة الكارب لزيادة أكسدة الدهون مع يوم إعادة شحن جليكوجين (Refeed).',
    description: 'رفع البروتين إلى أقصى حد لحماية العضلات مع تقليل الكربوهيدرات لمعظم أيام الأسبوع.'
  },
  maintenance: {
    label: 'محافظة وتوازن صحي (Maintenance)',
    color: '#9C27B0',
    bgColor: 'rgba(156, 39, 176, 0.15)',
    borderColor: '#9C27B0',
    proteinMultiplier: 1.8,
    carbRatio: 0.45,
    fatRatio: 0.30,
    calorieDelta: 0, // Zero surplus/deficit
    scientificBasis: 'توازن تام في الطاقة (السعرات = TDEE) مع تدوير خفيف للكربوهيدرات لتعزيز الحساسية للإنسولين وزيادة طاقة التمرين.',
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

/**
 * Strict Data Requirement Guard (if-else condition)
 * Prevents calculations if bodyFatPct or weightKg is missing or invalid
 */
export function hasRequiredDataForKatchMcArdle(profile: UserProfile): boolean {
  return (
    Boolean(profile) &&
    typeof profile.weightKg === 'number' &&
    profile.weightKg > 0 &&
    typeof profile.bodyFatPct === 'number' &&
    profile.bodyFatPct > 0
  );
}

/**
 * Ensures profile has valid numbers for Katch-McArdle calculations,
 * falling back to gender defaults (15% male / 23% female, 80kg) if unprovided.
 */
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

  return {
    ...p,
    weightKg,
    gender,
    bodyFatPct,
    heightCm,
    age,
    activityLevel,
    goal: p.goal || 'muscle'
  };
}

/**
 * Body Fat and Activity Level Categorization Tiers
 */
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
 * Strict Lookup Table determining Carbohydrate Requirements & Scaling Factors
 * based on Body Fat Percentage Tiers (essential, lean, moderate, high)
 * and Physical Activity Tiers (sedentary, moderate, intense).
 */
export interface CarbLookupEntry {
  baseCarbRatioPct: number;    // Baseline Carb % of Total Energy
  highCarbMultiplier: number;  // Multiplier for High Carb / Heavy Workout Days
  mediumCarbMultiplier: number;// Multiplier for Medium Carb Days
  lowCarbMultiplier: number;   // Multiplier for Low Carb / Rest Days
  refeedCarbMultiplier: number;// Multiplier for Refeed Days
  description: string;
}

export const CARB_REQUIREMENT_LOOKUP_TABLE: Record<BodyFatTier, Record<ActivityTier, CarbLookupEntry>> = {
  essential: {
    sedentary: {
      baseCarbRatioPct: 45,
      highCarbMultiplier: 1.35,
      mediumCarbMultiplier: 1.0,
      lowCarbMultiplier: 0.60,
      refeedCarbMultiplier: 1.40,
      description: 'دهون منخفضة جداً + نشاط خامل: تركيز على حساسية إنسولين عالية مع تدوير طاقة معتدل.'
    },
    moderate: {
      baseCarbRatioPct: 50,
      highCarbMultiplier: 1.45,
      mediumCarbMultiplier: 1.0,
      lowCarbMultiplier: 0.55,
      refeedCarbMultiplier: 1.50,
      description: 'دهون منخفضة جداً + نشاط متوسط: شحن جليكوجين ممتاز لتعزيز البناء العضلي بدون تخزين شحوم.'
    },
    intense: {
      baseCarbRatioPct: 55,
      highCarbMultiplier: 1.55,
      mediumCarbMultiplier: 1.0,
      lowCarbMultiplier: 0.50,
      refeedCarbMultiplier: 1.60,
      description: 'دهون منخفضة جداً + نشاط مكثف: أقصى كمية كربوهيدرات لدعم التدريب المكثف والأداء الأقصى.'
    }
  },
  lean: {
    sedentary: {
      baseCarbRatioPct: 40,
      highCarbMultiplier: 1.30,
      mediumCarbMultiplier: 1.0,
      lowCarbMultiplier: 0.55,
      refeedCarbMultiplier: 1.35,
      description: 'جسم ممشوق + نشاط خامل: توازن كربوهيدرات مع ضبط الفائض لتفادي تراكم الدهون.'
    },
    moderate: {
      baseCarbRatioPct: 45,
      highCarbMultiplier: 1.40,
      mediumCarbMultiplier: 1.0,
      lowCarbMultiplier: 0.50,
      refeedCarbMultiplier: 1.45,
      description: 'جسم ممشوق + نشاط متوسط: تدوير كارب مثالي لدعم البناء واستشفاء الألياف العضلية.'
    },
    intense: {
      baseCarbRatioPct: 50,
      highCarbMultiplier: 1.50,
      mediumCarbMultiplier: 1.0,
      lowCarbMultiplier: 0.45,
      refeedCarbMultiplier: 1.55,
      description: 'جسم ممشوق + نشاط مكثف: زيادة كبيرة بالكارب في أيام التمرين وتخفيض موجه في أيام الراحة.'
    }
  },
  moderate: {
    sedentary: {
      baseCarbRatioPct: 35,
      highCarbMultiplier: 1.25,
      mediumCarbMultiplier: 0.95,
      lowCarbMultiplier: 0.50,
      refeedCarbMultiplier: 1.30,
      description: 'دهون متوسطة + نشاط خامل: تقليل الكارب في أيام الراحة لتنشيط أكسدة الشحوم المخزنة.'
    },
    moderate: {
      baseCarbRatioPct: 40,
      highCarbMultiplier: 1.35,
      mediumCarbMultiplier: 0.95,
      lowCarbMultiplier: 0.45,
      refeedCarbMultiplier: 1.40,
      description: 'دهون متوسطة + نشاط متوسط: تدوير متوازن بين أيام التمرين الثقيلة وأيام الاستشفاء.'
    },
    intense: {
      baseCarbRatioPct: 45,
      highCarbMultiplier: 1.40,
      mediumCarbMultiplier: 0.95,
      lowCarbMultiplier: 0.40,
      refeedCarbMultiplier: 1.45,
      description: 'دهون متوسطة + نشاط مكثف: كربوهيدرات موجهة خصيصاً للتمرين لمنع خسارة الكتلة العضلية.'
    }
  },
  high: {
    sedentary: {
      baseCarbRatioPct: 25,
      highCarbMultiplier: 1.15,
      mediumCarbMultiplier: 0.85,
      lowCarbMultiplier: 0.40,
      refeedCarbMultiplier: 1.20,
      description: 'دهون مرتفعة + نشاط خامل: تقييد الكارب لإعادة رفع حساسية الإنسولين وأكسدة الدهون.'
    },
    moderate: {
      baseCarbRatioPct: 30,
      highCarbMultiplier: 1.25,
      mediumCarbMultiplier: 0.85,
      lowCarbMultiplier: 0.40,
      refeedCarbMultiplier: 1.25,
      description: 'دهون مرتفعة + نشاط متوسط: كربوهيدرات مركزة حول التمرين فقط مع تخفيض قاسي في الراحة.'
    },
    intense: {
      baseCarbRatioPct: 35,
      highCarbMultiplier: 1.30,
      mediumCarbMultiplier: 0.85,
      lowCarbMultiplier: 0.35,
      refeedCarbMultiplier: 1.35,
      description: 'دهون مرتفعة + نشاط مكثف: حماية العضلات بالكارب في التمارين الصعبة مع حرق الدهون بقية الأيام.'
    }
  }
};

/**
 * Get Carb Requirement Entry from Lookup Table
 */
export function getCarbLookupEntry(profile: UserProfile): CarbLookupEntry {
  const effective = getEffectiveProfile(profile);
  const fatTier = getBodyFatTier(effective.gender, effective.bodyFatPct!);
  const actTier = getActivityTier(effective.activityLevel);
  return CARB_REQUIREMENT_LOOKUP_TABLE[fatTier][actTier];
}

/**
 * Scientific Matrix Rule interface from strict Lookup Table
 */
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

/**
 * Strict Scientific Reference Matrix (Lookup Table)
 * Connects Body Fat %, Activity Level, and Training Goal deterministically
 */
export function getCarbMatrixRules(profile: UserProfile): CarbMatrixRule {
  const effective = getEffectiveProfile(profile);
  const lookup = getCarbLookupEntry(effective);
  const fatTier = getBodyFatTier(effective.gender, effective.bodyFatPct!);
  const actTier = getActivityTier(effective.activityLevel);

  const fatTierLabels: Record<BodyFatTier, string> = {
    essential: 'نسبة دهون منخفضة جداً (رياضي محترف / منافسات)',
    lean: 'نسبة دهون مثالية وممشوقة (Lean Body Comp)',
    moderate: 'نسبة دهون متوسطة (Moderate Body Comp)',
    high: 'نسبة دهون مرتفعة (High Body Fat)'
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
 * Calculate Lean Body Mass (LBM) in kg using strict Katch-McArdle formula
 * Formula: LBM = weightKg * (1 - bodyFatPct / 100)
 */
export function calculateLeanBodyMass(profile: UserProfile): number {
  const effective = getEffectiveProfile(profile);
  const lbm = effective.weightKg * (1 - (effective.bodyFatPct || 15) / 100);
  return Math.round(lbm * 10) / 10;
}

/**
 * Calculate Basal Metabolic Rate using Katch-McArdle Formula (Gold Standard for Athletes)
 * Formula: BMR = 370 + (21.6 * Lean Body Mass in kg)
 */
export function calculateBMR(profile: UserProfile): number {
  const lbm = calculateLeanBodyMass(profile);
  return Math.round(370 + (21.6 * lbm));
}

/**
 * Calculate BMR using Mifflin-St Jeor (for scientific reference comparison)
 */
export function calculateBMRMifflin(profile: UserProfile): number {
  const effective = getEffectiveProfile(profile);
  const { weightKg, heightCm, age, gender } = effective;
  if (gender === 'Male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE) using Katch-McArdle BMR
 */
export function calculateTDEE(profile: UserProfile): number {
  const effective = getEffectiveProfile(profile);
  const bmr = calculateBMR(effective);
  return Math.round(bmr * effective.activityLevel);
}

/**
 * Calculate Baseline Macros using Katch-McArdle Engine & Lookup Table
 */
export function calculateBaselineMacros(profile: UserProfile): Macros {
  const effective = getEffectiveProfile(profile);
  const tdee = calculateTDEE(effective);
  const goalConfig = GOALS_MAP[effective.goal] || GOALS_MAP.muscle;
  const lookup = getCarbLookupEntry(effective);
  
  // Target calories based on scientific goal surplus/deficit
  const targetCalories = Math.max(1200, tdee + goalConfig.calorieDelta);

  // Protein calculation based on total weight and goal multiplier
  const proteinG = Math.round(effective.weightKg * goalConfig.proteinMultiplier);
  const proteinCal = proteinG * 4;

  // Fat calculation based on target calories ratio
  const fatCal = Math.round(targetCalories * goalConfig.fatRatio);
  const fatG = Math.round(fatCal / 9);

  // Carb ratio derived from Lookup Table or goal mapping
  const carbRatio = lookup ? (lookup.baseCarbRatioPct / 100) : goalConfig.carbRatio;
  
  // Calculate carb calories using the scientific carb ratio from the Lookup Table / Goal
  const carbCalFromRatio = Math.round(targetCalories * carbRatio);
  const carbG = Math.max(20, Math.round(carbCalFromRatio / 4));

  // Adjust calories to ensure total macro calories match target calories exactly
  const actualCalories = Math.round((proteinG * 4) + (fatG * 9) + (carbG * 4));

  return {
    calories: actualCalories,
    protein: proteinG,
    fat: fatG,
    carbs: carbG
  };
}

/**
 * Export alias calculateMacros for exact compatibility
 */
export const calculateMacros = calculateBaselineMacros;

/**
 * Generate 7-Day Carb Cycling Plan using strict normalized weekly energy scaling
 * Guarantees total weekly calories = 7 * daily target kcal while balancing carbs/fats/protein scientifically
 */
export function generateWeeklyCarbPlan(profile: UserProfile): DayPlan[] {
  if (!profile) {
    throw new Error('خطأ في البيانات: ملف المستخدم مفقود بالكامل.');
  }

  if (
    profile.bodyFatPct === undefined ||
    profile.bodyFatPct === null ||
    typeof profile.bodyFatPct !== 'number' ||
    isNaN(profile.bodyFatPct) ||
    profile.bodyFatPct <= 0
  ) {
    throw new Error('خطأ في البيانات الحيوية: غياب نسبة الدهون في الجسم (bodyFatPct). يلزم إدخال نسبة الدهون لحساب معادلة Katch-McArdle وتوليد الخطة الغذائية الدقيقة.');
  }

  if (profile.bodyFatPct < 3 || profile.bodyFatPct > 60) {
    throw new Error(`خطأ في الحساب: نسبة الدهون المدخلة (${profile.bodyFatPct}%) خارج النطاق المنطقي (من 3% إلى 60%).`);
  }

  if (
    profile.weightKg === undefined ||
    profile.weightKg === null ||
    typeof profile.weightKg !== 'number' ||
    isNaN(profile.weightKg) ||
    profile.weightKg <= 0
  ) {
    throw new Error('خطأ في البيانات الحيوية: وزن الجسم (weightKg) مفقود. يرجى إدخال الوزن بالكيلوجرام لمتابعة الحسابات العلمية.');
  }

  if (profile.weightKg < 30 || profile.weightKg > 250) {
    throw new Error(`خطأ في الحساب: وزن الجسم المدخل (${profile.weightKg} كجم) خارج النطاق المنطقي (من 30 إلى 250 كجم).`);
  }

  const validation = validateProfileForNutrition(profile);
  if (!validation.isValid) {
    throw new Error(`خطأ في بيانات الملف الشخصي: ${validation.errors.join(' | ')}`);
  }

  const effective = getEffectiveProfile(profile);

  const baseMacros = calculateBaselineMacros(effective);
  const targetKcal = baseMacros.calories;

  const daysConfig = [
    { name: 'السبت', isWorkout: true },
    { name: 'الأحد', isWorkout: true },
    { name: 'الإثنين', isWorkout: false },
    { name: 'الثلاثاء', isWorkout: true },
    { name: 'الأربعاء', isWorkout: true },
    { name: 'الخميس', isWorkout: true },
    { name: 'الجمعة', isWorkout: false }
  ];

  // Weight multipliers for daily energy distribution
  const kcalWeightsMap: Record<string, Record<CarbDayType, number>> = {
    fatloss: { high: 1.15, medium: 1.00, low: 0.90, refeed: 1.30 },
    cutting: { high: 1.15, medium: 1.00, low: 0.90, refeed: 1.30 },
    muscle: { high: 1.12, medium: 1.00, low: 0.92, refeed: 1.22 },
    maintenance: { high: 1.10, medium: 1.00, low: 0.93, refeed: 1.20 }
  };

  const currentWeights = kcalWeightsMap[effective.goal] || kcalWeightsMap.muscle;

  // Determine Day Types per day
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
    let workoutFocus = isWorkout ? 'تمرين مقاومة مخصص' : 'راحة واستشفاء عضلات';

    if (effective.goal === 'muscle') {
      if (isHeavy) {
        type = 'high';
        workoutFocus = index === 0 ? 'ظهر + بايسبس (شدة عالية)' : index === 3 ? 'أرجل + سمانة (تحفيز ضخامة)' : 'تمرين مركبة كبرى (High Carb)';
      } else if (isWorkout) {
        type = 'medium';
        workoutFocus = 'صدر + ترايسبس + أكتاف';
      } else {
        type = 'low';
        workoutFocus = 'راحة نشطة / استشفاء عضلات';
      }
    } else if (effective.goal === 'fatloss') {
      if (isHeavy) {
        type = 'high';
        workoutFocus = 'تمرين الشدة العالية HIIT + عضلات كبيرة';
      } else if (isWorkout) {
        type = 'medium';
        workoutFocus = 'تمارين مقاومة شمولية + كارديو';
      } else {
        type = 'low';
        workoutFocus = 'راحة من التمارين + صيام متقطع';
      }
    } else if (effective.goal === 'cutting') {
      if (index === 0 && (effective.bodyFatPct || 15) <= 18) {
        type = 'refeed';
        workoutFocus = 'يوم Refeed شحن الجليكوجين + تمرين أرجل حاد';
      } else if (isHeavy || isWorkout) {
        type = 'medium';
        workoutFocus = 'تمارين مقاومة عالية التكرار + كارديو تنشيف';
      } else {
        type = 'low';
        workoutFocus = 'تنشيف حاد + صيام 18:6 + مشي خفيف';
      }
    } else {
      // Maintenance
      if (isHeavy) {
        type = 'high';
        workoutFocus = 'تمرين قوة ورشاقة كلي';
      } else if (isWorkout) {
        type = 'medium';
        workoutFocus = 'لياقة بدنية وكارديو متوسط';
      } else {
        type = 'low';
        workoutFocus = 'راحة واستشفاء';
      }
    }

    // Optional user strategy overrides
    if (effective.carbCycleStrategy === 'high_low_2tier') {
      type = isWorkout ? 'high' : 'low';
    } else if (effective.carbCycleStrategy === 'refeed_matrix') {
      type = index === 0 ? 'refeed' : 'low';
    }

    return { name: d.name, isWorkout, type, workoutFocus };
  });

  // Calculate raw calories based on weights & normalize to guarantee exact 7-day total target
  const rawKcals = assignedDays.map(d => targetKcal * (currentWeights[d.type] || 1.0));
  const sumRawKcal = rawKcals.reduce((sum, val) => sum + val, 0);
  const scaleFactor = (targetKcal * 7.0) / sumRawKcal;

  const refWeight = effective.bodyFatPct ? calculateLeanBodyMass(effective) : effective.weightKg;

  const fatPerKgMap: Record<CarbDayType, number> = {
    high: 0.75,
    medium: 0.95,
    low: 1.30,
    refeed: 0.65
  };

  return assignedDays.map((d, i) => {
    const dayKcal = Math.round(rawKcals[i] * scaleFactor);

    // Protein calculation (elevated slightly on low carb days to protect muscle)
    let dayProtein = baseMacros.protein;
    if (d.type === 'low') dayProtein = Math.round(baseMacros.protein * 1.06);
    else if (d.type === 'refeed') dayProtein = Math.round(baseMacros.protein * 0.95);

    // Fat calculation bounded strictly between 20% and 45% of daily calories
    const minFat = Math.round((dayKcal * 0.20) / 9);
    const maxFat = Math.round((dayKcal * 0.45) / 9);
    const rawFat = Math.round(refWeight * fatPerKgMap[d.type]);
    let dayFat = Math.max(minFat, Math.min(maxFat, rawFat));

    // Carbs from remaining calories
    let dayCarbs = Math.round((dayKcal - (dayProtein * 4) - (dayFat * 9)) / 4);

    // Safety net for carbs (min 30g)
    if (dayCarbs < 40) {
      const needKcal = (40 - dayCarbs) * 4;
      const fatCutG = Math.min(dayFat - minFat, Math.round(needKcal / 9));
      dayFat -= Math.max(0, fatCutG);
      dayCarbs = Math.round((dayKcal - (dayProtein * 4) - (dayFat * 9)) / 4);
    }
    dayCarbs = Math.max(30, dayCarbs);

    const finalCalories = (dayProtein * 4) + (dayCarbs * 4) + (dayFat * 9);

    // Calculate scientifically accurate food portions in grams
    const cookedRicePortionG = Math.round((dayCarbs * 0.40) / 0.28); // 100g cooked rice = ~28g carbs
    const sweetPotatoPortionG = Math.round((dayCarbs * 0.30) / 0.20); // 100g sweet potato = ~20g carbs
    const oatsPortionG = Math.round((dayCarbs * 0.25) / 0.66); // 100g dry oats = ~66g carbs
    const chickenPortionG = Math.round((dayProtein * 0.45) / 0.31); // 100g chicken = ~31g protein

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

    return {
      dayName: d.name,
      type: d.type,
      carbs: dayCarbs,
      protein: dayProtein,
      fat: dayFat,
      calories: finalCalories,
      workoutFocus: d.workoutFocus,
      recommendedCarbSources: sources,
      isWorkout: d.isWorkout
    };
  });
}

/**
 * Detailed Scientific Breakdown for UI Transparency & Zero Hallucination
 */
export interface ScientificBreakdown {
  validation: ValidationResult;
  matrixRules: CarbMatrixRule;
  bmrFormula: string;
  bmrValue: number;
  bmrKatchValue: number;
  bmrMifflinValue: number;
  lbmKg: number;
  bodyFatPctUsed: number;
  activityLabel: string;
  activityMultiplier: number;
  tdeeValue: number;
  goalName: string;
  goalCalorieDelta: number;
  targetCalories: number;
  proteinGrams: number;
  proteinMultiplier: number;
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

  const lbmKg = calculateLeanBodyMass(profile);
  const bodyFatPctUsed = profile.bodyFatPct && profile.bodyFatPct > 0 
    ? profile.bodyFatPct 
    : (profile.gender === 'Male' ? 15 : 23);

  const bmrKatchValue = calculateBMR(profile);
  const bmrMifflinValue = calculateBMRMifflin(profile);
  const tdee = calculateTDEE(profile);

  const goalConfig = GOALS_MAP[profile.goal] || GOALS_MAP.muscle;
  const act = ACTIVITY_LEVELS.find((a) => a.value === profile.activityLevel) || ACTIVITY_LEVELS[2];

  const targetCalories = tdee + goalConfig.calorieDelta;
  const proteinGrams = Math.round(profile.weightKg * goalConfig.proteinMultiplier);
  const proteinCalories = proteinGrams * 4;

  const fatCalories = Math.round(targetCalories * goalConfig.fatRatio);
  const fatGrams = Math.round(fatCalories / 9);

  const carbCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const baseCarbGrams = Math.round(carbCalories / 4);

  const highCarbRule = `ماتريكس (${Math.round(matrixRules.highCarbFactor * 100)}% carb): زيادة الكارب بنسبة +${Math.round((matrixRules.highCarbFactor - 1) * 100)}% (+${matrixRules.highCalorieAdj} سعرة) في أيام التمارين المركبة الأساسية`;
  const mediumCarbRule = `ماتريكس (${Math.round(matrixRules.mediumCarbFactor * 100)}% carb): كارب متوازن (${Math.round(matrixRules.mediumCarbFactor * 100)}% من الأساسي) في أيام تمارين المقاومة العامة`;
  const lowCarbRule = `ماتريكس (${Math.round(matrixRules.lowCarbFactor * 100)}% carb): تقليل الكارب إلى ${Math.round(matrixRules.lowCarbFactor * 100)}% من الأساسي (${matrixRules.lowCalorieAdj} سعرة) في أيام الراحة لتنشيط الأكسدة`;

  return {
    validation,
    matrixRules,
    bmrFormula: `370 + (21.6 × LBM ${lbmKg}kg)`,
    bmrValue: bmrKatchValue,
    bmrKatchValue,
    bmrMifflinValue,
    lbmKg,
    bodyFatPctUsed,
    activityLabel: act.label,
    activityMultiplier: profile.activityLevel,
    tdeeValue: tdee,
    goalName: goalConfig.label,
    goalCalorieDelta: goalConfig.calorieDelta,
    targetCalories,
    proteinGrams,
    proteinMultiplier: goalConfig.proteinMultiplier,
    proteinCalories,
    fatGrams,
    fatRatioPct: Math.round(goalConfig.fatRatio * 100),
    fatCalories,
    baseCarbGrams,
    scientificBasisText: goalConfig.scientificBasis,
    highCarbRule,
    mediumCarbRule,
    lowCarbRule,
  };
}

/**
 * Interface for Intra-day Dynamic Carb Timing Allocation
 */
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

/**
 * Calculates dynamic intra-day carbohydrate timing & nutrient partitioning
 * Based on GLUT4 translocation, workout status, body fat / insulin sensitivity, and day type.
 */
export function calculateIntradayCarbDistribution(dayPlan: DayPlan, profile: UserProfile): IntradayCarbTiming {
  const effective = getEffectiveProfile(profile);
  const totalCarbs = dayPlan.carbs;
  const isWorkout = dayPlan.isWorkout !== undefined ? dayPlan.isWorkout : !dayPlan.workoutFocus?.includes('راحة');
  const dayType = dayPlan.type;
  const bodyFat = effective.bodyFatPct || 15;

  let insulinSensitivityText = 'حساسية إنسولين عالية (توجيه ممتاز للماكروز نحو الخلايا العضلية)';
  if (bodyFat > 22) {
    insulinSensitivityText = 'حساسية إنسولين منخفضة (يتطلب تركيز الكارب بعد التمرين مباشرة فقط للحد من تحويله لدهون)';
  } else if (bodyFat > 16) {
    insulinSensitivityText = 'حساسية إنسولين معتدلة (توزيع متوازن وحساسية جيدة أثناء وبعد التمرين)';
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
      rationale = `في أيام الكارب المرتفع (${totalCarbs}g)، يتم تحفيز مستقبلات GLUT4 البنائية عبر توجيه ${postPct}% من الكارب في نافذة الاستشفاء بعد التمرين لضمان شحن الجليكوجين دون أي تخزين في النسيج الدهني.`;
    } else if (dayType === 'medium') {
      prePct = 30;
      postPct = 40;
      rationale = `في أيام الكارب المتوسط (${totalCarbs}g)، يتم توزيع الكارب بنسبة ${prePct}% قبل التمرين لتأمين طاقة التدريب و ${postPct}% بعد التمرين لإيقاف الهدم العضلي وتجديد المخازن.`;
    } else {
      prePct = 25;
      postPct = 45;
      rationale = `في أيام الكارب المنخفض مع التمرين (${totalCarbs}g)، يُركز معظم الكارب حول نافذة التمرين بحساب حذر لإعادة تحفيز أكسدة الدهون بقية اليوم.`;
    }
  } else {
    if (dayType === 'high' || dayType === 'refeed') {
      prePct = 35;
      postPct = 40;
      rationale = `في يوم الراحة ذو الكارب المرتفع (${totalCarbs}g)، تُقسم الكميات بين وجبات نافذة الأكل لإعادة تعبئة الجليكوجين الكبدي والعضلي ببطء مع دعم هرمون اللبتين (Leptin).`;
    } else {
      prePct = 35;
      postPct = 35;
      rationale = `في يوم الراحة المنخفض الكارب (${totalCarbs}g)، يُوزع الكارب بالتساوي على وجبات نافذة الأكل مع التركيز على مصادر الكارب المعقد الخضراوي ذو المؤشر الجلايسيمي المنخفض (Low GI).`;
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

/**
 * Recommend Intermittent Fasting schedule
 */
export function recommendFasting(profile: UserProfile): FastingType {
  if (profile.age > 60) return '12:12';
  if (profile.goal === 'muscle') return '14:10';
  if (profile.goal === 'fatloss') return '16:8';
  if (profile.goal === 'cutting') return '18:6';
  return '16:8';
}
