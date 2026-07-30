import React, { useState, useMemo } from 'react';
import {
  CalculationInputs,
  UnitSystem,
  SavedProject,
  ExchangerType,
  FlowType
} from './types';
import { calculateResults, validateInputs } from './utils/heatExchangerEngine';
import { unitLabels, convertTempFromSi, convertTempToSi } from './utils/unitConverter';
import { fluidsDatabase } from './data/fluidsDatabase';
import { presetProjects } from './data/presetProjects';
import { Header } from './components/Header';
import { ValidationAlerts } from './components/ValidationAlerts';
import { TemperatureProfileChart } from './components/Charts/TemperatureProfileChart';
import { EnergyBalancePieChart } from './components/Charts/EnergyBalancePieChart';
import { HeatExchanger3D } from './components/3D/HeatExchanger3D';
import { PdfExportModal } from './components/Modals/PdfExportModal';
import { ProjectManagerModal } from './components/Modals/ProjectManagerModal';
import { StepByStepTab } from './components/Tabs/StepByStepTab';
import { AutoSuggestTab } from './components/Tabs/AutoSuggestTab';
import { ComparisonTab } from './components/Tabs/ComparisonTab';
import { FluidDatabaseTab } from './components/Tabs/FluidDatabaseTab';

// Roadmap Suite Tabs
import { HolmanHeatTransferTab } from './components/Tabs/HolmanHeatTransferTab';
import { UnitOperationsTab } from './components/Tabs/UnitOperationsTab';
import { EngineeringCalculatorTab } from './components/Tabs/EngineeringCalculatorTab';
import { UnitConverterTab } from './components/Tabs/UnitConverterTab';
import { EngineeringDatabaseTab } from './components/Tabs/EngineeringDatabaseTab';
import { VirtualLabTab } from './components/Tabs/VirtualLabTab';
import { QuizTab } from './components/Tabs/QuizTab';
import { EngineeringReportModal } from './components/Modals/EngineeringReportModal';
import { Language, translations } from './data/translations';

