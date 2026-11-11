import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, FileText, DollarSign, Layers } from 'lucide-react';
import { MaintenanceRecord } from '../types';
import { SignaturePad } from './SignaturePad';
import { SAMPLE_SIGNATURE } from '../db/db';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: MaintenanceRecord | null;
  unitId: string;
  nextNomorUrut?: number;
  onSave: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const QUICK_JOBS = [
  'Ganti dinamo drain',
  'Cleaning',
  'Isi freon',
  'Ganti kapasitor',
  'Perbaikan kebocoran pipa',
  'Flushing & Vakum sistem',
  'Ganti sensor thermistor',
  'Perbaikan kelistrikan / PCB'
];

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
  const [biaya, setBiaya] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [parafUrl, setParafUrl] = useState<string>(SAMPLE_SIGNATURE);
  const [keterangan, setKeterangan] = useState<string>('');
  const [status, setStatus] = useState<'Selesai' | 'Proses' | 'Menunggu Sparepart'>('Selesai');

  useEffect(() => {
    if (record) {
      setNomorUrut(record.nomorUrut || 1);
      setTanggal(record.tanggal || '');
      setUraianPekerjaan(record.uraianPekerjaan || '');
      setBiaya(record.biaya || 0);
      setQty(record.qty || 1);
      setParafUrl(record.parafUrl || SAMPLE_SIGNATURE);
      setKeterangan(record.keterangan || '');
      setStatus(record.status || 'Selesai');
    } else {
      // Default to today
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      setTanggal(`${dd}-${mm}-${yyyy}`);
      setNomorUrut(nextNomorUrut);
      setUraianPekerjaan('');
      setBiaya(0);
      setQty(1);
      setParafUrl(SAMPLE_SIGNATURE);
      setKeterangan('');
      setStatus('Selesai');
    }
  }, [record, nextNomorUrut, isOpen]);

  if (!isOpen) return null;

  const totalHarga = (Number(biaya) || 0) * (Number(qty) || 1);

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
      biaya: Number(biaya) || 0,
      qty: Number(qty) || 1,
      totalHarga,
      parafUrl,
      keterangan: keterangan.trim(),
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="bg-brand-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {record ? 'Edit Catatan Pemeliharaan' : 'Catat Pemeliharaan / Servis Baru'}
              </h3>
              <p className="text-blue-100 text-[11px]">Baris #{nomorUrut} Kartu Pemeliharaan</p>
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
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 max-h-[82vh] overflow-y-auto">
          {/* Row 1: Nomor & Tanggal */}
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
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
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
                  placeholder="DD-MM-YYYY (cth: 29-01-2026)"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Uraian Pekerjaan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Uraian Pekerjaan / Sparepart
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ganti dinamo drain, Cleaning, Isi freon..."
              value={uraianPekerjaan}
              onChange={(e) => setUraianPekerjaan(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium text-slate-900"
            />
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_JOBS.map((job) => (
                <button
                  type="button"
                  key={job}
                  onClick={() => setUraianPekerjaan(job)}
                  className="text-[11px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-brand-800 border border-slate-200 hover:border-blue-300 px-2 py-0.5 rounded-full transition-colors"
                >
                  + {job}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Quantity (User's feature request) */}
          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 space-y-2.5">
            <div className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-brand-700" />
              Biaya Perbaikan & Perhitungan Total
            </div>

            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-6">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Harga Satuan (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  placeholder="0"
                  value={biaya || ''}
                  onChange={(e) => setBiaya(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-medium"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 text-center">
                  Qty
                </label>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>

              <div className="col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 text-right">
                  Total Biaya
                </label>
                <div className="text-xs font-bold font-mono text-brand-900 bg-white border border-blue-200 rounded-lg py-1.5 px-2.5 text-right">
                  Rp {totalHarga.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          {/* Status & Keterangan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Pekerjaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
              >
                <option value="Selesai">✅ Selesai</option>
                <option value="Proses">🔄 Sedang Dikerjakan</option>
                <option value="Menunggu Sparepart">⏳ Menunggu Sparepart</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Tekanan Freon
              </label>
              <input
                type="text"
                placeholder="Cth: Freon 130 psi"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Paraf Digital Pad */}
          <div className="pt-1">
            <SignaturePad
              initialValue={parafUrl}
              onSave={(dataUrl) => setParafUrl(dataUrl)}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {record && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Yakin ingin menghapus catatan servis ini?')) {
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
                className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-colors"
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
