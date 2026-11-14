import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Cpu, MapPin } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-emerald-100 my-auto">
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {unit ? 'Edit Spesifikasi Unit AC' : 'Tambah Unit AC Baru'}
              </h3>
              <p className="text-emerald-200 text-[11px]">
                Ruangan: {targetRoom.namaRuangan}
              </p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Target Ruangan Terkunci */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Ruangan (Terkunci)
            </label>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{targetRoom.namaRuangan}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mitra / Klien */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Mitra / Klien
              </label>
              <input
                type="text"
                placeholder="Contoh: PT. ABC / Bpk. Rudi"
                value={mitra}
                onChange={(e) => setMitra(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            {/* Ruangan / Lokasi Tercetak di Kartu */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Lokasi Tercetak di Kartu *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: RUANG ADMIN / LT. 2"
                value={ruanganLokasi}
                onChange={(e) => setRuanganLokasi(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Merk AC */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Merk AC *
              </label>
              <input
                type="text"
                required
                placeholder="Daikin, Panasonic, Sharp, dll"
                value={merk}
                onChange={(e) => setMerk(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>

            {/* Jenis AC */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Jenis AC
              </label>
              <input
                type="text"
                placeholder="Split Wall, Cassette, Standing, dll"
                value={jenisAc}
                onChange={(e) => setJenisAc(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Kapasitas */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Kapasitas
              </label>
              <input
                type="text"
                placeholder="1/2 PK, 1 PK, 2 PK, dll"
                value={kapasitas}
                onChange={(e) => setKapasitas(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            {/* Type / Model */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Type / Model
              </label>
              <input
                type="text"
                placeholder="Model / Tipe"
                value={typeModel}
                onChange={(e) => setTypeModel(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            {/* No. Seri */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                No. Seri Unit
              </label>
              <input
                type="text"
                placeholder="Nomor Seri"
                value={noSeri}
                onChange={(e) => setNoSeri(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
            {unit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus unit AC "${unit.ruanganLokasi}" secara permanen?`)) {
                    onDelete(unit.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Unit</span>
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
                <span>Simpan Unit AC</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
