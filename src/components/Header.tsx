import React, { useState, useEffect } from 'react';
import { UnitSystem } from '../types';
import { Language, translations } from '../data/translations';
import { Flame, FileText, FolderOpen, Sun, Moon, Wifi, WifiOff, Globe } from 'lucide-react';

interface HeaderProps {
  unitSystem: UnitSystem;
  onToggleUnit: (system: UnitSystem) => void;
  onOpenPdfModal: () => void;
  onOpenProjectModal: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeProjectName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  unitSystem,
  onToggleUnit,
  onOpenPdfModal,
  onOpenProjectModal,
  language,
  onLanguageChange,
  theme,
  onToggleTheme,
  activeProjectName
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const t = translations[language];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-xl font-mono">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <h1 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2">
              {t.appTitle} <span className="text-amber-500 font-mono text-[10px] uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">v3.0 Suite</span>
            </h1>
            <p className="text-[10px] text-slate-400">{t.appSubTitle}</p>
          </div>
        </div>

        {/* Action Controls, Language, Theme, Offline Indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Offline Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                : 'bg-amber-950/60 text-amber-400 border-amber-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? t.onlineStatus : t.offlineStatus}</span>
          </div>

          {/* Language Selector (AR / EN / DE) */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <button
              onClick={() => onLanguageChange('ar')}
              className={`px-2 py-1 rounded font-bold transition text-[11px] ${
                language === 'ar' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded font-bold transition text-[11px] ${
                language === 'en' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('de')}
              className={`px-2 py-1 rounded font-bold transition text-[11px] ${
                language === 'de' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DE
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
            title={theme === 'dark' ? t.themeLight : t.themeDark}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Unit System Selector */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onToggleUnit('SI')}
              className={`px-2.5 py-1 rounded font-bold transition text-[11px] ${
                unitSystem === 'SI' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SI
            </button>
            <button
              onClick={() => onToggleUnit('Imperial')}
              className={`px-2.5 py-1 rounded font-bold transition text-[11px] ${
                unitSystem === 'Imperial' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Imp
            </button>
          </div>

          {/* Project Manager */}
          <button
            onClick={onOpenProjectModal}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 shadow transition"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.projects}</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={onOpenPdfModal}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};

