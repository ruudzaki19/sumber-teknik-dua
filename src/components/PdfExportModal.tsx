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

  // 12 rows matching the physical card (Gambar 5)
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

    // Capture with desktop A4 dimensions to eliminate mobile distortion and blurriness
    const canvas = await html2canvas(element, {
      scale: 2.5, // High resolution for crisp, clear text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      windowWidth: 1024
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Exact A4 dimensions: 210mm x 297mm
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
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
              Format Standar A4 Resmi (Persis Gambar Asli)
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

        {/* Document Printable Viewport - Horizontal scroll container for mobile */}
        <div className="flex-1 overflow-auto p-4 bg-slate-200/80 flex justify-center">
          {/* FIXED A4 CANVAS CONTAINER (Exact standard A4 794px width) */}
          <div
            ref={printAreaRef}
            id="printable-document"
            style={{
              width: '794px',
              minWidth: '794px',
              maxWidth: '794px',
              minHeight: '1123px',
              height: '1123px',
              backgroundColor: '#ffffff',
              padding: '38px 46px',
              boxSizing: 'border-box',
              fontFamily: 'Arial, sans-serif'
            }}
            className="shadow-xl text-black border border-slate-300 select-text flex flex-col justify-between"
          >
            <div>
              {/* KOP SURAT (Image 7 Exact Crop) */}
              <div className="w-full mb-3">
                <img
                  src={FIXED_KOP_PATH}
                  alt="Kop Surat CV. SARANA REKATAMA BUANA"
                  className="w-full h-auto object-contain block"
                  style={{ maxHeight: '110px' }}
                />
              </div>

              {/* Title Box (Identical to Gambar 5) */}
              <div
                style={{
                  border: '1.5px solid #000000',
                  padding: '7px 12px',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}
              >
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    margin: 0,
                    color: '#000000'
                  }}
                >
                  KARTU PEMELIHARAAN AIR CONDITIONER TAHUN {year}
                </h3>
              </div>

              {/* Metadata Table (Identical to Gambar 5) */}
              <div
                style={{
                  border: '1.5px solid #000000',
                  marginBottom: '18px'
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px'
                  }}
                >
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #000000' }}>
                      <td style={{ width: '240px', padding: '5px 10px', fontWeight: 'bold' }}>MITRA</td>
                      <td style={{ padding: '5px 10px', borderLeft: '1px solid #000000' }}>: {unit.mitra || ''}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #000000' }}>
                      <td style={{ padding: '5px 10px', fontWeight: 'bold' }}>JENIS AC</td>
                      <td style={{ padding: '5px 10px', borderLeft: '1px solid #000000', fontWeight: 'bold', textTransform: 'uppercase' }}>: {unit.jenisAc || ''}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #000000' }}>
                      <td style={{ padding: '5px 10px', fontWeight: 'bold' }}>MERK</td>
                      <td style={{ padding: '5px 10px', borderLeft: '1px solid #000000', fontWeight: 'bold', textTransform: 'uppercase' }}>: {unit.merk || ''}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #000000' }}>
                      <td style={{ padding: '5px 10px', fontWeight: 'bold' }}>TYPE</td>
                      <td style={{ padding: '5px 10px', borderLeft: '1px solid #000000' }}>: {unit.typeModel || ''}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #000000' }}>
                      <td style={{ padding: '5px 10px', fontWeight: 'bold' }}>KAPASITAS</td>
                      <td style={{ padding: '5px 10px', borderLeft: '1px solid #000000', fontWeight: 'bold' }}>: {unit.kapasitas || ''}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #000000' }}>
                      <td style={{ padding: '5px 10px', fontWeight: 'bold' }}>NO. SERI</td>
                      <td style={{ padding: '5px 10px', borderLeft: '1px solid #000000' }}>: {unit.noSeri || ''}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 10px', fontWeight: 'bold' }}>RUANGAN / LOKASI</td>
                      <td style={{ padding: '5px 10px', borderLeft: '1px solid #000000', fontWeight: 'bold', textTransform: 'uppercase' }}>: {unit.ruanganLokasi || ''}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 12-ROW SERVICE HISTORY TABLE (Identical to Gambar 5) */}
              <div
                style={{
                  border: '1.5px solid #000000'
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12.5px'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1.5px solid #000000',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <th style={{ width: '45px', padding: '8px 4px', borderRight: '1px solid #000000' }}>NO</th>
                      <th style={{ width: '135px', padding: '8px 6px', borderRight: '1px solid #000000' }}>TANGGAL</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #000000' }}>URAIAN PEKERJAAN</th>
                      <th style={{ width: '120px', padding: '8px 6px' }}>PARAF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ no, record }) => (
                      <tr
                        key={no}
                        style={{
                          height: '38px',
                          borderBottom: no < 12 ? '1px solid #000000' : 'none'
                        }}
                      >
                        <td
                          style={{
                            textAlign: 'center',
                            fontWeight: '600',
                            borderRight: '1px solid #000000',
                            verticalAlign: 'middle',
                            padding: '4px'
                          }}
                        >
                          {no}
                        </td>
                        <td
                          style={{
                            textAlign: 'center',
                            borderRight: '1px solid #000000',
                            verticalAlign: 'middle',
                            padding: '4px 8px',
                            fontWeight: '500'
                          }}
                        >
                          {record?.tanggal || ''}
                        </td>
                        <td
                          style={{
                            borderRight: '1px solid #000000',
                            verticalAlign: 'middle',
                            padding: '4px 12px',
                            fontWeight: '500',
                            whiteSpace: 'pre-line',
                            lineHeight: '1.3'
                          }}
                        >
                          {record?.uraianPekerjaan || ''}
                        </td>
                        <td
                          style={{
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            padding: '2px 6px'
                          }}
                        >
                          {record ? (
                            <img
                              src={FIXED_SIGNATURE_PATH}
                              alt="Paraf"
                              style={{
                                maxHeight: '32px',
                                maxWidth: '90px',
                                margin: '0 auto',
                                display: 'block',
                                objectFit: 'contain'
                              }}
                            />
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom minimal spacer to lock A4 height */}
            <div style={{ height: '8px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
