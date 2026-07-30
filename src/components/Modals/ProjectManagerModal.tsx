import React, { useState } from 'react';
import { SavedProject, CalculationInputs } from '../../types';
import { presetProjects } from '../../data/presetProjects';
import { FolderOpen, Save, Download, Upload, Trash2, Plus, Sparkles, X, Check } from 'lucide-react';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInputs: CalculationInputs;
  onLoadProject: (inputs: CalculationInputs) => void;
  savedProjects: SavedProject[];
  onSaveProject: (project: SavedProject) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  currentInputs,
  onLoadProject,
  savedProjects,
  onSaveProject,
  onDeleteProject
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectNotes, setNewProjectNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'presets'>('load');

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    if (!newProjectName.trim()) return;
    const project: SavedProject = {
      id: `proj_${Date.now()}`,
      name: newProjectName.trim(),
      date: new Date().toLocaleDateString('ar-EG'),
      notes: newProjectNotes,
      inputs: { ...currentInputs }
    };
    onSaveProject(project);
    setNewProjectName('');
    setNewProjectNotes('');
    setActiveTab('load');
  };

  const handleExportJson = (project: SavedProject) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], 'UTF-8');
      fileReader.onload = e => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (parsed && parsed.inputs) {
            onSaveProject(parsed);
            onLoadProject(parsed.inputs);
            onClose();
          }
        } catch (err) {
          alert('خطأ في صيغة ملف JSON المستورد');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
            <FolderOpen className="w-5 h-5" />
            إدارة المشاريع والتصاميم (Project Manager)
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('load')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-t border-x ${
              activeTab === 'load'
                ? 'bg-slate-900 border-slate-700 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            المشاريع المحفوظة ({savedProjects.length})
          </button>

          <button
            onClick={() => setActiveTab('save')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-t border-x ${
              activeTab === 'save'
                ? 'bg-slate-900 border-slate-700 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            حفظ التصميم الحالي
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-t border-x ${
              activeTab === 'presets'
                ? 'bg-slate-900 border-slate-700 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            قوالب جاهزة (Presets)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'save' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">اسم المشروع</label>
                <input
                  type="text"
                  placeholder="مثال: مبادل مصفاة التكرير E-101"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">ملاحظات هندسية (اختياري)</label>
                <textarea
                  rows={3}
                  placeholder="ملاحظات حول سائل التشغيل أو متطلبات الموقع..."
                  value={newProjectNotes}
                  onChange={e => setNewProjectNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-amber-500 outline-none"
                />
              </div>

              <button
                onClick={handleSaveCurrent}
                disabled={!newProjectName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-2.5 rounded-xl shadow-lg transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                حفظ التصميم في الذاكرة المحلية
              </button>
            </div>
          )}

          {activeTab === 'load' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">قائمة التصاميم المخزنة:</span>

                {/* Import JSON */}
                <label className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  استيراد مشروع JSON
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>

              {savedProjects.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">لا توجد مشاريع محفوظة بعد. قم بحفظ مشروعك الأول الآن!</div>
              ) : (
                savedProjects.map(proj => (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-100">{proj.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{proj.date} | {proj.notes || 'بدون ملاحظات'}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onLoadProject(proj.inputs);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition"
                      >
                        تحميل
                      </button>

                      <button
                        onClick={() => handleExportJson(proj)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title="تصدير JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-mono mb-2">اختر أحد المشاريع القوالب الجاهزة للتحميل السريع:</div>
              {presetProjects.map(preset => (
                <div
                  key={preset.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-500/50 transition flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-bold text-sm text-amber-400">{preset.name}</div>
                    <p className="text-xs text-slate-400 mt-1">{preset.notes}</p>
                  </div>

                  <button
                    onClick={() => {
                      onLoadProject(preset.inputs);
                      onClose();
                    }}
                    className="flex-none px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-xs rounded-lg shadow transition"
                  >
                    تطبيق القالب
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
