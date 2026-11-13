import React, { useEffect, useState } from 'react';
import { Download, LogIn, RefreshCw, AlertCircle, Printer, ArrowLeft } from 'lucide-react';
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
  const TOTAL_ROWS = 11;
  const displayRows = Array.from({ length: TOTAL_ROWS }, (_, i) => items[i] || null);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 pb-16">
      {/* Top Navbar */}
      <header className="bg-brand-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center border border-emerald-400/30">
              <img src="/logo-crop.png" alt="ST" className="w-full h-full object-contain" />
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
              Ditujukan kepada <strong>{bon.kepadaYth}</strong> • Tanggal: {bon.tanggal}
            </p>
          </div>
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-md transition-all text-xs active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Download PDF Nota</span>
          </button>
        </div>

        {/* Paper Receipt Simulation */}
        <div className="bg-white rounded-3xl border border-slate-300 p-4 sm:p-8 shadow-md">
          {/* Header Persis Gambar 1 */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <img src="/logo-crop.png" alt="Logo ST" className="w-16 h-18 object-contain shrink-0" />
              <div>
                <h2 className="text-lg sm:text-xl font-black text-emerald-800 uppercase tracking-tight">
                  SUMBER TEKNIK DUA
                </h2>
                <div className="text-xs font-bold text-slate-700">Service, Jual-Beli</div>
                <div className="text-[11px] text-slate-600 leading-tight">
                  AC Rumah, AC Mobil, Kulkas, Freezer
                  <br />
                  Water Heater, Mesin Cuci, Dispenser
                </div>
                <div className="text-xs font-bold text-emerald-800 mt-1 leading-tight">
                  Komp. Griya Serpong Blok H4/2
                  <br />
                  Telp. 0813 8895 9081
                  <br />
                  Serpong - Tangerang
                </div>
              </div>
            </div>

            <div className="text-xs text-emerald-900 font-bold space-y-1 w-full sm:w-auto">
              <div>Tangerang, <span className="text-slate-900">{bon.tanggal}</span></div>
              <div>Kepada Yth, <span className="text-slate-900 uppercase">{bon.kepadaYth}</span></div>
              <div className="text-slate-400 font-mono text-[11px]">............................................................</div>
              <div>Telp. <span className="text-slate-900">{bon.telpPelanggan || '-'}</span></div>
            </div>
          </div>

          {/* Table Persis Gambar 1 */}
          <div className="overflow-x-auto border-[1.8px] border-emerald-800 rounded-none">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-white border-b-[1.8px] border-emerald-800 text-emerald-800 font-black text-center">
                  <th className="w-24 py-2.5 px-2 border-r-[1.8px] border-emerald-800">BANYAKNYA</th>
                  <th className="py-2.5 px-3 border-r-[1.8px] border-emerald-800">KETERANGAN</th>
                  <th className="w-32 py-2.5 px-3 border-r-[1.8px] border-emerald-800">HARGA SATUAN</th>
                  <th className="w-36 py-2.5 px-3">JUMLAH</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((it, idx) => (
                  <tr key={idx} className="border-b-[1.8px] border-emerald-800 h-9">
                    <td className="py-2 px-2 text-center font-bold text-slate-900 border-r-[1.8px] border-emerald-800">
                      {it ? it.banyaknya : ''}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900 uppercase border-r-[1.8px] border-emerald-800">
                      {it ? it.keterangan : ''}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 border-r-[1.8px] border-emerald-800">
                      {it && it.hargaSatuan ? formatNumber(it.hargaSatuan) : ''}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                      {it && it.jumlah ? formatNumber(it.jumlah) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* JUMLAH & RP Bottom Line */}
            <div className="flex justify-end">
              <div className="w-32 py-2 px-3 text-center font-black text-xs text-emerald-800 border-r-[1.8px] border-emerald-800 uppercase">
                JUMLAH
              </div>
              <div className="w-36 py-2 px-3 flex items-center justify-between font-mono font-black text-xs text-slate-900 border-l-[1.8px] border-r-[1.8px] border-b-[1.8px] border-emerald-800">
                <span className="text-emerald-800">Rp.</span>
                <span>{formatNumber(bon.totalJumlah)}</span>
              </div>
            </div>
          </div>

          {/* Footer Persis Gambar 1 */}
          <div className="mt-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 px-4">
            {/* Teknisi */}
            <div className="text-center w-52">
              <div className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">
                TEKNISI
              </div>
              <div className="h-16 flex items-center justify-center">
                <img
                  src={FIXED_SIGNATURE_PATH}
                  alt="Paraf Teknisi"
                  className="max-h-14 max-w-[130px] object-contain"
                />
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                ( {bon.namaTeknisi || 'Sumber Teknik Dua'} )
              </div>
            </div>

            {/* Cap Stamp Resmi & Penerima */}
            <div className="text-center w-64">
              <div className="h-16 flex items-center justify-center">
                <img
                  src="/stamp-clean.png"
                  alt="SUMBER TEKNIK DUA"
                  className="max-h-14 max-w-[240px] object-contain"
                />
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                ( {bon.namaPenerima || '........................................'} )
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bon PDF Modal */}
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
