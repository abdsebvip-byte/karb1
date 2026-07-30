import React, { useState } from 'react';
import { UserProfile, Goal, FastingType } from '../types';
import { ACTIVITY_LEVELS, GOALS_MAP, calculateBMR, calculateTDEE } from '../domain/nutrition';
import { User, Dumbbell, Scale, Activity, Flame, X, Check } from 'lucide-react';

interface UserProfileModalProps {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  const bmr = calculateBMR(formData);
  const tdee = calculateTDEE(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">إعداد الملف الشخصي والأهداف</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Name & Age */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">الاسم</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">العمر (سنة)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Gender & Height */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">النوع</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="Male">ذكر (Male)</option>
                <option value="Female">أنثى (Female)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">الطول (سم)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 170 })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Weight & Target Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">الوزن الحالي (كجم)</label>
              <input
                type="number"
                step="0.5"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 70 })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">الوزن المستهدف (كجم)</label>
              <input
                type="number"
                step="0.5"
                value={formData.targetWeightKg || ''}
                onChange={(e) => setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) || undefined })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">الهدف الرئيسي من الكارب سايكل</label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value as Goal })}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-bold"
            >
              <option value="muscle">بناء عضلي وخفض دهون متزامن (Bulk / Recomp)</option>
              <option value="fatloss">خسارة دهون متوازنة (Fat Loss)</option>
              <option value="cutting">تنشيف قاسي للمسابقات (Aggressive Cutting)</option>
              <option value="maintenance">محافظة وتوازن صحي (Maintenance)</option>
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">مستوى النشاط التمريني</label>
            <select
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: parseFloat(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              {ACTIVITY_LEVELS.map((act) => (
                <option key={act.value} value={act.value}>
                  {act.label}
                </option>
              ))}
            </select>
          </div>

          {/* BMR & TDEE Live Preview */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex justify-around text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">معدل الأيض البسيط (BMR)</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(bmr)} kcal</span>
            </div>
            <div className="w-[1px] bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">احتياج الطاقة اليومي (TDEE)</span>
              <span className="text-sm font-bold text-amber-400">{tdee} kcal</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ البيانات وإعادة الحساب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
