import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, DoorClosed } from 'lucide-react';
import { Room } from '../types';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room | null;
  onSave: (roomData: Omit<Room, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  room,
  onSave,
  onDelete
}) => {
  const [namaRuangan, setNamaRuangan] = useState('');

  useEffect(() => {
    if (room) {
      setNamaRuangan(room.namaRuangan);
    } else {
      setNamaRuangan('');
    }
  }, [room, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaRuangan.trim()) {
      alert('Nama ruangan wajib diisi');
      return;
    }

    onSave({
      id: room ? room.id : undefined,
      namaRuangan: namaRuangan.trim(),
      qrCodeId: room?.qrCodeId || `ROOM-${Date.now().toString(36).toUpperCase()}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-emerald-100 my-auto">
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <DoorClosed className="w-4 h-4 text-emerald-300" />
            </div>
            <h3 className="font-bold text-sm">
              {room ? 'Edit Data Ruangan' : 'Tambah Ruangan Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Nama Ruangan / Lokasi *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ruang Direktur, Ruang Server, Ruang Rapat"
              value={namaRuangan}
              onChange={(e) => setNamaRuangan(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
            {room && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus ruangan "${room.namaRuangan}" beserta seluruh data unit AC di dalamnya?`)) {
                    onDelete(room.id);
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
                <span>Simpan Ruangan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
