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
  const [qrCodeId, setQrCodeId] = useState('');

  useEffect(() => {
    if (room) {
      setNamaRuangan(room.namaRuangan);
      setQrCodeId(room.qrCodeId);
    } else {
      setNamaRuangan('');
      setQrCodeId(`QR-ROOM-${Date.now().toString(36).toUpperCase()}`);
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
      qrCodeId: qrCodeId.trim() || `QR-ROOM-${Date.now().toString(36).toUpperCase()}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DoorClosed className="w-4 h-4 text-blue-200" />
            <h3 className="font-bold text-sm">
              {room ? 'Edit Data Ruangan' : 'Tambah Ruangan Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Ruangan / Lokasi
            </label>
            <input
              type="text"
              required
              value={namaRuangan}
              onChange={(e) => setNamaRuangan(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kode QR Ruangan
            </label>
            <input
              type="text"
              required
              value={qrCodeId}
              onChange={(e) => setQrCodeId(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-brand-800 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {room && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus ruangan "${room.namaRuangan}"?`)) {
                    onDelete(room.id);
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
                className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Ruangan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
