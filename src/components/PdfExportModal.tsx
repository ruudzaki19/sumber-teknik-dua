import React, { useRef, useState } from 'react';
import { X, Download, Printer, CheckCircle2, Eye, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ACUnit, MaintenanceRecord, CompanySettings } from '../types';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: ACUnit;
  records: MaintenanceRecord[];
  settings: CompanySettings;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  unit,
  records,
  settings
}) => {
  const [includePrices, setIncludePrices] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Prepare 12 rows strictly matching the user's paper card layout
  const rows = Array.from({ length: 12 }, (_, index) => {
    const record = records.find(r => (r.nomorUrut || 0) === index + 1) || records[index];
    return {
      no: index + 1,
      record: record || null
    };
  });

  const totalBiayaSemua = records.reduce((acc, curr) => acc + (curr.totalHarga || (curr.biaya * (curr.qty || 1)) || 0), 0);

  const handleDownloadPDF = async () => {
    if (!printAreaRef.current) return;
    setIsGenerating(true);

    try {
      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5, // High resolution for crisp printing
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 5, imgWidth, Math.min(imgHeight, pageHeight - 10));
      pdf.save(`Kartu_Pemeliharaan_AC_${unit.ruanganLokasi.replace(/\s+/g, '_')}_${settings.tahunDefault}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Gagal mendownload PDF, coba gunakan tombol Cetak Langsung.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[96vh]">
        {/* Header Bar */}
        <div className="bg-brand-800 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm sm:text-base">Pratinjau & Cetak Kartu Pemeliharaan</h3>
            <p className="text-blue-100 text-xs">
              Sesuai format resmi CV. SARANA REKATAMA BUANA
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Toolbar */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Format Lembar:</span>
            <div className="inline-flex rounded-lg bg-white p-1 border border-slate-300">
              <button
                type="button"
                onClick={() => setIncludePrices(false)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  !includePrices
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Format Asli (Blanko Fisik)
              </button>
              <button
                type="button"
                onClick={() => setIncludePrices(true)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                  includePrices
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Format Rekap & Biaya
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Cetak Langsung
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isGenerating ? 'Membuat PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Document Printable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/70 flex justify-center">
          <div
            ref={printAreaRef}
            id="printable-document"
            className="w-full max-w-[760px] bg-white p-8 sm:p-10 shadow-lg text-black font-sans leading-tight border border-slate-300 select-text"
            style={{ minHeight: '1000px', backgroundColor: '#ffffff' }}
          >
            {/* KOP SURAT (Identical to user's photo) */}
            <div className="flex items-center justify-start gap-5 pb-3">
              {/* Logo SAREBU */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-2 border-emerald-600 flex items-center justify-center p-1 relative">
                  <div className="text-[7px] text-emerald-800 font-bold uppercase text-center absolute -top-1 tracking-tighter">
                    CV. SARANA REKATAMA BUANA
                  </div>
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                    <span className="text-3xl font-black text-lime-500 tracking-tighter">S</span>
                  </div>
                  <div className="text-[7px] text-emerald-800 font-bold uppercase text-center absolute -bottom-1">
                    * TANGERANG *
                  </div>
                </div>
                <span className="text-[10px] font-black tracking-widest text-emerald-800 mt-1 uppercase border border-emerald-800 px-1 rounded-sm">
                  CV. SAREBU
                </span>
              </div>

              {/* Company Info */}
              <div className="flex-1 text-center">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-lime-600 drop-shadow-sm uppercase font-sans">
                  CV. SARANA REKATAMA BUANA
                </h1>
                <h2 className="text-sm sm:text-base font-extrabold tracking-widest text-emerald-700 uppercase mt-0.5">
                  SUPPLIER - CONTRACTOR
                </h2>
                <p className="text-xs text-slate-800 mt-1 font-medium">
                  {settings.alamat1}
                </p>
                <p className="text-xs text-slate-800 font-medium">
                  {settings.alamat2}
                </p>
              </div>
            </div>

            {/* Horizontal line */}
            <div className="w-full h-1 bg-emerald-700 mt-1 mb-4"></div>

            {/* Title Box */}
            <div className="border border-black py-1.5 px-4 text-center mb-4">
              <h3 className="text-base sm:text-lg font-bold tracking-wider uppercase text-black">
                KARTU PEMELIHARAAN AIR CONDITIONER TAHUN {settings.tahunDefault}
              </h3>
            </div>

            {/* Metadata Table (Mitra, Jenis AC, Merk, dll.) */}
            <div className="border border-black mb-4">
              <div className="grid grid-cols-12 divide-x divide-black text-xs font-semibold">
                <div className="col-span-4 p-1.5 pl-3 border-b border-black">MITRA</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-normal">: {unit.mitra || '-'}</div>

                <div className="col-span-4 p-1.5 pl-3 border-b border-black">JENIS AC</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-bold">: {unit.jenisAc}</div>

                <div className="col-span-4 p-1.5 pl-3 border-b border-black">MERK</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-bold">: {unit.merk}</div>

                <div className="col-span-4 p-1.5 pl-3 border-b border-black">TYPE</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-normal">: {unit.typeModel || '-'}</div>

                <div className="col-span-4 p-1.5 pl-3 border-b border-black">KAPASITAS</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-bold">: {unit.kapasitas}</div>

                <div className="col-span-4 p-1.5 pl-3 border-b border-black">NO. SERI</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-normal">: {unit.noSeri || '-'}</div>

                <div className="col-span-4 p-1.5 pl-3">RUANGAN / LOKASI</div>
                <div className="col-span-8 p-1.5 pl-3 font-bold">: {unit.ruanganLokasi}</div>
              </div>
            </div>

            {/* 12-ROW MAINTENANCE TABLE */}
            <div className="border border-black overflow-hidden">
              <table className="w-full text-xs text-black border-collapse">
                <thead>
                  <tr className="border-b border-black divide-x divide-black font-bold text-center">
                    <th className="w-12 py-2">NO</th>
                    <th className="w-32 py-2">TANGGAL</th>
                    <th className="py-2 px-3 text-left">URAIAN PEKERJAAN</th>
                    {includePrices && (
                      <>
                        <th className="w-24 py-2 px-2 text-right">BIAYA</th>
                        <th className="w-12 py-2 text-center">QTY</th>
                        <th className="w-28 py-2 px-2 text-right">TOTAL</th>
                      </>
                    )}
                    <th className="w-24 py-2">PARAF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {rows.map(({ no, record }) => (
                    <tr key={no} className="divide-x divide-black h-10">
                      <td className="text-center font-semibold py-1">{no}</td>
                      <td className="text-center py-1 px-2 font-medium">
                        {record?.tanggal || ''}
                      </td>
                      <td className="py-1 px-3 font-medium">
                        {record?.uraianPekerjaan || ''}
                      </td>
                      {includePrices && (
                        <>
                          <td className="py-1 px-2 text-right font-mono text-[11px]">
                            {record ? `Rp ${(record.biaya || 0).toLocaleString('id-ID')}` : ''}
                          </td>
                          <td className="py-1 text-center font-mono text-[11px]">
                            {record ? (record.qty || 1) : ''}
                          </td>
                          <td className="py-1 px-2 text-right font-mono font-bold text-[11px]">
                            {record ? `Rp ${(record.totalHarga || (record.biaya * (record.qty || 1)) || 0).toLocaleString('id-ID')}` : ''}
                          </td>
                        </>
                      )}
                      <td className="text-center py-0.5 px-1 align-middle">
                        {record?.parafUrl ? (
                          <img
                            src={record.parafUrl}
                            alt="Paraf"
                            className="max-h-8 max-w-[70px] mx-auto object-contain"
                          />
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {includePrices && (
                  <tfoot>
                    <tr className="border-t-2 border-black divide-x divide-black bg-slate-50 font-bold">
                      <td colSpan={5} className="py-2 px-3 text-right">
                        TOTAL ESTIMASI BIAYA PERBAIKAN:
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-900 font-black">
                        Rp {totalBiayaSemua.toLocaleString('id-ID')}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Footer QR code verification mark & Technician note */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-300">
              <div>
                <span>Dicetak otomatis dari Sistem Pemeliharaan AC • ID Unit: </span>
                <span className="font-mono font-semibold">{unit.qrCodeId}</span>
              </div>
              <div className="text-right">
                <span>Teknisi Pelaksana: </span>
                <span className="font-semibold text-black">Bpk. Teknisi AC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
