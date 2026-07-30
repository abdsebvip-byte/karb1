import React, { useState } from 'react';
import { UserProfile, DayPlan, MealItem, FastingSession } from '../types';
import { GOALS_MAP } from '../domain/nutrition';
import { ScientificBreakdownModal } from '../components/ScientificBreakdownModal';
import { Flame, Dumbbell, Droplets, Plus, Timer, Sparkles, CheckCircle, ChevronRight, PieChart, Calculator, ShieldCheck, Utensils } from 'lucide-react';

interface DashboardScreenProps {
  profile: UserProfile;
  todayPlan: DayPlan;
  weeklyPlan: DayPlan[];
  meals: MealItem[];
  fastingSession?: FastingSession;
  planError?: string | null;
  onOpenProfile?: () => void;
  onAddMeal: (meal: Omit<MealItem, 'id'>) => void;
  onUpdateProfile?: (updated: UserProfile) => void;
  onNavigateToFasting: () => void;
  onNavigateToAI: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  todayPlan,
  weeklyPlan,
  meals,
  fastingSession,
  planError,
  onOpenProfile,
  onAddMeal,
  onUpdateProfile,
  onNavigateToFasting,
  onNavigateToAI,
}) => {
  const [waterMl, setWaterMl] = useState<number>(1750);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    const todayIdx = (new Date().getDay() + 1) % 7;
    return todayIdx < weeklyPlan.length ? todayIdx : 0;
  });
  const [showMealModal, setShowMealModal] = useState<boolean>(false);
  const [showScientificModal, setShowScientificModal] = useState<boolean>(false);

  const activePlan = weeklyPlan[selectedDayIndex] || todayPlan;

  // Maximum carb value in weekly plan for bar chart scaling
  const maxWeeklyCarb = Math.max(...weeklyPlan.map(p => p.carbs), 1);

  // Calculate consumed totals
  const consumedCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const consumedCarbs = meals.reduce((acc, m) => acc + m.carbs, 0);
  const consumedProtein = meals.reduce((acc, m) => acc + m.protein, 0);
  const consumedFat = meals.reduce((acc, m) => acc + m.fat, 0);

  const calPct = Math.min(100, Math.round((consumedCalories / activePlan.calories) * 100));
  const carbPct = Math.min(100, Math.round((consumedCarbs / activePlan.carbs) * 100));
  const protPct = Math.min(100, Math.round((consumedProtein / activePlan.protein) * 100));
  const fatPct = Math.min(100, Math.round((consumedFat / activePlan.fat) * 100));

  const typeDetails = {
    high: { title: 'يوم كربوهيدرات مرتفع', icon: '🔥', color: 'from-amber-600 to-orange-500', bg: 'bg-amber-950/40 border-amber-500/40' },
    medium: { title: 'يوم كربوهيدرات متوسط', icon: '⚖️', color: 'from-blue-600 to-indigo-500', bg: 'bg-blue-950/40 border-blue-500/40' },
    low: { title: 'يوم كربوهيدرات منخفض', icon: '🥗', color: 'from-emerald-600 to-teal-500', bg: 'bg-emerald-950/40 border-emerald-500/40' },
    refeed: { title: 'يوم Refeed شحن الجليكوجين', icon: '⚡', color: 'from-purple-600 to-pink-500', bg: 'bg-purple-950/40 border-purple-500/40' },
  }[(activePlan && activePlan.type) || 'medium'] || { title: 'يوم كربوهيدرات متوسط', icon: '⚖️', color: 'from-blue-600 to-indigo-500', bg: 'bg-blue-950/40 border-blue-500/40' };

  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: 350,
    protein: 30,
    carbs: 40,
    fat: 8,
    quantity: '1 وجبة',
    mealType: 'lunch' as MealItem['mealType'],
    time: '14:30'
  });

  const handleAddMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeal.name.trim()) return;
    onAddMeal(newMeal);
    setShowMealModal(false);
    setNewMeal({
      name: '',
      calories: 350,
      protein: 30,
      carbs: 40,
      fat: 8,
      quantity: '1 وجبة',
      mealType: 'lunch',
      time: '14:30'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12">
      {/* Body Fat & Nutrition Validation Alert inside Dashboard */}
      {planError && (
        <div className="bg-rose-950/90 border border-rose-500/80 p-4 rounded-2xl shadow-xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <span className="text-xl">⚠️</span>
              <span>تنبيه خطأ في بيانات نسبة الدهون والحسابات</span>
            </div>
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition shadow-sm shrink-0"
              >
                تعديل نسبة الدهون
              </button>
            )}
          </div>
          <p className="text-xs text-rose-200 leading-relaxed font-medium">
            {planError}
          </p>
        </div>
      )}

      {/* 0. Real-time Goal & Strategy Controller Bar */}
      {onUpdateProfile && (
        <div className="bg-slate-900/90 border border-purple-500/30 p-3 rounded-2xl space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              التحكم الحي بنظام الكارب سايكل والهدف
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded-full font-mono font-bold">
              متصل حياً 100% ⚡
            </span>
          </div>

          {/* Quick Goal Selectors */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'muscle', label: 'بناء عضلات', icon: '🏋️', color: 'border-purple-500 text-purple-300 bg-purple-950/40' },
              { id: 'fatloss', label: 'خسارة دهون', icon: '⚡', color: 'border-amber-500 text-amber-300 bg-amber-950/40' },
              { id: 'cutting', label: 'تنشيف حاد', icon: '🔥', color: 'border-red-500 text-red-300 bg-red-950/40' },
              { id: 'maintenance', label: 'محافظة', icon: '⚖️', color: 'border-blue-500 text-blue-300 bg-blue-950/40' },
            ].map((g) => {
              const isSelected = profile.goal === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => onUpdateProfile({ ...profile, goal: g.id as any })}
                  className={`py-1.5 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? `${g.color} ring-1 ring-purple-400 font-bold scale-[1.02] shadow-sm`
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs">{g.icon}</span>
                  <span className="text-[10px] mt-0.5 leading-tight">{g.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Carb Cycle Strategy Switcher */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400 font-medium">استراتيجية التوزيع:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'classic_3tier', label: 'ثلاثي متوازن' },
                { id: 'high_low_2tier', label: 'ثنائي High/Low' },
                { id: 'refeed_matrix', label: 'شحن Refeed' },
              ].map((strat) => {
                const activeStrat = profile.carbCycleStrategy || 'classic_3tier';
                const isSelected = activeStrat === strat.id;
                return (
                  <button
                    key={strat.id}
                    onClick={() => onUpdateProfile({ ...profile, carbCycleStrategy: strat.id as any })}
                    className={`px-2 py-0.5 rounded-lg border text-[10px] transition ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {strat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 0.5. 7-Day Live Visual Carb Cycling Graph & Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-amber-400" />
            توزيع الكارب الأسبوعي الفعلي (Live Carb Wave Chart)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {profile.goal === 'muscle' ? 'موجات تضخيم' : profile.goal === 'cutting' ? 'تنشيف قاسي' : 'توزيع متوازن'}
          </span>
        </div>

        {/* 7-Day Bar Chart Visualizer */}
        <div className="grid grid-cols-7 gap-1.5 items-end h-20 pt-2 border-b border-slate-800 pb-1">
          {weeklyPlan.map((plan, idx) => {
            const isSelected = idx === selectedDayIndex;
            const heightPct = Math.max(15, Math.min(100, Math.round((plan.carbs / maxWeeklyCarb) * 100)));
            const barBg = plan.type === 'high' 
              ? 'bg-gradient-to-t from-amber-600 to-orange-400 border-amber-400' 
              : plan.type === 'medium' 
              ? 'bg-gradient-to-t from-blue-600 to-indigo-400 border-blue-400' 
              : 'bg-gradient-to-t from-emerald-600 to-teal-400 border-emerald-400';
            const arrowIcon = plan.type === 'high' ? '↑' : plan.type === 'medium' ? '↔' : '↓';

            return (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex flex-col items-center justify-end h-full group transition-all ${
                  isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <span className="text-[9px] font-mono font-bold text-amber-300 mb-0.5">{plan.carbs}g</span>
                <div className="w-full bg-slate-950/80 rounded-t-lg overflow-hidden flex flex-col justify-end p-0.5 h-full">
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t border-t ${barBg} transition-all duration-300 flex items-center justify-center text-[8px] text-white font-extrabold`}
                  >
                    {arrowIcon}
                  </div>
                </div>
                <span className={`text-[9px] font-bold mt-1 ${isSelected ? 'text-purple-300 font-extrabold' : 'text-slate-400'}`}>
                  {plan.dayName.substring(0, 3)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Main Hero Banner - Selected Day's Carb Cycle Status */}
      <div className={`p-4 rounded-2xl border ${typeDetails.bg} backdrop-blur shadow-xl relative overflow-hidden transition-all duration-300`}>
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{typeDetails.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">يوم: {activePlan.dayName}</span>
            </div>
            <h2 className="text-lg font-extrabold text-white">{typeDetails.title}</h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
              تمرين اليوم: <span className="text-amber-300 font-semibold">{activePlan.workoutFocus}</span>
            </p>
          </div>
          <div className="text-left bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block">هدف الكارب المحدد</span>
            <span className="text-lg font-extrabold text-amber-400">{activePlan.carbs}g</span>
            <span className="text-[9px] text-slate-400 block font-mono">{activePlan.calories} سعرة</span>
          </div>
        </div>

        {/* Recommended Carb Sources Chips */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex-1">
            <span className="text-[11px] text-slate-400 font-medium block mb-1.5">مصادر كربوهيدرات موصى بها اليوم:</span>
            <div className="flex flex-wrap gap-1.5">
              {activePlan.recommendedCarbSources.map((src, i) => (
                <span key={i} className="text-[10px] bg-slate-900 text-slate-200 border border-slate-700/80 px-2 py-0.5 rounded-lg">
                  {src}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowScientificModal(true)}
            className="shrink-0 ml-2 px-2.5 py-1 bg-purple-950/90 border border-purple-700/80 hover:border-purple-500 rounded-xl text-[10px] font-bold text-purple-200 flex items-center gap-1 shadow-sm transition"
          >
            <Calculator className="w-3 h-3 text-purple-400" />
            <span>الحساب العلمي والدليل</span>
          </button>
        </div>
      </div>

      {/* 2. Today's Macros Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">إحصائيات الماكروز والسعرات</h3>
          </div>
          <span className="text-xs font-bold text-slate-300">
            {consumedCalories} / <span className="text-purple-400">{todayPlan.calories}</span> سعرة
          </span>
        </div>

        {/* Calories Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${calPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>تم استهلاك {calPct}% من السعرات</span>
            <span>المتبقي: {Math.max(0, todayPlan.calories - consumedCalories)} سعرة</span>
          </div>
        </div>

        {/* Macro Trio Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* Carbs */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 text-center">
            <div className="flex items-center justify-between text-[11px] text-amber-400 mb-1 font-semibold">
              <span>كربوهيدرات</span>
              <span>{consumedCarbs}/{todayPlan.carbs}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${carbPct}%` }} />
            </div>
          </div>

          {/* Protein */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30 text-center">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 mb-1 font-semibold">
              <span>بروتين</span>
              <span>{consumedProtein}/{todayPlan.protein}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${protPct}%` }} />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-blue-500/30 text-center">
            <div className="flex items-center justify-between text-[11px] text-blue-400 mb-1 font-semibold">
              <span>دهون</span>
              <span>{consumedFat}/{todayPlan.fat}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${fatPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fasting Quick Widget & Water Tracker */}
      <div className="grid grid-cols-2 gap-3">
        {/* Fasting Quick Card */}
        <div
          onClick={onNavigateToFasting}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-amber-400" />
              الصيام المتقطع
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition transform rotate-180" />
          </div>

          <div className="my-2">
            <span className="text-xl font-extrabold text-amber-400 font-mono">
              {fastingSession?.completed ? 'مكتمل ✅' : 'جاري الصيام 🔥'}
            </span>
            <p className="text-[10px] text-slate-400">نظام {profile.fastingType || '16:8'}</p>
          </div>

          <span className="text-[10px] text-purple-300 underline font-medium">عرض عداد الصيام والإنزيمات</span>
        </div>

        {/* Water Intake Tracker Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              شرب الماء اليوم
            </span>
            <span className="text-[10px] text-cyan-300 font-mono font-bold">{waterMl} / 3000 مل</span>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden my-2 border border-slate-800">
            <div className="h-full bg-cyan-400 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (waterMl / 3000) * 100)}%` }} />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setWaterMl((prev) => Math.min(5000, prev + 250))}
              className="flex-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 rounded-lg py-1 text-[11px] font-bold flex items-center justify-center gap-1 transition"
            >
              <Plus className="w-3 h-3" />
              250ml
            </button>
            <button
              onClick={() => setWaterMl((prev) => Math.min(5000, prev + 500))}
              className="flex-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 rounded-lg py-1 text-[11px] font-bold flex items-center justify-center gap-1 transition"
            >
              <Plus className="w-3 h-3" />
              500ml
            </button>
          </div>
        </div>
      </div>

      {/* 4. AI Coach Banner */}
      <div
        onClick={onNavigateToAI}
        className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-purple-800/60 rounded-2xl p-3.5 shadow-xl flex items-center justify-between cursor-pointer hover:border-purple-500 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1">
              استشر ذكاء CarbFlow AI
              <span className="text-[9px] bg-purple-500 text-white px-1.5 py-0.2 rounded font-mono">Gemini</span>
            </h4>
            <p className="text-[11px] text-purple-200">احصل على اقتراح وجبات فورية وتعديل لماكروز يومك الحالي</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-purple-400 rotate-180" />
      </div>

      {/* 5. Daily Meal Log Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">سجل الوجبات اليومية</h3>
          <button
            onClick={() => setShowMealModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-purple-600/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة وجبة
          </button>
        </div>

        {meals.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">لم يتم تسجيل وجبات اليوم بعد.</p>
            <p className="text-[10px] text-slate-500 mt-1">انقر فوق "إضافة وجبة" لتتبع الكارب والبروتين والدهون.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <div key={meal.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{meal.name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{meal.quantity}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                    <span className="text-amber-400">كارب: {meal.carbs}g</span>
                    <span className="text-emerald-400">بروتين: {meal.protein}g</span>
                    <span className="text-blue-400">دهون: {meal.fat}g</span>
                  </div>
                </div>
                <div className="text-left font-mono font-bold text-purple-300">
                  {meal.calories} kcal
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Meal Modal with Real Live Math (Carbs*4 + Protein*4 + Fat*9) */}
      {showMealModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">إضافة وجبة حقيقية وتتبع الماكروز</h3>
              </div>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono font-bold">
                حساب آلي 100%
              </span>
            </div>

            {/* Meal Presets Selector */}
            <div>
              <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
                اختيار وجبة جاهزة ومحسوبة بالجرامات (Presets)
              </label>
              <select
                onChange={(e) => {
                  const presets: Record<string, { name: string; carbs: number; protein: number; fat: number; quantity: string }> = {
                    rice_chicken: { name: '200g أرز أبيض مطبوخ + 200g صدر دجاج مشوي + 10g زيت زيتون', carbs: 56, protein: 62, fat: 14, quantity: '410 جرام' },
                    oats_protein: { name: '120g شوفان + 250ml حليب + 1 موزة + 30g واير بروتين', carbs: 95, protein: 44, fat: 11, quantity: '400 جرام' },
                    eggs_toast: { name: '4 بيضات مسلوقة + 100g خبز أسمر (2 توست) + 50g أفوكادو', carbs: 48, protein: 34, fat: 26, quantity: '350 جرام' },
                    tuna_potato: { name: '300g بطاطس مسلوقة + 185g علبة تونة بالماء', carbs: 63, protein: 46, fat: 3, quantity: '485 جرام' },
                    huge_bulking: { name: '350g أرز مطبوخ + 250g لحم بقر صافي + 20g مكسرات مشكلة', carbs: 98, protein: 72, fat: 34, quantity: '620 جرام' },
                    keto_cutting: { name: '250g صدر دجاج + سلطة خضراء بروكلي وخس + 20g زيت زيتون', carbs: 8, protein: 77, fat: 22, quantity: '450 جرام' },
                  };
                  const selected = presets[e.target.value];
                  if (selected) {
                    const cals = (selected.carbs * 4) + (selected.protein * 4) + (selected.fat * 9);
                    setNewMeal({
                      ...newMeal,
                      name: selected.name,
                      carbs: selected.carbs,
                      protein: selected.protein,
                      fat: selected.fat,
                      calories: cals,
                      quantity: selected.quantity,
                    });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-medium"
              >
                <option value="">-- اختر من الوجبات الرياضية الشائعة (اختياري) --</option>
                <option value="rice_chicken">🍗 وجبة غداء/عشاء: 200g أرز + 200g دجاج + زيت زيتون (598 kcal)</option>
                <option value="oats_protein">🥣 وجبة إفطار/قبل التمرين: 120g شوفان + حليب + موزة + بروتين (655 kcal)</option>
                <option value="eggs_toast">🥑 وجبة إفطار: 4 بيضات + 2 توست أسمر + أفوكادو (562 kcal)</option>
                <option value="tuna_potato">🥔 وجبة كربوهيدرات: 300g بطاطس + علبة تونة بالماء (463 kcal)</option>
                <option value="huge_bulking">🥩 وجبة ضخمة جداً: 350g أرز + 250g لحم بقر + مكسرات (986 kcal)</option>
                <option value="keto_cutting">🥗 وجبة تنشيف منخفضة الكارب: 250g دجاج + بروكلي + زيت زيتون (538 kcal)</option>
              </select>
            </div>

            <form onSubmit={handleAddMealSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">اسم الوجبة</label>
                <input
                  type="text"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  placeholder="مثال: 200g أرز + 150g صدر دجاج"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">كمية/وزن الوجبة</label>
                <input
                  type="text"
                  value={newMeal.quantity}
                  onChange={(e) => setNewMeal({ ...newMeal, quantity: e.target.value })}
                  placeholder="مثال: 350 جرام أو 1 صحن كبير"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                />
              </div>

              {/* Macro Inputs with Automatic Real-Time Math */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-amber-400 mb-1 font-bold text-[11px]">الكارب (جم)</label>
                  <input
                    type="number"
                    min="0"
                    value={newMeal.carbs}
                    onChange={(e) => {
                      const c = Math.max(0, Number(e.target.value));
                      const cals = (c * 4) + (newMeal.protein * 4) + (newMeal.fat * 9);
                      setNewMeal({ ...newMeal, carbs: c, calories: cals });
                    }}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-400 font-extrabold text-sm"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">× 4 = {newMeal.carbs * 4} kcal</span>
                </div>

                <div>
                  <label className="block text-emerald-400 mb-1 font-bold text-[11px]">البروتين (جم)</label>
                  <input
                    type="number"
                    min="0"
                    value={newMeal.protein}
                    onChange={(e) => {
                      const p = Math.max(0, Number(e.target.value));
                      const cals = (newMeal.carbs * 4) + (p * 4) + (newMeal.fat * 9);
                      setNewMeal({ ...newMeal, protein: p, calories: cals });
                    }}
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-400 font-extrabold text-sm"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">× 4 = {newMeal.protein * 4} kcal</span>
                </div>

                <div>
                  <label className="block text-blue-400 mb-1 font-bold text-[11px]">الدهون (جم)</label>
                  <input
                    type="number"
                    min="0"
                    value={newMeal.fat}
                    onChange={(e) => {
                      const f = Math.max(0, Number(e.target.value));
                      const cals = (newMeal.carbs * 4) + (newMeal.protein * 4) + (f * 9);
                      setNewMeal({ ...newMeal, fat: f, calories: cals });
                    }}
                    className="w-full bg-slate-950 border border-blue-500/40 rounded-xl px-3 py-2 text-blue-400 font-extrabold text-sm"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">× 9 = {newMeal.fat * 9} kcal</span>
                </div>
              </div>

              {/* Exact Thermodynamic Calculation Banner */}
              <div className="bg-purple-950/60 border border-purple-500/40 p-3 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-purple-400" />
                    السعرات الإجمالية المحسوبة تلقائياً:
                  </span>
                  <span className="text-sm font-extrabold font-mono text-purple-300">
                    {newMeal.calories} kcal
                  </span>
                </div>
                <p className="text-[10px] text-purple-200/90 font-mono dir-ltr text-right">
                  ({newMeal.carbs}g × 4) + ({newMeal.protein}g × 4) + ({newMeal.fat}g × 9) = {newMeal.calories} kcal
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMealModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-purple-600/30 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  حفظ وتأكيد الوجبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Scientific Modal */}
      <ScientificBreakdownModal
        profile={profile}
        isOpen={showScientificModal}
        onClose={() => setShowScientificModal(false)}
      />
    </div>
  );
};
