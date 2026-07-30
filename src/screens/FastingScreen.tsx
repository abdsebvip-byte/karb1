import React, { useState, useEffect } from 'react';
import { UserProfile, FastingSession, FastingType } from '../types';
import { recommendFasting } from '../domain/nutrition';
import { Timer, Play, Square, CheckCircle2, Flame, Zap, Shield, Sparkles, Clock } from 'lucide-react';

interface FastingScreenProps {
  profile: UserProfile;
  activeSession?: FastingSession;
  onStartFast: (type: FastingType) => void;
  onStopFast: () => void;
}

export const FastingScreen: React.FC<FastingScreenProps> = ({
  profile,
  activeSession,
  onStartFast,
  onStopFast,
}) => {
  const [selectedType, setSelectedType] = useState<FastingType>(
    profile.fastingType || recommendFasting(profile)
  );

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (activeSession && !activeSession.completed) {
      const startMs = new Date(activeSession.startTime).getTime();
      interval = setInterval(() => {
        const nowMs = new Date().getTime();
        const diffSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
        setElapsedSeconds(diffSec);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const targetHours = activeSession?.targetHours || (selectedType === '16:8' ? 16 : selectedType === '18:6' ? 18 : selectedType === '14:10' ? 14 : 12);
  const targetSeconds = targetHours * 3600;
  const progressPct = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100));

  const hoursElapsed = Math.floor(elapsedSeconds / 3600);
  const minsElapsed = Math.floor((elapsedSeconds % 3600) / 60);
  const secsElapsed = elapsedSeconds % 60;

  const hoursLeft = Math.max(0, targetHours - hoursElapsed - 1);
  const minsLeft = 59 - minsElapsed;

  // Fasting Phases
  const getFastingPhase = (hrs: number) => {
    if (hrs < 4) return { title: 'مرحلة الهضم وامصاص السكر', icon: '🍏', desc: 'انخفاض مستويات سكر الدم والإنسولين تدريجياً' };
    if (hrs < 8) return { title: 'مرحلة استنفاد الجليكوجين', icon: '🔥', desc: 'يبدأ الجسم في استخدام الجليكوجين المخزن في الكبد والعضلات' };
    if (hrs < 12) return { title: 'مرحلة حرق الدهون الحقيقي', icon: '⚡', desc: 'ارتفاع إنزيمات حرق الدهون وتراجع هرمون الإنسولين كلياً' };
    if (hrs < 16) return { title: 'مرحلة الكيتوزيس الخفيف والهرمون الذاتي', icon: '🚀', desc: 'ارتفاع هرمون النمو HGH بنسبة عالية والتنظيف الخلوي' };
    return { title: 'مرحلة الالتهام الذاتي Autophagy', icon: '💎', desc: 'تجديد الخلايا التالفة وأقصى درجات حرق الدهون وحساسية الإنسولين' };
  };

  const currentPhase = getFastingPhase(hoursElapsed);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Timer className="w-5 h-5 text-amber-400" />
          مؤقت الصيام المتقطع الذكي
        </h2>
        <p className="text-xs text-slate-400">تنشيط الإنزيمات الحارقة وحماية حساسية الإنسولين</p>
      </div>

      {/* Main Radial Progress Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 to-transparent pointer-events-none" />

        {/* Circular Timer Display */}
        <div className="relative w-52 h-52 flex items-center justify-center my-2">
          {/* SVG Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="104"
              cy="104"
              r="90"
              className="stroke-slate-800"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="104"
              cy="104"
              r="90"
              className="stroke-amber-400 transition-all duration-1000"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={2 * Math.PI * 90 * (1 - progressPct / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Inner Content */}
          <div className="absolute flex flex-col items-center text-center">
            {activeSession && !activeSession.completed ? (
              <>
                <span className="text-2xl font-black font-mono text-white tracking-wider">
                  {String(hoursElapsed).padStart(2, '0')}:{String(minsElapsed).padStart(2, '0')}:{String(secsElapsed).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-amber-300 font-bold mt-1">
                  إكمال {progressPct}% من الصيام
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  متبقي {hoursLeft} ساعة و {minsLeft} دقيقة
                </span>
              </>
            ) : (
              <>
                <Flame className="w-10 h-10 text-amber-400 animate-bounce" />
                <span className="text-sm font-bold text-white mt-1">جاهز لبدء الصيام؟</span>
                <span className="text-[10px] text-slate-400">نظام {selectedType}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full mt-4">
          {activeSession && !activeSession.completed ? (
            <button
              onClick={onStopFast}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition"
            >
              <Square className="w-4 h-4 fill-current" />
              إنهاء الصيام وتناول الوجبة
            </button>
          ) : (
            <button
              onClick={() => onStartFast(selectedType)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition scale-100 hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              بدء مؤقت الصيام الآن ({selectedType})
            </button>
          )}
        </div>
      </div>

      {/* Recommended Fasting Plan Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center justify-between">
          <span>اختر نظام الصيام المناسب لك</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            موصى به: {recommendFasting(profile)}
          </span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { type: '16:8' as FastingType, title: '16:8 القياسي (شائع جداً)', desc: '16 ساعة صيام، 8 ساعات نافذة طعام' },
            { type: '14:10' as FastingType, title: '14:10 البناء العضلي', desc: 'مناسب لأيام التمرين الشاق وتضخيم العضلات' },
            { type: '18:6' as FastingType, title: '18:6 التنشيف القاسي', desc: 'تطهير حاد وتسريع حرق الدهون المستعصية' },
            { type: '12:12' as FastingType, title: '12:12 اللطيف والمبتدئين', desc: 'مناسب للاستشفاء وصحة الجهاز الهضمي' },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => setSelectedType(item.type)}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                selectedType === item.type
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-amber-300">{item.title}</span>
                {selectedType === item.type && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <span className="text-[10px] text-slate-400 mt-1">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fasting Biological Phase Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          الحالة الحيوية الحالية في جسمك:
        </h3>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 flex items-start gap-3">
          <span className="text-2xl">{currentPhase.icon}</span>
          <div>
            <h4 className="text-xs font-bold text-amber-300">{currentPhase.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">{currentPhase.desc}</p>
          </div>
        </div>

        {/* Timeline breakdown */}
        <div className="space-y-2 pt-1 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-emerald-400">0 - 4 ساعات:</span> هضم وتخزين السكر
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-bold text-blue-400">4 - 8 ساعات:</span> هبوط الإنسولين واستخدام الجليكوجين
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold text-amber-400">8 - 12 ساعة:</span> وبداية أكسدة الدهون الحقيقية
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="font-bold text-purple-400">12+ ساعة:</span> تحفيز هرمون النمو والالتهام الذاتي
          </div>
        </div>
      </div>
    </div>
  );
};
