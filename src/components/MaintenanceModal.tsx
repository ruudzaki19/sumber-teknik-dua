import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, FileText } from 'lucide-react';
import { MaintenanceRecord } from '../types';
import { FIXED_SIGNATURE_PATH } from '../db/db';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: MaintenanceRecord | null;
  unitId: string;
  nextNomorUrut?: number;
  onSave: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  record,
  unitId,
  nextNomorUrut = 1,
  onSave,
  onDelete
}) => {
  const [nomorUrut, setNomorUrut] = useState<number>(nextNomorUrut);
  const [tanggal, setTanggal] = useState<string>('');
  const [uraianPekerjaan, setUraianPekerjaan] = useState<string>('');

  useEffect(() => {
    if (record) {
      setNomorUrut(record.nomorUrut || 1);
      setTanggal(record.tanggal || '');
      setUraianPekerjaan(record.uraianPekerjaan || '');
    } else {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      setTanggal(`${dd}-${mm}-${yyyy}`);
      setNomorUrut(nextNomorUrut);
      setUraianPekerjaan('');
    }
  }, [record, nextNomorUrut, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uraianPekerjaan.trim()) {
      alert('Mohon isi uraian pekerjaan');
      return;
    }

    onSave({
      id: record ? record.id : undefined,
      unitId,
      nomorUrut: Number(nomorUrut) || 1,
      tanggal,
      uraianPekerjaan: uraianPekerjaan.trim(),
      parafUrl: FIXED_SIGNATURE_PATH
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {record ? 'Edit Catatan Pemeliharaan' : 'Catat Pemeliharaan / Servis Baru'}
              </h3>
              <p className="text-blue-200 text-[11px]">Baris #{nomorUrut} Kartu Pemeliharaan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Row 1: Baris No & Tanggal */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Baris No.
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={nomorUrut}
                onChange={(e) => setNomorUrut(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center font-bold"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pekerjaan
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Uraian Pekerjaan: MULTILINE TEXTAREA (Bisa di-enter ke bawah) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Uraian Pekerjaan / Sparepart
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tulis uraian pekerjaan (tekan Enter untuk baris baru)"
              value={uraianPekerjaan}
              onChange={(e) => setUraianPekerjaan(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 leading-relaxed"
            />
          </div>

          {/* Fixed Paraf Preview (Image 3) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Paraf Teknisi</span>
              <span className="text-[11px] text-slate-400">Otomatis terisi paraf resmi</span>
            </div>
            <div className="bg-white p-1 px-3 rounded-lg border border-slate-300">
              <img
                src={FIXED_SIGNATURE_PATH}
                alt="Paraf"
                className="h-8 max-w-[80px] object-contain"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {record && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Hapus catatan servis ini?')) {
                    onDelete(record.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1.5 inline-flex items-center gap-1 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Catatan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
