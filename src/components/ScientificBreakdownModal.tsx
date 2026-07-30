import React from 'react';
import { UserProfile } from '../types';
import { getScientificBreakdownDetails, SCIENTIFIC_CITATIONS } from '../domain/nutrition';
import { X, ShieldCheck, Calculator, Flame, Dumbbell, Activity, CheckCircle2, BookOpen, Info } from 'lucide-react';

interface ScientificBreakdownModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificBreakdownModal: React.FC<ScientificBreakdownModalProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const details = getScientificBreakdownDetails(profile);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">الأساس العلمي ودليل الحسابات الدقيق</h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  بدون تخمين (No Hallucination)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تطابق كامل مع معادلات الجمعية الدولية لتغذية الرياضيين (ISSN)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-300">
          
          {/* Scientific Guarantee Banner & Validation Status */}
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/60 border border-emerald-500/30 rounded-2xl p-3 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-emerald-300 text-xs flex items-center gap-2">
                  <span>ضمان الدقة العلمية والمعادلات المرجعية (No-Guess Matrix)</span>
                  {details.validation.isValid ? (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                      بيانات كاملة ومحققة 100%
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30">
                      بيانات غير مكتملة
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  تم استبدال التخمينات في توزيعات الكارب بجدول مرجعي صارم (Lookup Table Matrix) يربط نسبة الدهون والنشاط والهدف بمستويات الكارب المحددة بدقة.
                </p>
              </div>
            </div>

            {/* Validation Errors or Warnings if present */}
            {details.validation.errors.length > 0 && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-3 text-rose-300 text-[11px]">
                <strong className="block text-rose-200 mb-1">⚠️ تحذير عدم استكمال البيانات العلمية:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                  {details.validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Step 1: Strict Lookup Table Matrix Info */}
          <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                الجدول المرجعي الصارم لتنظيم الكارب سايكل (Lookup Table Matrix)
              </span>
              <span className="bg-purple-500/20 text-purple-300 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                Zero Guesswork
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 block font-semibold">تصنيف نسبة الدهون</span>
                <span className="font-bold text-amber-300">{details.matrixRules.bodyFatCategoryLabel}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 block font-semibold">تصنيف النشاط البدني</span>
                <span className="font-bold text-emerald-400">{details.matrixRules.activityCategoryLabel}</span>
              </div>
            </div>

            <div className="bg-purple-950/40 border border-purple-800/50 p-2.5 rounded-xl text-[11px] text-purple-200 leading-relaxed">
              <span className="font-extrabold text-purple-300 block mb-0.5">🔍 تعليل الجدول المرجعي المطبق:</span>
              {details.matrixRules.matrixRuleRationale}
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
              <div className="bg-amber-950/30 border border-amber-500/30 p-2 rounded-xl">
                <span className="text-amber-400 block text-[9px] font-bold">معامل الكارب العالي</span>
                <span className="text-amber-300 font-extrabold text-xs">{(details.matrixRules.highCarbFactor * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-blue-950/30 border border-blue-500/30 p-2 rounded-xl">
                <span className="text-blue-400 block text-[9px] font-bold">معامل الكارب المتوسط</span>
                <span className="text-blue-300 font-extrabold text-xs">{(details.matrixRules.mediumCarbFactor * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-2 rounded-xl">
                <span className="text-emerald-400 block text-[9px] font-bold">معامل الكارب المنخفض</span>
                <span className="text-emerald-300 font-extrabold text-xs">{(details.matrixRules.lowCarbFactor * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Step 1: BMR Equation - Katch-McArdle Formula */}
          <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                1. معدل الأيض الأساسي (BMR) - معادلة Katch-McArdle الأدق للرياضيين
              </span>
              <span className="font-mono font-extrabold text-amber-300 text-sm">{details.bmrKatchValue} kcal/day</span>
            </div>
            
            <p className="text-[11px] text-slate-300 leading-relaxed">
              تعتمد هذه المعادلة عالمياً كالمعيار الذهبي (Gold Standard) لأنها تحسب الطاقة الحيوية بناءً على <span className="text-purple-300 font-bold">الكتلة العضلية الصافية (Lean Body Mass)</span> وليس الوزن الكلي المجرد:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 block">نسبة الدهون المستعملة</span>
                <span className="text-xs font-bold text-amber-400">{details.bodyFatPctUsed}%</span>
              </div>
              <div className="bg-slate-900 border border-purple-800/60 p-2 rounded-xl bg-purple-950/30">
                <span className="text-[9px] text-purple-300 block">الكتلة الصافية (LBM)</span>
                <span className="text-xs font-extrabold text-purple-200">{details.lbmKg} kg</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-[9px] text-slate-400 block">مقارنة بـ Mifflin-St Jeor</span>
                <span className="text-xs font-bold text-slate-300">{details.bmrMifflinValue} kcal</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl font-mono text-[11px] text-purple-200">
              BMR = 370 + (21.6 × {details.lbmKg}kg) = <span className="font-extrabold text-amber-300">{details.bmrKatchValue} سعرة حرارية</span>
            </div>
          </div>

          {/* Step 2: TDEE Equation */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                2. إجمالي حرق الطاقة اليومي (TDEE)
              </span>
              <span className="font-mono font-extrabold text-emerald-300 text-sm">{details.tdeeValue} kcal/day</span>
            </div>
            <p className="text-[11px] text-slate-400">
              ناتج ضرب الـ BMR بمكافئ النشاط البدني الخاص بك (<span className="text-slate-200 font-semibold">{details.activityLabel}</span>):
            </p>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl font-mono text-[11px] text-emerald-200">
              TDEE = {details.bmrValue} × {details.activityMultiplier} = {details.tdeeValue} سعرة
            </div>
          </div>

          {/* Step 3: Goal Deficit/Surplus & Macros Target */}
          <div className="bg-slate-950 border border-purple-500/20 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-purple-400" />
                3. ضبط هدفك الرياضي: <span className="text-purple-300 font-extrabold">{details.goalName}</span>
              </span>
              <span className="font-mono font-bold text-xs text-purple-300">
                {details.goalCalorieDelta > 0 ? `+${details.goalCalorieDelta}` : details.goalCalorieDelta} kcal
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed bg-purple-950/40 border border-purple-800/40 p-2.5 rounded-xl">
              💡 <span className="font-bold text-purple-200">التعليل العلمي:</span> {details.scientificBasisText}
            </p>

            {/* Scientific Macro Distribution Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-slate-900 border border-emerald-500/30 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">البروتين (مبني على LBM)</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">{details.proteinGrams}g</span>
                <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                  ({details.proteinMultiplierLBM}g / kg LBM)
                </span>
              </div>

              <div className="bg-slate-900 border border-blue-500/30 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">الدهون الصحية</span>
                <span className="text-sm font-extrabold text-blue-400 font-mono">{details.fatGrams}g</span>
                <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                  ({details.fatRatioPct}% من السعرات)
                </span>
              </div>

              <div className="bg-slate-900 border border-amber-500/30 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">الكارب الأساسي (المتوسط)</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono">{details.baseCarbGrams}g</span>
                <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                  ({(details.baseCarbGrams / details.lbmKg).toFixed(1)}g / kg LBM)
                </span>
              </div>
            </div>

            {/* Exercise Physiology & Glycogen Depletion Metrics Panel */}
            <div className="bg-slate-900 border border-purple-800/60 p-3 rounded-xl space-y-2 mt-2">
              <span className="font-extrabold text-purple-200 block text-xs border-b border-slate-800 pb-1">
                🧬 محرك فسيولوجيا الجليكوجين وتكيّف هرمون اللبتين (Leptin & Glycogen Physiology):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-mono">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">سعة الجليكوجين العضلي</span>
                  <span className="text-purple-300 font-extrabold">{details.phys.muscleGlycogenCapacityG}g</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">سعة الجليكوجين الكبدي</span>
                  <span className="text-amber-300 font-bold">{details.phys.liverGlycogenCapacityG}g</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">استهلاك التمرين الثقيل</span>
                  <span className="text-emerald-400 font-bold font-mono">~{details.phys.heavyLegWorkoutDepletionG}g</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">استهلاك الدماغ اليومي</span>
                  <span className="text-blue-300 font-bold">{details.phys.basalBrainGlucoseNeedG}g</span>
                </div>
              </div>

              {details.phys.obesityInsulinCapActive && (
                <div className="bg-amber-950/40 border border-amber-600/40 p-2 rounded-lg text-[10px] text-amber-200">
                  ⚠️ <strong>تفعيل سقف الحساسية للإنسولين:</strong> نظراً لارتفاع نسبة الدهون ({details.bodyFatPctUsed}%)، تم وضع سقف أمان حاسم على كميات الكارب المرتفعة لمنع مقاومة الإنسولين ولتسريع حرق الشحوم.
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Carb Cycling Breakdown for This Specific Goal */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              قواعد تدوير الكربوهيدرات المخصصة لهدفك ({details.goalName}):
            </h3>

            <div className="space-y-2">
              <div className="bg-slate-900 border border-amber-500/30 p-2.5 rounded-xl flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">🔥 الأيام المرتفعة:</span>
                <span className="text-[11px] text-slate-300">{details.highCarbRule}</span>
              </div>

              <div className="bg-slate-900 border border-blue-500/30 p-2.5 rounded-xl flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">⚖️ الأيام المتوسطة:</span>
                <span className="text-[11px] text-slate-300">{details.mediumCarbRule}</span>
              </div>

              <div className="bg-slate-900 border border-emerald-500/30 p-2.5 rounded-xl flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">🥗 الأيام المنخفضة:</span>
                <span className="text-[11px] text-slate-300">{details.lowCarbRule}</span>
              </div>
            </div>
          </div>

          {/* Goals Comparison Matrix */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <h3 className="font-bold text-white text-xs">جدول المقارنة العلمية بين الأهداف الرياضية المختلفة:</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-[10px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-1.5 font-bold">الهدف</th>
                    <th className="p-1.5 font-bold">السعرات</th>
                    <th className="p-1.5 font-bold">البروتين/كجم</th>
                    <th className="p-1.5 font-bold">استراتيجية الكارب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className={profile.goal === 'muscle' ? 'bg-purple-950/40 text-purple-200 font-bold' : ''}>
                    <td className="p-1.5 font-bold text-emerald-400">بناء عضلي (Recomp)</td>
                    <td className="p-1.5">+250 سعرة (فائض)</td>
                    <td className="p-1.5 font-mono">2.2g</td>
                    <td className="p-1.5">أعلى كارب في أيام الأرجل والظهر للبناء</td>
                  </tr>
                  <tr className={profile.goal === 'fatloss' ? 'bg-purple-950/40 text-purple-200 font-bold' : ''}>
                    <td className="p-1.5 font-bold text-blue-400">خسارة دهون (Fat Loss)</td>
                    <td className="p-1.5">-400 سعرة (عجز)</td>
                    <td className="p-1.5 font-mono">2.1g</td>
                    <td className="p-1.5">Refeed أسبوعي لحماية الغدة والأيض</td>
                  </tr>
                  <tr className={profile.goal === 'cutting' ? 'bg-purple-950/40 text-purple-200 font-bold' : ''}>
                    <td className="p-1.5 font-bold text-red-400">تنشيف قاسي (Cutting)</td>
                    <td className="p-1.5">-600 سعرة (عجز حاد)</td>
                    <td className="p-1.5 font-mono">2.4g (أقصى حد)</td>
                    <td className="p-1.5">أيام منخفضة الكارب جداً لزيادة حرق الدهون</td>
                  </tr>
                  <tr className={profile.goal === 'maintenance' ? 'bg-purple-950/40 text-purple-200 font-bold' : ''}>
                    <td className="p-1.5 font-bold text-purple-400">محافظة (Maintenance)</td>
                    <td className="p-1.5">0 (متكافئ TDEE)</td>
                    <td className="p-1.5 font-mono">1.8g</td>
                    <td className="p-1.5">تدوير متوازن للرشاقة والحيوية</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Peer-Reviewed Scientific References */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" />
              المراجع والدراسات العلمية المحكمة (Peer-Reviewed Citations):
            </h3>
            <div className="space-y-2 text-[10px] text-slate-300">
              {Object.entries(SCIENTIFIC_CITATIONS).map(([key, cite]) => (
                <div key={key} className="bg-slate-900 border border-slate-800 p-2 rounded-xl space-y-0.5">
                  <div className="flex items-center justify-between text-purple-300 font-bold">
                    <span>{cite.authors} ({cite.year})</span>
                    <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/80 font-mono">
                      {cite.doiOrSource}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-200">{cite.title}</p>
                  <p className="text-slate-400 text-[9.5px]">{cite.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
          >
            فهمت المعادلة والدليل العلمي
          </button>
        </div>
      </div>
    </div>
  );
};
