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
    <div className="fixed inset-0 z-50 bg-st-dark/65 backdrop-blur-[2px] flex items-center justify-center p-3 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-st-white rounded-[24px] w-full max-w-md overflow-hidden shadow-[8px_8px_0px_#14402c] border-[3px] border-st-dark my-auto font-sora text-st-text"
      >
        {/* Header - Solid Forest Green */}
        <div className="bg-st-primary text-white p-4 sm:p-5 flex items-center justify-between border-b-[3px] border-st-dark">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-st-dark border-2 border-st-pale/40 flex items-center justify-center shadow-[2px_2px_0px_#14402c]">
              <FileText className="w-4 h-4 text-st-light" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                {record ? 'Edit Catatan Pemeliharaan' : 'Catat Pemeliharaan / Servis Baru'}
              </h3>
              <p className="text-st-pale text-[11px] tabular-nums font-mono font-bold">
                Baris #{nomorUrut} Kartu Pemeliharaan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-st-dark hover:bg-black border-2 border-st-dark flex items-center justify-center text-st-pale hover:text-white transition-all shadow-[1px_1px_0px_#14402c] active:translate-y-0.5"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3.5">
            {/* Nomor Urut */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                Nomor Baris (1-12)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={nomorUrut}
                onChange={(e) => setNomorUrut(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-bold tabular-nums text-st-text focus:outline-none focus:border-st-primary shadow-inner transition-colors"
              />
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                Tanggal Pekerjaan
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="DD-MM-YYYY"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-2.5 pr-8 bg-st-cream border-2 border-st-dark rounded-xl font-bold tabular-nums text-st-text focus:outline-none focus:border-st-primary shadow-inner transition-colors"
                />
                <Calendar className="w-4 h-4 text-st-dark absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Uraian Pekerjaan */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
              Uraian Pekerjaan <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Contoh: Cuci steam indoor & outdoor, tambah freon R32"
              value={uraianPekerjaan}
              onChange={(e) => setUraianPekerjaan(e.target.value)}
              className="w-full p-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-medium text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner leading-relaxed transition-colors"
            />
          </div>

          {/* Paraf Teknisi Otomatis */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
              Paraf Teknisi Resmi (Otomatis Terisi)
            </label>
            <div className="p-3 bg-st-cream/80 border-2 border-st-dark rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={FIXED_SIGNATURE_PATH}
                  alt="Paraf Resmi Teknisi"
                  className="h-8 max-w-[85px] object-contain"
                />
                <span className="text-xs text-st-text font-bold">
                  Yulianto (Teknisi Resmi)
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-st-dark bg-st-pale border border-st-dark px-2.5 py-1 rounded-lg font-extrabold shadow-[1px_1px_0px_#14402c]">
                <span className="w-1.5 h-1.5 rounded-full bg-st-primary"></span>
                Valid
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t-2 border-st-dark/20 flex items-center justify-between gap-2">
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
                className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl border-2 border-rose-600 flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#991b1b] active:translate-y-0.5 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </motion.button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2.5">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-st-white hover:bg-st-cream text-st-dark font-bold rounded-xl border-2 border-st-dark transition-all shadow-[2px_2px_0px_#14402c] active:translate-y-0.5 text-xs"
              >
                Batal
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-5 py-2.5 bg-st-primary hover:bg-st-dark text-white font-extrabold rounded-xl border-2 border-st-dark flex items-center gap-2 shadow-[3px_3px_0px_#14402c] active:translate-y-0.5 transition-all text-xs"
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
