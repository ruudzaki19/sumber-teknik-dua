import React, { useEffect, useState } from 'react';
import { Wrench, Printer, LogIn, RefreshCw, AlertCircle } from 'lucide-react';
import { dataService } from '../db/dataService';
import { ACUnit, MaintenanceRecord } from '../types';
import { FIXED_SIGNATURE_PATH } from '../db/db';
import { PdfExportModal } from './PdfExportModal';

interface PublicQRViewProps {
  unitId: string;
  onAdminLoginClick: () => void;
}

export const PublicQRView: React.FC<PublicQRViewProps> = ({ unitId, onAdminLoginClick }) => {
  const [unit, setUnit] = useState<ACUnit | null>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const result = await dataService.getUnitById(unitId);
    setUnit(result.unit);
    setRecords(result.records);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Auto refresh data every 10 seconds so clients see live updates
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [unitId]);

  if (loading && !unit) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-600 font-semibold">Memuat Data Pemeliharaan AC...</p>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">Data AC Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Unit AC dengan ID ini mungkin belum didaftarkan atau telah dihapus oleh teknisi.
          </p>
          <button
            onClick={onAdminLoginClick}
            className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl"
          >
            Masuk sebagai Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 pb-16">
      {/* Public Header */}
      <header className="bg-brand-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Wrench className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight uppercase">
                Sumber Tekhnik Dua
              </h1>
              <p className="text-[10px] sm:text-[11px] text-blue-200">
                Kartu Pemeliharaan AC • Mode Lihat (User)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onAdminLoginClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-brand-900 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content View (Read-Only) */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-5 flex-1 w-full space-y-4">
        {/* Banner Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-brand-900">
          <span>
            📋 Anda sedang melihat data resmi kartu pemeliharaan ruangan <strong>{unit.ruanganLokasi}</strong>.
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-500">Live Realtime</span>
        </div>

        {/* Unit Card */}
        <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-brand-900 text-white p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold block">
                KARTU PEMELIHARAAN AC TAHUN 2026
              </span>
              <h2 className="text-base sm:text-lg font-black uppercase">
                {unit.ruanganLokasi} — {unit.merk} {unit.jenisAc} ({unit.kapasitas})
              </h2>
            </div>

            {/* Public Action: Download PDF */}
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition-colors border border-white/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF Kartu Pemeliharaan</span>
            </button>
          </div>

          {/* Unit Metadata Grid */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">JENIS AC</span>
              <span className="font-bold text-slate-800">{unit.jenisAc || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">MERK</span>
              <span className="font-bold text-slate-800">{unit.merk || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">KAPASITAS</span>
              <span className="font-bold text-slate-800">{unit.kapasitas || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">NO. SERI</span>
              <span className="font-mono text-slate-700">{unit.noSeri || '-'}</span>
            </div>
          </div>

          {/* 12-ROW TABLE (Read-Only) */}
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Riwayat Pekerjaan Servis Lapangan
            </h3>

            <div className="overflow-x-auto border border-slate-300 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                  <tr>
                    <th className="w-12 py-2.5 px-3 text-center border-r border-slate-200">NO</th>
                    <th className="w-32 py-2.5 px-3 border-r border-slate-200">TANGGAL</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">URAIAN PEKERJAAN</th>
                    <th className="w-24 py-2.5 px-2 text-center">PARAF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {records.length > 0 ? (
                    records.map((rec, idx) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-600 border-r border-slate-200 align-top">
                          {rec.nomorUrut || idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-200 whitespace-nowrap align-top">
                          {rec.tanggal}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200 whitespace-pre-line leading-relaxed align-top">
                          {rec.uraianPekerjaan}
                        </td>
                        <td className="py-1 px-2 text-center align-top">
                          <img
                            src={FIXED_SIGNATURE_PATH}
                            alt="Paraf"
                            className="h-6 max-w-[65px] mx-auto object-contain"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        Belum ada catatan servis terdaftar untuk unit ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <span className="text-[11px] text-slate-400">
                Data resmi dari teknisi Sumber Tekhnik Dua • Diperbarui secara otomatis.
              </span>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Download PDF Resmi</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* PDF Modal */}
      {unit && (
        <PdfExportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          unit={unit}
          records={records}
          year="2026"
        />
      )}
    </div>
  );
};
