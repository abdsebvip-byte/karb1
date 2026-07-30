import React from 'react';
import { UserProfile, DayPlan } from '../types';
import { GOALS_MAP } from '../domain/nutrition';
import { User, Flame, Smartphone } from 'lucide-react';

interface HeaderTopBarProps {
  profile: UserProfile;
  todayPlan: DayPlan;
  onOpenProfile: () => void;
  onOpenAndroidExport?: () => void;
}

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({
  profile,
  todayPlan,
  onOpenProfile,
  onOpenAndroidExport,
}) => {
  const goalConfig = GOALS_MAP[profile.goal] || GOALS_MAP.muscle;

  const typeBadges = {
    high: { label: 'كارب مرتفع', icon: '🔥', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    medium: { label: 'كارب متوسط', icon: '⚖️', bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    low: { label: 'كارب منخفض', icon: '🥗', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    refeed: { label: 'يوم Refeed', icon: '⚡', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  };

  const badge = (todayPlan && typeBadges[todayPlan.type]) || typeBadges.medium;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Brand & App Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 flex items-center justify-center shadow-md shadow-purple-600/20 text-white font-bold shrink-0">
          <Flame className="w-5 h-5 text-amber-300 fill-amber-300/30" />
        </div>
        <div>
          <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>CarbFlow</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">AI</span>
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span className="font-medium text-slate-300">{profile.name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{goalConfig.label}</span>
          </p>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-2.5">
        {/* Day Type Badge */}
        <div className={`text-xs px-3 py-1.5 rounded-full border font-bold flex items-center gap-1.5 shadow-sm ${badge.bg}`}>
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </div>

        {onOpenAndroidExport && (
          <button
            onClick={onOpenAndroidExport}
            className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-purple-500 hover:bg-slate-800 transition shadow-sm"
            title="مرجع كود Android Studio"
          >
            <Smartphone className="w-4 h-4 text-purple-400" />
          </button>
        )}

        <button
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-purple-500 hover:bg-slate-800 transition shadow-sm"
          title="الملف الشخصي والهدف"
        >
          <User className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};

