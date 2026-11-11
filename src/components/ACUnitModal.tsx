import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Cpu, MapPin } from 'lucide-react';
import { ACUnit, Room } from '../types';

interface ACUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: ACUnit | null;
  defaultRoomId?: string;
  rooms: Room[];
  onSave: (unitData: Omit<ACUnit, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const COMMON_BRANDS = ['POLYTRON', 'DAIKIN', 'PANASONIC', 'GREE', 'SHARP', 'LG', 'MITSUBISHI', 'SAMSUNG', 'TOSHIBA', 'CHANGHONG', 'AUX'];
const COMMON_TYPES = ['KASET', 'SPLIT WALL', 'STANDING FLOOR', 'CEILING SUSPENDED', 'DUCTING / CENTRAL', 'PORTABLE'];
const COMMON_CAPACITIES = ['0.5 PK', '0.75 PK', '1 PK', '1.5 PK', '2 PK', '2.5 PK', '3 PK', '4 PK', '5 PK', '10 PK'];

export const ACUnitModal: React.FC<ACUnitModalProps> = ({
  isOpen,
  onClose,
  unit,
  defaultRoomId,
  rooms,
  onSave,
  onDelete
}) => {
  const [roomId, setRoomId] = useState<string>('');
  const [mitra, setMitra] = useState<string>('');
  const [jenisAc, setJenisAc] = useState<string>('KASET');
  const [merk, setMerk] = useState<string>('POLYTRON');
  const [typeModel, setTypeModel] = useState<string>('');
  const [kapasitas, setKapasitas] = useState<string>('5 PK');
  const [noSeri, setNoSeri] = useState<string>('');
  const [ruanganLokasi, setRuanganLokasi] = useState<string>('');
  const [qrCodeId, setQrCodeId] = useState<string>('');

  useEffect(() => {
    if (unit) {
      setRoomId(unit.roomId);
      setMitra(unit.mitra || '');
      setJenisAc(unit.jenisAc || 'KASET');
      setMerk(unit.merk || 'POLYTRON');
      setTypeModel(unit.typeModel || '');
      setKapasitas(unit.kapasitas || '5 PK');
      setNoSeri(unit.noSeri || '');
      setRuanganLokasi(unit.ruanganLokasi || '');
      setQrCodeId(unit.qrCodeId || '');
    } else {
      const selectedRoom = rooms.find(r => r.id === defaultRoomId) || rooms[0];
      setRoomId(selectedRoom?.id || '');
      setMitra('');
      setJenisAc('KASET');
      setMerk('POLYTRON');
      setTypeModel('');
      setKapasitas('5 PK');
      setNoSeri('');
      setRuanganLokasi(selectedRoom ? selectedRoom.namaRuangan.toUpperCase() : '');
      setQrCodeId(`AC-QR-${Date.now().toString(36).toUpperCase()}`);
    }
  }, [unit, defaultRoomId, rooms, isOpen]);

  // When room selection changes, update the default ruanganLokasi
  const handleRoomChange = (newRoomId: string) => {
    setRoomId(newRoomId);
    const found = rooms.find(r => r.id === newRoomId);
    if (found && (!ruanganLokasi || ruanganLokasi === '')) {
      setRuanganLokasi(found.namaRuangan.toUpperCase());
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merk.trim() || !ruanganLokasi.trim()) {
      alert('Mohon lengkapi merk dan ruangan/lokasi AC.');
      return;
    }

    onSave({
      id: unit ? unit.id : undefined,
      roomId: roomId || (rooms[0]?.id ?? 'room-default'),
      mitra: mitra.trim(),
      jenisAc: jenisAc.trim(),
      merk: merk.trim().toUpperCase(),
      typeModel: typeModel.trim(),
      kapasitas: kapasitas.trim(),
      noSeri: noSeri.trim(),
      ruanganLokasi: ruanganLokasi.trim().toUpperCase(),
      qrCodeId: qrCodeId.trim() || `AC-QR-${Date.now().toString(36).toUpperCase()}`
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
              <Cpu className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {unit ? 'Edit Data Unit AC' : 'Tambah Unit AC Baru'}
              </h3>
              <p className="text-blue-100 text-[11px]">Sesuai spesifikasi Kartu Pemeliharaan</p>
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
        <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[82vh] overflow-y-auto">
          {/* Room Assignment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              Kelompok Ruangan
            </label>
            <select
              value={roomId}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.namaRuangan} {r.gedungArea ? `(${r.gedungArea})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Mitra */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              MITRA / KLIEN (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Gedung Galeri, PT Sahabat, dll."
              value={mitra}
              onChange={(e) => setMitra(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Ruangan / Lokasi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              RUANGAN / LOKASI (Tercetak di Kartu)
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: GEDUNG GALERI (TENGAH)"
              value={ruanganLokasi}
              onChange={(e) => setRuanganLokasi(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 uppercase"
            />
          </div>

          {/* Merk & Jenis AC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MERK
              </label>
              <input
                type="text"
                list="brands-list"
                required
                placeholder="Contoh: POLYTRON"
                value={merk}
                onChange={(e) => setMerk(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold uppercase"
              />
              <datalist id="brands-list">
                {COMMON_BRANDS.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                JENIS AC
              </label>
              <input
                type="text"
                list="types-list"
                required
                placeholder="Contoh: KASET"
                value={jenisAc}
                onChange={(e) => setJenisAc(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold uppercase"
              />
              <datalist id="types-list">
                {COMMON_TYPES.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>

          {/* Kapasitas & Type Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                KAPASITAS
              </label>
              <input
                type="text"
                list="capacity-list"
                required
                placeholder="Contoh: 5 PK, 1 PK, 2 PK"
                value={kapasitas}
                onChange={(e) => setKapasitas(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              />
              <datalist id="capacity-list">
                {COMMON_CAPACITIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                TYPE / MODEL (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: PAC-50VZ"
                value={typeModel}
                onChange={(e) => setTypeModel(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* No Seri & QR Code ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NO. SERI (Opsional)
              </label>
              <input
                type="text"
                placeholder="Nomor seri bodi"
                value={noSeri}
                onChange={(e) => setNoSeri(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                KODE QR (ID Unik)
              </label>
              <input
                type="text"
                required
                value={qrCodeId}
                onChange={(e) => setQrCodeId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-brand-800 font-bold"
              />
            </div>
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
                className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-colors"
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
