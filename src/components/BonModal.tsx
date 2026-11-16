import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Receipt, User, Phone, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Bon } from '../types';
import { FIXED_SIGNATURE_PATH } from '../db/db';

interface BonModalProps {
  isOpen: boolean;
  onClose: () => void;
  bon?: Bon | null;
  onSave: (
    bonData: Omit<Bon, 'id' | 'createdAt' | 'updatedAt' | 'items'> & {
      id?: string;
      items: Array<{
        banyaknya: string | number;
        keterangan: string;
        hargaSatuan: number;
        jumlah: number;
      }>;
    }
  ) => void;
  onDelete?: (id: string) => void;
}

interface ItemRow {
  banyaknya: string | number;
  keterangan: string;
  hargaSatuan: number;
  jumlah: number;
}

export const BonModal: React.FC<BonModalProps> = ({
  isOpen,
  onClose,
  bon,
  onSave,
  onDelete
}) => {
  const [nomorBon, setNomorBon] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [kepadaYth, setKepadaYth] = useState('');
  const [telpPelanggan, setTelpPelanggan] = useState('');
  const [items, setItems] = useState<ItemRow[]>([
    { banyaknya: 1, keterangan: '', hargaSatuan: 0, jumlah: 0 }
  ]);

  // Format Helper
  const getIndonesianDate = () => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const now = new Date();
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  const generateBonNumber = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(100 + Math.random() * 900);
    return `STD-${yyyy}${mm}-${random}`;
  };

  useEffect(() => {
    if (bon) {
      setNomorBon(bon.nomorBon || '');
      setTanggal(bon.tanggal || '');
      setKepadaYth(bon.kepadaYth || '');
      setTelpPelanggan(bon.telpPelanggan || '');

      if (bon.items && bon.items.length > 0) {
        setItems(
          bon.items.map(it => {
            const numMatch = String(it.banyaknya).replace(',', '.').match(/[-+]?[0-9]*\.?[0-9]+/);
            const qty = numMatch ? parseFloat(numMatch[0]) : 1;
            const price = Number(it.hargaSatuan) || 0;
            return {
              banyaknya: it.banyaknya != null ? it.banyaknya : 1,
              keterangan: it.keterangan || '',
              hargaSatuan: price,
              jumlah: it.jumlah != null ? Number(it.jumlah) : Math.round(qty * price)
            };
          })
        );
      } else {
        setItems([{ banyaknya: 1, keterangan: '', hargaSatuan: 0, jumlah: 0 }]);
      }
    } else {
      setNomorBon(generateBonNumber());
      setTanggal(getIndonesianDate());
      setKepadaYth('');
      setTelpPelanggan('');
      setItems([{ banyaknya: 1, keterangan: '', hargaSatuan: 0, jumlah: 0 }]);
    }
  }, [bon, isOpen]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
    const updated = [...items];
    const row = { ...updated[index] };

    if (field === 'banyaknya') {
      row.banyaknya = value;
      const numMatch = String(value).replace(',', '.').match(/[-+]?[0-9]*\.?[0-9]+/);
      const qty = numMatch ? parseFloat(numMatch[0]) : 1;
      row.jumlah = Math.round(qty * (row.hargaSatuan || 0));
    } else if (field === 'hargaSatuan') {
      const price = Math.max(0, parseFloat(value) || 0);
      row.hargaSatuan = price;
      const numMatch = String(row.banyaknya).replace(',', '.').match(/[-+]?[0-9]*\.?[0-9]+/);
      const qty = numMatch ? parseFloat(numMatch[0]) : 1;
      row.jumlah = Math.round(qty * price);
    } else if (field === 'keterangan') {
      row.keterangan = value;
    }

    updated[index] = row;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { banyaknya: 1, keterangan: '', hargaSatuan: 0, jumlah: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setItems([{ banyaknya: 1, keterangan: '', hargaSatuan: 0, jumlah: 0 }]);
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const totalCalculated = items.reduce((sum, item) => sum + (item.jumlah || 0), 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(it => it.keterangan.trim().length > 0);
    if (validItems.length === 0) {
      alert('Mohon isi minimal 1 baris keterangan pekerjaan / item bon.');
      return;
    }

    onSave({
      id: bon ? bon.id : undefined,
      nomorBon: nomorBon.trim() || generateBonNumber(),
      tanggal: tanggal.trim() || getIndonesianDate(),
      kepadaYth: kepadaYth.trim(),
      telpPelanggan: telpPelanggan.trim(),
      totalJumlah: totalCalculated,
      namaTeknisi: 'Yulianto',
      namaPenerima: '',
      parafUrl: FIXED_SIGNATURE_PATH,
      items: validItems
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-xl w-full max-w-3xl overflow-hidden shadow-sm border border-slate-200 my-auto flex flex-col max-h-[92vh]"
      >
        {/* Header - Solid Forest Green */}
        <div className="bg-[#15803D] text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 border-b border-[#14532D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {bon ? 'Edit Bon / Nota Transaksi' : 'Buat Bon / Nota Transaksi Baru'}
              </h3>
              <p className="text-emerald-100 text-xs">
                Format Resmi SUMBER TEKNIK DUA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Metadata Top Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {/* Tanggal */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tanggal
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium tabular-nums text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              </div>
            </div>

            {/* Kepada Yth (Opsional) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Kepada Yth.
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nama Pelanggan"
                  value={kepadaYth}
                  onChange={(e) => setKepadaYth(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              </div>
            </div>

            {/* Telp. Pelanggan */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                No. Telp Pelanggan
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={telpPelanggan}
                  onChange={(e) => setTelpPelanggan(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium tabular-nums text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Dynamic Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 text-xs">
                Daftar Pekerjaan &amp; Rincian Bon
              </h4>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </motion.button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-xs bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="w-20 py-2 px-3 text-center border-r border-slate-200">BANYAKNYA</th>
                    <th className="py-2 px-3 border-r border-slate-200">KETERANGAN</th>
                    <th className="w-36 py-2 px-3 border-r border-slate-200 text-right">HARGA SATUAN</th>
                    <th className="w-36 py-2 px-3 border-r border-slate-200 text-right">JUMLAH</th>
                    <th className="w-12 py-2 px-2 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      {/* Banyaknya */}
                      <td className="p-1.5 border-r border-slate-100">
                        <input
                          type="text"
                          placeholder="1"
                          value={row.banyaknya}
                          onChange={(e) => handleItemChange(idx, 'banyaknya', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-center font-semibold tabular-nums text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                        />
                      </td>

                      {/* Keterangan */}
                      <td className="p-1.5 border-r border-slate-100">
                        <input
                          type="text"
                          required
                          placeholder="Uraian perbaikan / suku cadang"
                          value={row.keterangan}
                          onChange={(e) => handleItemChange(idx, 'keterangan', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-normal text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                        />
                      </td>

                      {/* Harga Satuan */}
                      <td className="p-1.5 border-r border-slate-100">
                        <div className="relative">
                          <span className="absolute left-2 top-1 text-slate-400 font-semibold text-[10px]">Rp</span>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            placeholder="0"
                            value={row.hargaSatuan || ''}
                            onChange={(e) => handleItemChange(idx, 'hargaSatuan', e.target.value)}
                            className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-300 rounded text-right font-mono tabular-nums font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* Jumlah (Banyaknya x Harga Satuan) */}
                      <td className="p-1.5 border-r border-slate-100 text-right font-mono tabular-nums font-bold text-slate-900 bg-slate-50/50">
                        {formatRupiah(row.jumlah)}
                      </td>

                      {/* Aksi */}
                      <td className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Total Row */}
                <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-4 text-right text-xs uppercase tracking-wider text-slate-700 border-r border-slate-200">
                      JUMLAH TOTAL
                    </td>
                    <td className="py-2.5 px-3 text-right text-xs font-mono tabular-nums text-emerald-800 border-r border-slate-200 font-bold">
                      {formatRupiah(totalCalculated)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            {bon && onDelete ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  if (confirm(`Hapus bon nomor "${bon.nomorBon}" secara permanen?`)) {
                    onDelete(bon.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg flex items-center gap-1.5 transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Bon</span>
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
                <span>Simpan Bon Transaksi</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
