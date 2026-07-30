/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, MealItem, FastingSession, ProgressEntry, FastingType } from './types';
import { DEFAULT_USER_PROFILE, generateWeeklyCarbPlan, getEffectiveProfile } from './domain/nutrition';
import { AndroidFrame } from './components/AndroidFrame';
import { HeaderTopBar } from './components/HeaderTopBar';
import { BottomNavigation, TabType } from './components/BottomNavigation';
import { DashboardScreen } from './screens/DashboardScreen';
import { MealPlanScreen } from './screens/MealPlanScreen';
import { FastingScreen } from './screens/FastingScreen';
import { AIScreen } from './screens/AIScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { CoachScreen } from './screens/CoachScreen';
import { ProfileModal } from './components/ProfileModal';
import { AndroidExportModal } from './components/AndroidExportModal';
import { Smartphone, Code2 } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('carbflow_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return getEffectiveProfile(parsed);
      } catch {
        return DEFAULT_USER_PROFILE;
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showAndroidCodeModal, setShowAndroidCodeModal] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('carbflow_user_profile', JSON.stringify(profile));
  }, [profile]);

  // Meals State
  const [meals, setMeals] = useState<MealItem[]>(() => {
    const saved = localStorage.getItem('carbflow_meals');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'm_1',
        name: 'شوفان بالموز والزبادي اليوناني',
        calories: 420,
        protein: 34,
        carbs: 60,
        fat: 8,
        quantity: '150g',
        mealType: 'breakfast',
        time: '08:30',
      },
      {
        id: 'm_2',
        name: 'صدور دجاج مشوية + أرز بني مسلوق',
        calories: 550,
        protein: 48,
        carbs: 70,
        fat: 10,
        quantity: '1 وجبة كاملة',
        mealType: 'lunch',
        time: '14:00',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('carbflow_meals', JSON.stringify(meals));
  }, [meals]);

  const handleAddMeal = (newMeal: Omit<MealItem, 'id'>) => {
    const item: MealItem = {
      ...newMeal,
      id: 'm_' + Date.now(),
    };
    setMeals((prev) => [...prev, item]);
  };

  // Fasting Session State
  const [fastingSession, setFastingSession] = useState<FastingSession | undefined>(() => {
    const saved = localStorage.getItem('carbflow_fasting');
    if (saved) return JSON.parse(saved);
    return {
      id: 'f_1',
      startTime: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
      targetHours: 16,
      completedHours: 4.5,
      fastingType: profile.fastingType || '16:8',
      completed: false,
    };
  });

  useEffect(() => {
    if (fastingSession) {
      localStorage.setItem('carbflow_fasting', JSON.stringify(fastingSession));
    }
  }, [fastingSession]);

  const handleStartFast = (type: FastingType) => {
    const targetHrs = type === '16:8' ? 16 : type === '18:6' ? 18 : type === '14:10' ? 14 : 12;
    setFastingSession({
      id: 'f_' + Date.now(),
      startTime: new Date().toISOString(),
      targetHours: targetHrs,
      completedHours: 0,
      fastingType: type,
      completed: false,
    });
  };

  const handleStopFast = () => {
    if (fastingSession) {
      setFastingSession({
        ...fastingSession,
        endTime: new Date().toISOString(),
        completed: true,
      });
    }
  };

  // Progress Entries State
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>(() => {
    const saved = localStorage.getItem('carbflow_progress');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'p_1', date: '2026-07-01', weightKg: 84.5, bodyFatPct: 18, waistCm: 86 },
      { id: 'p_2', date: '2026-07-10', weightKg: 83.8, bodyFatPct: 17.5, waistCm: 85 },
      { id: 'p_3', date: '2026-07-20', weightKg: 82.7, bodyFatPct: 16.8, waistCm: 83.5 },
      { id: 'p_4', date: '2026-07-29', weightKg: 82.0, bodyFatPct: 16.0, waistCm: 82 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('carbflow_progress', JSON.stringify(progressEntries));
  }, [progressEntries]);

  // Profile Update Handler that ensures effective data normalization and instant plan recalculation
  const handleUpdateProfile = (updatedProfile: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setProfile((prev) => {
      const next = typeof updatedProfile === 'function' ? updatedProfile(prev) : updatedProfile;
      const effective = getEffectiveProfile(next);
      return effective;
    });
  };

  const handleAddProgressEntry = (entry: Omit<ProgressEntry, 'id'>) => {
    const created: ProgressEntry = {
      ...entry,
      id: 'p_' + Date.now(),
    };
    setProgressEntries((prev) => [...prev, created]);
    handleUpdateProfile((prev) => ({
      ...prev,
      weightKg: entry.weightKg,
      bodyFatPct: entry.bodyFatPct !== undefined ? entry.bodyFatPct : prev.bodyFatPct,
    }));
  };

  const { weeklyPlan, planError } = React.useMemo(() => {
    try {
      const plan = generateWeeklyCarbPlan(profile);
      return { weeklyPlan: plan, planError: null };
    } catch (err: any) {
      console.error('Plan generation error:', err);
      return { weeklyPlan: [], planError: err.message || 'بيانات الملف غير مكتملة' };
    }
  }, [profile]);

  const todayIndex = (new Date().getDay() + 1) % 7;
  const todayPlan = (weeklyPlan && weeklyPlan.length > 0)
    ? (weeklyPlan[todayIndex] || weeklyPlan[0])
    : {
        dayName: 'اليوم',
        type: 'medium' as const,
        carbs: 200,
        protein: 150,
        fat: 60,
        calories: 1940,
        workoutFocus: 'تمرين متوازن',
        recommendedCarbSources: []
      };

  return (
    <AndroidFrame>
      <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden relative font-['Cairo',sans-serif]">
        
        {/* Android Native Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-b border-purple-800/60 px-3 py-1 flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold">Android Native UI (Kotlin & Jetpack Compose)</span>
          </div>

          <button
            onClick={() => setShowAndroidCodeModal(true)}
            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold transition shadow-sm"
          >
            <Code2 className="w-3 h-3" />
            <span>مرجع أكواد أندرويد</span>
          </button>
        </div>

        {/* Top App Bar */}
        <HeaderTopBar
          profile={profile}
          todayPlan={todayPlan}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenAndroidExport={() => setShowAndroidCodeModal(true)}
        />

        {/* Validation Error Banner */}
        {planError && (
          <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2 flex items-center justify-between text-xs text-rose-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-400">⚠️ تنبيه البيانات:</span>
              <span>{planError}</span>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] shrink-0"
            >
              تعديل البيانات
            </button>
          </div>
        )}

        {/* Viewport */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <DashboardScreen
              profile={profile}
              todayPlan={todayPlan}
              weeklyPlan={weeklyPlan}
              meals={meals}
              fastingSession={fastingSession}
              planError={planError}
              onOpenProfile={() => setShowProfileModal(true)}
              onAddMeal={handleAddMeal}
              onUpdateProfile={handleUpdateProfile}
              onNavigateToFasting={() => setActiveTab('fasting')}
              onNavigateToAI={() => setActiveTab('ai')}
            />
          )}

          {activeTab === 'mealplan' && (
            <MealPlanScreen
              profile={profile}
              weeklyPlan={weeklyPlan}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {activeTab === 'fasting' && (
            <FastingScreen
              profile={profile}
              activeSession={fastingSession}
              onStartFast={handleStartFast}
              onStopFast={handleStopFast}
            />
          )}

          {activeTab === 'ai' && (
            <AIScreen profile={profile} todayPlan={todayPlan} />
          )}

          {activeTab === 'progress' && (
            <ProgressScreen
              profile={profile}
              progressEntries={progressEntries}
              onAddProgressEntry={handleAddProgressEntry}
            />
          )}

          {activeTab === 'coach' && (
            <CoachScreen
              onApplyClientToApp={(clientProfile) => {
                handleUpdateProfile(clientProfile);
                setActiveTab('dashboard');
              }}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Modals */}
        <ProfileModal
          profile={profile}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSave={handleUpdateProfile}
        />

        {showAndroidCodeModal && (
          <AndroidExportModal onClose={() => setShowAndroidCodeModal(false)} />
        )}
      </div>
    </AndroidFrame>
  );
}
