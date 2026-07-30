import React, { useState } from 'react';
import { CalculationResults, UnitSystem } from '../../types';
import { unitLabels } from '../../utils/unitConverter';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Flame, ShieldAlert, Zap, Thermometer, Percent, Info } from 'lucide-react';

interface EnergyBalancePieChartProps {
  results: CalculationResults;
  unitSystem: UnitSystem;
}

export const EnergyBalancePieChart: React.FC<EnergyBalancePieChartProps> = ({
  results,
  unitSystem
}) => {
  // Ambient heat loss override slider (%) if user wants to simulate real-world insulation loss
  const [ambientLossPercent, setAmbientLossPercent] = useState<number>(5);

  const unit = unitLabels[unitSystem];
  const qHotRaw = results.qHotKw;
  const qColdRaw = results.qColdKw;

  // Calculate actual energy breakdown
  // Hot fluid total heat released
  const totalHotEnergy = Math.max(0.1, qHotRaw);

  // Computed loss from delta or slider
  let calculatedLoss = Math.max(0, qHotRaw - qColdRaw);
  
  // If qHot equals qCold or user wants custom loss, apply ambient loss factor
  const customLossAmount = (totalHotEnergy * ambientLossPercent) / 100;
  
  // Effective absorbed heat by cold fluid after ambient loss
  const effectiveColdAbsorbed = Math.max(0, totalHotEnergy - customLossAmount);
  const effectiveAmbientLoss = customLossAmount;

  // Thermal Efficiency %
  const thermalEfficiency = ((effectiveColdAbsorbed / totalHotEnergy) * 100).toFixed(1);

  // Data for Recharts Pie Chart
  const pieData = [
    {
      name: 'الحرارة الممتصة بواسطة المائع البارد (Q_cold)',
      nameEn: 'Heat Absorbed by Cold Fluid',
      value: Number(effectiveColdAbsorbed.toFixed(2)),
      color: '#06b6d4', // Cyan
      percentage: ((effectiveColdAbsorbed / totalHotEnergy) * 100).toFixed(1)
    },
    {
      name: 'الحرارة المفقودة للوسط المحيط (Q_ambient)',
      nameEn: 'Heat Lost to Ambient Environment',
      value: Number(effectiveAmbientLoss.toFixed(2)),
      color: '#f59e0b', // Amber/Orange
      percentage: ((effectiveAmbientLoss / totalHotEnergy) * 100).toFixed(1)
    }
  ];

  // Custom Tooltip for Pie Chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl dir-rtl text-xs font-mono">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-100">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: data.color }}
            />
            <span>{data.name}</span>
          </div>
          <div className="text-amber-400 font-bold text-sm">
            {data.value} {unit.heatDuty}
          </div>
          <div className="text-slate-400 text-[11px] mt-0.5">
            النسبة المئوية: <span className="text-emerald-400 font-bold">{data.percentage}%</span> من إجمالي طاقة السائل الساخن
          </div>
        </div>
      );
    };
    return null;
  };

  // Custom Render Legend
  const renderCustomLegend = (props: any) => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono mt-3 dir-rtl">
        {pieData.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span
              className="w-3 h-3 rounded-full flex-none"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-200 font-bold">{entry.name}</span>
            <span className="text-amber-400 font-bold">({entry.percentage}%)</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Title & Description */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            توازن الطاقة والحرارة المفقودة (Energy Balance & Ambient Heat Loss)
          </h3>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            رسم بياني دائري تفاعلي (Pie Chart) يوضح توزيع الطاقة المنبعثة من المائع الساخن بين الامتصاص والمفقودات.
          </p>
        </div>

        {/* Efficiency Badge */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-left font-mono">
          <div className="text-[10px] text-slate-400 uppercase">الكفاءة الحرارية المعزولة Thermal Efficiency</div>
          <div className="text-base font-black text-emerald-400">{thermalEfficiency}%</div>
        </div>
      </div>

      {/* Main Content Grid: Pie Chart + Controls & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Recharts Pie Chart (7 Cols) */}
        <div className="md:col-span-7 h-64 sm:h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="#0f172a"
                strokeWidth={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderCustomLegend} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label for Donut style */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 text-center pointer-events-none">
            <div className="text-[10px] font-mono text-slate-400">إجمالي Q_hot</div>
            <div className="text-sm font-extrabold font-mono text-amber-400">
              {totalHotEnergy.toFixed(1)}
            </div>
            <div className="text-[9px] font-mono text-slate-500">{unit.heatDuty}</div>
          </div>
        </div>

        {/* Side Metrics & Interactive Insulation Loss Controller (5 Cols) */}
        <div className="md:col-span-5 space-y-3 font-mono text-xs">
          {/* Card 1: Q Hot */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">طاقة السائل الساخن Q_hot</div>
                <div className="text-slate-100 font-bold">{totalHotEnergy.toFixed(2)} {unit.heatDuty}</div>
              </div>
            </div>
            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">100%</span>
          </div>

          {/* Card 2: Q Cold Absorbed */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">الطاقة الممتصة Q_cold</div>
                <div className="text-cyan-300 font-bold">{effectiveColdAbsorbed.toFixed(2)} {unit.heatDuty}</div>
              </div>
            </div>
            <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded text-[11px]">
              {((effectiveColdAbsorbed / totalHotEnergy) * 100).toFixed(1)}%
            </span>
          </div>

          {/* Card 3: Ambient Heat Loss */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">الفقد للوسط المحيط Q_ambient</div>
                <div className="text-amber-400 font-bold">{effectiveAmbientLoss.toFixed(2)} {unit.heatDuty}</div>
              </div>
            </div>
            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">
              {ambientLossPercent}%
            </span>
          </div>

          {/* Interactive Insulation Loss Control Slider */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                نسبة المفقودات للجو (Insulation Loss Factor):
              </span>
              <span className="text-amber-400 font-bold">{ambientLossPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={ambientLossPercent}
              onChange={e => setAmbientLossPercent(+e.target.value)}
              className="w-full accent-amber-500 cursor-pointer bg-slate-900 h-2 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>0% (عزل حراري تام)</span>
              <span>10% (عزل قياسي)</span>
              <span>25% (بدون عزل)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Note */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-cyan-400 flex-none mt-0.5" />
        <div>
          تُمثل المعادلة الحرارية العامة: <span className="text-slate-200 font-bold">Q_hot = Q_cold + Q_ambient</span>. 
          في التصاميم المثالية المفترضة يكون <span className="text-cyan-300">Q_ambient ≈ 0</span> بافتراض وجود عزل حراري محكم للمبادل (Thermal Insulation Outer Shell).
        </div>
      </div>
    </div>
  );
};
