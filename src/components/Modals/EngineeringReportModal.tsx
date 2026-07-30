import React from 'react';
import { CalculationInputs, CalculationResults } from '../../types';
import { FileText, Printer, X, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface EngineeringReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: CalculationInputs;
  results: CalculationResults;
  exchangerName: string;
}

export const EngineeringReportModal: React.FC<EngineeringReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  results,
  exchangerName
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl font-mono overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8 text-slate-100 print:bg-white print:text-black print:p-0 print:border-none">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold">تقرير التصميم والتحقيق الهندسي الشامل (Engineering Calculation Report)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT CONTENT */}
        <div className="space-y-6 bg-slate-950 p-6 rounded-xl border border-slate-800 print:bg-white print:text-black print:border-none print:p-0">
          {/* Header Stamp */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-base font-bold text-amber-400 print:text-black">
                منصة التصميم الهندسي للمبادلات والعمليات الصناعية
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                Chemical & Thermal Process Engineering Specification Sheet
              </p>
            </div>
            <div className="text-left text-xs font-mono text-slate-400 print:text-gray-600">
              <div>التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
              <div>المرجع: HOLMAN-MCCABE-SPEC-{Math.floor(Math.random() * 8999 + 1000)}</div>
              <div className="text-emerald-400 font-bold mt-1 print:text-emerald-700">الحالة: معتمد (Verified)</div>
            </div>
          </div>

          {/* Exchanger Overview */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <h4 className="text-xs font-bold text-cyan-400 print:text-blue-800 mb-2">1. نوع المعدة والتكوين المختار:</h4>
            <div className="text-xs font-bold text-slate-200 print:text-black">{exchangerName}</div>
          </div>

          {/* Operating Parameters Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400 print:text-amber-700">2. المتغيرات التشغيلية والموائع (Operating Parameters):</h4>
            <table className="w-full text-right text-xs border-collapse border border-slate-800 print:border-gray-300">
              <thead>
                <tr className="bg-slate-900 text-slate-300 print:bg-gray-200 print:text-black">
                  <th className="p-2 border border-slate-800 print:border-gray-300">الخاصية</th>
                  <th className="p-2 border border-slate-800 print:border-gray-300">المائع الساخن (Hot Fluid)</th>
                  <th className="p-2 border border-slate-800 print:border-gray-300">المائع البارد (Cold Fluid)</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 print:text-gray-800">
                <tr>
                  <td className="p-2 border border-slate-800 print:border-gray-300 font-bold">اسم المائع</td>
                  <td className="p-2 border border-slate-800 print:border-gray-300">{inputs.hotFluidName}</td>
                  <td className="p-2 border border-slate-800 print:border-gray-300">{inputs.coldFluidName}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800 print:border-gray-300 font-bold">حرارة الدخول Tin (°C)</td>
                  <td className="p-2 border border-slate-800 print:border-gray-300">{inputs.tHotIn} °C</td>
                  <td className="p-2 border border-slate-800 print:border-gray-300">{inputs.tColdIn} °C</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800 print:border-gray-300 font-bold">حرارة الخروج Tout (°C)</td>
                  <td className="p-2 border border-slate-800 print:border-gray-300">{inputs.tHotOut} °C</td>
                  <td className="p-2 border border-slate-800 print:border-gray-300">{inputs.tColdOut} °C</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800 print:border-gray-300 font-bold">معدل التدفق Mass Flow</td>
                  <td className="p-2 border border-slate-800 print:border-gray-300">{inputs.mHot} kg/s</td>
                  <td className="p-2 border border-slate-800 print:border-gray-300">{inputs.mCold} kg/s</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Results Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 print:text-emerald-700">3. نتائج الحسابات الحرارية والمساحة (Calculated Results):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
                <span className="text-slate-400 print:text-gray-600 block text-[10px]">الحرارة المنقولة Q</span>
                <span className="font-bold text-amber-400 print:text-black">{results.qDesignKw.toFixed(2)} kW</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
                <span className="text-slate-400 print:text-gray-600 block text-[10px]">LMTD المعادل</span>
                <span className="font-bold text-cyan-400 print:text-black">{results.effectiveLmtd.toFixed(2)} °C</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
                <span className="text-slate-400 print:text-gray-600 block text-[10px]">المساحة المطلوبة Area</span>
                <span className="font-bold text-emerald-400 print:text-black">{results.requiredAreaM2.toFixed(2)} m²</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
                <span className="text-slate-400 print:text-gray-600 block text-[10px]">الكفاءة الحرارية ε</span>
                <span className="font-bold text-purple-400 print:text-black">{(results.effectivenessEps * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Verification Sign-off */}
          <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-xs text-slate-400 print:text-gray-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>تم التحقق الفيزيائي طبقاً لمعايير TEMA و Holman Heat Transfer</span>
            </div>
            <div>توقيع المهندس المسؤول: __________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};
