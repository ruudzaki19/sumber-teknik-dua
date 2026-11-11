import React, { useState } from 'react';
import { X, Save, Download, Upload, RotateCcw, Building, ShieldCheck, Database, Check } from 'lucide-react';
import { CompanySettings } from '../types';
import { exportDatabaseBackup, importDatabaseBackup, seedInitialDataIfNeeded, db, DEFAULT_SETTINGS } from '../db/db';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onUpdateSettings: (newSettings: CompanySettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

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
    if (confirm('PERINGATAN: Ini akan mereset data ke contoh awal (Gedung Galeri, Ruang Admin, dll). Lanjutkan?')) {
      await db.rooms.clear();
      await db.acUnits.clear();
      await db.maintenanceRecords.clear();
      await db.settings.clear();
      await seedInitialDataIfNeeded();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="bg-brand-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-sm">Pengaturan & Backup Data</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* User Account Section */}
          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={user?.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'A')}`}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full border border-blue-300"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{user?.name}</div>
                  <div className="text-[11px] text-slate-500">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-xs text-red-600 hover:text-red-700 font-semibold px-2.5 py-1 rounded bg-white border border-red-200 shadow-sm"
              >
                Keluar Akun
              </button>
            </div>
          </div>

          {/* Kop Surat Settings */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
              Kop Surat & Cetak Kartu
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Perusahaan / Usaha
              </label>
              <input
                type="text"
                required
                value={formData.namaPerusahaan}
                onChange={(e) => setFormData({ ...formData, namaPerusahaan: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slogan / Sub-judul
                </label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Kartu Pemeliharaan
                </label>
                <input
                  type="text"
                  value={formData.tahunDefault}
                  onChange={(e) => setFormData({ ...formData, tahunDefault: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Baris 1
              </label>
              <input
                type="text"
                value={formData.alamat1}
                onChange={(e) => setFormData({ ...formData, alamat1: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Baris 2 / Kota
              </label>
              <input
                type="text"
                value={formData.alamat2}
                onChange={(e) => setFormData({ ...formData, alamat2: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  Kop Surat Berhasil Disimpan
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Simpan Perubahan Kop Surat
                </>
              )}
            </button>
          </form>

          {/* Database Backup & Restore */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-brand-700" />
              Penyimpanan Data Lokal & Cadangan
            </div>
            <p className="text-xs text-slate-500">
              Data tersimpan otomatis di perangkat HP / laptop ini. Download cadangan berkala agar data tidak hilang saat berganti perangkat.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-brand-700" />
                Download Backup (JSON)
              </button>

              <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                Pulihkan Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleResetData}
              className="text-xs text-slate-400 hover:text-red-600 inline-flex items-center gap-1 pt-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset ke contoh bawaan awal
            </button>
          </div>
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
