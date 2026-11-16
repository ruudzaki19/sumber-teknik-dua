import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Cpu, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { ACUnit, Room } from '../types';

interface ACUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: ACUnit | null;
  targetRoom: Room;
  onSave: (unitData: Omit<ACUnit, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

export const ACUnitModal: React.FC<ACUnitModalProps> = ({
  isOpen,
  onClose,
  unit,
  targetRoom,
  onSave,
  onDelete
}) => {
  const [mitra, setMitra] = useState<string>('');
  const [jenisAc, setJenisAc] = useState<string>('');
  const [merk, setMerk] = useState<string>('');
  const [typeModel, setTypeModel] = useState<string>('');
  const [kapasitas, setKapasitas] = useState<string>('');
  const [noSeri, setNoSeri] = useState<string>('');
  const [ruanganLokasi, setRuanganLokasi] = useState<string>('');

  useEffect(() => {
    if (unit) {
      setMitra(unit.mitra || '');
      setJenisAc(unit.jenisAc || '');
      setMerk(unit.merk || '');
      setTypeModel(unit.typeModel || '');
      setKapasitas(unit.kapasitas || '');
      setNoSeri(unit.noSeri || '');
      setRuanganLokasi(unit.ruanganLokasi || targetRoom?.namaRuangan || '');
    } else {
      setMitra('');
      setJenisAc('');
      setMerk('');
      setTypeModel('');
      setKapasitas('');
      setNoSeri('');
      setRuanganLokasi(targetRoom ? targetRoom.namaRuangan : '');
    }
  }, [unit, targetRoom, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merk.trim() || !ruanganLokasi.trim()) {
      alert('Mohon isi merk AC dan nama ruangan/lokasi.');
      return;
    }

    onSave({
      id: unit ? unit.id : undefined,
      roomId: targetRoom.id,
      mitra: mitra.trim(),
      jenisAc: jenisAc.trim(),
      merk: merk.trim(),
      typeModel: typeModel.trim(),
      kapasitas: kapasitas.trim(),
      noSeri: noSeri.trim(),
      ruanganLokasi: ruanganLokasi.trim(),
      qrCodeId: unit?.qrCodeId || `AC-UNIT-${Date.now().toString(36).toUpperCase()}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-sm border border-slate-200 my-auto"
      >
        {/* Header - Solid Forest Green */}
        <div className="bg-[#15803D] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#14532D]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {unit ? 'Edit Spesifikasi Unit AC' : 'Tambah Unit AC Baru'}
              </h3>
              <p className="text-emerald-100 text-[11px]">
                Ruangan: {targetRoom.namaRuangan}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Target Ruangan Terkunci */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Ruangan Terpilih
            </label>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{targetRoom.namaRuangan}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mitra / Klien */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Mitra / Klien
              </label>
              <input
                type="text"
                placeholder="Nama Klien / Instansi"
                value={mitra}
                onChange={(e) => setMitra(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium text-slate-900 transition-colors"
              />
            </div>

            {/* Ruangan / Lokasi Tercetak di Kartu */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Lokasi Tercetak di Kartu *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Gallery / Lt. 2"
                value={ruanganLokasi}
                onChange={(e) => setRuanganLokasi(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-semibold text-slate-900 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Merk AC */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Merk AC *
              </label>
              <input
                type="text"
                required
                placeholder="Daikin, Panasonic, Sharp, dll"
                value={merk}
                onChange={(e) => setMerk(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-semibold text-slate-900 transition-colors"
              />
            </div>

            {/* Jenis AC */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Jenis AC
              </label>
              <input
                type="text"
                placeholder="Split, Cassette, Standing, dll"
                value={jenisAc}
                onChange={(e) => setJenisAc(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium text-slate-900 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Kapasitas */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Kapasitas
              </label>
              <input
                type="text"
                placeholder="1/2 PK, 1 PK, 2 PK"
                value={kapasitas}
                onChange={(e) => setKapasitas(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium tabular-nums text-slate-900 transition-colors"
              />
            </div>

            {/* Type / Model */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Type / Model
              </label>
              <input
                type="text"
                placeholder="Tipe Model"
                value={typeModel}
                onChange={(e) => setTypeModel(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium text-slate-900 transition-colors"
              />
            </div>

            {/* No. Seri */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                No. Seri Unit
              </label>
              <input
                type="text"
                placeholder="Nomor Seri"
                value={noSeri}
                onChange={(e) => setNoSeri(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono tabular-nums text-slate-900 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            {unit && onDelete ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  if (confirm(`Hapus unit AC "${unit.ruanganLokasi}" secara permanen?`)) {
                    onDelete(unit.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg flex items-center gap-1.5 transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Unit</span>
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
                <span>Simpan Unit AC</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
