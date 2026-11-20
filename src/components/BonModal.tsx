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
        hargaSatuan: number | string;
        jumlah: number | string;
      }>;
    }
  ) => void;
  onDelete?: (id: string) => void;
}

interface ItemRow {
  banyaknya: string | number;
  keterangan: string;
  hargaSatuan: number | string;
  jumlah: number | string;
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
    { banyaknya: 1, keterangan: '', hargaSatuan: '', jumlah: '' }
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
            const hs = it.hargaSatuan !== undefined && it.hargaSatuan !== null && it.hargaSatuan !== 0
              ? (typeof it.hargaSatuan === 'number' ? it.hargaSatuan.toLocaleString('id-ID') : String(it.hargaSatuan))
              : '';
            const jm = it.jumlah !== undefined && it.jumlah !== null && it.jumlah !== 0
              ? (typeof it.jumlah === 'number' ? it.jumlah.toLocaleString('id-ID') : String(it.jumlah))
              : '';

            return {
              banyaknya: it.banyaknya != null ? it.banyaknya : 1,
              keterangan: it.keterangan || '',
              hargaSatuan: hs,
              jumlah: jm
            };
          })
        );
      } else {
        setItems([{ banyaknya: 1, keterangan: '', hargaSatuan: '', jumlah: '' }]);
      }
    } else {
      setNomorBon(generateBonNumber());
      setTanggal(getIndonesianDate());
      setKepadaYth('');
      setTelpPelanggan('');
      setItems([{ banyaknya: 1, keterangan: '', hargaSatuan: '', jumlah: '' }]);
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

      const hsStr = String(row.hargaSatuan || '').trim();
      const cleanDigits = hsStr.replace(/[^0-9]/g, '');
      const price = cleanDigits ? parseInt(cleanDigits, 10) : 0;
      if (price > 0) {
        const hasRp = /rp/i.test(hsStr);
        const total = Math.round(qty * price);
        row.jumlah = hasRp ? `Rp ${total.toLocaleString('id-ID')}` : total.toLocaleString('id-ID');
      }
    } else if (field === 'hargaSatuan') {
      row.hargaSatuan = value;
      const cleanDigits = String(value).replace(/[^0-9]/g, '');
      const price = cleanDigits ? parseInt(cleanDigits, 10) : 0;

      const numMatch = String(row.banyaknya).replace(',', '.').match(/[-+]?[0-9]*\.?[0-9]+/);
      const qty = numMatch ? parseFloat(numMatch[0]) : 1;
      if (price > 0) {
        const hasRp = /rp/i.test(String(value));
        const total = Math.round(qty * price);
        row.jumlah = hasRp ? `Rp ${total.toLocaleString('id-ID')}` : total.toLocaleString('id-ID');
      }
    } else if (field === 'jumlah') {
      row.jumlah = value;
    } else if (field === 'keterangan') {
      row.keterangan = value;
    }

    updated[index] = row;
    setItems(updated);
  };

  const handleBlurFormat = (index: number, field: 'hargaSatuan' | 'jumlah') => {
    const updated = [...items];
    const row = { ...updated[index] };
    const val = String(row[field] || '').trim();
    if (!val) return;

    const clean = val.replace(/[^0-9]/g, '');
    if (clean) {
      const hasRp = /rp/i.test(val);
      const formatted = parseInt(clean, 10).toLocaleString('id-ID');
      row[field] = hasRp ? `Rp ${formatted}` : formatted;
      updated[index] = row;
      setItems(updated);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { banyaknya: 1, keterangan: '', hargaSatuan: '', jumlah: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setItems([{ banyaknya: 1, keterangan: '', hargaSatuan: '', jumlah: '' }]);
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const totalCalculated = items.reduce((sum, item) => {
    const cleanStr = String(item.jumlah || '').replace(/[^0-9]/g, '');
    return sum + (cleanStr ? parseInt(cleanStr, 10) : 0);
  }, 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items
      .filter(it => it.keterangan.trim().length > 0)
      .map(it => {
        return {
          banyaknya: it.banyaknya != null ? it.banyaknya : 1,
          keterangan: it.keterangan.trim(),
          hargaSatuan: it.hargaSatuan != null ? it.hargaSatuan : '',
          jumlah: it.jumlah != null ? it.jumlah : ''
        };
      });

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
    <div className="fixed inset-0 z-50 bg-st-dark/65 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-st-white rounded-[24px] w-full max-w-3xl overflow-hidden shadow-[8px_8px_0px_#14402c] border-[3px] border-st-dark my-auto flex flex-col max-h-[92vh] font-sora text-st-text"
      >
        {/* Header - Solid Forest Green */}
        <div className="bg-st-primary text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b-[3px] border-st-dark">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-st-dark border-2 border-st-pale/40 flex items-center justify-center shadow-[2px_2px_0px_#14402c]">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-st-light" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                {bon ? 'Edit Bon / Nota Transaksi' : 'Buat Bon / Nota Transaksi Baru'}
              </h3>
              <p className="text-st-pale text-[11px] font-bold">
                Format Resmi SUMBER TEKNIK DUA
              </p>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Metadata Top Grid: Kiri (Tanggal & Telp), Kanan (Kepada Yth - Textarea 3 Baris) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-st-cream/80 p-4 rounded-2xl border-2 border-st-dark">
            {/* Kiri: Tanggal & Telp Pelanggan */}
            <div className="space-y-3">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                  Tanggal
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-st-white border-2 border-st-dark rounded-xl font-bold tabular-nums text-st-text focus:border-st-primary focus:outline-none transition-colors"
                  />
                  <Calendar className="w-4 h-4 text-st-dark absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Telp. Pelanggan */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                  No. Telp Pelanggan
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={telpPelanggan}
                    onChange={(e) => setTelpPelanggan(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-st-white border-2 border-st-dark rounded-xl font-mono tabular-nums font-bold text-st-text placeholder:text-st-text-muted focus:border-st-primary focus:outline-none transition-colors"
                  />
                  <Phone className="w-4 h-4 text-st-dark absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Kanan: Kepada Yth */}
            <div className="flex flex-col">
              <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                Kepada Yth.
              </label>
              <div className="relative flex-1">
                <textarea
                  rows={3}
                  value={kepadaYth}
                  onChange={(e) => setKepadaYth(e.target.value)}
                  className="w-full h-full min-h-[92px] pl-9 pr-3 py-2 bg-st-white border-2 border-st-dark rounded-xl font-bold text-st-text focus:border-st-primary focus:outline-none transition-colors resize-none leading-relaxed"
                />
                <User className="w-4 h-4 text-st-dark absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Dynamic Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-st-dark text-xs uppercase tracking-wider">
                Daftar Pekerjaan &amp; Rincian Bon
              </h4>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-st-pale hover:bg-st-cream text-st-dark border-2 border-st-dark text-xs font-extrabold rounded-xl shadow-[2px_2px_0px_#14402c] active:translate-y-0.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </motion.button>
            </div>

            <div className="overflow-x-auto border-2 border-st-dark rounded-xl shadow-[3px_3px_0px_#14402c] bg-st-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-st-cream-dark border-b-2 border-st-dark text-st-dark font-extrabold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="w-24 py-2.5 px-3 text-center border-r-2 border-st-dark">BANYAKNYA</th>
                    <th className="py-2.5 px-3 border-r-2 border-st-dark">KETERANGAN</th>
                    <th className="w-36 py-2.5 px-3 border-r-2 border-st-dark text-right">HARGA SATUAN</th>
                    <th className="w-36 py-2.5 px-3 border-r-2 border-st-dark text-right">JUMLAH</th>
                    <th className="w-12 py-2.5 px-2 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-st-dark/20">
                  {items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-st-pale/20 transition-colors">
                      {/* Banyaknya */}
                      <td className="p-2 border-r border-st-dark/20">
                        <input
                          type="text"
                          placeholder="1"
                          value={row.banyaknya}
                          onChange={(e) => handleItemChange(idx, 'banyaknya', e.target.value)}
                          className="w-full px-2 py-1.5 bg-st-cream border-2 border-st-dark/40 rounded-lg text-center font-extrabold tabular-nums text-st-dark focus:border-st-primary focus:bg-white focus:outline-none transition-colors"
                        />
                      </td>

                      {/* Keterangan */}
                      <td className="p-2 border-r border-st-dark/20">
                        <textarea
                          rows={Math.max(1, (row.keterangan.match(/\n/g) || []).length + 1)}
                          required
                          placeholder="Uraian perbaikan / suku cadang (bisa Enter)"
                          value={row.keterangan}
                          onChange={(e) => handleItemChange(idx, 'keterangan', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-st-cream border-2 border-st-dark/40 rounded-lg font-medium text-st-text focus:border-st-primary focus:bg-white focus:outline-none transition-colors resize-y leading-relaxed text-xs"
                        />
                      </td>

                      {/* Harga Satuan (Opsional) */}
                      <td className="p-2 border-r border-st-dark/20">
                        <input
                          type="text"
                          placeholder="0 (opsional)"
                          value={row.hargaSatuan !== undefined && row.hargaSatuan !== null ? String(row.hargaSatuan) : ''}
                          onChange={(e) => handleItemChange(idx, 'hargaSatuan', e.target.value)}
                          onBlur={() => handleBlurFormat(idx, 'hargaSatuan')}
                          className="w-full px-2.5 py-1.5 bg-st-cream border-2 border-st-dark/40 rounded-lg text-right font-mono tabular-nums font-bold text-st-dark focus:border-st-primary focus:bg-white focus:outline-none transition-colors placeholder:text-st-text-muted/60"
                        />
                      </td>

                      {/* Jumlah (Bisa Terhitung Otomatis atau Diisi Langsung) */}
                      <td className="p-2 border-r border-st-dark/20">
                        <input
                          type="text"
                          placeholder="0"
                          value={row.jumlah !== undefined && row.jumlah !== null ? String(row.jumlah) : ''}
                          onChange={(e) => handleItemChange(idx, 'jumlah', e.target.value)}
                          onBlur={() => handleBlurFormat(idx, 'jumlah')}
                          className="w-full px-2.5 py-1.5 bg-st-cream border-2 border-st-dark/40 rounded-lg text-right font-mono tabular-nums font-extrabold text-st-dark focus:border-st-primary focus:bg-white focus:outline-none transition-colors"
                        />
                      </td>

                      {/* Aksi */}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-st-text-muted hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-transparent hover:border-rose-400"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Total Row */}
                <tfoot className="bg-st-cream-dark border-t-2 border-st-dark font-extrabold">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right text-xs uppercase tracking-wider text-st-dark border-r-2 border-st-dark">
                      JUMLAH TOTAL
                    </td>
                    <td className="py-3 px-3 text-right text-xs sm:text-sm font-mono tabular-nums text-st-primary border-r-2 border-st-dark font-extrabold">
                      {formatRupiah(totalCalculated)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t-2 border-st-dark/20 flex items-center justify-between gap-2">
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
                className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl border-2 border-rose-600 flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#991b1b] active:translate-y-0.5 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Bon</span>
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
                <span>Simpan Bon Transaksi</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
