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
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-emerald-100 my-auto">
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {record ? 'Edit Catatan Pemeliharaan' : 'Catat Pemeliharaan / Servis Baru'}
              </h3>
              <p className="text-emerald-200 text-[11px]">Baris #{nomorUrut} Kartu Pemeliharaan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {/* Nomor Urut */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nomor Baris (1-12)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={nomorUrut}
                onChange={(e) => setNomorUrut(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tanggal Pekerjaan
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="DD-MM-YYYY"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-2.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Uraian Pekerjaan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Uraian Pekerjaan
            </label>
            <textarea
              required
              rows={4}
              placeholder=""
              value={uraianPekerjaan}
              onChange={(e) => setUraianPekerjaan(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold uppercase leading-relaxed"
            />
          </div>

          {/* Paraf Teknisi Otomatis */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Paraf Teknisi Resmi (Otomatis Terisi)
            </label>
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={FIXED_SIGNATURE_PATH}
                  alt="Paraf Resmi Teknisi"
                  className="h-9 max-w-[100px] object-contain"
                />
                <span className="text-[11px] text-emerald-800 font-bold">
                  Tanda Tangan / Paraf Resmi Teknisi
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 bg-white border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                VALID
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
            {record && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Hapus catatan servis ini?')) {
                    onDelete(record.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Catatan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
