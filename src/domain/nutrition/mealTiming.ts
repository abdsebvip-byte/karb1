import { UserProfile, DayPlan, FastingType } from '../../types';
import { getEffectiveProfile } from './validation';

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
