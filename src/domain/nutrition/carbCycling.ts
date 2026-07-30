import { UserProfile, DayPlan, CarbDayType } from '../../types';
import { getEffectiveProfile, validateProfileForNutrition, GOALS_MAP } from './validation';
import { BodyFatTier, ActivityTier, getBodyFatTier, getActivityTier, calculatePhysiologicalEngineState } from './physiology';

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
