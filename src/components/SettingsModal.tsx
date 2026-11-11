import React from 'react';
import { X, Download, Upload, RotateCcw, Database } from 'lucide-react';
import { exportDatabaseBackup, importDatabaseBackup, clearAllRoomsAndUnits } from '../db/db';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const handleExportBackup = async () => {
    const jsonStr = await exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-ac-pemeliharaan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importDatabaseBackup(content);
      if (success) {
        alert('Data berhasil dipulihkan dari file backup!');
        window.location.reload();
      } else {
        alert('Gagal memulihkan data. Format file tidak sesuai.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (confirm('PERINGATAN: Ini akan mengosongkan semua data ruangan dan unit. Lanjutkan?')) {
      await clearAllRoomsAndUnits();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-sm">Backup & Cadangan Data</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">{user?.name}</span>
              <span className="text-[11px] text-slate-500">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded border border-red-200 bg-white"
            >
              Keluar
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Cadangan Database</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-brand-700" />
                Backup JSON
              </button>

              <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                Restore Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-slate-400 hover:text-red-600 inline-flex items-center gap-1 pt-2"
          >
            <RotateCcw className="w-3 h-3" />
            Kosongkan semua data
          </button>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
