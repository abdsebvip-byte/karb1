import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-0 sm:p-4">
      {/* Top Controller Bar */}
      <div className="w-full max-w-md sm:max-w-4xl flex items-center justify-between p-3 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 backdrop-blur z-50 rounded-b-xl sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-purple-300">CarbFlow AI — Android Native View</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              isPhoneFrame
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden xs:inline">إطار أندرويد</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              !isPhoneFrame
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden xs:inline">شاشة كاملة</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      {isPhoneFrame ? (
        <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-900 border-[8px] sm:border-[12px] border-slate-800 rounded-[44px] shadow-2xl shadow-purple-950/40 flex flex-col overflow-hidden transition-all duration-300 my-auto">
          {/* Smartphone Top Speaker & Camera Notch */}
          <div className="absolute top-0 left-0 right-0 h-7 bg-slate-950 z-50 flex items-center justify-between px-6 text-[10px] text-slate-400 font-mono">
            <span>20:14</span>
            <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-900/60" />
            </div>
            <div className="flex items-center gap-1">
              <span>5G</span>
              <span className="w-3 h-2 bg-emerald-500 rounded-sm" />
            </div>
          </div>

          {/* App Body Container inside Phone */}
          <div className="flex-1 flex flex-col pt-7 overflow-hidden bg-slate-950">
            {children}
          </div>

          {/* Android Navigation Gesture Pill */}
          <div className="h-4 bg-slate-950 flex items-center justify-center pb-1">
            <div className="w-32 h-1 bg-slate-700 rounded-full" />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl min-h-[85vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">
          {children}
        </div>
      )}
    </div>
  );
};
