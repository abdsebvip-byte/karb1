import React from 'react';
import { LayoutDashboard, CalendarDays, Timer, Bot, TrendingUp, Users } from 'lucide-react';

export type TabType = 'dashboard' | 'mealplan' | 'fasting' | 'ai' | 'progress' | 'coach';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'mealplan' as TabType, label: 'خطة الكارب', icon: CalendarDays },
    { id: 'fasting' as TabType, label: 'الصيام', icon: Timer },
    { id: 'ai' as TabType, label: 'الذكاء', icon: Bot, highlight: true },
    { id: 'progress' as TabType, label: 'التقدم', icon: TrendingUp },
    { id: 'coach' as TabType, label: 'المدرب', icon: Users },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[50px] relative ${
              isActive
                ? 'text-purple-300 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute -top-1.5 w-8 h-1 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full shadow-sm shadow-purple-500/50" />
            )}

            <div
              className={`p-1.5 rounded-lg transition-colors ${
                isActive
                  ? tab.highlight
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-600/40'
                    : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                  : 'hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>

            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[58px]">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
