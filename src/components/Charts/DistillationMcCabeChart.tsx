import React from 'react';
import { calculateMcCabeThiele, DistillationInputs } from '../../utils/mccabeCalculators';
import { Layers, CheckCircle2, Sliders } from 'lucide-react';

interface DistillationMcCabeChartProps {
  inputs: DistillationInputs;
}

export const DistillationMcCabeChart: React.FC<DistillationMcCabeChartProps> = ({ inputs }) => {
  const result = calculateMcCabeThiele(inputs);

  // SVG dimensions
  const size = 360;
  const padding = 40;
  const chartWidth = size - 2 * padding;
  const chartHeight = size - 2 * padding;

  const toSvgX = (x: number) => padding + x * chartWidth;
  const toSvgY = (y: number) => size - padding - y * chartHeight;

  // Equilibrium curve path
  const eqPathStr = result.equilibriumPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
    .join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 dir-rtl font-mono">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            مخطط ماكيب ثيلي النظري (McCabe-Thiele Distillation Diagram)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            حساب عدد المراحل النظرية N وشعاع الترجيع الأدنى R_min ورسم خطوات الصواني.
          </p>
        </div>

        {/* Calculated Results Badges */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-xl text-center">
            <span className="text-[9px] text-slate-400 block">عدد الصواني النظرية N:</span>
            <span className="text-sm font-bold text-amber-400">{result.theoreticalStages} مراحل</span>
          </div>

          <div className="bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-xl text-center">
            <span className="text-[9px] text-slate-400 block">صينية التغذية Feed Stage:</span>
            <span className="text-sm font-bold text-cyan-300">الصينية #{result.feedStage}</span>
          </div>

          <div className="bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-xl text-center">
            <span className="text-[9px] text-slate-400 block">الترجيع الأدنى R_min:</span>
            <span className="text-sm font-bold text-emerald-400">{result.rMin}</span>
          </div>
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="flex flex-col items-center justify-center">
        <svg width={size} height={size} className="bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
          {/* Grid lines */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map(val => (
            <g key={`grid-${val}`}>
              <line
                x1={toSvgX(val)}
                y1={toSvgY(0)}
                x2={toSvgX(val)}
                y2={toSvgY(1)}
                stroke="#1e293b"
                strokeDasharray="2 2"
              />
              <line
                x1={toSvgX(0)}
                y1={toSvgY(val)}
                x2={toSvgX(1)}
                y2={toSvgY(val)}
                stroke="#1e293b"
                strokeDasharray="2 2"
              />
              {/* Tick labels */}
              <text x={toSvgX(val)} y={size - 12} fill="#64748b" fontSize="9" textAnchor="middle">
                {val}
              </text>
              <text x={18} y={toSvgY(val) + 3} fill="#64748b" fontSize="9" textAnchor="end">
                {val}
              </text>
            </g>
          ))}

          {/* 45 Degree Line (y = x) */}
          <line
            x1={toSvgX(0)}
            y1={toSvgY(0)}
            x2={toSvgX(1)}
            y2={toSvgY(1)}
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Equilibrium Curve */}
          <path d={eqPathStr} fill="none" stroke="#f59e0b" strokeWidth="2.5" />

          {/* Rectifying Operating Line */}
          <line
            x1={toSvgX(result.rectifyingLine.xStart)}
            y1={toSvgY(result.rectifyingLine.yStart)}
            x2={toSvgX(result.rectifyingLine.xEnd)}
            y2={toSvgY(result.rectifyingLine.yEnd)}
            stroke="#06b6d4"
            strokeWidth="2"
          />

          {/* q-Line */}
          <line
            x1={toSvgX(result.qLine.xF)}
            y1={toSvgY(result.qLine.yF)}
            x2={toSvgX(result.qLine.xq)}
            y2={toSvgY(result.qLine.yq)}
            stroke="#e11d48"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Tray Staircase steps */}
          {result.stages.map((st, idx) => (
            <g key={`step-${idx}`}>
              {/* Horizontal line to equilibrium curve */}
              <line
                x1={toSvgX(st.x1)}
                y1={toSvgY(st.y1)}
                x2={toSvgX(st.x2)}
                y2={toSvgY(st.y1)}
                stroke="#10b981"
                strokeWidth="1.8"
              />
              {/* Vertical line down to operating line */}
              <line
                x1={toSvgX(st.x2)}
                y1={toSvgY(st.y1)}
                x2={toSvgX(st.x2)}
                y2={toSvgY(st.y2)}
                stroke="#10b981"
                strokeWidth="1.8"
              />
            </g>
          ))}

          {/* Axis Titles */}
          <text x={size / 2} y={size - 4} fill="#94a3b8" fontSize="10" textAnchor="middle font-bold">
            x (الكثافة المولية للسائل Liquid Mole Fraction)
          </text>
          <text
            x={10}
            y={size / 2}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="middle"
            transform={`rotate(-90 10 ${size / 2})`}
          >
            y (الكثافة المولية للبخار Vapor Mole Fraction)
          </text>
        </svg>

        {/* Legend Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-3 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 inline-block"></span>
            <span>منحنى التوازن (Equilibrium)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
            <span>خط التشغيل الإثراء (ROL)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 inline-block"></span>
            <span>خط التغذية (q-line)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block"></span>
            <span>خطوات الصواني (Tray Steps)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
