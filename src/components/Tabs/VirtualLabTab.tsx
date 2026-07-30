import React, { useState } from 'react';
import { UnitSystem } from '../../types';
import { FlaskConical, Sliders, Activity, AlertTriangle, CheckCircle, Flame, Droplets, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface VirtualLabTabProps {
  unitSystem: UnitSystem;
}

export const VirtualLabTab: React.FC<VirtualLabTabProps> = ({ unitSystem }) => {
  // Live Virtual Lab State
  const [labMode, setLabMode] = useState<'distillation' | 'heat_exchanger' | 'absorption'>('distillation');

  // Distillation Lab Parameters
  const [feedRate, setFeedRate] = useState<number>(1000); // kmol/h
  const [feedCompXF, setFeedCompXF] = useState<number>(0.45);
  const [destillateXD, setDestillateXD] = useState<number>(0.95);
  const [bottomsXB, setBottomsXB] = useState<number>(0.05);
  const [refluxRatio, setRefluxRatio] = useState<number>(3.0);
  const [columnPressure, setColumnPressure] = useState<number>(1.2); // bar

  // Exchanger Lab Parameters
  const [tHotIn, setTHotIn] = useState<number>(120);
  const [tHotOut, setTHotOut] = useState<number>(60);
  const [tColdIn, setTColdIn] = useState<number>(20);
  const [tColdOut, setTColdOut] = useState<number>(75);
  const [mHot, setMHot] = useState<number>(5.0); // kg/s
  const [overallU, setOverallU] = useState<number>(850); // W/m²K

  // Calculations for Distillation Virtual Lab
  // Material Balance: F = D + B => F*xF = D*xD + B*xB
  const distillateD = Math.max(0, (feedRate * (feedCompXF - bottomsXB)) / (destillateXD - bottomsXB || 1));
  const bottomsB = Math.max(0, feedRate - distillateD);
  const minRefluxR = 1.2; // approx
  const activeStages = Math.round(12 + 6 * (refluxRatio / (refluxRatio + 1)) * 3);
  const reboilerDutyKw = (distillateD * (refluxRatio + 1) * 38) / 3.6; // approx kJ/mol

  // Calculations for Exchanger Virtual Lab
  const cpHot = 4180; // Water
  const qKw = (mHot * cpHot * (tHotIn - tHotOut)) / 1000;
  const dT1 = tHotIn - tColdOut;
  const dT2 = tHotOut - tColdIn;
  const lmtd = dT1 === dT2 ? dT1 : (dT1 - dT2) / Math.log(dT1 / dT2 || 1);
  const requiredArea = (qKw * 1000) / (overallU * (lmtd || 1));

  // Validation Warnings Check
  const validationErrors: string[] = [];
  if (tHotIn <= tColdIn) {
    validationErrors.push('خطأ فيزيائي: حرارة المائع الساخن يجب أن تكون أعلى من حرارة المائع البارد!');
  }
  if (tHotOut <= tColdIn) {
    validationErrors.push('تحذير: حدث تقاطع حراري (Temperature Cross) في المبادل!');
  }
  if (destillateXD <= feedCompXF) {
    validationErrors.push('خطأ: تركيز الناتـج العلوي (xD) يجب أن يكون أكبر من تركيز التغذية (xF)!');
  }
  if (refluxRatio < 0.5) {
    validationErrors.push('تحذير: نسبة الارتجاع (Reflux Ratio) منخفضة جداً مما قد يمنع الفصل!');
  }

  // Graph Data
  const chartData = Array.from({ length: 10 }, (_, i) => {
    const pos = i / 9;
    if (labMode === 'heat_exchanger') {
      const th = tHotIn - pos * (tHotIn - tHotOut);
      const tc = tColdIn + pos * (tColdOut - tColdIn);
      return { pos: `${Math.round(pos * 100)}%`, HotFluid: Math.round(th), ColdFluid: Math.round(tc) };
    } else {
      const stageP = Math.round(25 + i * (columnPressure * 8));
      const stageTemp = Math.round(65 + i * 5);
      return { pos: `Tray ${i + 1}`, Pressure: stageP, Temp: stageTemp };
    }
  });

  return (
    <div className="space-y-6 dir-rtl font-mono">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            المختبر الافتراضي التفاعلي الحي (Interactive Virtual Laboratory)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            عدّل المتغيرات الفيزيائية بمرونة وشاهد نتائج الموازنة، درجات الحرارة، وعدد المراحل لحظياً مع رسوم بيانية حية.
          </p>
        </div>

        {/* Lab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setLabMode('distillation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              labMode === 'distillation'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            🧪 مختبر التقطير (Distillation Lab)
          </button>
          <button
            onClick={() => setLabMode('heat_exchanger')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              labMode === 'heat_exchanger'
                ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            🔥 مختبر التبادل الحراري (Exchanger Lab)
          </button>
        </div>
      </div>

      {/* Validation Warnings Box */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-950/60 border border-rose-800 p-4 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            تحذيرات التدقيق والتفتيش الفيزيائي (Physics Validation):
          </h4>
          <ul className="list-disc list-inside text-xs text-rose-200 space-y-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Sliders & Live Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interactive Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4" />
            المتغيرات التشغيلية للمختبر (Live Input Parameters)
          </h3>

          {labMode === 'distillation' ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>معدل التغذية F (kmol/h):</span>
                  <span className="text-cyan-400 font-bold">{feedRate}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={feedRate}
                  onChange={e => setFeedRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>تركيز التغذية xF:</span>
                  <span className="text-amber-400 font-bold">{feedCompXF.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.02"
                  value={feedCompXF}
                  onChange={e => setFeedCompXF(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>تركيز الناتج العلوي المطلوب xD:</span>
                  <span className="text-emerald-400 font-bold">{destillateXD.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="0.99"
                  step="0.01"
                  value={destillateXD}
                  onChange={e => setDestillateXD(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>نسبة الارتجاع Reflux Ratio (R):</span>
                  <span className="text-purple-400 font-bold">{refluxRatio.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="10.0"
                  step="0.2"
                  value={refluxRatio}
                  onChange={e => setRefluxRatio(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-950 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>ضغط العمود Column Pressure (bar):</span>
                  <span className="text-sky-400 font-bold">{columnPressure.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={columnPressure}
                  onChange={e => setColumnPressure(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-950 rounded cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>حرارة المائع الساخن عند الدخول Th,in (°C):</span>
                  <span className="text-rose-400 font-bold">{tHotIn}°C</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="250"
                  step="5"
                  value={tHotIn}
                  onChange={e => setTHotIn(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-950 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>حرارة المائع الساخن عند الخروج Th,out (°C):</span>
                  <span className="text-orange-400 font-bold">{tHotOut}°C</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="5"
                  value={tHotOut}
                  onChange={e => setTHotOut(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 bg-slate-950 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>حرارة المائع البارد عند الدخول Tc,in (°C):</span>
                  <span className="text-cyan-400 font-bold">{tColdIn}°C</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={tColdIn}
                  onChange={e => setTColdIn(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>تدفق المائع الساخن (kg/s):</span>
                  <span className="text-amber-400 font-bold">{mHot} kg/s</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={mHot}
                  onChange={e => setMHot(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Metrics & Graph */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {labMode === 'distillation' ? (
              <>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">تدفق الناتج العلوي D</span>
                  <span className="text-base font-bold text-cyan-400">{distillateD.toFixed(1)} kmol/h</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">تدفق الناتج السفلي B</span>
                  <span className="text-base font-bold text-emerald-400">{bottomsB.toFixed(1)} kmol/h</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">عدد الصواني النظرية N</span>
                  <span className="text-base font-bold text-amber-400">{activeStages} صينية</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">حمل الغلاية Reboiler</span>
                  <span className="text-base font-bold text-rose-400">{reboilerDutyKw.toFixed(0)} kW</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl col-span-2">
                  <span className="text-[10px] text-slate-400 block">الكفاءة التخمينية</span>
                  <span className="text-xs font-bold text-slate-200">78% (كفاءة صواني مورفري)</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">الحرارة المنقولة Q</span>
                  <span className="text-base font-bold text-rose-400">{qKw.toFixed(1)} kW</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">المتوسط اللوغاريتمي LMTD</span>
                  <span className="text-base font-bold text-amber-400">{lmtd.toFixed(1)} °C</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">المساحة المطلوبة Area</span>
                  <span className="text-base font-bold text-cyan-400">{requiredArea.toFixed(2)} m²</span>
                </div>
              </>
            )}
          </div>

          {/* Dynamic Recharts Visualization */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>📈 المنحنى البياني المباشر للمختبر الافتراضي</span>
              <span className="text-[10px] text-slate-500">Live Dynamic Plot</span>
            </h4>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="pos" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px' }} />
                  {labMode === 'heat_exchanger' ? (
                    <>
                      <Area type="monotone" dataKey="HotFluid" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="المائع الساخن °C" />
                      <Area type="monotone" dataKey="ColdFluid" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} name="المائع البارد °C" />
                    </>
                  ) : (
                    <>
                      <Area type="monotone" dataKey="Temp" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="الحرارة °C" />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
