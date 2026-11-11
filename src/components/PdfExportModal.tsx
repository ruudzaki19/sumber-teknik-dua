import React, { useRef, useState } from 'react';
import { X, Download, Printer, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ACUnit, MaintenanceRecord } from '../types';
import { FIXED_KOP_PATH, FIXED_SIGNATURE_PATH } from '../db/db';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: ACUnit;
  records: MaintenanceRecord[];
  year?: string;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  unit,
  records,
  year = '2026'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // 12 rows matching the physical card
  const rows = Array.from({ length: 12 }, (_, index) => {
    const record = records.find(r => (r.nomorUrut || 0) === index + 1) || records[index];
    return {
      no: index + 1,
      record: record || null
    };
  });

  const generatePdfBlob = async (): Promise<{ blob: Blob; filename: string } | null> => {
    if (!printAreaRef.current) return null;
    const element = printAreaRef.current;
    const canvas = await html2canvas(element, {
      scale: 2.5,
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

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 5, imgWidth, Math.min(imgHeight, pageHeight - 10));
    const filename = `Kartu_Pemeliharaan_AC_${unit.ruanganLokasi.replace(/[^a-zA-Z0-9]/g, '_')}_${year}.pdf`;
    const blob = pdf.output('blob');
    return { blob, filename };
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const res = await generatePdfBlob();
      if (!res) return;

      const url = URL.createObjectURL(res.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = res.filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Gagal mendownload otomatis. Silakan gunakan tombol "Buka di Tab Baru" atau "Cetak Langsung".');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInNewTab = async () => {
    setIsGenerating(true);
    try {
      const res = await generatePdfBlob();
      if (!res) return;
      const url = URL.createObjectURL(res.blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error opening PDF:', err);
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
        <div className="bg-brand-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm sm:text-base">Pratinjau Kartu Pemeliharaan AC</h3>
            <p className="text-blue-200 text-xs">
              Kop Surat Resmi CV. SARANA REKATAMA BUANA
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-600 font-semibold">
            Lokasi: <span className="text-brand-900 font-bold">{unit.ruanganLokasi}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenInNewTab}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors"
              title="Buka langsung di tab baru browser untuk preview & simpan"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-700" />
              Buka di Tab Baru
            </button>
            <button
              onClick={handleDirectPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Cetak Langsung
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
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
            style={{ minHeight: '980px', backgroundColor: '#ffffff' }}
          >
            {/* KOP SURAT (Image 7 Exact Crop) */}
            <div className="w-full mb-3">
              <img
                src={FIXED_KOP_PATH}
                alt="Kop Surat CV. SARANA REKATAMA BUANA"
                className="w-full h-auto object-contain block"
              />
            </div>

            {/* Title Box */}
            <div className="border border-black py-1.5 px-4 text-center mb-4">
              <h3 className="text-base sm:text-lg font-bold tracking-wider uppercase text-black">
                KARTU PEMELIHARAAN AIR CONDITIONER TAHUN {year}
              </h3>
            </div>

            {/* Metadata Table */}
            <div className="border border-black mb-4">
              <div className="grid grid-cols-12 divide-x divide-black text-xs font-semibold">
                <div className="col-span-4 p-1.5 pl-3 border-b border-black">MITRA</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-normal">: {unit.mitra || ''}</div>

                <div className="col-span-4 p-1.5 pl-3 border-b border-black">JENIS AC</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-bold">: {unit.jenisAc}</div>

                <div className="col-span-4 p-1.5 pl-3 border-b border-black">MERK</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-bold">: {unit.merk}</div>

                <div className="col-span-4 p-1.5 pl-3 border-b border-black">TYPE</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-normal">: {unit.typeModel || ''}</div>

                <div className="col-span-4 p-1.5 pl-3 border-b border-black">KAPASITAS</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-bold">: {unit.kapasitas}</div>

                <div className="col-span-4 p-1.5 pl-3 border-b border-black">NO. SERI</div>
                <div className="col-span-8 p-1.5 pl-3 border-b border-black font-normal">: {unit.noSeri || ''}</div>

                <div className="col-span-4 p-1.5 pl-3">RUANGAN / LOKASI</div>
                <div className="col-span-8 p-1.5 pl-3 font-bold">: {unit.ruanganLokasi}</div>
              </div>
            </div>

            {/* 12-ROW MAINTENANCE TABLE (No prices, pure work log) */}
            <div className="border border-black overflow-hidden">
              <table className="w-full text-xs text-black border-collapse">
                <thead>
                  <tr className="border-b border-black divide-x divide-black font-bold text-center">
                    <th className="w-12 py-2">NO</th>
                    <th className="w-36 py-2">TANGGAL</th>
                    <th className="py-2 px-3 text-left">URAIAN PEKERJAAN</th>
                    <th className="w-28 py-2">PARAF</th>
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
                      <td className="text-center py-0.5 px-1 align-middle">
                        {record ? (
                          <img
                            src={FIXED_SIGNATURE_PATH}
                            alt="Paraf"
                            className="max-h-8 max-w-[75px] mx-auto object-contain"
                          />
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Verification Footer */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-300">
              <div>
                <span>ID Unit QR: </span>
                <span className="font-mono font-semibold text-slate-800">{unit.qrCodeId}</span>
              </div>
              <div>
                <span>Sistem Kartu Pemeliharaan AC • Sumber Tekhnik 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
