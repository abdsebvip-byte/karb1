import { UserProfile } from '../../types';

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
    proteinMultiplierLBM: 2.3, // g per kg of LBM (Helms 2014 & ISSN 2017)
    proteinMultiplierTotal: 2.0,
    carbRatio: 0.50,
    fatRatio: 0.25,
    calorieDelta: 250, // Surplus +250 kcal (Garthe et al. 2013)
    scientificCitationKey: 'ISSN_PROTEIN_STAND',
    scientificBasis: 'زيادة طفيفة في السعرات (+250) مع بناء البروتين على الكتلة الخالية من الدهون LBM (Helms et al. 2014) وتغذية الجليكوجين في أيام التمرين (ACSM 2016).',
    description: 'تركيز على زيادة الكربوهيدرات في أيام التمرين لتعزيز البناء العضلي وتجديد الجليكوجين.'
  },
  fatloss: {
    label: 'خسارة دهون متوازنة (Fat Loss)',
    color: '#2196F3',
    bgColor: 'rgba(33, 150, 243, 0.15)',
    borderColor: '#2196F3',
    proteinMultiplierLBM: 2.5, // g per kg LBM (Helms 2014)
    proteinMultiplierTotal: 1.9,
    carbRatio: 0.35,
    fatRatio: 0.28,
    calorieDelta: -400, // Deficit -400 kcal
    scientificCitationKey: 'PROTEIN_LBM_HELMS',
    scientificBasis: 'عجز متوسط (-400) لحماية العضلات مع تحديد البروتين بناءً على LBM وتدوير الكارب لتفادي هبوط هرمون اللبتين وتكيّف الأيض (Hall et al. 2011).',
    description: 'تخفيض السعرات مع الحفاظ على أيام مرتفعة الكارب لمنع هبوط الأيض (Metabolic Adaptation).'
  },
  cutting: {
    label: 'تنشيف قاسي وجاهزية (Aggressive Cutting)',
    color: '#F44336',
    bgColor: 'rgba(244, 67, 54, 0.15)',
    borderColor: '#F44336',
    proteinMultiplierLBM: 2.7, // High protein to prevent muscle loss in severe deficit (Helms 2014)
    proteinMultiplierTotal: 2.2,
    carbRatio: 0.25,
    fatRatio: 0.25,
    calorieDelta: -600, // Deficit -600 kcal
    scientificCitationKey: 'PROTEIN_LBM_HELMS',
    scientificBasis: 'عجز حاد (-600 سعرة) مع رفع البروتين إلى 2.7g/kg LBM لمنع الهدم العضلي، وتوجيه الكارب حواش التمارين فقط (Loucks et al. 2011).',
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
    calorieDelta: 0,
    scientificCitationKey: 'ISSN_PROTEIN_STAND',
    scientificBasis: 'توازن تام في الطاقة مع تدوير خفيف للكربوهيدرات لتعزيز الحساسية للإنسولين وزيادة أداء التمارين (Thomas et al. 2016).',
    description: 'توازن مستقر في السعرات مع تدوير متوسط للكربوهيدرات لزيادة النشاط واللياقة.'
  }
};

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
