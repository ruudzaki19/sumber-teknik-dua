import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, AlertCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { dataService } from '../db/dataService';
import { Bon } from '../types';
import { BonPdfModal } from './BonPdfModal';
import { FIXED_SIGNATURE_PATH } from '../db/db';
import { supabase } from '../lib/supabase';

interface PublicBonViewProps {
  bonId: string;
  onBackClick: () => void;
}

export const PublicBonView: React.FC<PublicBonViewProps> = ({ bonId, onBackClick }) => {
  const [bon, setBon] = useState<Bon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const loadBonData = async () => {
    setLoading(true);
    const result = await dataService.getBonById(bonId);
    setBon(result.bon);
    setLoading(false);
  };

  useEffect(() => {
    loadBonData();

    // Supabase Realtime channel
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel(`public:bon-${bonId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bons' },
          () => {
            loadBonData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bon_items' },
          () => {
            loadBonData();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [bonId]);

  const formatNumber = (val: number) => {
    if (!val && val !== 0) return '';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  if (loading && !bon) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-600 font-semibold">Memuat Nota / Bon Transaksi...</p>
        </div>
      </div>
    );
  }

  if (!bon) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">Nota Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Nota dengan nomor atau ID ini tidak ditemukan atau telah dihapus.
          </p>
          <button
            onClick={onBackClick}
            className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const items = bon.items || [];
  // 13 baris persis format fisik resmi
  const TOTAL_ROWS = 13;
  const displayRows = Array.from({ length: TOTAL_ROWS }, (_, i) => items[i] || null);

  const greenBorder = '1.8px solid #1b6837';
  const greenText = '#1b6837';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 pb-16">
      {/* Top Navbar */}
      <header className="bg-brand-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center border border-emerald-400/30">
              <img src="/logo-resmi.png" alt="ST" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight uppercase">
                SUMBER TEKNIK DUA
              </h1>
              <p className="text-[10px] sm:text-[11px] text-emerald-200">
                Nota / Bon Transaksi Resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadBonData}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onBackClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-brand-900 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 flex-1 w-full space-y-4">
        {/* Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-brand-950">
          <div>
            <span className="font-bold text-sm">
              🧾 Nota Resmi: <span className="font-mono text-emerald-900">{bon.nomorBon}</span>
            </span>
            <p className="text-slate-600 text-xs mt-0.5">
              {bon.kepadaYth ? (
                <>Ditujukan kepada <strong>{bon.kepadaYth}</strong> • </>
              ) : null}
              Tanggal: {bon.tanggal}
            </p>
          </div>
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-md transition-all text-xs active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Gambar Bon (JPG)</span>
          </button>
        </div>

        {/* Paper Receipt Simulation */}
        <div className="bg-white rounded-3xl border border-slate-300 p-4 sm:p-8 shadow-md">
          {/* Header Kop Surat Rapi Dua Kolom (Bebas Potong) */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-5">
            {/* Kiri: Kop Surat HD SUMBER TEKNIK DUA */}
            <div className="w-full sm:w-[54%] max-w-[390px]">
              <img
                src="/kop-card-hd.png"
                alt="SUMBER TEKNIK DUA"
                className="w-full h-auto block"
              />
            </div>

            {/* Kanan: Field Pelanggan Rapi dengan Garis Titik-Titik Hijau */}
            <div className="w-full sm:w-[44%] flex flex-col justify-between pt-1">
              {/* Baris 1: Tangerang, [Tanggal] */}
              <div className="flex items-end min-h-[26px] mb-1.5">
                <span className="text-[#1b6837] font-bold text-xs sm:text-[13px] whitespace-nowrap mr-1.5">
                  Tangerang,
                </span>
                <span className="flex-1 border-b-[1.2px] border-dotted border-[#1b6837] text-slate-900 font-bold text-xs sm:text-[13px] pb-0.5 pl-1 min-h-[18px]">
                  {bon.tanggal || ''}
                </span>
              </div>

              {/* Baris 2: Kepada Yth, [Nama Pelanggan] */}
              <div className="flex items-end min-h-[26px] mb-1.5">
                <span className="text-[#1b6837] font-bold text-xs sm:text-[13px] whitespace-nowrap mr-1.5">
                  Kepada Yth,
                </span>
                <span className="flex-1 border-b-[1.2px] border-dotted border-[#1b6837] text-slate-900 font-bold text-xs sm:text-[13px] uppercase pb-0.5 pl-1 min-h-[18px]">
                  {bon.kepadaYth || ''}
                </span>
              </div>

              {/* Baris 3: Garis Titik-Titik Kosong */}
              <div className="min-h-[22px] border-b-[1.2px] border-dotted border-[#1b6837] mb-1.5" />

              {/* Baris 4: Garis Titik-Titik Kosong */}
              <div className="min-h-[22px] border-b-[1.2px] border-dotted border-[#1b6837] mb-1.5" />

              {/* Baris 5: Telp. [No. HP Pelanggan] */}
              <div className="flex items-end min-h-[26px]">
                <span className="text-[#1b6837] font-bold text-xs sm:text-[13px] whitespace-nowrap mr-1.5">
                  Telp.
                </span>
                <span className="flex-1 border-b-[1.2px] border-dotted border-[#1b6837] text-slate-900 font-bold text-xs sm:text-[13px] pb-0.5 pl-1 min-h-[18px]">
                  {bon.telpPelanggan || ''}
                </span>
              </div>
            </div>
          </div>

          {/* Table 13 Baris Border Hijau */}
          <div className="overflow-x-auto border-[1.8px] border-emerald-800 rounded-none">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-white border-b-[1.8px] border-emerald-800 text-emerald-800 font-black text-center text-xs sm:text-sm">
                  <th className="w-24 sm:w-28 py-2.5 px-2 border-r-[1.8px] border-emerald-800 text-center">
                    BANYAKNYA
                  </th>
                  <th className="py-2.5 px-3 border-r-[1.8px] border-emerald-800 text-center">
                    KETERANGAN
                  </th>
                  <th className="w-32 sm:w-36 py-2.5 px-3 border-r-[1.8px] border-emerald-800 text-center">
                    HARGA SATUAN
                  </th>
                  <th className="w-36 sm:w-40 py-2.5 px-3 text-center">
                    JUMLAH
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((it, idx) => (
                  <tr key={idx} className="border-b-[1.8px] border-emerald-800 h-9">
                    {/* Banyaknya */}
                    <td className="py-2 px-2 text-center font-bold text-slate-900 border-r-[1.8px] border-emerald-800">
                      {it ? it.banyaknya : ''}
                    </td>

                    {/* Keterangan */}
                    <td className="py-2 px-3 font-bold text-slate-900 uppercase border-r-[1.8px] border-emerald-800">
                      {it ? it.keterangan : ''}
                    </td>

                    {/* Harga Satuan (Auto Ada Rp.) */}
                    <td className="py-2 px-2.5 border-r-[1.8px] border-emerald-800 text-slate-900">
                      {it && (it.hargaSatuan || it.hargaSatuan === 0) ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-emerald-800 font-bold text-[11px] sm:text-xs">Rp.</span>
                          <span className="font-mono font-bold">{formatNumber(it.hargaSatuan)}</span>
                        </div>
                      ) : ''}
                    </td>

                    {/* Jumlah (Auto Ada Rp.) */}
                    <td className="py-2 px-2.5 text-slate-900">
                      {it && (it.jumlah || it.jumlah === 0) ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-emerald-800 font-bold text-[11px] sm:text-xs">Rp.</span>
                          <span className="font-mono font-black">{formatNumber(it.jumlah)}</span>
                        </div>
                      ) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* JUMLAH & RP Bottom Line */}
            <div className="flex justify-end">
              <div className="w-32 sm:w-36 py-2 px-3 text-center font-black text-xs sm:text-sm text-emerald-800 border-r-[1.8px] border-emerald-800 uppercase">
                JUMLAH
              </div>
              <div className="w-36 sm:w-40 py-2 px-3 flex items-center justify-between font-mono font-black text-xs sm:text-sm text-slate-900 border-l-[1.8px] border-r-[1.8px] border-b-[1.8px] border-emerald-800">
                <span className="text-emerald-800">Rp.</span>
                <span>{formatNumber(bon.totalJumlah)}</span>
              </div>
            </div>
          </div>

          {/* Footer Tanda Tangan Yulianto & Stempel Dekat */}
          <div className="mt-8 flex flex-row items-center justify-start gap-8 sm:gap-12 px-2 sm:px-4">
            {/* Teknisi */}
            <div className="text-center w-44 sm:w-52">
              <div className="text-xs sm:text-sm font-black text-emerald-800 uppercase tracking-wider mb-1">
                TEKNISI
              </div>
              <div className="h-16 flex items-center justify-center">
                <img
                  src={FIXED_SIGNATURE_PATH}
                  alt="Paraf Teknisi"
                  className="max-h-14 max-w-[130px] object-contain"
                />
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                ( Yulianto )
              </div>
            </div>

            {/* Cap Stamp Biru Resmi Dekat Tanda Tangan (Tanpa Teks di Bawahnya) */}
            <div className="flex items-center justify-center pt-3">
              <img
                src="/stamp-clean.png"
                alt="SUMBER TEKNIK DUA"
                className="max-h-14 max-w-[240px] sm:max-w-[280px] object-contain"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bon PDF / JPG Modal */}
      {bon && (
        <BonPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          bon={bon}
        />
      )}
    </div>
  );
};
