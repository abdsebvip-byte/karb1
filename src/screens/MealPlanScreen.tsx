import React, { useState } from 'react';
import { UserProfile, DayPlan } from '../types';
import { GOALS_MAP, calculateIntradayCarbDistribution } from '../domain/nutrition';
import { ScientificBreakdownModal } from '../components/ScientificBreakdownModal';
import { Sparkles, Dumbbell, Calendar, Utensils, Printer, RefreshCw, ChefHat, Calculator, ShieldCheck, Clock, Zap, Target } from 'lucide-react';

interface MealPlanScreenProps {
  profile: UserProfile;
  weeklyPlan: DayPlan[];
  onUpdateProfile?: (updated: UserProfile) => void;
}

interface AIRecipe {
  title: string;
  mealType: string;
  description: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  ingredients: string[];
}

export const MealPlanScreen: React.FC<MealPlanScreenProps> = ({
  profile,
  weeklyPlan,
  onUpdateProfile,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [recipes, setRecipes] = useState<AIRecipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState<boolean>(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [showScientificModal, setShowScientificModal] = useState<boolean>(false);

  const selectedDay = weeklyPlan[selectedDayIndex] || weeklyPlan[0];

  const typeConfig = {
    high: { label: 'مرتفع الكارب 🔥', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    medium: { label: 'متوسط الكارب ⚖️', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    low: { label: 'منخفض الكارب 🥗', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    refeed: { label: 'إعادة شحن Refeed ⚡', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  }[(selectedDay && selectedDay.type) || 'medium'] || { label: 'متوسط الكارب ⚖️', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };

  const goalConfig = GOALS_MAP[profile.goal] || GOALS_MAP.muscle;

  // Scientific Intra-day Carb Timing Distribution
  const intradayTiming = calculateIntradayCarbDistribution(selectedDay, profile);

  const handleGenerateAIRecipes = async () => {
    setLoadingRecipes(true);
    setRecipeError(null);
    try {
      const res = await fetch('/api/ai/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayType: selectedDay.type,
          targetCarbs: selectedDay.carbs,
          targetProtein: selectedDay.protein,
          targetFat: selectedDay.fat,
          targetCalories: selectedDay.calories,
          preferences: profile.notes || 'وجبات صحية رياضية ممتازة',
        }),
      });

      const data = await res.json();
      if (data.recipes && Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
      } else {
        setRecipeError('تعذر الحصول على وصفات مجدولة.');
      }
    } catch (err: any) {
      setRecipeError(err.message || 'حدث خطأ أثناء طلب الوصفات الذكية.');
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handlePrintPlan = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            جدول الكارب سايكل الأسبوعي
          </h2>
          <p className="text-xs text-slate-400">تخطيط 7 أيام مقسمة بالمعادلات الرياضية</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScientificModal(true)}
            className="px-2.5 py-1.5 bg-purple-950/80 border border-purple-700/80 rounded-xl text-purple-300 hover:text-white hover:border-purple-500 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5 text-purple-400" />
            <span>الدليل العلمي للحسابات</span>
          </button>
          <button
            onClick={handlePrintPlan}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="طباعة / تصدير الخطة"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Goal Explanation Banner & Quick Switches */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-lg">
        <div className="flex items-start gap-2.5">
          <Target className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">الهدف الفعّال حالياً: <span style={{ color: goalConfig.color }}>{goalConfig.label}</span></span>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono font-bold">
                {goalConfig.calorieDelta > 0 ? `+${goalConfig.calorieDelta}` : goalConfig.calorieDelta} kcal
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              {goalConfig.scientificBasis}
            </p>
          </div>
        </div>

        {/* Quick Goal Selectors inside MealPlan */}
        {onUpdateProfile && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
            <span className="text-[10px] text-slate-400 font-bold shrink-0">اختبار الأهداف حياً:</span>
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              {[
                { id: 'muscle', label: 'تضخيم عضلات 🏋️' },
                { id: 'fatloss', label: 'خسارة دهون ⚡' },
                { id: 'cutting', label: 'تنشيف قاسي 🔥' },
                { id: 'maintenance', label: 'محافظة ⚖️' },
              ].map((g) => {
                const isSelected = profile.goal === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => onUpdateProfile({ ...profile, goal: g.id as any })}
                    className={`px-2.5 py-1 rounded-xl text-[10px] border font-bold transition whitespace-nowrap ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Horizontal Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {weeklyPlan.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const dayBadge = day.type === 'high' ? '🔥' : day.type === 'medium' ? '⚖️' : '🥗';

          return (
            <button
              key={day.dayName}
              onClick={() => {
                setSelectedDayIndex(idx);
                setRecipes([]);
              }}
              className={`flex-1 min-w-[70px] p-2.5 rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'bg-purple-900/60 border-purple-500 text-white shadow-lg shadow-purple-950/50 scale-105'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="block text-xs font-bold">{day.dayName}</span>
              <span className="text-[10px] block mt-0.5">{dayBadge}</span>
              <span className="text-[9px] block font-mono font-semibold text-amber-300 mt-1">{day.carbs}g</span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Card Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">يوم {selectedDay.dayName}</h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${typeConfig.bg}`}>
                {typeConfig.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
              التركيز الرياضي: <span className="text-slate-200 font-semibold">{selectedDay.workoutFocus}</span>
            </p>
          </div>

          <div className="text-left">
            <span className="text-xs text-slate-400 block">إجمالي السعرات</span>
            <span className="text-base font-extrabold text-purple-300 font-mono">{selectedDay.calories} kcal</span>
          </div>
        </div>

        {/* Macro Targets Breakdown */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">الكربوهيدرات</span>
            <span className="text-lg font-extrabold text-amber-400 font-mono">{selectedDay.carbs}g</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">البروتين</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">{selectedDay.protein}g</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-blue-500/30 text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">الدهون</span>
            <span className="text-lg font-extrabold text-blue-400 font-mono">{selectedDay.fat}g</span>
          </div>
        </div>

        {/* Intra-day Carb Timing Breakdown */}
        <div className="bg-slate-950/90 p-3.5 rounded-xl border border-purple-500/20 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              التوزيع التوقيتي العلمي للكارب خلال هذا اليوم ({selectedDay.carbs}g):
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full w-fit">
              {intradayTiming.insulinSensitivityFactor}
            </span>
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
            💡 {intradayTiming.scientificRationale}
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
              <span className="text-[9px] text-slate-400 block font-semibold">{intradayTiming.preWorkoutWindowText} ({intradayTiming.preWorkoutPct}%)</span>
              <span className="text-sm font-extrabold text-amber-300 font-mono">{intradayTiming.preWorkoutCarbsG}g</span>
              <span className="text-[8px] text-slate-400 block">طاقة وانقباض</span>
            </div>
            <div className="bg-slate-900 border border-purple-800/60 p-2 rounded-lg bg-purple-950/30">
              <span className="text-[9px] text-purple-300 block font-semibold">{intradayTiming.postWorkoutWindowText} ({intradayTiming.postWorkoutPct}%)</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">{intradayTiming.postWorkoutCarbsG}g</span>
              <span className="text-[8px] text-purple-400 block">شحن جليكوجين GLUT4</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
              <span className="text-[9px] text-slate-400 block font-semibold">{intradayTiming.otherMealsWindowText} ({intradayTiming.otherMealsPct}%)</span>
              <span className="text-sm font-extrabold text-slate-300 font-mono">{intradayTiming.otherMealsCarbsG}g</span>
              <span className="text-[8px] text-slate-400 block">خضار وألياف</span>
            </div>
          </div>
        </div>

        {/* Recommended Foods */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            أهم المصادر الغذائية الموصى بها لهذا اليوم:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedDay.recommendedCarbSources.map((item, i) => (
              <span key={i} className="text-xs bg-slate-900 border border-slate-700/70 text-slate-200 px-2.5 py-1 rounded-lg">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* AI Recipe Generator Button */}
        <button
          onClick={handleGenerateAIRecipes}
          disabled={loadingRecipes}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {loadingRecipes ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              جاري ابتكار الوجبات بالذكاء الاصطناعي...
            </>
          ) : (
            <>
              <ChefHat className="w-4 h-4 text-amber-300" />
              ابتكار 3 وجبات مخصصة بالذكاء الاصطناعي (Gemini)
            </>
          )}
        </button>
      </div>

      {/* Recipe error feedback */}
      {recipeError && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs">
          {recipeError}
        </div>
      )}

      {/* Generated AI Recipes List */}
      {recipes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            الوجبات المقترحة ليوم {selectedDay.dayName} ({typeConfig.label}):
          </h3>
          {recipes.map((rec, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  {rec.title}
                </span>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-medium">
                  {rec.mealType}
                </span>
              </div>
              <p className="text-xs text-slate-300">{rec.description}</p>

              <div className="flex items-center gap-3 text-[11px] font-mono bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold">كارب: {rec.carbs}g</span>
                <span className="text-emerald-400 font-bold">بروتين: {rec.protein}g</span>
                <span className="text-blue-400 font-bold">دهون: {rec.fat}g</span>
                <span className="text-purple-300 font-bold mr-auto">{rec.calories} kcal</span>
              </div>

              {rec.ingredients && (
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">المكونات:</span>
                  <div className="flex flex-wrap gap-1">
                    {rec.ingredients.map((ing, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        • {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
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

