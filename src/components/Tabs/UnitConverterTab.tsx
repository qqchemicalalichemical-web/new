import React, { useState } from 'react';
import { UnitCategory } from '../../types';
import { unitCategoriesData, CategoryUnits } from '../../data/unitConverterData';
import { ArrowRightLeft, Layers, Sparkles, Copy, Check } from 'lucide-react';

export const UnitConverterTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory>('Length');

  const currentCategoryData: CategoryUnits = unitCategoriesData.find(c => c.category === selectedCategory) || unitCategoriesData[0];

  const [fromUnitIdx, setFromUnitIdx] = useState(0);
  const [toUnitIdx, setToUnitIdx] = useState(1);
  const [inputValue, setInputValue] = useState(1);
  const [copied, setCopied] = useState(false);

  // Conversion logic
  const fromUnit = currentCategoryData.units[fromUnitIdx] || currentCategoryData.units[0];
  const toUnit = currentCategoryData.units[toUnitIdx] || currentCategoryData.units[1] || currentCategoryData.units[0];

  const baseVal = fromUnit.toBase(inputValue);
  const convertedResult = toUnit.fromBase(baseVal);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${inputValue} ${fromUnit.symbol} = ${convertedResult} ${toUnit.symbol}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 dir-rtl font-mono">
      {/* Category Selection Sub-Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-500" />
            محول الوحدات الهندسية الكامل (Engineering Appendix Converter - 25+ Categories)
          </h2>
          <span className="text-[10px] text-slate-400">تحويل فوري فائق الدقة</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {unitCategoriesData.map(cat => (
            <button
              key={cat.category}
              onClick={() => {
                setSelectedCategory(cat.category);
                setFromUnitIdx(0);
                setToUnitIdx(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedCategory === cat.category
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat.nameAr}
            </button>
          ))}
        </div>
      </div>

      {/* Converter Main Interactive Card */}
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-amber-400">
            فئة التحويل الحالية: {currentCategoryData.nameAr}
          </h3>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ النتيجة'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* FROM Unit Input */}
          <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-[11px] text-slate-400 block">القيمة والوحدة الأصلية (From):</label>
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(+e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xl font-bold text-slate-100 outline-none focus:border-amber-500"
            />
            <select
              value={fromUnitIdx}
              onChange={e => setFromUnitIdx(+e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-400 font-bold outline-none"
            >
              {currentCategoryData.units.map((u, idx) => (
                <option key={`from-${idx}`} value={idx}>
                  {u.nameAr} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button Icon */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={() => {
                const temp = fromUnitIdx;
                setFromUnitIdx(toUnitIdx);
                setToUnitIdx(temp);
              }}
              className="p-3 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 rounded-full border border-amber-500/30 transition shadow-lg"
              title="تبديل الوحدات"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* TO Unit Result */}
          <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-2">
            <label className="text-[11px] text-slate-400 block">النتيجة المحولة (To):</label>
            <div className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xl font-bold text-amber-400 overflow-x-auto">
              {Number.isFinite(convertedResult) ? convertedResult.toLocaleString('en-US', { maximumFractionDigits: 6 }) : '0'}
            </div>
            <select
              value={toUnitIdx}
              onChange={e => setToUnitIdx(+e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-300 font-bold outline-none"
            >
              {currentCategoryData.units.map((u, idx) => (
                <option key={`to-${idx}`} value={idx}>
                  {u.nameAr} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Grid Summary of all units in category */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-bold">جدول التكافؤ الشامل لجميع وحدات {currentCategoryData.nameAr}:</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            {currentCategoryData.units.map((u, idx) => {
              const val = u.fromBase(baseVal);
              return (
                <div key={`grid-u-${idx}`} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">{u.nameAr}:</span>
                  <span className="font-bold text-slate-200">{val.toFixed(4)} {u.symbol}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
