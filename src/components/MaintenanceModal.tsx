import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-sm border border-slate-200 my-auto"
      >
        {/* Header - Solid Forest Green */}
        <div className="bg-[#15803D] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#14532D]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {record ? 'Edit Catatan Pemeliharaan' : 'Catat Pemeliharaan / Servis Baru'}
              </h3>
              <p className="text-emerald-100 text-[11px] tabular-nums font-mono">
                Baris #{nomorUrut} Kartu Pemeliharaan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {/* Nomor Urut */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nomor Baris (1-12)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={nomorUrut}
                onChange={(e) => setNomorUrut(parseInt(e.target.value) || 1)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-semibold tabular-nums text-slate-900 transition-colors"
              />
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tanggal Pekerjaan
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="DD-MM-YYYY"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-2 pr-8 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium tabular-nums text-slate-900 transition-colors"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Uraian Pekerjaan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Uraian Pekerjaan
            </label>
            <textarea
              required
              rows={4}
              placeholder="Contoh: Cuci steam indoor & outdoor, tambah freon R32"
              value={uraianPekerjaan}
              onChange={(e) => setUraianPekerjaan(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-normal text-slate-900 leading-relaxed transition-colors"
            />
          </div>

          {/* Paraf Teknisi Otomatis */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Paraf Teknisi Resmi (Otomatis Terisi)
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={FIXED_SIGNATURE_PATH}
                  alt="Paraf Resmi Teknisi"
                  className="h-8 max-w-[85px] object-contain"
                />
                <span className="text-[11px] text-slate-700 font-semibold">
                  Yulianto (Teknisi Resmi)
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Valid
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            {record && onDelete ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  if (confirm('Hapus catatan servis ini?')) {
                    onDelete(record.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg flex items-center gap-1.5 transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </motion.button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-xs"
              >
                Batal
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-4 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Catatan</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
