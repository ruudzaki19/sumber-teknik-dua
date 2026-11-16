import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  QrCode,
  Calendar,
  User,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bon } from '../types';

interface BonListViewProps {
  bons: Bon[];
  isAdmin: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (bon: Bon) => void;
  onOpenPdf: (bon: Bon) => void;
  onOpenQR: (bon: Bon) => void;
  onDelete: (bonId: string) => void;
}

export const BonListView: React.FC<BonListViewProps> = ({
  bons,
  isAdmin,
  onOpenCreate,
  onOpenEdit,
  onOpenPdf,
  onOpenQR,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredBons = bons.filter((b) => {
    if (!q) return true;
    return (
      b.nomorBon.toLowerCase().includes(q) ||
      (b.kepadaYth && b.kepadaYth.toLowerCase().includes(q)) ||
      b.tanggal.toLowerCase().includes(q) ||
      (b.telpPelanggan && b.telpPelanggan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Controls: Search Bar & (+ Buat Bon Baru) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor bon, nama, atau tanggal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium text-slate-900 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-slate-400 hover:text-slate-600 absolute right-3 top-2 font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {/* Action: + Buat Bon Baru (Admin Only) */}
        {isAdmin && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCreate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Bon Baru</span>
          </motion.button>
        )}
      </div>

      {/* Empty State: No bons at all */}
      {bons.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center mx-auto mb-3 border border-emerald-200">
            <Receipt className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAdmin ? 'Belum Ada Bon Tercatat' : 'Belum Ada Data Bon'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {isAdmin
              ? 'Mulai catat transaksi nota servis atau pembelian sparepart dengan menekan tombol di bawah.'
              : 'Saat ini belum ada nota transaksi yang dicatat oleh admin teknisi.'}
          </p>
          {isAdmin && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onOpenCreate}
              className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Bon Sekarang</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Empty State: Search filter yields no results */}
      {bons.length > 0 && filteredBons.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          <p className="text-xs font-semibold text-slate-700">
            Tidak ada nota yang cocok dengan pencarian "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-emerald-700 font-semibold hover:underline"
          >
            Hapus kata kunci pencarian
          </button>
        </div>
      )}

      {/* Bons Cards Grid / List with Staggered Motion */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.04
            }
          }
        }}
      >
        <AnimatePresence>
          {filteredBons.map((bon) => {
            const itemCount = bon.items ? bon.items.length : 0;

            return (
              <motion.div
                key={bon.id}
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
                  }
                }}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors overflow-hidden flex flex-col justify-between"
              >
                {/* Card Header: Solid Industrial Forest Green */}
                <div className="bg-[#15803D] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#14532D]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-xs font-semibold text-emerald-100 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-600/40">
                        {bon.nomorBon}
                      </span>
                      <span className="text-[11px] text-emerald-100 flex items-center gap-1 font-medium tabular-nums">
                        <Calendar className="w-3 h-3 text-emerald-300" />
                        {bon.tanggal}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold uppercase text-white mt-1 truncate max-w-[260px]">
                      {bon.kepadaYth || 'Pelanggan Umum'}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-emerald-200 block uppercase font-semibold">TOTAL</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-white">
                      {formatRupiah(bon.totalJumlah)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1">
                  {/* Meta details & Status indicator */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="tabular-nums font-mono text-[11px]">
                        {bon.telpPelanggan || '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-[11px] font-medium text-slate-700">
                        Teknisi: {bon.namaTeknisi || 'Yulianto'}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Tercatat Resmi
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Rincian Pekerjaan ({itemCount} Item)
                    </span>
                    <div className="space-y-1">
                      {(bon.items || []).slice(0, 3).map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100"
                        >
                          <span className="font-medium text-slate-800 truncate max-w-[220px]">
                            <strong className="tabular-nums font-semibold">{it.banyaknya}x</strong>{' '}
                            {it.keterangan}
                          </span>
                          <span className="font-mono tabular-nums text-emerald-800 font-bold shrink-0">
                            {formatRupiah(it.jumlah)}
                          </span>
                        </div>
                      ))}
                      {itemCount > 3 && (
                        <p className="text-[11px] text-slate-400 italic text-center pt-0.5">
                          +{itemCount - 3} item lainnya...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Share QR Code Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onOpenQR(bon)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-xs"
                      title="QR Code & Link Nota Digital"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="hidden xs:inline">QR Link</span>
                    </motion.button>

                    {/* Download / Pratinjau Bon (JPG) */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onOpenPdf(bon)}
                      className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-xs"
                      title="Pratinjau & Download Gambar Bon (JPG)"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Unduh Bon</span>
                    </motion.button>
                  </div>

                  {/* Admin Actions: Edit & Delete */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onOpenEdit(bon)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (confirm(`Hapus bon nomor "${bon.nomorBon}" secara permanen?`)) {
                            onDelete(bon.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Bon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
