import React, { useRef, useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ACUnit, MaintenanceRecord } from '../types';
import { FIXED_SIGNATURE_PATH } from '../db/db';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState<number>(0.45);

  // Responsive scaling ONLY for visual modal view on mobile
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 20;
        const standardA4Width = 794;
        const calculatedScale = Math.min(1, containerWidth / standardA4Width);
        setPreviewScale(calculatedScale > 0.3 ? calculatedScale : 0.45);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isOpen]);

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
      scale: 2.5, // Ultra-sharp 2.5x High-DPI
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('printable-document');
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.webkitTransform = 'none';
          clonedElement.style.position = 'static';
          clonedElement.style.width = '794px';
          clonedElement.style.minWidth = '794px';
          clonedElement.style.maxWidth = '794px';
          clonedElement.style.height = 'auto';
          clonedElement.style.minHeight = '1120px';
          clonedElement.style.margin = '0 auto';
          clonedElement.style.padding = '32px 42px';
          clonedElement.style.boxSizing = 'border-box';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const targetWidth = pageWidth - (margin * 2);
    const targetHeight = (canvas.height * targetWidth) / canvas.width;

    pdf.addImage(
      imgData,
      'PNG',
      margin,
      margin,
      targetWidth,
      Math.min(targetHeight, pageHeight - (margin * 2)),
      undefined,
      'FAST'
    );

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
      alert('Gagal mendownload PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[96vh]">
        {/* Header Bar */}
        <div className="bg-brand-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm sm:text-base">Pratinjau Kartu Pemeliharaan AC</h3>
            <p className="text-emerald-200 text-xs">
              Lokasi: <span className="text-white font-bold">{unit.ruanganLokasi}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: DOWNLOAD PDF BUTTON */}
        <div className="bg-slate-100 p-3 px-4 border-b border-slate-200 flex items-center justify-end shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Membuat PDF Full-Page...' : 'Download PDF Kartu Pemeliharaan'}</span>
          </button>
        </div>

        {/* Document Viewport */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-6 bg-slate-200/90 flex justify-center items-start"
        >
          {/* Sizer box taking up the scaled dimensions */}
          <div
            style={{
              width: `${794 * previewScale}px`,
              height: `${1130 * previewScale}px`,
              position: 'relative'
            }}
          >
            {/* The exact A4 Document element */}
            <div
              ref={printAreaRef}
              id="printable-document"
              style={{
                width: '794px',
                minWidth: '794px',
                maxWidth: '794px',
                minHeight: '1120px',
                backgroundColor: '#ffffff',
                padding: '32px 42px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              className="shadow-2xl text-black select-text flex flex-col justify-between"
            >
              <div>
                {/* ================= KOP SURAT HD SUMBER TEKNIK DUA (GAMBAR 4) ================= */}
                <div style={{ width: '100%', marginBottom: '16px' }}>
                  <img
                    src="/kop-card-hd.png"
                    alt="Kop Surat SUMBER TEKNIK DUA"
                    style={{
                      maxHeight: '125px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
                  {/* Decorative divider line */}
                  <div style={{ marginTop: '10px', borderBottom: '2.5px solid #14532d' }}></div>
                  <div style={{ marginTop: '2px', borderBottom: '1px solid #16a34a' }}></div>
                </div>

                {/* Title Box */}
                <div
                  style={{
                    border: '1.5px solid #000000',
                    padding: '8px 12px',
                    textAlign: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <h3
                    style={{
                      fontSize: '18px',
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

                {/* Metadata Table - SINKRON & BESAR (15px bold) */}
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
                      fontSize: '15px'
                    }}
                  >
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td style={{ width: '250px', padding: '6px 12px', fontWeight: 'bold' }}>MITRA</td>
                        <td style={{ padding: '6px 12px', borderLeft: '1px solid #000000', fontWeight: 'bold' }}>: {unit.mitra || ''}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 'bold' }}>JENIS AC</td>
                        <td style={{ padding: '6px 12px', borderLeft: '1px solid #000000', fontWeight: 'bold', textTransform: 'uppercase' }}>: {unit.jenisAc || ''}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 'bold' }}>MERK</td>
                        <td style={{ padding: '6px 12px', borderLeft: '1px solid #000000', fontWeight: 'bold', textTransform: 'uppercase' }}>: {unit.merk || ''}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 'bold' }}>TYPE</td>
                        <td style={{ padding: '6px 12px', borderLeft: '1px solid #000000', fontWeight: 'bold' }}>: {unit.typeModel || ''}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 'bold' }}>KAPASITAS</td>
                        <td style={{ padding: '6px 12px', borderLeft: '1px solid #000000', fontWeight: 'bold' }}>: {unit.kapasitas || ''}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 'bold' }}>NO. SERI</td>
                        <td style={{ padding: '6px 12px', borderLeft: '1px solid #000000', fontWeight: 'bold' }}>: {unit.noSeri || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 12px', fontWeight: 'bold' }}>RUANGAN / LOKASI</td>
                        <td style={{ padding: '6px 12px', borderLeft: '1px solid #000000', fontWeight: 'bold', textTransform: 'uppercase' }}>: {unit.ruanganLokasi || ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 12-ROW SERVICE HISTORY TABLE - TULISAN BESAR, BOLD & MENGISI HALAMAN */}
                <div
                  style={{
                    border: '1.5px solid #000000'
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14.5px'
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: '1.5px solid #000000',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          backgroundColor: '#f8fafc'
                        }}
                      >
                        <th style={{ width: '50px', padding: '9px 4px', borderRight: '1px solid #000000' }}>NO</th>
                        <th style={{ width: '135px', padding: '9px 6px', borderRight: '1px solid #000000' }}>TANGGAL</th>
                        <th style={{ padding: '9px 12px', textAlign: 'center', borderRight: '1px solid #000000' }}>URAIAN PEKERJAAN</th>
                        <th style={{ width: '125px', padding: '9px 6px' }}>PARAF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ no, record }) => (
                        <tr
                          key={no}
                          style={{
                            height: '40px',
                            borderBottom: no < 12 ? '1px solid #000000' : 'none'
                          }}
                        >
                          <td
                            style={{
                              textAlign: 'center',
                              fontWeight: 'bold',
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
                              fontWeight: 'bold'
                            }}
                          >
                            {record?.tanggal || ''}
                          </td>
                          <td
                            style={{
                              borderRight: '1px solid #000000',
                              verticalAlign: 'middle',
                              padding: '5px 12px',
                              fontWeight: 'bold',
                              whiteSpace: 'pre-line',
                              lineHeight: '1.35',
                              textTransform: 'uppercase'
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
                                alt="Paraf Teknisi"
                                style={{
                                  maxHeight: '34px',
                                  maxWidth: '95px',
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

              {/* Bottom minimal spacer */}
              <div style={{ height: '8px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
