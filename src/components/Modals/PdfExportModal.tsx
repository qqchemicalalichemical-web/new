import React, { useState } from 'react';
import { CalculationInputs, CalculationResults, SavedProject } from '../../types';
import { generateStepByStep, recommendExchangerType } from '../../utils/heatExchangerEngine';
import { unitLabels } from '../../utils/unitConverter';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText, X, CheckCircle, Sparkles } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: CalculationInputs;
  results: CalculationResults;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  results
}) => {
  const [engineerName, setEngineerName] = useState('م. أحمد علي - مهندس عمليات');
  const [projectTitle, setProjectTitle] = useState('تقرير تصميم مبادل حراري هندسي');
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeStepByStep, setIncludeStepByStep] = useState(true);

  if (!isOpen) return null;

  const unit = unitLabels[inputs.unitSystem];
  const recommendation = recommendExchangerType(inputs);
  const steps = generateStepByStep(inputs, results);

  const handleExportPdf = async () => {
    setIsGenerating(true);
    try {
      const reportElement = document.getElementById('pdf-report-content');
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0e1a28'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Heat_Exchanger_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
            <FileText className="w-5 h-5" />
            تصدير تقرير النتائج الهندسي (PDF Report Export)
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Settings */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">اسم المهندس / المصمم</label>
              <input
                type="text"
                value={engineerName}
                onChange={e => setEngineerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-sans focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">عنوان المشروع / الوحدة</label>
              <input
                type="text"
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-sans focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              id="incSteps"
              checked={includeStepByStep}
              onChange={e => setIncludeStepByStep(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
            />
            <label htmlFor="incSteps" className="text-xs text-slate-300 cursor-pointer">
              تضمين خطوات الحسابات والمعادلات التفصيلية للطلاب والتدقيق الهندسي (Step-by-step breakdown)
            </label>
          </div>

          {/* Hidden HTML Template for html2canvas PDF capture */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950">
            <div className="text-xs font-mono text-slate-400 mb-2">معاينة التقرير القابل للتصدير (Report Preview):</div>
            <div id="pdf-report-content" className="p-6 bg-slate-900 text-slate-100 rounded-lg border border-slate-800 space-y-5 font-sans">
              <div className="flex justify-between items-start border-b border-amber-500/40 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-amber-500">{projectTitle}</h2>
                  <p className="text-xs text-slate-400 mt-1">المحاكي الهندسي للمبادلات الحرارية - Heat Exchanger Design Suite</p>
                </div>
                <div className="text-right text-xs font-mono text-slate-400">
                  <div>التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
                  <div>المصمم: {engineerName}</div>
                  <div>نظام الوحدات: {inputs.unitSystem}</div>
                </div>
              </div>

              {/* Input Specs */}
              <div>
                <h3 className="text-sm font-bold text-cyan-400 mb-2">1. مدخلات التصميم والظروف التشغيلية</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div>Th,in: <span className="text-amber-400">{inputs.thin} {unit.temp}</span></div>
                  <div>Th,out: <span className="text-amber-400">{inputs.thout} {unit.temp}</span></div>
                  <div>Tc,in: <span className="text-cyan-300">{inputs.tcin} {unit.temp}</span></div>
                  <div>Tc,out: <span className="text-cyan-300">{inputs.tcout} {unit.temp}</span></div>
                  <div>ṁh: <span>{inputs.mh} {unit.massFlow}</span></div>
                  <div>ṁc: <span>{inputs.mc} {unit.massFlow}</span></div>
                  <div>U المفترض: <span>{inputs.uAssumed} {unit.uCoef}</span></div>
                  <div>نوع التدفق: <span>{inputs.flowType}</span></div>
                </div>
              </div>

              {/* Main Results */}
              <div>
                <h3 className="text-sm font-bold text-emerald-400 mb-2">2. نتائج الحسابات الفنية (Calculated Results)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400">الحمل الحراري Q</div>
                    <div className="text-lg font-bold text-amber-500">{results.qDesignKw} {unit.heatDuty}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400">LMTD الفعّال</div>
                    <div className="text-lg font-bold text-cyan-400">{results.effectiveLmtd} {unit.tempDiff}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400">المساحة المطلوبة A</div>
                    <div className="text-lg font-bold text-emerald-400">{results.requiredAreaM2} {unit.area}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400">الفعالية (Effectiveness ε)</div>
                    <div className="text-lg font-bold text-slate-100">{(results.effectivenessEps * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400">عدد وحدات الانتقال NTU</div>
                    <div className="text-lg font-bold text-slate-100">{results.ntu}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400">عامل التصحيح F</div>
                    <div className="text-lg font-bold text-slate-100">{results.correctionFactorF}</div>
                  </div>
                </div>
              </div>

              {/* Smart Recommendation */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-amber-500/30">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4" />
                  التوصية الهندسية للمبادل: {recommendation.titleAr} (مطابقة {recommendation.matchScore}%)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{recommendation.descriptionAr}</p>
              </div>

              {/* Step By Step if checked */}
              {includeStepByStep && (
                <div>
                  <h3 className="text-sm font-bold text-cyan-400 mb-2">3. الشرح الرياضي خطوة بخطوة (Educational Steps)</h3>
                  <div className="space-y-2 text-xs font-mono">
                    {steps.slice(0, 4).map(step => (
                      <div key={step.stepNumber} className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <div className="font-bold text-amber-400">خطوة {step.stepNumber}: {step.titleAr}</div>
                        <div className="text-slate-300 mt-1">{step.substitutionAr}</div>
                        <div className="text-emerald-400 font-bold mt-0.5">{step.resultAr}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <span>جاري إنشاء ملف PDF...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                تصدير PDF الآن
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
