import React, { useState } from 'react';
import { CalculationResults, UnitSystem } from '../../types';
import { unitLabels } from '../../utils/unitConverter';
import { AlertTriangle, Thermometer } from 'lucide-react';

interface TemperatureProfileChartProps {
  results: CalculationResults;
  unitSystem: UnitSystem;
}

export const TemperatureProfileChart: React.FC<TemperatureProfileChartProps> = ({
  results,
  unitSystem
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const profiles = results.temperatureProfile || [];

  if (profiles.length === 0) return null;

  const tempUnit = unitLabels[unitSystem].temp;

  // Chart Dimensions
  const svgWidth = 700;
  const svgHeight = 280;
  const paddingL = 60;
  const paddingR = 40;
  const paddingT = 30;
  const paddingB = 40;

  const width = svgWidth - paddingL - paddingR;
  const height = svgHeight - paddingT - paddingB;

  // Find min and max temperature for scaling
  const allTemps = profiles.flatMap(p => [p.th, p.tc]);
  const minTemp = Math.floor(Math.min(...allTemps) - 5);
  const maxTemp = Math.ceil(Math.max(...allTemps) + 5);
  const tempRange = Math.max(1, maxTemp - minTemp);

  const getX = (xNorm: number) => paddingL + xNorm * width;
  const getY = (temp: number) => paddingT + height * (1 - (temp - minTemp) / tempRange);

  // Generate SVG path strings
  const hotPathD = profiles
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.xNormalized)} ${getY(p.th)}`)
    .join(' ');

  const coldPathD = profiles
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.xNormalized)} ${getY(p.tc)}`)
    .join(' ');

  // Area between curves for filled gradient
  const areaD = `${hotPathD} ${profiles
    .slice()
    .reverse()
    .map(p => `L ${getX(p.xNormalized)} ${getY(p.tc)}`)
    .join(' ')} Z`;

  // Find minimum temperature difference (pinch point)
  let minDiff = Infinity;
  let pinchPoint = profiles[0];
  profiles.forEach(p => {
    if (p.dT < minDiff) {
      minDiff = p.dT;
      pinchPoint = p;
    }
  });

  const activeHover = hoveredIndex !== null ? profiles[hoveredIndex] : pinchPoint;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-amber-500" />
            تغير درجات الحرارة عبر طول المبادل الحراري Temperature Profiles
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            مخطط تفاعلي يوضح توزيع الحرارة للسائل الساخن (الخروج/الدخول) مقابل السائل البارد عبر الطول المُمثَّل لنسبة الطول x/L.
          </p>
        </div>

        {/* Pinch Point Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 font-mono text-xs">
          <span className="text-slate-400">نقطة الاقتراب الحراري (Pinch Point):</span>
          <span className="text-emerald-400 font-bold">{minDiff.toFixed(1)} {tempUnit}</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto text-xs font-mono select-none"
        >
          <defs>
            <linearGradient id="hotGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e08238" />
              <stop offset="100%" stopColor="#dd5522" />
            </linearGradient>

            <linearGradient id="coldGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="100%" stopColor="#4fb3d9" />
            </linearGradient>

            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e08238" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4fb3d9" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const tempVal = minTemp + ratio * tempRange;
            const y = getY(tempVal);
            return (
              <g key={ratio}>
                <line
                  x1={paddingL}
                  y1={y}
                  x2={svgWidth - paddingR}
                  y2={y}
                  stroke="#1b2f4a"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingL - 10}
                  y={y + 4}
                  fill="#8ea3bb"
                  textAnchor="end"
                  fontSize="11"
                >
                  {tempVal.toFixed(0)} {tempUnit}
                </text>
              </g>
            );
          })}

          {/* X Axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map(xNorm => {
            const x = getX(xNorm);
            return (
              <g key={xNorm}>
                <line x1={x} y1={paddingT} x2={x} y2={svgHeight - paddingB} stroke="#1b2f4a" strokeWidth="1" />
                <text x={x} y={svgHeight - paddingB + 20} fill="#8ea3bb" textAnchor="middle" fontSize="11">
                  {(xNorm * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Filled Area between curves */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Curves */}
          <path d={hotPathD} fill="none" stroke="url(#hotGradient)" strokeWidth="3.5" strokeLinecap="round" />
          <path d={coldPathD} fill="none" stroke="url(#coldGradient)" strokeWidth="3.5" strokeLinecap="round" />

          {/* Interactive Hover Guides */}
          {profiles.map((p, idx) => {
            const x = getX(p.xNormalized);
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Transparent hit area */}
                <rect
                  x={x - width / (profiles.length * 2)}
                  y={paddingT}
                  width={width / profiles.length}
                  height={height}
                  fill="transparent"
                />

                {isHovered && (
                  <>
                    <line
                      x1={x}
                      y1={paddingT}
                      x2={x}
                      y2={svgHeight - paddingB}
                      stroke="#e0a83e"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle cx={x} cy={getY(p.th)} r="6" fill="#e08238" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={x} cy={getY(p.tc)} r="6" fill="#4fb3d9" stroke="#ffffff" strokeWidth="2" />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Info Card */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            السائل الساخن Th: <strong className="text-amber-400 font-semibold">{activeHover.th} {tempUnit}</strong>
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
            السائل البارد Tc: <strong className="text-cyan-300 font-semibold">{activeHover.tc} {tempUnit}</strong>
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            الفارق المحلي ΔT: <strong className="text-emerald-300 font-semibold">{activeHover.dT} {tempUnit}</strong>
          </span>
        </div>

        <div className="text-slate-400">
          الموقع: <strong className="text-slate-200">x/L = {(activeHover.xNormalized * 100).toFixed(0)}%</strong>
        </div>
      </div>
    </div>
  );
};
