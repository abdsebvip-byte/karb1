import React, { useState } from 'react';
import { UserProfile, ProgressEntry } from '../types';
import { calculatePhysiologicalEngineState } from '../domain/nutrition';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Plus, Calendar, Zap, Sparkles } from 'lucide-react';

interface ProgressScreenProps {
  profile: UserProfile;
  progressEntries: ProgressEntry[];
  onAddProgressEntry: (entry: Omit<ProgressEntry, 'id'>) => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  profile,
  progressEntries,
  onAddProgressEntry,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newWeight, setNewWeight] = useState<number>(profile.weightKg);
  const [newFatPct, setNewFatPct] = useState<number>(profile.bodyFatPct || 16);
  const [newWaist, setNewWaist] = useState<number>(82);
  const [notes, setNotes] = useState<string>('');

  const phys = calculatePhysiologicalEngineState(profile);

  const sortedEntries = [...progressEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Chart dataset formatting
  const chartData = sortedEntries.map((e) => ({
    date: e.date.substring(5), // MM-DD
    weight: e.weightKg,
    fat: e.bodyFatPct || 0,
  }));

  const initialWeight = sortedEntries.length > 0 ? sortedEntries[0].weightKg : profile.weightKg;
  const latestWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weightKg : profile.weightKg;
  const diffKg = Number((latestWeight - initialWeight).toFixed(1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProgressEntry({
      date: new Date().toISOString().split('T')[0],
      weightKg: newWeight,
      bodyFatPct: newFatPct,
      waistCm: newWaist,
      notes,
    });
    setShowAddModal(false);
    setNotes('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            متابعة الوزن والترتيب الأيضي
          </h2>
          <p className="text-xs text-slate-400">سجل القياسات ومؤشرات المحرك الأيضي والفسيولوجي</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          تسجيل وزن اليوم
        </button>
      </div>

      {/* Exercise Physiology Engine Projections Banner */}
      <div className="bg-slate-900 border border-purple-500/30 p-3.5 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            توقعات ومؤشرات المحرك الفسيولوجي الأيضي (Forbes / Hall Engine)
          </span>
          <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono font-bold">
            التكيف الأيضي: {(phys.adaptiveFactor * 100).toFixed(0)}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">خسارة الدهون التقديرية</span>
            <span className="text-emerald-400 font-extrabold font-mono text-xs">~{phys.projectedWeeklyFatLossKg} كجم/أسبوع</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">الزمن المتوقع للهدف</span>
            <span className="text-amber-400 font-extrabold font-mono text-xs">{phys.estimatedWeeksToGoal} أسبوع</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">ملاءة الطاقة EA</span>
            <span className={`font-extrabold font-mono text-xs ${phys.energyAvailabilityTarget < 30 ? 'text-rose-400' : 'text-purple-300'}`}>
              {phys.energyAvailabilityTarget} kcal/kg LBM
            </span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">مؤشر إجهاد الدايت</span>
            <span className={`font-extrabold font-mono text-xs ${phys.dietFatigueScore > 70 ? 'text-rose-400' : 'text-blue-300'}`}>
              {phys.dietFatigueScore} / 100
            </span>
          </div>
        </div>

        {phys.refeedRecommendation !== 'none' && (
          <div className="bg-purple-950/60 border border-purple-700/80 p-2 rounded-xl text-[11px] text-purple-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              توصية المحرك: {phys.refeedRecommendation === 'diet_break_1week' ? 'أسبوع استراحة الدايت (Diet Break) على سعرات المحافظة' : phys.refeedRecommendation === '2_day_refeed' ? 'يومان شحن كربوهيدرات (Refeed)' : 'يوم شحن كربوهيدرات (Refeed)'}
            </span>
            <span className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-slate-300">
              رفع هرمون اللبتين ⚡
            </span>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">الوزن الحالي</span>
          <span className="text-base font-extrabold text-white font-mono">{latestWeight} كجم</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">الهدف المطلوب</span>
          <span className="text-base font-extrabold text-amber-400 font-mono">{profile.targetWeightKg || 75} كجم</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">التغير الإجمالي</span>
          <span className={`text-base font-extrabold font-mono ${diffKg <= 0 ? 'text-emerald-400' : 'text-purple-400'}`}>
            {diffKg > 0 ? `+${diffKg}` : diffKg} كجم
          </span>
        </div>
      </div>

      {/* Progress Chart Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center justify-between">
          <span>مخطط تغير الوزن (كجم)</span>
          <span className="text-[10px] text-purple-300 font-mono">آخر التسجيلات</span>
        </h3>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="weight" name="الوزن (كجم)" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-white">سجل القياسات السابقة</h3>
        <div className="space-y-2">
          {sortedEntries.slice().reverse().map((entry) => (
            <div key={entry.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {entry.date}
                  </span>
                  {entry.notes && <span className="text-[10px] text-slate-400">({entry.notes})</span>}
                </div>
                {entry.waistCm && (
                  <span className="text-[10px] text-slate-400 mt-0.5 block">محيط الخصر: {entry.waistCm} سم</span>
                )}
              </div>
              <div className="text-left">
                <span className="text-sm font-extrabold text-emerald-400 font-mono block">{entry.weightKg} كجم</span>
                {entry.bodyFatPct && (
                  <span className="text-[10px] text-slate-400">{entry.bodyFatPct}% دهون</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">تسجيل قياسات جديدة اليوم</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">الوزن الحالي (كجم)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">نسبة الدهون المقدرة (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newFatPct}
                  onChange={(e) => setNewFatPct(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">محيط الخصر (سم)</label>
                <input
                  type="number"
                  value={newWaist}
                  onChange={(e) => setNewWaist(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">ملاحظات والتطور</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: بعد يوم الكارب المرتفع، عروق واضحة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold"
                >
                  حفظ القياس
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
