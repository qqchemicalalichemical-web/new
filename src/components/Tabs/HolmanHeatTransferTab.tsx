import React, { useState } from 'react';
import { HolmanModuleId, CalculationInputs, CalculationResults, UnitSystem } from '../../types';
import {
  calculateConductionWall,
  calculateFin,
  calculateRadiation,
  calculateNaturalConvection,
  calculateForcedConvection,
  calculateTransientConduction,
  calculateCriticalRadius
} from '../../utils/holmanCalculators';
import { unitLabels } from '../../utils/unitConverter';
import { Modular3DViewer } from '../3D/Modular3DViewer';
import { TemperatureProfileChart } from '../Charts/TemperatureProfileChart';
import { EnergyBalancePieChart } from '../Charts/EnergyBalancePieChart';

import {
  Flame,
  Activity,
  Layers,
  Zap,
  ShieldAlert,
  Thermometer,
  Sliders,
  Box,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface HolmanHeatTransferTabProps {
  inputs: CalculationInputs;
  results: CalculationResults;
  onUpdateInput: (field: keyof CalculationInputs, value: any) => void;
}

export const HolmanHeatTransferTab: React.FC<HolmanHeatTransferTabProps> = ({
  inputs,
  results,
  onUpdateInput
}) => {
  const [activeModule, setActiveModule] = useState<HolmanModuleId>('lmtd');

  // Conduction state
  const [condArea, setCondArea] = useState(2.0);
  const [tInside, setTInside] = useState(250);
  const [tOutside, setTOutside] = useState(30);

  // Fin state
  const [finLength, setFinLength] = useState(80);
  const [finThickness, setFinThickness] = useState(4);
  const [finWidth, setFinWidth] = useState(100);
  const [finTb, setFinTb] = useState(180);
  const [finTinf, setFinTinf] = useState(25);
  const [finH, setFinH] = useState(45);

  // Radiation state
  const [radT1, setRadT1] = useState(600);
  const [radT2, setRadT2] = useState(100);
  const [radE1, setRadE1] = useState(0.85);
  const [radE2, setRadE2] = useState(0.75);

  // Transient state
  const [transTime, setTransTime] = useState(120);

  // Critical radius state
  const [critK, setCritK] = useState(0.04);
  const [critH, setCritH] = useState(10);

  const unit = unitLabels[inputs.unitSystem];

  const holmanModules: Array<{ id: HolmanModuleId; nameAr: string; icon: string }> = [
    { id: 'lmtd', nameAr: '1. LMTD فرق الحرارة اللوجارتمي', icon: '📊' },
    { id: 'ntu', nameAr: '2. ε-NTU طريقة الفعالية', icon: '⚡' },
    { id: 'overall_u', nameAr: '3. Overall U معامل U الكلي', icon: '🛡️' },
    { id: 'conduction', nameAr: '4. Conduction التوصيل للجدار', icon: '🧱' },
    { id: 'fins', nameAr: '5. Fins الزعانف الحرارية', icon: '🔱' },
    { id: 'radiation', nameAr: '6. Radiation الإشعاع الحراري', icon: '☀️' },
    { id: 'natural_convection', nameAr: '7. Natural Convection الحمل الحري', icon: '💨' },
    { id: 'forced_convection', nameAr: '8. Forced Convection الحمل القسري', icon: '🌀' },
    { id: 'boiling', nameAr: '9. Boiling الغليان والفقاعات', icon: '🫧' },
    { id: 'condensation', nameAr: '10. Condensation التكثيف', icon: '💧' },
    { id: 'transient_conduction', nameAr: '11. Transient Conduction التوصيل العابر', icon: '⏱️' },
    { id: 'critical_radius', nameAr: '12. Critical Radius نصف القطر الحرِج', icon: '⭕' },
    { id: 'exchanger_selection', nameAr: '13. Exchanger Selection اختيار المبادل', icon: '🏗️' }
  ];

  // Calculations for active module
  const conductionRes = calculateConductionWall(
    [
      { name: 'طوب حراري داخلي (Firebrick)', thicknessMm: 120, kValue: 1.2 },
      { name: 'عازل صوف زجاجي (Glass Wool)', thicknessMm: 80, kValue: 0.038 },
      { name: 'جدار صلب خارجي (Steel Outer)', thicknessMm: 10, kValue: 45 }
    ],
    condArea,
    tInside,
    tOutside
  );

  const finRes = calculateFin({
    tbC: finTb,
    tInfC: finTinf,
    lengthMm: finLength,
    thicknessMm: finThickness,
    widthMm: finWidth,
    kFin: 205, // Aluminum
    hAmbient: finH
  });

  const radRes = calculateRadiation({
    t1C: radT1,
    t2C: radT2,
    area1M2: 1.5,
    emissivity1: radE1,
    emissivity2: radE2,
    viewFactorF12: 1.0
  });

  const transientRes = calculateTransientConduction({
    initialTempC: 300,
    ambientTempC: 25,
    sphereRadiusMm: 25,
    density: 7850,
    cp: 465,
    k: 52,
    h: 120,
    timeSeconds: transTime
  });

  const critRes = calculateCriticalRadius({
    pipeOuterRadiusMm: 20,
    insulationK: critK,
    hOuter: critH
  });

  return (
    <div className="space-y-6 dir-rtl">
      {/* Holman Modules Sub-Header Selector */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <h2 className="text-xs font-mono font-bold text-amber-500 uppercase flex items-center gap-2">
            <Flame className="w-4 h-4" />
            قسم انتقال الحرارة التعليمية (Holman Heat Transfer Suite - 13 Modules)
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">مرجع: J.P. Holman - Heat Transfer</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {holmanModules.map(mod => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                activeModule === mod.id
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
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

      {/* MODULE 1: LMTD */}
      {activeModule === 'lmtd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 space-y-6">
            <Modular3DViewer
              moduleType="lmtd_exchanger"
              titleAr="نموذج المبادل الحراري لتقييم LMTD"
              subTitleAr="يوضح اتجاهات الجريان المتعاكس وتدرج الحرارة بين المائعين"
            />

            <TemperatureProfileChart results={results} unitSystem={inputs.unitSystem} />
            <EnergyBalancePieChart results={results} unitSystem={inputs.unitSystem} />
          </div>
        </div>
      )}

      {/* MODULE 2: NTU */}
      {activeModule === 'ntu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              مؤشرات طريقة الفعالية (ε-NTU Parameters)
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">عدد وحدات الانتقال الحراري NTU:</span>
                <span className="text-lg font-bold text-amber-400">{results.ntu}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">الفعالية الحرارية ε:</span>
                <span className="text-lg font-bold text-emerald-400">{(results.effectivenessEps * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">نسبة السعات الحرارية Cr (Cmin/Cmax):</span>
                <span className="text-lg font-bold text-cyan-300">{results.capacityRatioCr}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">أقصى نقل حراري نظري Q_max:</span>
                <span className="text-lg font-bold text-slate-100">{results.qMaxKw} {unit.heatDuty}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Modular3DViewer
              moduleType="ntu_flow"
              titleAr="محاكاة ثلاثية الأبعاد لطريقة ε-NTU"
              subTitleAr="تتبع مسارات نقل الطاقة بدون الحاجة لمجهولية درجات الحرارة الخاربة"
            />
          </div>
        </div>
      )}

      {/* MODULE 3: OVERALL U */}
      {activeModule === 'overall_u' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 space-y-5">
            <Modular3DViewer
              moduleType="overall_u_tube"
              titleAr="نموذج 3D لتوزع المقاومات الحرارية عبر جدار الأنبوب"
              subTitleAr="يظهر الاتساخ الداخلي/الخارجي، جدار الأنبوب، ومعاملات التوصيل h_i و h_o"
            />

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                تفاوض المقاومات الحرارية 1/U (Thermal Resistance Breakdown):
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">الحمل الداخلي 1/h_i:</span>
                  <span className="font-bold text-amber-400">{results.resistanceBreakdown.rInnerConv.toExponential(3)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">الاتساخ الداخلي R_fi:</span>
                  <span className="font-bold text-rose-400">{results.resistanceBreakdown.rInnerFouling.toExponential(3)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">جدار الأنبوب R_wall:</span>
                  <span className="font-bold text-slate-200">{results.resistanceBreakdown.rTubeWall.toExponential(3)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">الاتساخ الخارجي R_fo:</span>
                  <span className="font-bold text-rose-400">{results.resistanceBreakdown.rOuterFouling.toExponential(3)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">الحمل الخارجي 1/h_o:</span>
                  <span className="font-bold text-cyan-400">{results.resistanceBreakdown.rOuterConv.toExponential(3)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40">
                  <span className="text-amber-400 block text-[10px] font-bold">المقاومة الكلية R_total:</span>
                  <span className="font-bold text-amber-300 text-sm">{results.resistanceBreakdown.rTotal.toExponential(3)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: CONDUCTION WALL */}
      {activeModule === 'conduction' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              مدخلات الجدار متعدد الطبقات (Multi-layer Wall)
            </h3>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">المساحة السطحية A (m²):</label>
              <input
                type="number"
                value={condArea}
                onChange={e => setCondArea(+e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-amber-400 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">T_inside (°C):</label>
                <input
                  type="number"
                  value={tInside}
                  onChange={e => setTInside(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-rose-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">T_outside (°C):</label>
                <input
                  type="number"
                  value={tOutside}
                  onChange={e => setTOutside(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-cyan-300 outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-400 uppercase">نتائج التوصيل الحراري</div>
              <div className="text-xl font-bold text-amber-500">{conductionRes.qKw.toFixed(2)} kW</div>
              <div className="text-[10px] text-slate-400">معدل انتقال الحرارة عبر الجدار (q = ΔT / ΣR)</div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Modular3DViewer
              moduleType="conduction_wall"
              titleAr="جدار عازل 3D متعدد الطبقات"
              subTitleAr="محاكاة انتقال الحرارة بالتوصيل المباشر وانخفاض درجة الحرارة بين كل طبقة"
            />
          </div>
        </div>
      )}

      {/* MODULE 5: FINS */}
      {activeModule === 'fins' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-slate-100">مدخلات الزعنفة (Fin Parameters):</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px]">حرارة القاعدة T_b (°C):</label>
                <input
                  type="number"
                  value={finTb}
                  onChange={e => setFinTb(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-rose-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px]">حرارة المحيط T_inf (°C):</label>
                <input
                  type="number"
                  value={finTinf}
                  onChange={e => setFinTinf(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-cyan-300 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px]">طول الزعنفة L (mm):</label>
                <input
                  type="number"
                  value={finLength}
                  onChange={e => setFinLength(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px]">معامل الحمل h (W/m²K):</label>
                <input
                  type="number"
                  value={finH}
                  onChange={e => setFinH(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">كفاءة الزعنفة Fin Efficiency η:</span>
                <span className="text-base font-bold text-emerald-400">{finRes.efficiencyPercent}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">الحرارة المبددة Q_fin:</span>
                <span className="text-base font-bold text-amber-400">{finRes.qFinWatts} Watt</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Modular3DViewer
              moduleType="fin_array"
              titleAr="مصفوفة زعانف التبريد 3D"
              subTitleAr="توزع درجات الحرارة على طول الزعنفة والتشتيت الحراري للهواء المحيط"
            />
          </div>
        </div>
      )}

      {/* MODULE 6: RADIATION */}
      {activeModule === 'radiation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-slate-100">الإشعاع بين لوحين متوازيين (Radiation Plates):</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px]">حرارة السطح 1 (°C):</label>
                <input
                  type="number"
                  value={radT1}
                  onChange={e => setRadT1(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px]">حرارة السطح 2 (°C):</label>
                <input
                  type="number"
                  value={radT2}
                  onChange={e => setRadT2(+e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-cyan-300 outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-400">انتقال الحرارة بالإشعاع Q_rad:</div>
              <div className="text-2xl font-bold text-amber-400">{radRes.qKw} kW</div>
              <div className="text-[10px] text-slate-500">مستند لقانون ستيفان-بولتزمان Q = ε·σ·A·(T1⁴ - T2⁴)</div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Modular3DViewer
              moduleType="radiation_plates"
              titleAr="محاكاة الإشعاع الحراري 3D"
              subTitleAr="تفاعل فوتونات الحرارة وتبادل الطاقة الكهرومغناطيسية بين الأسطح"
            />
          </div>
        </div>
      )}

      {/* FALLBACK FOR OTHER MODULES WITH 3D INTERACTIVE CANVAS */}
      {!['lmtd', 'ntu', 'overall_u', 'conduction', 'fins', 'radiation'].includes(activeModule) && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                الموديل التعليمي: {holmanModules.find(m => m.id === activeModule)?.nameAr}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                نموذج تفاعلي مستند لمعادلات هولمان (J.P. Holman - Heat Transfer Edition 10th).
              </p>
            </div>
          </div>

          <Modular3DViewer
            moduleType={activeModule}
            titleAr={`نموذج ثلاثي الأبعاد 3D: ${holmanModules.find(m => m.id === activeModule)?.nameAr}`}
            subTitleAr="يدعم التدوير، التكبير، والتفاعل المباشر مع حركة الطاقة والموائع"
          />
        </div>
      )}
    </div>
  );
};
