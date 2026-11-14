import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Bon } from '../types';
import { FIXED_SIGNATURE_PATH } from '../db/db';

interface BonPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  bon: Bon;
}

export const BonPdfModal: React.FC<BonPdfModalProps> = ({
  isOpen,
  onClose,
  bon
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState<number>(0.5);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 20;
        const standardA4Width = 794;
        const calculatedScale = Math.min(1, containerWidth / standardA4Width);
        setPreviewScale(calculatedScale > 0.3 ? calculatedScale : 0.5);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isOpen]);

  if (!isOpen) return null;

  const items = bon.items || [];
  // Gambar 1 memiliki tepat 11 baris data di dalam tabel bon
  const TOTAL_ROWS = 11;
  const displayRows = Array.from({ length: TOTAL_ROWS }, (_, i) => items[i] || null);

  const formatNumber = (val: number) => {
    if (!val && val !== 0) return '';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const generatePdfBlob = async (): Promise<{ blob: Blob; filename: string } | null> => {
    if (!printAreaRef.current) return null;
    const element = printAreaRef.current;

    const canvas = await html2canvas(element, {
      scale: 3, // Ultra HD 300 DPI capture
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('printable-bon');
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.webkitTransform = 'none';
          clonedElement.style.position = 'static';
          clonedElement.style.width = '794px';
          clonedElement.style.minWidth = '794px';
          clonedElement.style.maxWidth = '794px';
          clonedElement.style.height = 'auto';
          clonedElement.style.margin = '0 auto';
          clonedElement.style.padding = '36px 42px';
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

    const safeNum = (bon.nomorBon || 'STD').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Nota_Bon_${safeNum}.pdf`;
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
      alert('Gagal mendownload PDF Bon.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const greenBorder = '1.8px solid #1b6837';
  const greenText = '#1b6837';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[96vh]">
        {/* Header Bar Modal */}
        <div className="bg-brand-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm sm:text-base">Pratinjau Nota / Bon Transaksi</h3>
            <p className="text-emerald-200 text-xs">
              Sesuai Format Fisik SUMBER TEKNIK DUA
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-100 p-3 px-4 border-b border-slate-200 flex items-center justify-end shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Membuat PDF HD...' : 'Download PDF Bon'}</span>
          </button>
        </div>

        {/* Document Viewport */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-6 bg-slate-200/90 flex justify-center items-start"
        >
          {/* Sizer Box */}
          <div
            style={{
              width: `${794 * previewScale}px`,
              height: `${1080 * previewScale}px`,
              position: 'relative'
            }}
          >
            {/* The exact Bon Document (A4 format matching Gambar 1) */}
            <div
              ref={printAreaRef}
              id="printable-bon"
              style={{
                width: '794px',
                minWidth: '794px',
                maxWidth: '794px',
                minHeight: '1060px',
                backgroundColor: '#ffffff',
                padding: '36px 42px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, Helvetica, sans-serif',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              className="shadow-2xl text-black select-text flex flex-col justify-between"
            >
              <div>
                {/* ================= HEADER KOP SURAT BON (PERSIS GAMBAR 4 HD) ================= */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    marginBottom: '16px'
                  }}
                >
                  <img
                    src="/kop-surat-hd.jpg"
                    alt="Kop Surat SUMBER TEKNIK DUA"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />

                  {/* Dynamic overlays for customer fields over dotted lines */}
                  {bon.tanggal && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10%',
                        left: '71.5%',
                        right: '1.5%',
                        backgroundColor: '#ffffff',
                        padding: '0 4px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#111827',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {bon.tanggal}
                    </div>
                  )}

                  {bon.kepadaYth && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '28%',
                        left: '72.5%',
                        right: '1.5%',
                        backgroundColor: '#ffffff',
                        padding: '0 4px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#111827',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {bon.kepadaYth}
                    </div>
                  )}

                  {bon.telpPelanggan && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '79.5%',
                        left: '66%',
                        right: '1.5%',
                        backgroundColor: '#ffffff',
                        padding: '0 4px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#111827',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {bon.telpPelanggan}
                    </div>
                  )}
                </div>

                {/* ================= TABEL 11 BARIS BORDER HIJAU (PERSIS GAMBAR 1) ================= */}
                <div style={{ width: '100%', marginBottom: '0px' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '13.5px',
                      border: greenBorder
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          height: '38px',
                          borderBottom: greenBorder,
                          color: greenText,
                          fontWeight: 900,
                          textAlign: 'center',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <th style={{ width: '125px', padding: '6px 4px', borderRight: greenBorder }}>
                          BANYAKNYA
                        </th>
                        <th style={{ padding: '6px 12px', borderRight: greenBorder }}>
                          KETERANGAN
                        </th>
                        <th style={{ width: '145px', padding: '6px 8px', borderRight: greenBorder }}>
                          HARGA SATUAN
                        </th>
                        <th style={{ width: '155px', padding: '6px 8px' }}>
                          JUMLAH
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.map((item, index) => (
                        <tr
                          key={index}
                          style={{
                            height: '38px',
                            borderBottom: greenBorder,
                            backgroundColor: '#ffffff'
                          }}
                        >
                          {/* Kolom 1: Banyaknya */}
                          <td
                            style={{
                              textAlign: 'center',
                              fontWeight: 'bold',
                              borderRight: greenBorder,
                              verticalAlign: 'middle',
                              padding: '4px 6px',
                              color: '#111827'
                            }}
                          >
                            {item ? item.banyaknya : ''}
                          </td>

                          {/* Kolom 2: Keterangan */}
                          <td
                            style={{
                              padding: '4px 12px',
                              borderRight: greenBorder,
                              verticalAlign: 'middle',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              color: '#111827'
                            }}
                          >
                            {item ? item.keterangan : ''}
                          </td>

                          {/* Kolom 3: Harga Satuan */}
                          <td
                            style={{
                              textAlign: 'right',
                              padding: '4px 10px',
                              borderRight: greenBorder,
                              verticalAlign: 'middle',
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              color: '#111827'
                            }}
                          >
                            {item && item.hargaSatuan ? formatNumber(item.hargaSatuan) : ''}
                          </td>

                          {/* Kolom 4: Jumlah */}
                          <td
                            style={{
                              textAlign: 'right',
                              padding: '4px 10px',
                              verticalAlign: 'middle',
                              fontFamily: 'monospace',
                              fontWeight: 900,
                              color: '#111827'
                            }}
                          >
                            {item && item.jumlah ? formatNumber(item.jumlah) : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* ================= BARIS JUMLAH & RP DI BAWAH TABEL (PERSIS GAMBAR 1) ================= */}
                  <div style={{ display: 'flex', width: '100%' }}>
                    {/* Kolom 1 & 2 di bawah tabel kosong tanpa border */}
                    <div style={{ flex: '1 1 auto' }}></div>

                    {/* Kolom 3: JUMLAH */}
                    <div
                      style={{
                        width: '145px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderLeft: 'none',
                        borderRight: greenBorder,
                        borderBottom: 'none',
                        fontWeight: 900,
                        fontSize: '14px',
                        color: greenText,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      JUMLAH
                    </div>

                    {/* Kolom 4: Rp. [Total] dengan Box Border Hijau */}
                    <div
                      style={{
                        width: '155px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 10px',
                        borderLeft: greenBorder,
                        borderRight: greenBorder,
                        borderBottom: greenBorder,
                        fontWeight: 900,
                        fontSize: '14.5px',
                        color: '#111827',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                    >
                      <span style={{ color: greenText }}>Rp.</span>
                      <span>{formatNumber(bon.totalJumlah)}</span>
                    </div>
                  </div>
                </div>

                {/* ================= FOOTER & TANDA TANGAN (PERSIS GAMBAR 3) ================= */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginTop: '28px',
                    padding: '0 10px'
                  }}
                >
                  {/* KIRI BAWAH: TEKNISI + Paraf Resmi + Nama Teknisi */}
                  <div style={{ textAlign: 'center', width: '220px' }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 900,
                        color: greenText,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '4px'
                      }}
                    >
                      TEKNISI
                    </div>

                    {/* Paraf Resmi Teknisi */}
                    <div
                      style={{
                        height: '75px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img
                        src={FIXED_SIGNATURE_PATH}
                        alt="Paraf Teknisi Resmi"
                        style={{
                          maxHeight: '70px',
                          maxWidth: '160px',
                          objectFit: 'contain'
                        }}
                      />
                    </div>

                    {/* Garis Nama Teknisi */}
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', marginTop: '2px' }}>
                      ( {bon.namaTeknisi || '........................................'} )
                    </div>
                  </div>

                  {/* KANAN: Stamp Biru Resmi SUMBER TEKNIK DUA + Garis Penerima (Gambar 3) */}
                  <div style={{ textAlign: 'center', width: '320px', marginRight: '15px' }}>
                    {/* Cap Stamp Resmi Ultra Clean (Pristine 0 Black Ink) */}
                    <div
                      style={{
                        height: '78px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '16px'
                      }}
                    >
                      <img
                        src="/stamp-clean.png"
                        alt="SUMBER TEKNIK DUA Telp. 0813 8895 9081"
                        style={{
                          maxHeight: '62px',
                          maxWidth: '300px',
                          objectFit: 'contain'
                        }}
                      />
                    </div>

                    {/* Garis Nama Penerima */}
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', marginTop: '6px' }}>
                      ( {bon.namaPenerima || '........................................'} )
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal spacer */}
              <div style={{ height: '10px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
