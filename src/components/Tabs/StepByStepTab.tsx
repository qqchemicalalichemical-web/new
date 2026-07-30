import React from 'react';
import { CalculationInputs, CalculationResults } from '../../types';
import { generateStepByStep } from '../../utils/heatExchangerEngine';
import { GraduationCap, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

interface StepByStepTabProps {
  inputs: CalculationInputs;
  results: CalculationResults;
}

export const StepByStepTab: React.FC<StepByStepTabProps> = ({ inputs, results }) => {
  const steps = generateStepByStep(inputs, results);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-6 rounded-2xl shadow-xl flex items-start gap-4">
        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            الشرح التفصيلي للحسابات خطوة بخطوة (Step-by-Step Engineering Calculation Breakdown)
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            صُمم هذا القسم لمساعدة الطلاب والمهندسين على استيعاب المعادلات الأساسية وتتبع خطوات التعويض الرياضي بالتفصيل للتحقق التدقيقي.
          </p>
        </div>
      </div>

      {/* Step Cards List */}
      <div className="space-y-4">
        {steps.map(step => (
          <div
            key={step.stepNumber}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-600/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/30">
                  {step.stepNumber}
                </span>
                <h3 className="font-bold text-sm text-slate-100">{step.titleAr}</h3>
              </div>

              <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/20">
                النتيجة: {step.resultAr}
              </span>
            </div>

            {/* Substitution Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-400 block mb-1">الصيغة الرياضية القياسية:</span>
                <div className="text-amber-400 font-bold text-sm bg-slate-900 p-2 rounded border border-slate-800 dir-ltr text-left">
                  {step.formulaTex}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">التعويض بالقيم الرقمية للمشروع:</span>
                <div className="text-cyan-300 font-semibold text-xs bg-slate-900 p-2 rounded border border-slate-800 dir-ltr text-left overflow-x-auto">
                  {step.substitutionAr}
                </div>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
              <BookOpen className="w-4 h-4 text-amber-500 flex-none mt-0.5" />
              <p className="leading-relaxed">{step.explanationAr}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
