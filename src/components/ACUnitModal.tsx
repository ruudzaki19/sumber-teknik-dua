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
      setRuanganLokasi(unit.ruanganLokasi || targetRoom?.namaRuangan?.toUpperCase() || '');
    } else {
      setMitra('');
      setJenisAc('');
      setMerk('');
      setTypeModel('');
      setKapasitas('');
      setNoSeri('');
      setRuanganLokasi(targetRoom ? targetRoom.namaRuangan.toUpperCase() : '');
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
      merk: merk.trim().toUpperCase(),
      typeModel: typeModel.trim(),
      kapasitas: kapasitas.trim(),
      noSeri: noSeri.trim(),
      ruanganLokasi: ruanganLokasi.trim().toUpperCase(),
      qrCodeId: unit?.qrCodeId || `AC-UNIT-${Date.now().toString(36).toUpperCase()}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {unit ? 'Edit Data Unit AC' : 'Tambah Unit AC Baru'}
              </h3>
              <p className="text-blue-200 text-[11px]">Sesuai spesifikasi Kartu Pemeliharaan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[82vh] overflow-y-auto">
          {/* Room (Locked) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              Ruangan (Terkunci pada ruangan yang dipilih)
            </label>
            <div className="w-full text-xs px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl font-bold text-brand-900 select-none">
              {targetRoom?.namaRuangan}
            </div>
          </div>

          {/* Mitra */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mitra / Klien
            </label>
            <input
              type="text"
              value={mitra}
              onChange={(e) => setMitra(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          {/* Ruangan / Lokasi (Tercetak di Kartu) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ruangan / Lokasi (Tercetak di Kartu)
            </label>
            <input
              type="text"
              required
              value={ruanganLokasi}
              onChange={(e) => setRuanganLokasi(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Merk & Jenis AC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Merk
              </label>
              <input
                type="text"
                required
                value={merk}
                onChange={(e) => setMerk(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis AC
              </label>
              <input
                type="text"
                required
                value={jenisAc}
                onChange={(e) => setJenisAc(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Kapasitas & Type Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapasitas
              </label>
              <input
                type="text"
                required
                value={kapasitas}
                onChange={(e) => setKapasitas(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type / Model (Opsional)
              </label>
              <input
                type="text"
                value={typeModel}
                onChange={(e) => setTypeModel(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* No Seri */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              No. Seri (Opsional)
            </label>
            <input
              type="text"
              value={noSeri}
              onChange={(e) => setNoSeri(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {unit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Hapus unit AC ini beserta seluruh riwayat pemeliharaannya?')) {
                    onDelete(unit.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1.5 inline-flex items-center gap-1 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Unit
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
                Simpan Unit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
