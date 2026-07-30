import React, { useState, useEffect } from 'react';
import { engineeringMaterialsData } from '../../data/engineeringDatabase';
import { MaterialProperty } from '../../types';
import { Database, Search, Droplet, Flame, Grid, Copy, Check, Plus } from 'lucide-react';
import { AddMaterialModal } from '../Modals/AddMaterialModal';

export const EngineeringDatabaseTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customMaterials, setCustomMaterials] = useState<MaterialProperty[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('custom_engineering_materials');
    if (saved) {
      try {
        setCustomMaterials(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleAddMaterial = (newMat: MaterialProperty) => {
    const updated = [newMat, ...customMaterials];
    setCustomMaterials(updated);
    localStorage.setItem('custom_engineering_materials', JSON.stringify(updated));
  };

  const allMaterials = [...customMaterials, ...engineeringMaterialsData];

  const categories = ['All', 'Fluids', 'Gases', 'Refrigerants', 'Metals', 'Insulation', 'Pipes'];

  const filteredMaterials = allMaterials.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.nameAr.includes(searchQuery) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descriptionAr.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (item: MaterialProperty) => {
    const text = `${item.nameAr} (${item.nameEn})\nDensity: ${item.density} kg/m³\nSpecific Heat: ${item.specificHeat} J/kg·K\nThermal Conductivity: ${item.thermalConductivity} W/m·K${
      item.viscosity ? `\nViscosity: ${item.viscosity} Pa·s` : ''
    }`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 dir-rtl font-mono">
      {/* Database Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" />
              قاعدة بيانات الخصائص الحرارية والهندسية الشاملة (Engineering Property Database)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تضم الكثافة، السعة الحرارية، معامل التوصيل، اللزوجة، وعامل الاتساخ لجميع المواد والموائع المعيارية.
            </p>
          </div>

          {/* Search Box & Add Material Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مادة جديدة</span>
            </button>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث باسم المائع، المعدن، أو الغاز..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Category Pill Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat === 'All'
                ? 'الكل (All Materials)'
                : cat === 'Fluids'
                ? '💧 الموائع السائلة'
                : cat === 'Gases'
                ? '💨 الغازات'
                : cat === 'Refrigerants'
                ? '❄️ وسائط التبريد'
                : cat === 'Metals'
                ? '🧱 المعادن والأنابيب'
                : cat === 'Insulation'
                ? '🛡️ العوازل الحرارية'
                : '📐 الأنابيب (Pipes)'}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Table Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>عدد العناصر المعروضة: {filteredMaterials.length} عنصر</span>
          <span>المعايرة عند 25°C و 1 atm (Standard Conditions)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-amber-400 font-mono">
                <th className="p-3">المادة / المائع (Material / Fluid)</th>
                <th className="p-3">الفئة (Category)</th>
                <th className="p-3">الكثافة ρ (kg/m³)</th>
                <th className="p-3">السعة Cp (J/kg·K)</th>
                <th className="p-3">التوصيل k (W/m·K)</th>
                <th className="p-3">الزوجة μ (Pa·s)</th>
                <th className="p-3">عامل الاتساخ Rf (m²·K/W)</th>
                <th className="p-3 text-center">نسخ</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((item, idx) => (
                <tr key={`mat-${idx}`} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold text-slate-100">
                    <div>{item.nameAr}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.nameEn}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{item.descriptionAr}</div>
                  </td>
                  <td className="p-3 text-cyan-400 font-mono">
                    <span className="bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-200">{item.density.toLocaleString()}</td>
                  <td className="p-3 font-mono text-slate-200">{item.specificHeat.toLocaleString()}</td>
                  <td className="p-3 font-mono font-bold text-amber-400">{item.thermalConductivity}</td>
                  <td className="p-3 font-mono text-slate-300">
                    {item.viscosity ? item.viscosity.toExponential(2) : '—'}
                  </td>
                  <td className="p-3 font-mono text-rose-300">
                    {item.foulingFactor ? item.foulingFactor.toExponential(2) : '—'}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition"
                      title="نسخ الخصائص"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMaterial={handleAddMaterial}
      />
    </div>
  );
};
