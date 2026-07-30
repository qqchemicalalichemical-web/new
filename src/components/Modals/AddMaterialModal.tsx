import React, { useState } from 'react';
import { MaterialProperty } from '../../types';
import { Plus, X, Database, Check } from 'lucide-react';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMaterial: (newMat: MaterialProperty) => void;
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({ isOpen, onClose, onAddMaterial }) => {
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<'Fluids' | 'Gases' | 'Refrigerants' | 'Metals' | 'Insulation' | 'Pipes'>('Fluids');
  const [density, setDensity] = useState<number>(1000);
  const [specificHeat, setSpecificHeat] = useState<number>(4180);
  const [thermalConductivity, setThermalConductivity] = useState<number>(0.6);
  const [viscosity, setViscosity] = useState<number>(0.001);
  const [foulingFactor, setFoulingFactor] = useState<number>(0.0001);
  const [descriptionAr, setDescriptionAr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !nameEn) return;

    const newMaterial: MaterialProperty = {
      id: `custom_${Date.now()}`,
      nameAr,
      nameEn,
      category,
      density,
      specificHeat,
      thermalConductivity,
      viscosity: viscosity > 0 ? viscosity : undefined,
      foulingFactor: foulingFactor > 0 ? foulingFactor : undefined,
      descriptionAr: descriptionAr || 'مادة هندسية مخصصة مضافة بواسطة المستخدم'
    };

    onAddMaterial(newMaterial);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl font-mono">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-500" />
            إضافة مادة جديدة لقاعدة البيانات الهندسية
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">اسم المادة بالعربية *</label>
              <input
                type="text"
                required
                placeholder="مثال: زيت المحركات الساخن"
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">English Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hot Engine Oil"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">الفئة (Category)</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 outline-none"
              >
                <option value="Fluids">💧 الموائع السائلة</option>
                <option value="Gases">💨 الغازات</option>
                <option value="Refrigerants">❄️ وسائط التبريد</option>
                <option value="Metals">🧱 المعادن والأنابيب</option>
                <option value="Insulation">🛡️ العوازل الحرارية</option>
                <option value="Pipes">📐 الأنابيب</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">الكثافة ρ (kg/m³)</label>
              <input
                type="number"
                step="any"
                value={density}
                onChange={e => setDensity(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Cp (J/kg·K)</label>
              <input
                type="number"
                step="any"
                value={specificHeat}
                onChange={e => setSpecificHeat(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">k (W/m·K)</label>
              <input
                type="number"
                step="any"
                value={thermalConductivity}
                onChange={e => setThermalConductivity(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">μ (Pa·s)</label>
              <input
                type="number"
                step="any"
                value={viscosity}
                onChange={e => setViscosity(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">الوصف / ملاحظات مخصصة</label>
            <input
              type="text"
              placeholder="وصف مختصر لمجال استخدام المادة"
              value={descriptionAr}
              onChange={e => setDescriptionAr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة المادة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
