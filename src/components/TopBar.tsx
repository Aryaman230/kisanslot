// React typings are supplied by the project's dependency configuration.
// @ts-nocheck — keep JSX runtime checks disabled when @types/react is unavailable.
// @ts-ignore — keep this component buildable when @types/react is unavailable.
import React from 'react';
import { Smartphone, Monitor, AlertTriangle, ShieldCheck, Sun, RefreshCw, Volume2 } from 'lucide-react';
import { AppInterface } from '../types';

interface TopBarProps {
  currentInterface: AppInterface;
  onInterfaceChange: (mode: AppInterface) => void;
  isHalted: boolean;
  onOpenHaltModal: () => void;
  onResumeOperations: () => void;
  highContrast: boolean;
  onToggleContrast: () => void;
  mobileViewMode: 'phone' | 'full';
  onToggleMobileViewMode: () => void;
  activeToken: string;
}

export const TopBar = ({
  currentInterface,
  onInterfaceChange,
  isHalted,
  onOpenHaltModal,
  onResumeOperations,
  highContrast,
  onToggleContrast,
  mobileViewMode,
  onToggleMobileViewMode,
  activeToken,
}: TopBarProps) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] text-white border-b border-slate-700 shadow-md">
      {/* Emergency Halt Banner if active */}
      {isHalted && (
        <div className="bg-red-600 px-4 py-2 text-white font-medium text-xs sm:text-sm flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white shrink-0" />
            <span>
              <strong>CRITICAL ALERT:</strong> Mandi Operations Temporarily HALTED by Command Center. Gates & Weighbridges Paused.
            </span>
          </div>
          <button
            onClick={onResumeOperations}
            className="bg-white text-red-700 px-2.5 py-1 rounded text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm ml-2"
          >
            Resume Operations
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & SIH Trust Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white shadow-sm border border-blue-400">
              <span className="font-serif text-sm">KS</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-white">
                  KisanSlot
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 px-1.5 py-0.5 rounded">
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Ministry of Agriculture & APMC Mandi Madhubani
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-700 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>e-NAM Integrated v2.4</span>
          </div>
        </div>

        {/* Center: Main Interface Toggle Switch */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 shadow-inner">
          <button
            id="toggle-interface-farmer"
            onClick={() => onInterfaceChange('farmer')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              currentInterface === 'farmer'
                ? 'bg-[#2563EB] text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Farmer Mobile PWA</span>
            <span className="hidden sm:inline-block text-[10px] bg-blue-900/60 px-1.5 py-0.5 rounded font-mono">
              {activeToken}
            </span>
          </button>

          <button
            id="toggle-interface-admin"
            onClick={() => onInterfaceChange('admin')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              currentInterface === 'admin'
                ? 'bg-[#2563EB] text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Mandi Admin Command Center</span>
          </button>
        </div>

        {/* Right: Quick Utilities */}
        <div className="flex items-center gap-2 text-xs">
          {currentInterface === 'farmer' && (
            <button
              onClick={onToggleMobileViewMode}
              title={mobileViewMode === 'phone' ? "Switch to Responsive Container" : "Switch to Mobile Device Frame"}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-medium">
                {mobileViewMode === 'phone' ? 'Phone Frame' : 'Full Width'}
              </span>
            </button>
          )}

          <button
            onClick={onToggleContrast}
            title="Outdoor Sunlight High Contrast Mode"
            className={`p-1.5 rounded-lg border transition-colors ${
              highContrast
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* Live Status indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isHalted ? 'bg-red-400' : 'bg-emerald-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isHalted ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="text-[11px] font-mono hidden sm:inline">
              {isHalted ? 'HALTED' : 'MANDI LIVE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
