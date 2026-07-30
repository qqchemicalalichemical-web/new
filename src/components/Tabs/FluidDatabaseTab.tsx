import React, { useState } from 'react';
import { fluidsDatabase, getFluidPropertiesAtTemp } from '../../data/fluidsDatabase';
import { FluidDefinition } from '../../types';
import { Database, Plus, Check, Info, Thermometer } from 'lucide-react';

interface FluidDatabaseTabProps {
  hotFluidId: string;
  coldFluidId: string;
  onSelectHotFluid: (id: string) => void;
  onSelectColdFluid: (id: string) => void;
}

export const FluidDatabaseTab: React.FC<FluidDatabaseTabProps> = ({
  hotFluidId,
  coldFluidId,
  onSelectHotFluid,
  onSelectColdFluid
}) => {
  const [selectedFluidId, setSelectedFluidId] = useState<string>(hotFluidId || 'water');
  const [evalTemp, setEvalTemp] = useState<number>(50);

  const selectedFluid = fluidsDatabase.find(f => f.id === selectedFluidId) || fluidsDatabase[0];
  const evalProps = getFluidPropertiesAtTemp(selectedFluidId, evalTemp);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-500" />
            قاعدة بيانات خصائص الموائع الشاملة (Thermal Fluid Database)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            اختر الموائع الصناعية لعرض الخواص الفيزيائية والديناميكية الحرارية المتغيرة حسب درجة الحرارة تلقائياً (ρ, Cp, k, μ, Pr).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Fluid Selection Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-mono text-slate-400 mb-2">قائمة الموائع المتوفرة في القاعدة ({fluidsDatabase.length}):</div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {fluidsDatabase.map(fluid => {
              const isHot = fluid.id === hotFluidId;
              const isCold = fluid.id === coldFluidId;
              const isSelected = fluid.id === selectedFluidId;

              return (
                <div
                  key={fluid.id}
                  onClick={() => setSelectedFluidId(fluid.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 text-slate-100 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{fluid.nameAr}</div>
                    <div className="text-[11px] font-mono text-slate-400">{fluid.nameEn}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectHotFluid(fluid.id);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                        isHot ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="تعيين كمائع ساخن"
                    >
                      ساخن
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectColdFluid(fluid.id);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                        isCold ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="تعيين كمائع بارد"
                    >
                      بارد
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Fluid Details & Dynamic Calculator */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Fluid Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-amber-500">{selectedFluid.nameAr}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedFluid.description}</p>
              </div>

              <span className="text-xs font-mono bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-slate-400">
                الفئة: {selectedFluid.category}
              </span>
            </div>

            {/* Temperature Slider Evaluator */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  حساب الخواص عند درجة حرارة التقييم:
                </span>
                <strong className="text-amber-400 font-bold text-sm">{evalTemp} °C</strong>
              </div>

              <input
                type="range"
                min={-20}
                max={200}
                value={evalTemp}
                onChange={e => setEvalTemp(+e.target.value)}
                className="w-full accent-amber-500"
              />

              {/* Dynamic Property Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">الكثافة ρ</div>
                  <div className="text-base font-bold font-mono text-slate-100">{evalProps.rho} <span className="text-xs text-slate-400">kg/m³</span></div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">الحرارة النوعية Cp</div>
                  <div className="text-base font-bold font-mono text-amber-400">{evalProps.cp} <span className="text-xs text-slate-400">J/kg·K</span></div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">التوصيل k</div>
                  <div className="text-base font-bold font-mono text-cyan-300">{evalProps.k} <span className="text-xs text-slate-400">W/m·K</span></div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">اللزوجة Dynamic μ</div>
                  <div className="text-base font-bold font-mono text-emerald-400">{(evalProps.mu * 1000).toFixed(3)} <span className="text-xs text-slate-400">mPa·s</span></div>
                </div>
              </div>
            </div>

            {/* Raw Reference Table */}
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2">جدول النقاط المرجعية لقاعدة البيانات (Raw Points):</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-amber-500">
                      <th className="p-2">T (°C)</th>
                      <th className="p-2">ρ (kg/m³)</th>
                      <th className="p-2">Cp (J/kg·K)</th>
                      <th className="p-2">k (W/m·K)</th>
                      <th className="p-2">μ (mPa·s)</th>
                      <th className="p-2">Pr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFluid.points.map((pt, idx) => (
                      <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-950 text-slate-300">
                        <td className="p-2 font-bold text-slate-100">{pt.tempC}</td>
                        <td className="p-2">{pt.rho}</td>
                        <td className="p-2">{pt.cp}</td>
                        <td className="p-2">{pt.k}</td>
                        <td className="p-2">{(pt.mu * 1000).toFixed(3)}</td>
                        <td className="p-2">{pt.pr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
