import React, { useState } from 'react';
import { McCabeModuleId, UnitSystem } from '../../types';
import {
  calculateAbsorptionTower,
  calculateEvaporator,
  calculateSedimentation,
  calculateCycloneSeparator,
  calculateFluidizedBed,
  calculateMixingPower,
  calculateROMembrane
} from '../../utils/mccabeCalculators';
import { DistillationMcCabeChart } from '../Charts/DistillationMcCabeChart';
import { Modular3DViewer } from '../3D/Modular3DViewer';
import { EvaporationSimulation3D } from '../3D/EvaporationSimulation3D';

import {
  Box,
  Sliders,
  Zap,
  Activity,
  CheckCircle2,
  Sparkles,
  Layers,
  Flame,
  Filter,
  Wind
} from 'lucide-react';

interface UnitOperationsTabProps {
  unitSystem: UnitSystem;
}

export const UnitOperationsTab: React.FC<UnitOperationsTabProps> = ({ unitSystem }) => {
  const [activeModule, setActiveModule] = useState<McCabeModuleId>('distillation');

  // Distillation state
  const [alpha, setAlpha] = useState(2.5);
  const [xF, setXF] = useState(0.5);
  const [xD, setXD] = useState(0.95);
  const [xB, setXB] = useState(0.05);
  const [refluxR, setRefluxR] = useState(2.5);
  const [qValue, setQValue] = useState(1.0);

  // Absorption state
  const [gasFlow, setGasFlow] = useState(1.2);
  const [kga, setKga] = useState(0.08);
  const [yIn, setYIn] = useState(0.05);
  const [yOut, setYOut] = useState(0.005);

  // Evaporator state
  const [effectsCount, setEffectsCount] = useState<1 | 2 | 3>(3);
  const [feedKgh, setFeedKgh] = useState(10000);
  const [xFeed, setXFeed] = useState(10);
  const [xProd, setXProd] = useState(50);

  // Sedimentation state
  const [dpUm, setDpUm] = useState(45);
  const [rhoP, setRhoP] = useState(2650);

  // Cyclone state
  const [gasVel, setGasVel] = useState(18);

  // Mixing state
  const [rpm, setRpm] = useState(180);
  const [impellerD, setImpellerD] = useState(0.8);

  const mccabeModules: Array<{ id: McCabeModuleId; nameAr: string; icon: string }> = [
    { id: 'distillation', nameAr: '1. Distillation التقطير (McCabe-Thiele)', icon: '🧪' },
    { id: 'absorption', nameAr: '2. Absorption الامتصاص والبرج المحشو', icon: '🧽' },
    { id: 'extraction', nameAr: '3. Extraction الاستخلاص سائل-سائل', icon: '⚗️' },
    { id: 'drying', nameAr: '4. Drying التجفيف والتجفيف الحراري', icon: '☀️' },
    { id: 'filtration', nameAr: '5. Filtration الترشيح والمكابس', icon: '🧹' },
    { id: 'evaporation', nameAr: '6. Evaporation التبخير متعدد التأثير', icon: '💨' },
    { id: 'crystallization', nameAr: '7. Crystallization البلورة والنمو', icon: '💎' },
    { id: 'sedimentation', nameAr: '8. Sedimentation الترسيب (Stokes)', icon: '⏳' },
    { id: 'cyclone', nameAr: '9. Cyclone Separator السايكلون العاصف', icon: '🌀' },
    { id: 'fluidization', nameAr: '10. Fluidization التمييع', icon: '🫧' },
    { id: 'mixing', nameAr: '11. Mixing الخلط والمقلبات', icon: '🔄' },
    { id: 'humidification', nameAr: '12. Humidification أبراج التبريد', icon: '💧' },
    { id: 'adsorption', nameAr: '13. Adsorption الأدمصاص', icon: '🧱' },
    { id: 'ion_exchange', nameAr: '14. Ion Exchange التبادل الأيوني', icon: '⚡' },
    { id: 'membrane', nameAr: '15. Membrane Separation الأغشية (RO/UF)', icon: '🛡️' }
  ];

  // Calculated Results
  const absorptionRes = calculateAbsorptionTower(gasFlow, 3.5, kga, yIn, yOut, 0.5);
  const evapRes = calculateEvaporator(effectsCount, feedKgh, xFeed, xProd, 3.0);
  const sedRes = calculateSedimentation(dpUm, rhoP, 997, 0.00089, 50);
  const cycloneRes = calculateCycloneSeparator(gasVel, 15, 2200);
  const mixingRes = calculateMixingPower(rpm, impellerD, 997, 0.00089);
  const roRes = calculateROMembrane(55, 25, 120);

  return (
    <div className="space-y-6 dir-rtl">
      {/* Unit Operations Header Selector */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-2">
            <Box className="w-4 h-4" />
            محاكي عمليات المراحل الصناعية (McCabe & Smith Unit Operations - 15 Modules)
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">مرجع: McCabe, Smith & Harriott - Unit Operations</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {mccabeModules.map(mod => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                activeModule === mod.id
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{mod.icon}</span>
              <span>{mod.nameAr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MODULE CONTENT RENDERERS */}

      {/* MODULE 1: DISTILLATION */}
      {activeModule === 'distillation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              مدخلات برج التقطير (Distillation Specs)
            </h3>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">المطايرة النسبية α (Relative Volatility):</label>
              <input
                type="number"
                step="0.1"
                value={alpha}
                onChange={e => setAlpha(+e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-amber-400 font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">x_F التغذية:</label>
                <input
                  type="number"
                  step="0.05"
                  value={xF}
                  onChange={e => setXF(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">x_D النواتج:</label>
                <input
                  type="number"
                  step="0.01"
                  value={xD}
                  onChange={e => setXD(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-emerald-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">x_B المتبقي:</label>
                <input
                  type="number"
                  step="0.01"
                  value={xB}
                  onChange={e => setXB(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-rose-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">نسبة الترجيع R (Reflux):</label>
                <input
                  type="number"
                  step="0.1"
                  value={refluxR}
                  onChange={e => setRefluxR(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-cyan-300 font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">حالة التغذية q-value:</label>
                <select
                  value={qValue}
                  onChange={e => setQValue(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none"
                >
                  <option value={1.0}>1.0 (سائل مشبع Saturated Liquid)</option>
                  <option value={0.0}>0.0 (بخار مشبع Saturated Vapor)</option>
                  <option value={0.5}>0.5 (خليط سائل وخار 50/50)</option>
                </select>
              </div>
            </div>

            <DistillationMcCabeChart
              inputs={{
                relativeVolatility: alpha,
                xF,
                xD,
                xB,
                refluxRatioR: refluxR,
                qValue
              }}
            />
          </div>

          <div className="lg:col-span-7 space-y-5">
            <Modular3DViewer
              moduleType="distillation_column"
              titleAr="نموذج 3D تفاعلي لبرج التقطير الصناعي"
              subTitleAr="محاكاة الصواني الداخلية، الغلاية السفلية Reboiler، المكثف العلوي Condenser ورجوع السائل Reflux"
            />
          </div>
        </div>
      )}

      {/* MODULE 2: ABSORPTION TOWER */}
      {activeModule === 'absorption' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-slate-100">برج الامتصاص المحشو (Packed Tower Absorption):</h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">ارتفاع البرج المطلوبة Z:</span>
                <span className="font-bold text-cyan-400 text-base">{absorptionRes.towerHeightM} متر</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">عدد وحدات الانتقال NTU:</span>
                <span className="font-bold text-amber-400">{absorptionRes.ntu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ارتفاع وحدة الانتقال HTU:</span>
                <span className="font-bold text-slate-200">{absorptionRes.htuM} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">كفاءة إزالة الغاز الملوث:</span>
                <span className="font-bold text-emerald-400">{absorptionRes.removalEfficiencyPercent}%</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Modular3DViewer
              moduleType="absorption_tower"
              titleAr="برج امتصاص محشو 3D"
              subTitleAr="توزع الحشوات الصناعية (Pall rings) ورش المائع الممتص علوياً"
            />
          </div>
        </div>
      )}

      {/* MODULE 6: MULTI-EFFECT EVAPORATION & 3D SIMULATION */}
      {activeModule === 'evaporation' && (
        <div className="space-y-6">
          <EvaporationSimulation3D />

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              مواصفات التبخير متعدد التأثير (Multiple-Effect Evaporator Engineering Specs):
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">عدد مراحل التبخير (Effects):</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setEffectsCount(1)}
                    className={`py-2 rounded-lg font-bold border transition ${
                      effectsCount === 1 ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    أحادي (1)
                  </button>
                  <button
                    onClick={() => setEffectsCount(2)}
                    className={`py-2 rounded-lg font-bold border transition ${
                      effectsCount === 2 ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    مزدوج (2)
                  </button>
                  <button
                    onClick={() => setEffectsCount(3)}
                    className={`py-2 rounded-lg font-bold border transition ${
                      effectsCount === 3 ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ثلاثي (3)
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
                <span className="text-slate-400 text-[10px]">اقتصادية البخار الإجمالية (Economy Factor):</span>
                <span className="font-bold text-emerald-400 text-lg">{evapRes.economyFactor} kg evap/kg steam</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
                <span className="text-slate-400 text-[10px]">إجمالي كمية البخار المتبخرة:</span>
                <span className="font-bold text-amber-400 text-lg">{evapRes.waterEvaporatedKgh} kg/h</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FALLBACK FOR OTHER MODULES */}
      {!['distillation', 'absorption', 'evaporation'].includes(activeModule) && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                وحدة العمليات: {mccabeModules.find(m => m.id === activeModule)?.nameAr}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                محاكاة هندسية تفاعلية مستندة لمعادلات ماكيب وسميث (McCabe & Smith).
              </p>
            </div>
          </div>

          <Modular3DViewer
            moduleType={activeModule}
            titleAr={`نموذج 3D: ${mccabeModules.find(m => m.id === activeModule)?.nameAr}`}
            subTitleAr="تتبع جريان المواد وحركة الجسيمات داخل المعدة الصناعية"
          />
        </div>
      )}
    </div>
  );
};
