import React, { useState } from 'react';
import { UserProfile, ProgressEntry } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Plus, Scale, Target, Trophy, Calendar } from 'lucide-react';

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
            متابعة الوزن ونسبة الدهون والقياسات
          </h2>
          <p className="text-xs text-slate-400">سجل تطور جسمك وقياساتك بمرور الوقت</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          تسجيل وزن اليوم
        </button>
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
