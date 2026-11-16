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
    <div className="fixed inset-0 z-50 bg-st-dark/65 backdrop-blur-[2px] flex items-center justify-center p-3 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-st-white rounded-[24px] w-full max-w-md overflow-hidden shadow-[8px_8px_0px_#14402c] border-[3px] border-st-dark my-auto font-sora text-st-text"
      >
        {/* Header - Solid Forest Green */}
        <div className="bg-st-primary text-white p-4 sm:p-5 flex items-center justify-between border-b-[3px] border-st-dark">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-st-dark border-2 border-st-pale/40 flex items-center justify-center shadow-[2px_2px_0px_#14402c]">
              <DoorClosed className="w-4 h-4 text-st-light" />
            </div>
            <div>
              <span className="text-[10px] text-st-pale uppercase tracking-wider font-extrabold block">
                MANAJEMEN RUANGAN
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                {room ? 'Edit Data Ruangan' : 'Tambah Ruangan Baru'}
              </h3>
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
              Nama Ruangan / Lokasi <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ruang Direktur, Ruang Server, Ruang Rapat"
              value={namaRuangan}
              onChange={(e) => setNamaRuangan(e.target.value)}
              className="w-full p-3 bg-st-cream border-2 border-st-dark rounded-xl font-bold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t-2 border-st-dark/20 flex items-center justify-between gap-2">
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
                className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl border-2 border-rose-600 flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#991b1b] active:translate-y-0.5 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
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
                <span>Simpan Ruangan</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
