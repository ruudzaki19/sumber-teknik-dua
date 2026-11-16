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
    <div className="fixed inset-0 z-50 bg-st-dark/65 backdrop-blur-[2px] flex items-center justify-center p-3 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-st-white rounded-[24px] w-full max-w-lg overflow-hidden shadow-[8px_8px_0px_#14402c] border-[3px] border-st-dark my-auto font-sora text-st-text"
      >
        {/* Header - Solid Forest Green */}
        <div className="bg-st-primary text-white p-4 sm:p-5 flex items-center justify-between border-b-[3px] border-st-dark">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-st-dark border-2 border-st-pale/40 flex items-center justify-center shadow-[2px_2px_0px_#14402c]">
              <Cpu className="w-4 h-4 text-st-light" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                {unit ? 'Edit Spesifikasi Unit AC' : 'Tambah Unit AC Baru'}
              </h3>
              <p className="text-st-pale text-[11px] font-bold">
                Ruangan: {targetRoom.namaRuangan}
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Target Ruangan Terkunci */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
              Ruangan Terpilih
            </label>
            <div className="p-2.5 bg-st-cream-dark border-2 border-st-dark rounded-xl text-st-dark font-extrabold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-st-primary" />
              <span>{targetRoom.namaRuangan}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Mitra / Klien */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                Mitra / Klien
              </label>
              <input
                type="text"
                placeholder="Nama Klien / Instansi"
                value={mitra}
                onChange={(e) => setMitra(e.target.value)}
                className="w-full p-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-semibold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
              />
            </div>

            {/* Ruangan / Lokasi Tercetak di Kartu */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                Lokasi Tercetak di Kartu <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Gallery / Lt. 2"
                value={ruanganLokasi}
                onChange={(e) => setRuanganLokasi(e.target.value)}
                className="w-full p-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-bold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Merk AC */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                Merk AC <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Daikin, Panasonic, Sharp, dll"
                value={merk}
                onChange={(e) => setMerk(e.target.value)}
                className="w-full p-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-bold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
              />
            </div>

            {/* Jenis AC */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                Jenis AC
              </label>
              <input
                type="text"
                placeholder="Split, Cassette, Standing, dll"
                value={jenisAc}
                onChange={(e) => setJenisAc(e.target.value)}
                className="w-full p-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-semibold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Kapasitas */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                Kapasitas
              </label>
              <input
                type="text"
                placeholder="1/2 PK, 1 PK, 2 PK"
                value={kapasitas}
                onChange={(e) => setKapasitas(e.target.value)}
                className="w-full p-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-bold tabular-nums text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
              />
            </div>

            {/* Type / Model */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                Type / Model
              </label>
              <input
                type="text"
                placeholder="Tipe Model"
                value={typeModel}
                onChange={(e) => setTypeModel(e.target.value)}
                className="w-full p-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-semibold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
              />
            </div>

            {/* No. Seri */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                No. Seri Unit
              </label>
              <input
                type="text"
                placeholder="Nomor Seri"
                value={noSeri}
                onChange={(e) => setNoSeri(e.target.value)}
                className="w-full p-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-mono tabular-nums font-bold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t-2 border-st-dark/20 flex items-center justify-between gap-2">
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
                className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl border-2 border-rose-600 flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#991b1b] active:translate-y-0.5 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Unit</span>
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
                <span>Simpan Unit AC</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
