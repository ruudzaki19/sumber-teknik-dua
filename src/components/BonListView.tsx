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
  Phone,
  CheckCircle2
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
    <div className="space-y-6 font-sora text-st-text">
      {/* Top Controls: Search Bar & (+ Buat Bon Baru) */}
      <div className="bg-st-white p-4 sm:p-5 rounded-[20px] border-[3px] border-st-dark shadow-[6px_6px_0px_#14402c] flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-st-dark absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor bon, nama, atau tanggal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-14 py-2.5 text-xs bg-st-cream border-2 border-st-dark rounded-xl font-semibold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-st-dark hover:text-rose-600 absolute right-3 top-2.5 font-bold px-1.5 py-0.5 rounded bg-st-cream-dark border border-st-dark"
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-st-primary hover:bg-st-dark text-white text-xs font-extrabold rounded-xl border-2 border-st-dark shadow-[3px_3px_0px_#14402c] active:translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Bon Baru</span>
          </motion.button>
        )}
      </div>

      {/* Empty State: No bons at all */}
      {bons.length === 0 && (
        <div className="bg-st-white rounded-[20px] border-[3px] border-dashed border-st-dark p-12 text-center shadow-[6px_6px_0px_#14402c]">
          <div className="w-14 h-14 bg-st-pale text-st-dark rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-st-dark shadow-[3px_3px_0px_#14402c]">
            <Receipt className="w-7 h-7 text-st-primary" />
          </div>
          <h3 className="text-base font-extrabold text-st-text uppercase tracking-tight">
            {isAdmin ? 'Belum Ada Bon Tercatat' : 'Belum Ada Data Bon'}
          </h3>
          <p className="text-xs text-st-text-muted max-w-sm mx-auto mt-1 mb-5 font-medium">
            {isAdmin
              ? 'Mulai catat transaksi nota servis atau pembelian sparepart dengan menekan tombol di bawah.'
              : 'Saat ini belum ada nota transaksi yang dicatat oleh admin teknisi.'}
          </p>
          {isAdmin && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onOpenCreate}
              className="px-5 py-2.5 bg-st-primary hover:bg-st-dark text-white text-xs font-extrabold rounded-xl inline-flex items-center gap-2 border-2 border-st-dark shadow-[3px_3px_0px_#14402c] active:translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Bon Sekarang</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Empty State: Search filter yields no results */}
      {bons.length > 0 && filteredBons.length === 0 && (
        <div className="bg-st-white rounded-[20px] border-[3px] border-st-dark p-8 text-center text-st-text-muted shadow-[6px_6px_0px_#14402c]">
          <p className="text-xs font-bold text-st-text">
            Tidak ada nota yang cocok dengan pencarian "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-st-primary font-extrabold hover:underline"
          >
            Hapus kata kunci pencarian
          </button>
        </div>
      )}

      {/* Bons Cards Grid / List with Staggered Motion */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
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
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.25, ease: 'easeOut' }
                  }
                }}
                className="bg-st-white rounded-[20px] border-[3px] border-st-dark shadow-[6px_6px_0px_#14402c] hover:shadow-[8px_8px_0px_#14402c] transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Card Header: Solid Industrial Forest Green */}
                <div className="bg-st-primary text-white p-4 px-5 flex items-center justify-between border-b-[3px] border-st-dark">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-xs font-extrabold text-white bg-st-dark px-2.5 py-0.5 rounded-lg border border-st-pale/40">
                        {bon.nomorBon}
                      </span>
                      <span className="text-[11px] text-st-pale flex items-center gap-1 font-bold tabular-nums">
                        <Calendar className="w-3.5 h-3.5 text-st-light" />
                        {bon.tanggal}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold uppercase text-white mt-1.5 truncate max-w-[260px] tracking-tight">
                      {bon.kepadaYth || 'Pelanggan Umum'}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-st-pale block uppercase font-extrabold tracking-wider">
                      TOTAL
                    </span>
                    <span className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-white">
                      {formatRupiah(bon.totalJumlah)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 space-y-3.5 flex-1">
                  {/* Meta details & Status indicator */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-st-text-muted gap-2 pb-3 border-b-2 border-st-dark/15">
                    <div className="flex items-center gap-1.5 font-bold text-st-text">
                      <Phone className="w-3.5 h-3.5 text-st-primary" />
                      <span className="tabular-nums font-mono text-xs">
                        {bon.telpPelanggan || '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-st-text">
                      <User className="w-3.5 h-3.5 text-st-primary" />
                      <span className="text-xs">
                        Teknisi: <strong className="font-bold">{bon.namaTeknisi || 'Yulianto'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-st-text-muted uppercase tracking-wider block">
                      Rincian Pekerjaan ({itemCount} Item)
                    </span>
                    <div className="space-y-1.5">
                      {(bon.items || []).slice(0, 3).map((it, idx) => {
                        const qtyStr = String(it.banyaknya || '1').trim();
                        const formattedQty = /^\d+(\.\d+)?$/.test(qtyStr) ? `${qtyStr}x` : qtyStr;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs bg-st-cream/80 p-2.5 rounded-xl border border-st-dark/25"
                          >
                            <span className="font-medium text-st-text truncate max-w-[220px]">
                              <strong className="tabular-nums font-extrabold text-st-dark">{formattedQty}</strong>{' '}
                              {it.keterangan}
                            </span>
                            <span className="font-mono tabular-nums text-st-primary font-extrabold shrink-0">
                              {formatRupiah(it.jumlah)}
                            </span>
                          </div>
                        );
                      })}
                      {itemCount > 3 && (
                        <p className="text-[11px] text-st-text-muted italic text-center pt-0.5 font-medium">
                          +{itemCount - 3} item lainnya...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3.5 bg-st-cream-dark border-t-2 border-st-dark flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Share QR Code Button */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onOpenQR(bon)}
                      className="px-3 py-1.5 bg-st-white hover:bg-st-cream text-st-dark border-2 border-st-dark rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-[2px_2px_0px_#14402c] active:translate-y-0.5"
                      title="QR Code & Link Nota Digital"
                    >
                      <QrCode className="w-3.5 h-3.5 text-st-primary" />
                      <span className="hidden xs:inline">QR Link</span>
                    </motion.button>

                    {/* Download / Pratinjau Bon (JPG) */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onOpenPdf(bon)}
                      className="px-3 py-1.5 bg-st-primary hover:bg-st-dark text-white border-2 border-st-dark rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-[2px_2px_0px_#14402c] active:translate-y-0.5"
                      title="Pratinjau & Download Gambar Bon (JPG)"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                      <span>Unduh Bon</span>
                    </motion.button>
                  </div>

                  {/* Admin Actions: Edit & Delete */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onOpenEdit(bon)}
                        className="px-3 py-1.5 bg-st-white hover:bg-st-cream text-st-dark border-2 border-st-dark rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-[2px_2px_0px_#14402c] active:translate-y-0.5"
                      >
                        <Edit className="w-3.5 h-3.5 text-st-dark" />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          if (confirm(`Hapus bon nomor "${bon.nomorBon}" secara permanen?`)) {
                            onDelete(bon.id);
                          }
                        }}
                        className="p-1.5 bg-st-white hover:bg-rose-100 text-rose-600 border-2 border-st-dark rounded-xl shadow-[2px_2px_0px_#14402c] active:translate-y-0.5 transition-all"
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
