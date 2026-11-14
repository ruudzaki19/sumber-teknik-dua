import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Edit,
  Trash2,
  QrCode,
  Calendar,
  User,
  Phone,
  Coins,
  ChevronRight
} from 'lucide-react';
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
    <div className="space-y-5">
      {/* Top Controls: Search Bar & (+ Buat Bon Baru) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor bon, nama pelanggan, atau tanggal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 font-bold"
            >
              Reset
            </button>
          )}
        </div>

        {/* Action: + Buat Bon Baru (Admin Only) */}
        {isAdmin && (
          <button
            onClick={onOpenCreate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Bon Baru</span>
          </button>
        )}
      </div>

      {/* Empty State: No bons at all */}
      {bons.length === 0 && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {isAdmin ? 'Belum Ada Bon Tercatat' : 'Belum Ada Data Bon'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {isAdmin
              ? 'Mulai catat transaksi nota servis atau pembelian sparepart dengan klik tombol di bawah.'
              : 'Saat ini belum ada nota transaksi yang dicatat oleh admin teknisi.'}
          </p>
          {isAdmin && (
            <button
              onClick={onOpenCreate}
              className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Bon Sekarang</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State: Search filter yields no results */}
      {bons.length > 0 && filteredBons.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
          <p className="text-sm font-semibold text-slate-700">
            Tidak ada nota yang cocok dengan pencarian "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-brand-700 font-bold hover:underline"
          >
            Hapus kata kunci pencarian
          </button>
        </div>
      )}

      {/* Bons Cards Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBons.map((bon) => {
          const itemCount = bon.items ? bon.items.length : 0;

          return (
            <div
              key={bon.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-200 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                      {bon.nomorBon}
                    </span>
                    <span className="text-[11px] text-emerald-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {bon.tanggal}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black uppercase text-white mt-1.5 truncate max-w-[280px]">
                    {bon.kepadaYth || '-'}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-200 block uppercase font-bold">TOTAL</span>
                  <span className="text-sm sm:text-base font-black font-mono text-white">
                    {formatRupiah(bon.totalJumlah)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1">
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Telp: {bon.telpPelanggan || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Teknisi: {bon.namaTeknisi || 'Sumber Teknik Dua'}</span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rincian Item ({itemCount})
                  </span>
                  <div className="space-y-1">
                    {(bon.items || []).slice(0, 3).map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl"
                      >
                        <span className="font-medium text-slate-800 truncate max-w-[220px]">
                          <strong>{it.banyaknya}x</strong> {it.keterangan}
                        </span>
                        <span className="font-mono text-emerald-800 font-bold shrink-0">
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
                  <button
                    onClick={() => onOpenQR(bon)}
                    className="p-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                    title="QR Code & Link Nota Digital"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden xs:inline">QR Link</span>
                  </button>

                  {/* Print / Download PDF */}
                  <button
                    onClick={() => onOpenPdf(bon)}
                    className="p-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                    title="Cetak & Download PDF Nota"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Cetak PDF</span>
                  </button>
                </div>

                {/* Admin Actions: Edit & Delete */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenEdit(bon)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus bon nomor "${bon.nomorBon}" secara permanen?`)) {
                          onDelete(bon.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      title="Hapus Bon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
