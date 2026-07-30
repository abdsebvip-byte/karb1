import React, { useState, useEffect } from 'react';
import { ClientProfile, Goal, FastingType, Gender, UserProfile } from '../types';
import { generateWeeklyCarbPlan, calculateBMR, calculateTDEE, calculateLeanBodyMass, getScientificBreakdownDetails, GOALS_MAP, ACTIVITY_LEVELS } from '../domain/nutrition';
import { ScientificBreakdownModal } from '../components/ScientificBreakdownModal';
import { Users, Plus, Edit3, FileText, CheckCircle, Award, Dumbbell, ShieldCheck, Calculator, ArrowLeftRight, Trash2, Clock, Sparkles, Check } from 'lucide-react';

interface CoachScreenProps {
  onApplyClientToApp?: (clientProfile: UserProfile) => void;
}

export const CoachScreen: React.FC<CoachScreenProps> = ({ onApplyClientToApp }) => {
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem('carbflow_coach_clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'c_1',
        name: 'الكابتن محمد علي',
        age: 29,
        gender: 'Male',
        heightCm: 182,
        weightKg: 89,
        activityLevel: 1.725,
        goal: 'cutting',
        fastingType: '16:8',
        clientCode: 'CF-8821',
        startDate: '2026-06-01',
        status: 'active',
        coachNotes: 'تقليل الكارب في أيام الاستشفاء إلى 90 جرام وحثه على شرب 4 لتر ماء.',
      },
      {
        id: 'c_2',
        name: 'اللاعبة سارة محمود',
        age: 25,
        gender: 'Female',
        heightCm: 165,
        weightKg: 62,
        activityLevel: 1.55,
        goal: 'fatloss',
        fastingType: '14:10',
        clientCode: 'CF-9042',
        startDate: '2026-07-10',
        status: 'active',
        coachNotes: 'استجابة ممتازة لنظام الكارب سايكل المتوسط، نزول 2.5 كجم دهون صافية.',
      },
    ];
  });

  const [selectedClientId, setSelectedClientId] = useState<string>(() => clients[0]?.id || '');
  
  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    age: number;
    gender: Gender;
    heightCm: number;
    weightKg: number;
    activityLevel: number;
    goal: Goal;
    fastingType: FastingType;
    coachNotes: string;
  }>({
    name: '',
    age: 28,
    gender: 'Male',
    heightCm: 175,
    weightKg: 78,
    activityLevel: 1.55,
    goal: 'muscle',
    fastingType: '16:8',
    coachNotes: '',
  });

  const [showScientificModal, setShowScientificModal] = useState<boolean>(false);
  const [appliedFeedback, setAppliedFeedback] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('carbflow_coach_clients', JSON.stringify(clients));
  }, [clients]);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      age: 28,
      gender: 'Male',
      heightCm: 175,
      weightKg: 78,
      activityLevel: 1.55,
      goal: 'muscle',
      fastingType: '16:8',
      coachNotes: 'مشترك جديد - تم إنشاء الخطة وتطبيق المعادلات الحسابية الدقيقة.',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (client: ClientProfile) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      age: client.age,
      gender: client.gender,
      heightCm: client.heightCm,
      weightKg: client.weightKg,
      activityLevel: client.activityLevel,
      goal: client.goal,
      fastingType: client.fastingType,
      coachNotes: client.coachNotes || '',
    });
    setShowModal(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClient) {
      // Update existing
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id
            ? {
                ...c,
                name: formData.name,
                age: Number(formData.age),
                gender: formData.gender,
                heightCm: Number(formData.heightCm),
                weightKg: Number(formData.weightKg),
                activityLevel: Number(formData.activityLevel),
                goal: formData.goal,
                fastingType: formData.fastingType,
                coachNotes: formData.coachNotes,
              }
            : c
        )
      );
    } else {
      // Add new client
      const newClient: ClientProfile = {
        id: 'c_' + Date.now(),
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weightKg),
        activityLevel: Number(formData.activityLevel),
        goal: formData.goal,
        fastingType: formData.fastingType,
        clientCode: 'CF-' + Math.floor(1000 + Math.random() * 9000),
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        coachNotes: formData.coachNotes || 'مشترك جديد - تم إعداد خطة الكارب سايكل الحسابية.',
      };
      setClients((prev) => [...prev, newClient]);
      setSelectedClientId(newClient.id);
    }

    setShowModal(false);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('هل أنت تأكد من حذف هذا المتدرب من قائمتك؟')) {
      const filtered = clients.filter((c) => c.id !== id);
      setClients(filtered);
      if (filtered.length > 0) {
        setSelectedClientId(filtered[0].id);
      }
    }
  };

  const handleApplyToApp = () => {
    if (selectedClient && onApplyClientToApp) {
      onApplyClientToApp(selectedClient);
      setAppliedFeedback(true);
      setTimeout(() => setAppliedFeedback(false), 2500);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Calculations for selected client
  const clientBmr = selectedClient ? calculateBMR(selectedClient) : 0;
  const clientTdee = selectedClient ? calculateTDEE(selectedClient) : 0;
  const clientWeeklyPlan = selectedClient ? generateWeeklyCarbPlan(selectedClient) : [];
  const clientGoalConfig = selectedClient ? GOALS_MAP[selectedClient.goal] : GOALS_MAP.muscle;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-16 font-['Cairo',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            وضع المدرب وإدارة المشتركين
          </h2>
          <p className="text-xs text-slate-400">إضافة وتعديل بيانات المتدربين وحساب خطط الكارب سايكل الدقيقة</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة متدرب جديد</span>
        </button>
      </div>

      {/* Clients Horizontal Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {clients.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClientId(c.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 ${
              selectedClientId === c.id
                ? 'bg-purple-900/70 border-purple-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{c.name}</span>
            <span className="text-[10px] font-mono text-purple-300">({c.clientCode})</span>
          </button>
        ))}
      </div>

      {/* Selected Client Card */}
      {selectedClient && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{selectedClient.name}</h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                  مشترك نشط ✅
                </span>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono">
                  {selectedClient.clientCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تاريخ الاشتراك: {selectedClient.startDate} | الجنس: {selectedClient.gender === 'Male' ? 'ذكر 👨' : 'أنثى 👩'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleOpenEditModal(selectedClient)}
                className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-700/80 hover:border-purple-500 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                <span>تعديل بيانات المتدرب</span>
              </button>

              {onApplyClientToApp && (
                <button
                  onClick={handleApplyToApp}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
                  title="تحميل ملف المتدرب إلى الواجهة الرئيسية للتطبيق"
                >
                  {appliedFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>تم تطبيق البيانات!</span>
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="w-3.5 h-3.5 text-white" />
                      <span>تطبيق خطته على الواجهة</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleExportPDF}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                title="طباعة تقرير المتدرب"
              >
                <FileText className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDeleteClient(selectedClient.id)}
                className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 text-xs font-bold transition"
                title="حذف المتدرب"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Client Physical Metrics Grid */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2">بيانات المتدرب الرياضية والجسدية المدخلة:</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">الوزن الحالي</span>
                <span className="font-bold text-white font-mono text-sm">{selectedClient.weightKg} كجم</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">الطول والعمر</span>
                <span className="font-bold text-white font-mono text-xs">{selectedClient.heightCm} سم ({selectedClient.age} سنة)</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">الهدف الرياضي</span>
                <span className="font-bold text-xs" style={{ color: clientGoalConfig?.color }}>{clientGoalConfig?.label}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">مستوى النشاط</span>
                <span className="font-bold text-slate-200 text-[11px]">
                  {ACTIVITY_LEVELS.find((a) => a.value === selectedClient.activityLevel)?.label.split('(')[0] || 'متوسط'}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">نظام الصيام</span>
                <span className="font-bold text-cyan-400 font-mono text-sm">{selectedClient.fastingType}</span>
              </div>
            </div>
          </div>

          {/* Scientific Calculations Results Banner */}
          <div className="bg-gradient-to-r from-purple-950/60 via-slate-950 to-indigo-950/60 border border-purple-500/30 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-purple-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-purple-400" />
                نتائج المعادلة الرياضية العلمية لهذا المتدرب (Katch-McArdle):
              </span>
              <button
                onClick={() => setShowScientificModal(true)}
                className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                مشاهدة الدليل والتعليل العلمي
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
              <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="text-[9px] text-purple-300 block font-semibold">الكتلة الصافية (LBM)</span>
                <span className="font-mono font-bold text-amber-300 text-xs">
                  {selectedClient ? calculateLeanBodyMass(selectedClient) : 0} كجم
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 block">معدل الأيض (BMR)</span>
                <span className="font-mono font-bold text-amber-300 text-xs">{clientBmr} سعرة</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 block">حرق النشاط (TDEE)</span>
                <span className="font-mono font-bold text-emerald-300 text-xs">{clientTdee} سعرة</span>
              </div>
              <div className="bg-slate-900/90 border border-purple-800/50 p-2 rounded-xl bg-purple-950/30">
                <span className="text-[9px] text-purple-300 block">السعرات المستهدفة</span>
                <span className="font-mono font-extrabold text-white text-xs">
                  {clientTdee + (clientGoalConfig?.calorieDelta || 0)} سعرة
                </span>
              </div>
            </div>
          </div>

          {/* 7-Day Generated Carb Cycle Plan for this Client */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
              جدول دورة الكربوهيدرات الأسبوعي المخصص لـ ({selectedClient.name}):
            </span>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
              {clientWeeklyPlan.map((day, i) => {
                const badgeBg =
                  day.type === 'high'
                    ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                    : day.type === 'medium'
                    ? 'bg-blue-950/60 border-blue-600/50 text-blue-300'
                    : 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300';
                return (
                  <div key={i} className={`p-1.5 rounded-xl border ${badgeBg} flex flex-col items-center justify-between gap-1`}>
                    <span className="font-bold text-[10px] text-slate-200">{day.dayName}</span>
                    <span className="font-mono font-extrabold text-xs">{day.carbs}g</span>
                    <span className="text-[8px] opacity-80">{day.type === 'high' ? 'عالي 🔥' : day.type === 'medium' ? 'متوسط ⚖️' : 'منخفض 🥗'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coach Notes */}
          <div className="bg-slate-950 p-3 rounded-xl border border-purple-800/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                توجيهات وتوصيات المدرب الخاصة:
              </span>
              <button
                onClick={() => handleOpenEditModal(selectedClient)}
                className="text-[10px] text-purple-400 hover:underline"
              >
                تعديل الملاحظات
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedClient.coachNotes || 'لا توجد ملاحظات إضافية.'}</p>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                {editingClient ? `تعديل بيانات المتدرب (${editingClient.name})` : 'إضافة متدرب جديد لحسابات الكارب سايكل'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5">
              
              {/* Name & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم المتدرب الكامل</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: أحمد مصطفى"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الجنس البيولوجي</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Male">ذكر (Male)</option>
                    <option value="Female">أنثى (Female)</option>
                  </select>
                </div>
              </div>

              {/* Age, Weight, Height */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">العمر (سنة)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    required
                    min={12}
                    max={90}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الوزن (كجم)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    required
                    min={30}
                    max={250}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الطول (سم)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    required
                    min={100}
                    max={230}
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">مستوى النشاط البدني</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {ACTIVITY_LEVELS.map((act) => (
                    <option key={act.value} value={act.value}>
                      {act.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Goal & Fasting Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الهدف الرياضي الموائم</label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value as Goal })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="muscle">بناء عضلي وتجميد الجليكوجين (Bulk/Recomp)</option>
                    <option value="fatloss">خسارة دهون متوازنة (Fat Loss)</option>
                    <option value="cutting">تنشيف قاسي وجاهزية (Aggressive Cutting)</option>
                    <option value="maintenance">محافظة وتوازن صحي (Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">جدول الصيام المتقطع</label>
                  <select
                    value={formData.fastingType}
                    onChange={(e) => setFormData({ ...formData, fastingType: e.target.value as FastingType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    <option value="16:8">16 ساعة صيام / 8 ساعات طعام (قياسي)</option>
                    <option value="18:6">18 ساعة صيام / 6 ساعات طعام (متقدم)</option>
                    <option value="14:10">14 ساعة صيام / 10 ساعات طعام (مبتدئ)</option>
                    <option value="12:12">12 ساعة صيام / 12 ساعة طعام (متوازن)</option>
                    <option value="none">بدون صيام متقطع</option>
                  </select>
                </div>
              </div>

              {/* Coach Special Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">توجيهات وتوصيات المدرب الخاصة</label>
                <textarea
                  rows={3}
                  value={formData.coachNotes}
                  onChange={(e) => setFormData({ ...formData, coachNotes: e.target.value })}
                  placeholder="أدخل أي ملاحظات خاصة بالمتدرب، كمية المكملات، لترات الماء، أو توصيات الكارديو..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
                >
                  {editingClient ? 'حفظ التعديلات' : 'إضافة المتدرب واعتماد الخطة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scientific Modal for Selected Client */}
      {selectedClient && (
        <ScientificBreakdownModal
          profile={selectedClient}
          isOpen={showScientificModal}
          onClose={() => setShowScientificModal(false)}
        />
      )}
    </div>
  );
};

