import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, DoorClosed } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-sm border border-slate-200 my-auto"
      >
        <div className="bg-[#15803D] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#14532D]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center">
              <DoorClosed className="w-4 h-4 text-emerald-200" />
            </div>
            <h3 className="font-bold text-sm text-white">
              {room ? 'Edit Data Ruangan' : 'Tambah Ruangan Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nama Ruangan / Lokasi *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ruang Direktur, Ruang Server, Ruang Rapat"
              value={namaRuangan}
              onChange={(e) => setNamaRuangan(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-semibold text-slate-900 transition-colors"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            {room && onDelete ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  if (confirm(`Hapus ruangan "${room.namaRuangan}" beserta seluruh data unit AC di dalamnya?`)) {
                    onDelete(room.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg flex items-center gap-1.5 transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
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
                <span>Simpan Ruangan</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
