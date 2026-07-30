import React, { useState } from 'react';
import { CalculationInputs, CalculationResults, SavedProject, UnitSystem } from '../../types';
import { calculateResults } from '../../utils/heatExchangerEngine';
import { unitLabels } from '../../utils/unitConverter';
import { Columns3, Check, Trophy, Sparkles, Plus } from 'lucide-react';

interface ComparisonTabProps {
  currentInputs: CalculationInputs;
  savedProjects: SavedProject[];
  unitSystem: UnitSystem;
}

export const ComparisonTab: React.FC<ComparisonTabProps> = ({
  currentInputs,
  savedProjects,
  unitSystem
}) => {
  // Current design + user selected compared designs
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [comparisonMetric, setComparisonMetric] = useState<'area' | 'effectiveness' | 'cost'>('area');

  const unit = unitLabels[unitSystem];

  // Evaluate designs for matrix
  const currentResult = calculateResults(currentInputs);
  const currentItem = {
    id: 'current_design',
    name: 'التصميم الحالي القائم (Current Design)',
    inputs: currentInputs,
    results: currentResult
  };

  const comparedItems = [
    currentItem,
    ...savedProjects
      .filter(p => selectedProjectIds.includes(p.id))
      .map(p => ({
        id: p.id,
        name: p.name,
        inputs: p.inputs,
        results: calculateResults(p.inputs)
      }))
  ];

  const toggleSelectProject = (id: string) => {
    if (selectedProjectIds.includes(id)) {
      setSelectedProjectIds(selectedProjectIds.filter(i => i !== id));
    } else {
      if (selectedProjectIds.length < 3) {
        setSelectedProjectIds([...selectedProjectIds, id]);
      }
    }
  };

  // Find optimum design according to metric
  let bestIndex = 0;
  if (comparisonMetric === 'area') {
    let minArea = Infinity;
    comparedItems.forEach((item, idx) => {
      if (item.results.requiredAreaM2 < minArea) {
        minArea = item.results.requiredAreaM2;
        bestIndex = idx;
      }
    });
  } else if (comparisonMetric === 'effectiveness') {
    let maxEps = -1;
    comparedItems.forEach((item, idx) => {
      if (item.results.effectivenessEps > maxEps) {
        maxEps = item.results.effectivenessEps;
        bestIndex = idx;
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Columns3 className="w-5 h-5 text-amber-500" />
            مقارنة التصاميم جنبًا إلى جنب (Side-by-Side Design Comparison)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            قارن حتى 4 بدائل تصميمية مختلفة جنباً إلى جنب لتحليل أفضل مساحة، أعلى كفاءة، وأقل تكلفة.
          </p>
        </div>

        {/* Priority Metric Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 px-2">معيار الأفضلية:</span>
          <button
            onClick={() => setComparisonMetric('area')}
            className={`px-3 py-1.5 rounded-md font-bold transition ${
              comparisonMetric === 'area' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            أقل مساحة مطلوب A
          </button>
          <button
            onClick={() => setComparisonMetric('effectiveness')}
            className={`px-3 py-1.5 rounded-md font-bold transition ${
              comparisonMetric === 'effectiveness' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            أعلى فعالية ε
          </button>
        </div>
      </div>

      {/* Selectable Projects Selector Bar */}
      {savedProjects.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-mono text-slate-400 mb-2">اختر مشاريع محفوظة للمقارنة مع التصميم الحالي:</div>
          <div className="flex flex-wrap gap-2">
            {savedProjects.map(p => {
              const isSelected = selectedProjectIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleSelectProject(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                    isSelected
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5 text-amber-500" /> : <Plus className="w-3.5 h-3.5" />}
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {comparedItems.map((item, idx) => {
          const isBest = idx === bestIndex;
          const r = item.results;

          return (
            <div
              key={item.id}
              className={`relative bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between shadow-xl transition ${
                isBest
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-gradient-to-b from-amber-950/20 to-slate-900'
                  : 'border-slate-800'
              }`}
            >
              {isBest && (
                <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Trophy className="w-3.5 h-3.5" />
                  التصميم الأفضل الموصى به
                </div>
              )}

              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-100">{item.name}</h3>
                  <div className="text-[11px] font-mono text-amber-500 mt-0.5">{item.inputs.exchangerType}</div>
                </div>

                {/* Key Metrics Stack */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">الحمل Q:</span>
                    <span className="font-bold text-amber-400">{r.qDesignKw} {unit.heatDuty}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">LMTD:</span>
                    <span className="font-bold text-cyan-400">{r.effectiveLmtd} {unit.tempDiff}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">المساحة A:</span>
                    <span className="font-bold text-emerald-400">{r.requiredAreaM2} {unit.area}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">الفعالية ε:</span>
                    <span className="font-bold text-slate-100">{(r.effectivenessEps * 100).toFixed(1)}%</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">معامل U:</span>
                    <span className="font-bold text-slate-100">{item.inputs.uAssumed} {unit.uCoef}</span>
                  </div>
                </div>
              </div>

              {/* Specs Summary */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>نوع التدفق: <span className="text-slate-200">{item.inputs.flowType}</span></div>
                <div>المائع الساخن: <span className="text-slate-200">{item.inputs.hotFluidId}</span></div>
                <div>المائع البارد: <span className="text-slate-200">{item.inputs.coldFluidId}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
