import React, { useState } from 'react';
import { UserProfile, Goal, FastingType } from '../types';
import { ACTIVITY_LEVELS, GOALS_MAP, calculateBMR, calculateBaselineMacros, getCarbMatrixRules, generateWeeklyCarbPlan } from '../domain/nutrition';
import { X, Save, User, Scale, Activity, Target, Flame, Calculator, Sparkles, CheckCircle2, Dumbbell } from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Live real-time math calculations based on current formData
  let previewBaseline = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  let previewRules = { highCarbFactor: 1.3, mediumCarbFactor: 1.0, lowCarbFactor: 0.7, highCalorieAdj: 250, lowCalorieAdj: -250, bodyFatCategoryLabel: '', activityCategoryLabel: '', matrixRuleRationale: '' };
  let validationError: string | null = null;

  try {
    previewBaseline = calculateBaselineMacros(formData);
    previewRules = getCarbMatrixRules(formData);
    generateWeeklyCarbPlan(formData);
  } catch (err: any) {
    validationError = err.message || 'بيانات مدخلة غير مكتملة';
  }

  const highDayCarbs = Math.round(previewBaseline.carbs * previewRules.highCarbFactor);
  const medDayCarbs = Math.round(previewBaseline.carbs * previewRules.mediumCarbFactor);
  const lowDayCarbs = Math.round(previewBaseline.carbs * previewRules.lowCarbFactor);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">إعدادات الملف الشخصي والمعادلات</h2>
              <p className="text-[11px] text-slate-400">تحديث حسابات Katch-McArdle وحسابات الكارب سايكل الحية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Name & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">الاسم</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">النوع</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Male">ذكر ♂</option>
                <option value="Female">أنثى ♀</option>
              </select>
            </div>
          </div>

          {/* Age, Height, Weight, Body Fat % */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">العمر (سنة)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                min={12}
                max={90}
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">الطول (سم)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                min={100}
                max={230}
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">الوزن الحالي (كجم)</label>
              <input
                type="number"
                step="0.5"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-purple-300 mb-1 flex items-center gap-1">
                <span>نسبة الدهون %</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.bodyFatPct || ''}
                onChange={(e) => setFormData({ ...formData, bodyFatPct: e.target.value ? Number(e.target.value) : undefined })}
                placeholder={formData.gender === 'Male' ? '15%' : '23%'}
                className="w-full bg-slate-950 border border-purple-800/60 rounded-xl px-3 py-2 text-amber-300 focus:outline-none focus:border-purple-500 font-mono font-bold"
                min={3}
                max={60}
              />
            </div>
          </div>

          {/* Goal selection */}
          <div>
            <label className="block font-medium text-slate-300 mb-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              الهدف الرياضي الرئيسي (يتغير الحساب ديناميكياً فور الاختيار)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(GOALS_MAP) as Goal[]).map((gKey) => {
                const g = GOALS_MAP[gKey];
                const isSelected = formData.goal === gKey;

                return (
                  <button
                    key={gKey}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: gKey })}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-900/40 border-purple-500 text-white shadow-md shadow-purple-900/30 ring-1 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center justify-between" style={{ color: g.color }}>
                      <span>{g.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {g.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strategy Selection */}
          <div>
            <label className="block font-medium text-slate-300 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              استراتيجية توزيع أيام الكارب سايكل
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, carbCycleStrategy: 'classic_3tier' })}
                className={`p-2 rounded-xl border text-right transition-all ${
                  (formData.carbCycleStrategy || 'classic_3tier') === 'classic_3tier'
                    ? 'bg-amber-950/40 border-amber-500/80 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-bold block text-xs">ثلاثي (High / Med / Low)</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">توزيع متوازن مرن حسب أيام التمرين والراحة</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, carbCycleStrategy: 'high_low_2tier' })}
                className={`p-2 rounded-xl border text-right transition-all ${
                  formData.carbCycleStrategy === 'high_low_2tier'
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-bold block text-xs">ثنائي (High / Low فقط)</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">مرتفع في التمارين القوية، ومنخفض جداً في الباقي</span>
              </button>
            </div>
          </div>

          {/* LIVE MATH REAL-TIME PREVIEW CARD */}
          <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-3.5 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                <Calculator className="w-4 h-4 text-purple-400" />
                معاينة الحسابات العلمية المباشرة (Live Real-Time Math Output)
              </span>
              <span className="bg-purple-500/20 text-purple-300 font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">
                تحديث فوري ⚡
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-sans">الأيض الأساسي (Katch-McArdle BMR)</span>
                <span className="font-bold text-purple-300">{calculateBMR(formData)} kcal</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-sans">السعرات الأساسية المستهدفة</span>
                <span className="font-bold text-amber-300">{previewBaseline.calories} kcal</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
              <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded-xl">
                <span className="text-amber-400 block text-[9px] font-sans font-bold">كارب مرتفع (High)</span>
                <span className="text-amber-300 font-extrabold text-xs block">{highDayCarbs}g</span>
                <span className="text-slate-400 text-[9px] font-sans block mt-0.5">{Math.round(previewBaseline.calories + previewRules.highCalorieAdj)} سعرة</span>
              </div>
              <div className="bg-blue-950/40 border border-blue-500/30 p-2 rounded-xl">
                <span className="text-blue-400 block text-[9px] font-sans font-bold">كارب متوسط (Med)</span>
                <span className="text-blue-300 font-extrabold text-xs block">{medDayCarbs}g</span>
                <span className="text-slate-400 text-[9px] font-sans block mt-0.5">{previewBaseline.calories} سعرة</span>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-xl">
                <span className="text-emerald-400 block text-[9px] font-sans font-bold">كارب منخفض (Low)</span>
                <span className="text-emerald-300 font-extrabold text-xs block">{lowDayCarbs}g</span>
                <span className="text-slate-400 text-[9px] font-sans block mt-0.5">{Math.round(previewBaseline.calories + previewRules.lowCalorieAdj)} سعرة</span>
              </div>
            </div>
          </div>

          {/* Training Days Selection */}
          <div>
            <label className="block font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-blue-400" />
                أيام التمارين الأسبوعية (اختر أيام التمرين)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {(formData.workoutDays || [0, 1, 3, 4, 5]).length} أيام تمرين
              </span>
            </label>
            <div className="grid grid-cols-7 gap-1">
              {[
                { name: 'سبت', idx: 0 },
                { name: 'أحد', idx: 1 },
                { name: 'إثنين', idx: 2 },
                { name: 'ثلاثاء', idx: 3 },
                { name: 'أربعاء', idx: 4 },
                { name: 'خميس', idx: 5 },
                { name: 'جمعة', idx: 6 },
              ].map((d) => {
                const currentWorkoutDays = formData.workoutDays || [0, 1, 3, 4, 5];
                const isWorkout = currentWorkoutDays.includes(d.idx);
                return (
                  <button
                    key={d.idx}
                    type="button"
                    onClick={() => {
                      const updated = isWorkout
                        ? currentWorkoutDays.filter(i => i !== d.idx)
                        : [...currentWorkoutDays, d.idx];
                      setFormData({ ...formData, workoutDays: updated });
                    }}
                    className={`py-2 rounded-lg border text-center font-bold text-[11px] transition-all ${
                      isWorkout
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fasting Type */}
          <div>
            <label className="block font-medium text-slate-300 mb-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              نظام الصيام المتقطع المفضل
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['16:8', '14:10', '18:6', '12:12'] as FastingType[]).map((fType) => (
                <button
                  key={fType}
                  type="button"
                  onClick={() => setFormData({ ...formData, fastingType: fType })}
                  className={`py-2 rounded-xl border text-center font-bold text-xs transition-all ${
                    formData.fastingType === fType
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {fType}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">ملاحظات خاصة</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              rows={2}
              placeholder="مثال: حساسية من الألبان، تمرين في 7 مساءً..."
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              حفظ وتطبيق الحسابات الحية
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
