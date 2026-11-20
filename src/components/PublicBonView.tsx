import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, AlertCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { dataService } from '../db/dataService';
import { Bon } from '../types';
import { BonPdfModal } from './BonPdfModal';
import { CoolingAirflowBackground } from './CoolingAirflowBackground';
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
  const TOTAL_PHYSICAL_ROWS = 13;
  const ROW_UNIT_HEIGHT = 36; // px

  const calculateKeteranganLines = (text: string): number => {
    if (!text || !text.trim()) return 1;
    const rawLines = text.split('\n');
    let totalLines = 0;
    const MAX_CHARS_PER_LINE = 33;

    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        totalLines += 1;
        continue;
      }
      const words = trimmed.split(/\s+/);
      let currentLineLen = 0;
      let lineCountForThis = 1;

      for (const w of words) {
        if (w.length > MAX_CHARS_PER_LINE) {
          if (currentLineLen > 0) {
            lineCountForThis += 1;
            currentLineLen = 0;
          }
          lineCountForThis += Math.floor(w.length / MAX_CHARS_PER_LINE);
          currentLineLen = w.length % MAX_CHARS_PER_LINE;
        } else if (currentLineLen === 0) {
          currentLineLen = w.length;
        } else if (currentLineLen + 1 + w.length <= MAX_CHARS_PER_LINE) {
          currentLineLen += 1 + w.length;
        } else {
          lineCountForThis += 1;
          currentLineLen = w.length;
        }
      }
      totalLines += lineCountForThis;
    }

    return Math.max(1, totalLines);
  };

  const hasPrice = (val: string | number | undefined | null): boolean => {
    if (val === undefined || val === null || val === '') return false;
    const clean = String(val).replace(/[^0-9]/g, '');
    if (!clean) return false;
    return parseInt(clean, 10) > 0;
  };

  const isManualRp = (val: string | number | undefined | null): boolean => {
    if (!val) return false;
    return /rp/i.test(String(val));
  };

  const formatPriceValue = (val: string | number | undefined | null): string => {
    if (!val) return '';
    const str = String(val).trim();
    const clean = str.replace(/[^0-9]/g, '');
    if (!clean) return '';
    const num = parseInt(clean, 10);
    return new Intl.NumberFormat('id-ID').format(num);
  };

  interface ProcessedRow {
    item: any;
    linesCount: number;
    rowHeight: number;
  }

  // Ukuran kotak pas sesuai isi teks (tanpa space kosong yang makan tempat di bawah)
  const getItemRowHeight = (lines: number): number => {
    if (lines <= 1) return 37;
    return (lines * 22) + 14; // 2 baris: 58px, 3 baris: 80px, 4 baris: 102px
  };

  const processedRows: ProcessedRow[] = items.map(it => {
    const lines = calculateKeteranganLines(it.keterangan);
    return {
      item: it,
      linesCount: lines,
      rowHeight: getItemRowHeight(lines)
    };
  });

  const TOTAL_TABLE_HEIGHT = 481; // 13 * 37px tepat
  const totalItemsHeight = processedRows.reduce((sum, r) => sum + r.rowHeight, 0);
  const remainingTableHeight = Math.max(0, TOTAL_TABLE_HEIGHT - totalItemsHeight);
  const numEmptyRows = remainingTableHeight > 0 ? Math.max(1, Math.round(remainingTableHeight / 37)) : 0;

  const emptyRowHeights: number[] = [];
  if (numEmptyRows > 0) {
    const baseHeight = Math.floor(remainingTableHeight / numEmptyRows);
    const remPixels = remainingTableHeight - (baseHeight * numEmptyRows);
    for (let i = 0; i < numEmptyRows; i++) {
      emptyRowHeights.push(i === numEmptyRows - 1 ? baseHeight + remPixels : baseHeight);
    }
  }

  const anyItemHasManualRp = items.some(it => isManualRp(it.hargaSatuan) || isManualRp(it.jumlah));

  // Split kepadaYth multi-baris (maksimal 3 baris formal sejajar)
  const rawKepada = bon.kepadaYth || '';
  const kepadaLines = rawKepada.split('\n').map(l => l.trim());
  const line1 = kepadaLines[0] || '';
  const line2 = kepadaLines[1] || '';
  const line3 = kepadaLines.slice(2).join(' ') || '';

  const solidBorder = '1.2px solid #1b6837';
  const greenText = '#1b6837';

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col text-slate-900 pb-16 relative">
      <CoolingAirflowBackground />

      {/* Top Navbar - Solid Forest Green */}
      <header className="bg-[#15803D] text-white sticky top-0 z-40 border-b border-[#14532D] shadow-xs relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center border border-emerald-300">
              <img src="/logo-resmi.png" alt="ST" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight uppercase text-white">
                SUMBER TEKNIK DUA
              </h1>
              <p className="text-[10px] sm:text-[11px] text-emerald-100 font-medium">
                Nota / Bon Transaksi Resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadBonData}
              className="p-2 bg-emerald-900/60 hover:bg-emerald-900 text-white rounded-lg transition-colors border border-emerald-700/60"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onBackClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-800" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 flex-1 w-full space-y-4 relative z-10">
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
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white font-semibold rounded-lg shadow-xs transition-colors text-xs active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Gambar Bon (JPG)</span>
          </button>
        </div>

        {/* Paper Receipt Simulation */}
        <div className="bg-white rounded-3xl border border-slate-300 p-4 sm:p-8 shadow-md">
          {/* Header Kop Surat Rapi Dua Kolom (Sejajar Tinggi Kop & Field Pelanggan) */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-5">
            {/* Kiri: Kop Surat HD SUMBER TEKNIK DUA Gambar 1 */}
            <div className="w-full sm:w-[54%] max-w-[400px]">
              <img
                src="/kop-card-hd.png"
                alt="SUMBER TEKNIK DUA"
                className="w-full h-auto block object-contain"
              />
            </div>

            {/* Kanan: Field Pelanggan Rapi Sejajar dengan Garis Titik-Titik Hijau */}
            <div className="w-full sm:w-[44%] flex flex-col justify-between py-1 min-h-[170px]">
              {/* Baris 1: Tangerang, [Tanggal] */}
              <div className="flex items-end min-h-[26px]">
                <span className="text-[#1b6837] font-bold text-xs sm:text-[14px] whitespace-nowrap mr-2">
                  Tangerang,
                </span>
                <span className="flex-1 border-b-[1.3px] border-dotted border-[#1b6837] text-slate-900 font-serif font-bold text-sm sm:text-base pb-1 pl-1 min-h-[20px] leading-tight">
                  {bon.tanggal || ''}
                </span>
              </div>

              {/* Baris 2: Kepada Yth, [Baris 1 Nama Pelanggan] (TANPA AUTO CAPSLOCK) */}
              <div className="flex items-end min-h-[26px]">
                <span className="text-[#1b6837] font-bold text-xs sm:text-[14px] whitespace-nowrap mr-2">
                  Kepada Yth,
                </span>
                <span className="flex-1 border-b-[1.3px] border-dotted border-[#1b6837] text-slate-900 font-serif font-bold text-sm sm:text-base pb-1 pl-1 min-h-[20px] leading-tight">
                  {line1}
                </span>
              </div>

              {/* Baris 3: Garis Titik-Titik dengan Baris 2 (Misal: PT Jaya - Sejajar Tanggal) */}
              <div className="min-h-[26px] border-b-[1.3px] border-dotted border-[#1b6837] flex items-end pb-1">
                <span className="w-20 sm:w-24 shrink-0" />
                <span className="flex-1 text-slate-900 font-serif font-bold text-sm sm:text-base pl-1 min-h-[20px] leading-tight">
                  {line2}
                </span>
              </div>

              {/* Baris 4: Garis Titik-Titik dengan Baris 3 (Misal: Reni Jaya - Sejajar Tanggal) */}
              <div className="min-h-[26px] border-b-[1.3px] border-dotted border-[#1b6837] flex items-end pb-1">
                <span className="w-20 sm:w-24 shrink-0" />
                <span className="flex-1 text-slate-900 font-serif font-bold text-sm sm:text-base pl-1 min-h-[20px] leading-tight">
                  {line3}
                </span>
              </div>

              {/* Baris 5: Telp. [No. HP Pelanggan] */}
              <div className="flex items-end min-h-[26px]">
                <span className="text-[#1b6837] font-bold text-xs sm:text-[14px] whitespace-nowrap mr-2">
                  Telp.
                </span>
                <span className="flex-1 border-b-[1.3px] border-dotted border-[#1b6837] text-slate-900 font-serif font-bold text-sm sm:text-base pb-1 pl-1 min-h-[20px] leading-tight">
                  {bon.telpPelanggan || ''}
                </span>
              </div>
            </div>
          </div>

          {/* Table 13 Baris Line Solid Konsisten 1.2px */}
          <div className="overflow-x-auto border-[1.2px] border-emerald-800 rounded-none">
            <table className="w-full text-xs sm:text-sm text-left border-collapse border-[1.2px] border-emerald-800">
              <thead>
                <tr className="bg-white border-b-[1.2px] border-emerald-800 text-emerald-800 font-black text-center text-xs sm:text-sm h-10 font-serif">
                  <th className="w-24 sm:w-28 border-r-[1.2px] border-emerald-800 p-0 text-center align-middle">
                    <div className="flex items-center justify-center h-full w-full pb-0.5 font-black text-emerald-800 text-xs sm:text-sm">
                      BANYAKNYA
                    </div>
                  </th>
                  <th className="border-r-[1.2px] border-emerald-800 p-0 text-center align-middle">
                    <div className="flex items-center justify-center h-full w-full pb-0.5 font-black text-emerald-800 text-xs sm:text-sm">
                      KETERANGAN
                    </div>
                  </th>
                  <th className="w-32 sm:w-36 border-r-[1.2px] border-emerald-800 p-0 text-center align-middle">
                    <div className="flex items-center justify-center h-full w-full pb-0.5 font-black text-emerald-800 text-xs sm:text-sm">
                      HARGA SATUAN
                    </div>
                  </th>
                  <th className="w-36 sm:w-40 p-0 text-center align-middle">
                    <div className="flex items-center justify-center h-full w-full pb-0.5 font-black text-emerald-800 text-xs sm:text-sm">
                      JUMLAH
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedRows.map((r, idx) => {
                  const it = r.item;

                  return (
                    <tr
                      key={`item-${idx}`}
                      className="border-b-[1.2px] border-emerald-800"
                      style={{ height: `${r.rowHeight}px` }}
                    >
                      {/* Banyaknya (Selalu di Tengah Vertikal) */}
                      <td
                        className="p-0 text-center font-bold text-slate-900 border-r-[1.2px] border-emerald-800 font-serif text-sm sm:text-base align-middle"
                        style={{ height: `${r.rowHeight}px` }}
                      >
                        <div className="flex items-center justify-center w-full h-full">
                          {it ? it.banyaknya : ''}
                        </div>
                      </td>

                      {/* Keterangan (Pas Sesuai Teks, Padding Seimbang Atas Bawah, Bebas Potong) */}
                      <td
                        className="py-0 px-3 font-bold text-slate-900 border-r-[1.2px] border-emerald-800 font-serif text-sm sm:text-base align-middle"
                        style={{ height: `${r.rowHeight}px` }}
                      >
                        <div className="w-full whitespace-pre-wrap break-words leading-snug">
                          {it ? it.keterangan : ''}
                        </div>
                      </td>

                      {/* Harga Satuan (Selalu di Tengah Vertikal, Manual Rp Warna Hitam) */}
                      <td
                        className="p-0 border-r-[1.2px] border-emerald-800 text-slate-900 align-middle"
                        style={{ height: `${r.rowHeight}px` }}
                      >
                        {it && hasPrice(it.hargaSatuan) ? (
                          <div
                            className={`flex items-center px-2.5 w-full h-full ${
                              isManualRp(it.hargaSatuan) ? 'justify-between' : 'justify-end'
                            }`}
                          >
                            {isManualRp(it.hargaSatuan) && (
                              <span className="font-serif font-bold text-xs sm:text-sm text-slate-900">
                                Rp.
                              </span>
                            )}
                            <span className="font-serif font-bold text-sm sm:text-base">
                              {formatPriceValue(it.hargaSatuan)}
                            </span>
                          </div>
                        ) : null}
                      </td>

                      {/* Jumlah (Selalu di Tengah Vertikal Sesuai Permintaan, Manual Rp Warna Hitam) */}
                      <td
                        className="p-0 text-slate-900 align-middle"
                        style={{ height: `${r.rowHeight}px` }}
                      >
                        {it && hasPrice(it.jumlah) ? (
                          <div
                            className={`flex items-center px-2.5 w-full h-full ${
                              isManualRp(it.jumlah) ? 'justify-between' : 'justify-end'
                            }`}
                          >
                            {isManualRp(it.jumlah) && (
                              <span className="font-serif font-bold text-xs sm:text-sm text-slate-900">
                                Rp.
                              </span>
                            )}
                            <span className="font-serif font-bold text-sm sm:text-base">
                              {formatPriceValue(it.jumlah)}
                            </span>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}

                {/* Sisa Baris Kosong (Menjaga Total Visual Tepat 481px Presisi) */}
                {emptyRowHeights.map((h, emptyIdx) => (
                  <tr
                    key={`empty-${emptyIdx}`}
                    className="border-b-[1.2px] border-emerald-800"
                    style={{ height: `${h}px` }}
                  >
                    <td className="border-r-[1.2px] border-emerald-800" />
                    <td className="border-r-[1.2px] border-emerald-800" />
                    <td className="border-r-[1.2px] border-emerald-800" />
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>

            {/* JUMLAH & RP Bottom Line Solid */}
            <div className="flex justify-end">
              <div className="w-32 sm:w-36 py-2 px-3 text-center font-black text-xs sm:text-sm text-emerald-800 border-r-[1.2px] border-emerald-800 uppercase font-serif">
                JUMLAH
              </div>
              <div
                className={`w-36 sm:w-40 py-2 px-3 flex items-center font-serif font-bold text-sm sm:text-base text-slate-900 border-l-[1.2px] border-r-[1.2px] border-b-[1.2px] border-emerald-800 ${
                  anyItemHasManualRp ? 'justify-between' : 'justify-end'
                }`}
              >
                {anyItemHasManualRp && (
                  <span className="font-serif text-slate-900 font-bold">Rp.</span>
                )}
                <span>{formatNumber(bon.totalJumlah)}</span>
              </div>
            </div>
          </div>

          {/* Footer Tanda Tangan Yulianto & Stempel Sedikit Menimpa */}
          <div className="mt-8 flex flex-row items-start justify-start px-2 sm:px-4 relative">
            {/* Teknisi */}
            <div className="text-center w-48 sm:w-56 relative z-10">
              <div className="text-xs sm:text-sm font-black text-emerald-800 uppercase tracking-wider mb-1">
                TEKNISI
              </div>
              <div className="h-16 flex items-center justify-center">
                <img
                  src={FIXED_SIGNATURE_PATH}
                  alt="Paraf Teknisi"
                  className="max-h-16 max-w-[140px] sm:max-w-[160px] object-contain"
                />
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                ( Yulianto )
              </div>
            </div>

            {/* Cap Stamp Biru Resmi Menempel & Sedikit Menimpa Tanda Tangan */}
            <div
              className="flex items-center justify-center pt-2 sm:pt-3 relative z-20"
              style={{
                marginLeft: '-45px', // Menimpa sedikit ujung kanan tanda tangan secara alami
                mixBlendMode: 'multiply'
              }}
            >
              <img
                src="/stamp-clean.png"
                alt="SUMBER TEKNIK DUA"
                className="max-h-14 sm:max-h-16 max-w-[240px] sm:max-w-[290px] object-contain"
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
