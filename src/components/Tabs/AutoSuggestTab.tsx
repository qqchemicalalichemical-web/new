import React from 'react';
import { CalculationInputs } from '../../types';
import { recommendExchangerType } from '../../utils/heatExchangerEngine';
import { Sparkles, CheckCircle, XCircle, ShieldAlert, Award } from 'lucide-react';

interface AutoSuggestTabProps {
  inputs: CalculationInputs;
  onSelectRecommendedType: (type: any) => void;
}

export const AutoSuggestTab: React.FC<AutoSuggestTabProps> = ({
  inputs,
  onSelectRecommendedType
}) => {
  const rec = recommendExchangerType(inputs);

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            محرك الاقتراح الهيدروليكي والحراري الذكي Smart Recommendation Engine
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            النوع الموصى به: <span className="text-amber-500">{rec.titleAr}</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">{rec.descriptionAr}</p>
        </div>

        {/* Match Score Badge */}
        <div className="flex flex-col items-center justify-center bg-slate-950 px-6 py-4 rounded-xl border border-amber-500/40 shadow-lg text-center">
          <Award className="w-7 h-7 text-amber-500 mb-1" />
          <div className="text-2xl font-bold font-mono text-amber-400">{rec.matchScore}%</div>
          <div className="text-[11px] text-slate-400">نسبة التوافق الهندسية</div>
        </div>
      </div>

      {/* Pros & Cons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pros */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            مزايا هذا المبادل بالنسبة لظروف مشروعك:
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {rec.prosAr.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-none" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons / Limitations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="font-bold text-sm text-rose-400 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            المحاذير والتحديات التشغيلية المتوقعة:
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {rec.consAr.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-none" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Alternative Options */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="font-bold text-sm text-slate-100">البدائل التصميمية الأخرى (Alternative Options):</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {rec.alternativesAr.map(alt => (
            <div
              key={alt.type}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="font-bold text-xs text-slate-200">{alt.titleAr}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">مطابقة: {alt.score}%</div>
              </div>

              <button
                onClick={() => onSelectRecommendedType(alt.type)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
              >
                اختيار
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
