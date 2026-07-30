import { UserProfile } from '../../types';
import { validateProfileForNutrition, GOALS_MAP, ACTIVITY_LEVELS, ValidationResult } from './validation';
import { PhysiologicalEngineState, calculatePhysiologicalEngineState } from './physiology';
import { CarbMatrixRule, getCarbMatrixRules } from './carbCycling';

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