import {
  Flame,
  Activity,
  Box,
  GraduationCap,
  Sparkles,
  Columns3,
  Database,
  Sliders,
  RotateCcw,
  Layers,
  Check,
  Zap,
  Calculator,
  ArrowRightLeft,
  FlaskConical,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // Master State for Calculation Inputs
  const [inputs, setInputs] = useState<CalculationInputs>({
    unitSystem: 'SI',
    flowType: 'counter',
    exchangerType: 'shell_and_tube',
    thin: 150,
    thout: 90,
    tcin: 20,
    tcout: 80,
    mh: 4.5,
    mc: 6.0,
    hotFluidId: 'water',
    coldFluidId: 'water',
    uAssumed: 450,
    di_mm: 20,
    do_mm: 25,
    length_m: 3,
    numTubes: 48,
    ktube: 45,
    rfi: 0.0002,
    rfo: 0.0002,
    hi: 3500,
    ho: 1800,
    maxPressureBar: 16,
    spaceConstraint: 'flexible',
    foulingSeverity: 'medium',
    budgetPriority: 'balanced'
  });

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'holman' | 'mccabe' | 'vlab' | 'quiz' | 'simulator' | '3d' | 'steps' | 'recommend' | 'compare' | 'fluids' | 'calc' | 'converter' | 'database'
  >('holman');

  // Multi-language & Theme State
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Saved Projects state in LocalStorage or fallback
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const local = localStorage.getItem('heat_exchanger_saved_projects');
      if (local) return JSON.parse(local);
    } catch (e) {}
    return presetProjects;
  });

  // Recalculate results & validation in real time
  const results = useMemo(() => calculateResults(inputs), [inputs]);
  const validationIssues = useMemo(() => validateInputs(inputs), [inputs]);
  const unit = unitLabels[inputs.unitSystem];

  // Feature #1: Toggle Unit System (SI <-> Imperial) with dynamic field conversion
  const handleToggleUnit = (newSystem: UnitSystem) => {
    if (newSystem === inputs.unitSystem) return;

    if (newSystem === 'Imperial') {
      setInputs(prev => ({
        ...prev,
        unitSystem: 'Imperial',
        thin: Number((prev.thin * 1.8 + 32).toFixed(1)),
        thout: Number((prev.thout * 1.8 + 32).toFixed(1)),
        tcin: Number((prev.tcin * 1.8 + 32).toFixed(1)),
        tcout: Number((prev.tcout * 1.8 + 32).toFixed(1)),
        mh: Number((prev.mh * 7936.64).toFixed(1)),
        mc: Number((prev.mc * 7936.64).toFixed(1)),
        uAssumed: Number((prev.uAssumed * 0.17611).toFixed(1))
      }));
    } else {
      setInputs(prev => ({
        ...prev,
        unitSystem: 'SI',
        thin: Number(((prev.thin - 32) / 1.8).toFixed(1)),
        thout: Number(((prev.thout - 32) / 1.8).toFixed(1)),
        tcin: Number(((prev.tcin - 32) / 1.8).toFixed(1)),
        tcout: Number(((prev.tcout - 32) / 1.8).toFixed(1)),
        mh: Number((prev.mh / 7936.64).toFixed(2)),
        mc: Number((prev.mc / 7936.64).toFixed(2)),
        uAssumed: Number((prev.uAssumed / 0.17611).toFixed(1))
      }));
    }
  };

  const handleUpdateInput = (field: keyof CalculationInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProject = (project: SavedProject) => {
    const updated = [project, ...savedProjects.filter(p => p.id !== project.id)];
    setSavedProjects(updated);
    try {
      localStorage.setItem('heat_exchanger_saved_projects', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteProject = (id: string) => {
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    try {
      localStorage.setItem('heat_exchanger_saved_projects', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleLoadProject = (newInputs: CalculationInputs) => {
    setInputs(newInputs);
  };

  const t = translations[language];

  return (
    <div className={`min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950 dir-rtl ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Header */}
      <Header
        unitSystem={inputs.unitSystem}
        onToggleUnit={handleToggleUnit}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onToggleTheme={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Real-time Validation Banners */}
        <ValidationAlerts issues={validationIssues} />

        {/* Main Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-800 mb-6 shadow-xl">
          <button
            onClick={() => setActiveTab('holman')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'holman'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Heat Transfer (Holman)</span>
          </button>

          <button
            onClick={() => setActiveTab('mccabe')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'mccabe'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Box className="w-4 h-4 text-cyan-400" />
            <span>Unit Operations (McCabe)</span>
          </button>

          <button
            onClick={() => setActiveTab('vlab')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'vlab'
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-purple-400" />
            <span>المختبر الافتراضي</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>الاختبارات</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>محاكي المبادل</span>
          </button>

          <button
            onClick={() => setActiveTab('3d')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === '3d'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Box className="w-4 h-4 text-indigo-400" />
            <span>نموذج 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('steps')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'steps'
                ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span>خطوات الحل</span>
          </button>

          <button
            onClick={() => setActiveTab('recommend')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'recommend'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>التوصية الذكية</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'compare'
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Columns3 className="w-4 h-4 text-teal-400" />
            <span>مقارنة التصاميم</span>
          </button>

          <button
            onClick={() => setActiveTab('fluids')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'fluids'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>قاعدة الموائع</span>
          </button>

          <button
            onClick={() => setActiveTab('calc')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'calc'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>الحاسبة الهندسية</span>
          </button>

          <button
            onClick={() => setActiveTab('converter')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'converter'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <span>محول الوحدات</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'database'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-400" />
            <span>المكتبة الهندسية</span>
          </button>
        </div>

        {/* TAB RENDERING */}
        {activeTab === 'holman' && (
          <HolmanHeatTransferTab inputs={inputs} results={results} onUpdateInput={handleUpdateInput} />
        )}

        {activeTab === 'mccabe' && <UnitOperationsTab unitSystem={inputs.unitSystem} />}

        {activeTab === 'vlab' && <VirtualLabTab />}

        {activeTab === 'quiz' && <QuizTab language={language} />}

        {activeTab === 'calc' && <EngineeringCalculatorTab />}

        {activeTab === 'converter' && <UnitConverterTab />}

        {activeTab === 'database' && <EngineeringDatabaseTab />}

        {/* TAB 1: Main Simulator Dashboard */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls Inputs Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    مدخلات العمليات والتصميم الإنشائي
                  </h2>
                  <span className="text-[11px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {inputs.unitSystem} Units
                  </span>
                </div>

                {/* Flow Arrangement Selector */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">ترتيب وتوجيه التدفق (Flow Configuration):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleUpdateInput('flowType', 'counter')}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border transition ${
                        inputs.flowType === 'counter'
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      متعاكس Counter
                    </button>
                    <button
                      onClick={() => handleUpdateInput('flowType', 'parallel')}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border transition ${
                        inputs.flowType === 'parallel'
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      متوازٍ Parallel
                    </button>
                    <button
                      onClick={() => handleUpdateInput('flowType', 'shell12')}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border transition ${
                        inputs.flowType === 'shell12'
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      قشرة 1-2 Shell
                    </button>
                  </div>
                </div>

                {/* Hot Fluid Specs */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-500">
                    <span>السائل الساخن Hot Fluid Stream</span>
                    <select
                      value={inputs.hotFluidId}
                      onChange={e => handleUpdateInput('hotFluidId', e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    >
                      {fluidsDatabase.map(f => (
                        <option key={f.id} value={f.id}>{f.nameAr}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400">Th,in ({unit.temp}):</label>
                      <input
                        type="number"
                        value={inputs.thin}
                        onChange={e => handleUpdateInput('thin', +e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-amber-400 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400">Th,out ({unit.temp}):</label>
                      <input
                        type="number"
                        value={inputs.thout}
                        onChange={e => handleUpdateInput('thout', +e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-amber-400 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400">معدل التدفق الكتلي ṁh ({unit.massFlow}):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.mh}
                      onChange={e => handleUpdateInput('mh', +e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Cold Fluid Specs */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                    <span>السائل البارد Cold Fluid Stream</span>
                    <select
                      value={inputs.coldFluidId}
                      onChange={e => handleUpdateInput('coldFluidId', e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    >
                      {fluidsDatabase.map(f => (
                        <option key={f.id} value={f.id}>{f.nameAr}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400">Tc,in ({unit.temp}):</label>
                      <input
                        type="number"
                        value={inputs.tcin}
                        onChange={e => handleUpdateInput('tcin', +e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-cyan-300 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400">Tc,out ({unit.temp}):</label>
                      <input
                        type="number"
                        value={inputs.tcout}
                        onChange={e => handleUpdateInput('tcout', +e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-cyan-300 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400">معدل التدفق الكتلي ṁc ({unit.massFlow}):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.mc}
                      onChange={e => handleUpdateInput('mc', +e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Overall U Coefficient Input */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-xs font-mono text-slate-300">
                    معامل الانتقال الحراري الكلي المفترض U ({unit.uCoef}):
                  </label>
                  <input
                    type="number"
                    value={inputs.uAssumed}
                    onChange={e => handleUpdateInput('uAssumed', +e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 font-bold focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Results & Graphs Panel (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Key Results Cards Hero Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 p-4 rounded-xl shadow-lg">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">الحمل Q</div>
                  <div className="text-xl font-bold font-mono text-amber-500 mt-1">{results.qDesignKw}</div>
                  <div className="text-[10px] text-slate-400">{unit.heatDuty}</div>
                </div>

                <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 p-4 rounded-xl shadow-lg">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">LMTD الفعّال</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{results.effectiveLmtd}</div>
                  <div className="text-[10px] text-slate-400">{unit.tempDiff}</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 p-4 rounded-xl shadow-lg">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">المساحة المطلوبة A</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{results.requiredAreaM2}</div>
                  <div className="text-[10px] text-slate-400">{unit.area}</div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">الفعالية ε</div>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">{(results.effectivenessEps * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-400">NTU = {results.ntu}</div>
                </div>
              </div>

              {/* Feature #2: Interactive Live Temperature Graph */}
              <TemperatureProfileChart results={results} unitSystem={inputs.unitSystem} />

              {/* Energy Balance Pie Chart (Recharts) */}
              <EnergyBalancePieChart results={results} unitSystem={inputs.unitSystem} />

              {/* Detailed Technical Breakdown Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
                  تفاصيل المؤشرات الهيدروليكية والحرارية (Hydraulic & Thermal Specs)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">عامل التصحيح F:</span>
                    <span className="font-bold text-slate-100">{results.correctionFactorF}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Cmin السعة الدنيا:</span>
                    <span className="font-bold text-cyan-400">{results.cminKwK} kW/K</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">نسبة السعة Cr:</span>
                    <span className="font-bold text-slate-100">{results.capacityRatioCr}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Qmax النظري:</span>
                    <span className="font-bold text-amber-500">{results.qMaxKw} {unit.heatDuty}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Th,out المحسوب بالفعالية:</span>
                    <span className="font-bold text-amber-400">{convertTempFromSi(results.calculatedThout, inputs.unitSystem).toFixed(1)} {unit.temp}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Tc,out المحسوب بالفعالية:</span>
                    <span className="font-bold text-cyan-300">{convertTempFromSi(results.calculatedTcout, inputs.unitSystem).toFixed(1)} {unit.temp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Interactive 3D Simulation */}
        {activeTab === '3d' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100">محاكاة ثلاثية الأبعاد تفاعلية 3D Interactive Viewer</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  استكشف مسارات التدفق وأنابيب وحواجز المبادل الحراري بنموذج 3D تفاعلي عالي الدقة.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">نوع المبادل الحالي:</span>
                <span className="text-xs font-bold text-amber-500 font-mono bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                  {inputs.exchangerType}
                </span>
              </div>
            </div>

            <HeatExchanger3D exchangerType={inputs.exchangerType} flowDirection={inputs.flowType} />
          </div>
        )}

        {/* TAB 3: Educational Step-by-Step Breakdown */}
        {activeTab === 'steps' && <StepByStepTab inputs={inputs} results={results} />}

        {/* TAB 4: Smart Auto-Suggestion Recommendation */}
        {activeTab === 'recommend' && (
          <AutoSuggestTab
            inputs={inputs}
            onSelectRecommendedType={type => handleUpdateInput('exchangerType', type)}
          />
        )}

        {/* TAB 5: Side-by-Side Design Comparison */}
        {activeTab === 'compare' && (
          <ComparisonTab
            currentInputs={inputs}
            savedProjects={savedProjects}
            unitSystem={inputs.unitSystem}
          />
        )}

        {/* TAB 6: Fluid Database Explorer */}
        {activeTab === 'fluids' && (
          <FluidDatabaseTab
            hotFluidId={inputs.hotFluidId}
            coldFluidId={inputs.coldFluidId}
            onSelectHotFluid={id => handleUpdateInput('hotFluidId', id)}
            onSelectColdFluid={id => handleUpdateInput('coldFluidId', id)}
          />
        )}
      </div>

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        inputs={inputs}
        results={results}
      />

      {/* Project Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        currentInputs={inputs}
        onLoadProject={handleLoadProject}
        savedProjects={savedProjects}
        onSaveProject={handleSaveProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Engineering Report Specification Modal */}
      <EngineeringReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        inputs={inputs}
        results={results}
        exchangerName={inputs.exchangerType === 'shell_and_tube' ? 'Shell & Tube Exchanger' : 'Plate Heat Exchanger'}
      />
    </div>
  );
}
