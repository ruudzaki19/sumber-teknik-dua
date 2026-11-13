import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Receipt, User, Phone, Calendar, Hash } from 'lucide-react';
import { Bon, BonItem } from '../types';
import { FIXED_SIGNATURE_PATH } from '../db/db';

interface BonModalProps {
  isOpen: boolean;
  onClose: () => void;
  bon?: Bon | null;
  onSave: (
    bonData: Omit<Bon, 'id' | 'createdAt' | 'updatedAt' | 'items'> & {
      id?: string;
      items: Array<{
        banyaknya: number;
        keterangan: string;
        hargaSatuan: number;
        jumlah: number;
      }>;
    }
  ) => void;
  onDelete?: (id: string) => void;
}

interface ItemRow {
  banyaknya: number;
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
  const [namaTeknisi, setNamaTeknisi] = useState('Sumber Teknik Dua');
  const [namaPenerima, setNamaPenerima] = useState('');
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
      setNamaTeknisi(bon.namaTeknisi || 'Sumber Teknik Dua');
      setNamaPenerima(bon.namaPenerima || '');

      if (bon.items && bon.items.length > 0) {
        setItems(
          bon.items.map(it => ({
            banyaknya: it.banyaknya || 1,
            keterangan: it.keterangan || '',
            hargaSatuan: it.hargaSatuan || 0,
            jumlah: (it.banyaknya || 1) * (it.hargaSatuan || 0)
          }))
        );
      } else {
        setItems([{ banyaknya: 1, keterangan: '', hargaSatuan: 0, jumlah: 0 }]);
      }
    } else {
      setNomorBon(generateBonNumber());
      setTanggal(getIndonesianDate());
      setKepadaYth('');
      setTelpPelanggan('');
      setNamaTeknisi('Sumber Teknik Dua');
      setNamaPenerima('');
      setItems([{ banyaknya: 1, keterangan: '', hargaSatuan: 0, jumlah: 0 }]);
    }
  }, [bon, isOpen]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
    const updated = [...items];
    const row = { ...updated[index] };

    if (field === 'banyaknya') {
      const qty = Math.max(1, parseFloat(value) || 0);
      row.banyaknya = qty;
      row.jumlah = qty * row.hargaSatuan;
    } else if (field === 'hargaSatuan') {
      const price = Math.max(0, parseFloat(value) || 0);
      row.hargaSatuan = price;
      row.jumlah = row.banyaknya * price;
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

    if (!kepadaYth.trim()) {
      alert('Mohon isi nama pelanggan / instansi (Kepada Yth.)');
      return;
    }

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
      namaTeknisi: namaTeknisi.trim() || 'Sumber Teknik Dua',
      namaPenerima: namaPenerima.trim() || kepadaYth.trim(),
      parafUrl: FIXED_SIGNATURE_PATH,
      items: validItems
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-emerald-100 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Receipt className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                {bon ? 'Edit Bon / Nota Transaksi' : 'Buat Bon / Nota Transaksi Baru'}
              </h3>
              <p className="text-emerald-200 text-xs">
                Format Resmi SUMBER TEKNIK DUA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Metadata Top Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Nomor Bon */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nomor Bon / Nota
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nomorBon}
                  onChange={(e) => setNomorBon(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tangerang, [Tanggal]
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: 13 November 2026"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Kepada Yth */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Kepada Yth. (Pelanggan) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Nama Pelanggan / Kantor"
                  value={kepadaYth}
                  onChange={(e) => setKepadaYth(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Telp. Pelanggan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                No. Telp Pelanggan
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0812 xxxx xxxx"
                  value={telpPelanggan}
                  onChange={(e) => setTelpPelanggan(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Dynamic Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  Daftar Pekerjaan &amp; Sparepart
                </h4>
                <p className="text-[11px] text-slate-500">
                  Masukkan banyaknya, rincian pekerjaan atau sparepart, serta harga satuan
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="overflow-x-auto border-2 border-emerald-700 rounded-2xl shadow-sm bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-emerald-800 text-white font-bold">
                  <tr>
                    <th className="w-20 py-2.5 px-3 text-center border-r border-emerald-600">BANYAKNYA</th>
                    <th className="py-2.5 px-3 border-r border-emerald-600">KETERANGAN</th>
                    <th className="w-36 py-2.5 px-3 border-r border-emerald-600">HARGA SATUAN</th>
                    <th className="w-36 py-2.5 px-3 border-r border-emerald-600">JUMLAH</th>
                    <th className="w-12 py-2.5 px-2 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-200">
                  {items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/40">
                      {/* Banyaknya */}
                      <td className="p-2 border-r border-emerald-200">
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={row.banyaknya}
                          onChange={(e) => handleItemChange(idx, 'banyaknya', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold focus:ring-1 focus:ring-brand-500 focus:outline-none"
                        />
                      </td>

                      {/* Keterangan */}
                      <td className="p-2 border-r border-emerald-200">
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Service Cuci AC Split 1 PK / Ganti Kapasitor"
                          value={row.keterangan}
                          onChange={(e) => handleItemChange(idx, 'keterangan', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold uppercase focus:ring-1 focus:ring-brand-500 focus:outline-none"
                        />
                      </td>

                      {/* Harga Satuan */}
                      <td className="p-2 border-r border-emerald-200">
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-[10px]">Rp</span>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            placeholder="0"
                            value={row.hargaSatuan || ''}
                            onChange={(e) => handleItemChange(idx, 'hargaSatuan', e.target.value)}
                            className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-right font-mono font-bold focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* Jumlah (Banyaknya x Harga Satuan) */}
                      <td className="p-2 border-r border-emerald-200 text-right font-mono font-black text-emerald-900 bg-emerald-50/50">
                        {formatRupiah(row.jumlah)}
                      </td>

                      {/* Aksi */}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Total Row */}
                <tfoot className="bg-emerald-50 border-t-2 border-emerald-700 font-black">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right text-xs uppercase tracking-wider text-emerald-950 border-r border-emerald-300">
                      JUMLAH TOTAL
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-mono text-emerald-900 border-r border-emerald-300">
                      {formatRupiah(totalCalculated)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Teknisi & Penerima Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Teknisi (Kiri Bawah Bon)
              </label>
              <input
                type="text"
                value={namaTeknisi}
                onChange={(e) => setNamaTeknisi(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                ✓ Paraf teknisi resmi otomatis tertera pada area tanda tangan
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Penerima / Pelanggan (Kanan Bawah Bon)
              </label>
              <input
                type="text"
                placeholder="Nama Pelanggan yang menerima"
                value={namaPenerima}
                onChange={(e) => setNamaPenerima(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
            {bon && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus bon nomor "${bon.nomorBon}" secara permanen?`)) {
                    onDelete(bon.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Bon</span>
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
                className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Bon Transaksi</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
