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
      scale: 2.5, // High DPI capture
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
        <div className="bg-slate-100 p-3 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 gap-2">
          <div className="text-xs text-slate-600 font-medium hidden sm:block">
            Format 1:1 Presisi dengan Blanko Nota Fisik
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Membuat PDF...' : 'Download PDF Bon'}</span>
            </button>
          </div>
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
                {/* ================= HEADER KOP SURAT BON (PERSIS GAMBAR 1) ================= */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  {/* KIRI: Logo ST Roda Gigi Hijau + Teks Profil Lengkap */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', width: '58%' }}>
                    <div style={{ width: '80px', height: '80px', flexShrink: 0, marginTop: '2px' }}>
                      <img
                        src="/logo-crop.png"
                        alt="Logo ST"
                        style={{ width: '75px', height: '82px', objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <h2
                        style={{
                          fontSize: '22px',
                          fontWeight: 900,
                          color: greenText,
                          margin: 0,
                          lineHeight: '1.15',
                          letterSpacing: '0.8px',
                          textTransform: 'uppercase'
                        }}
                      >
                        SUMBER TEKNIK DUA
                      </h2>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#2d3748',
                          marginTop: '3px',
                          marginBottom: '2px'
                        }}
                      >
                        Service, Jual-Beli
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#2d3748',
                          lineHeight: '1.25'
                        }}
                      >
                        AC Rumah, AC Mobil, Kulkas, Freezer
                        <br />
                        Water Heater, Mesin Cuci, Dispenser
                      </div>
                      <div
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 800,
                          color: greenText,
                          marginTop: '3px',
                          lineHeight: '1.25'
                        }}
                      >
                        Komp. Griya Serpong Blok H4/2
                        <br />
                        Telp. 0813 8895 9081
                        <br />
                        Serpong - Tangerang
                      </div>
                    </div>
                  </div>

                  {/* KANAN: Tangerang, Kepada Yth, Garis Titik-Titik, Telp */}
                  <div style={{ width: '40%', fontSize: '12.5px', color: greenText, fontWeight: 700, paddingTop: '4px' }}>
                    <div style={{ marginBottom: '6px' }}>
                      Tangerang,{' '}
                      <span style={{ color: '#111827', fontWeight: 'bold' }}>
                        {bon.tanggal || '...................................................'}
                      </span>
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      Kepada Yth,{' '}
                      <span style={{ color: '#111827', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {bon.kepadaYth || '................................................'}
                      </span>
                    </div>
                    <div style={{ color: greenText, letterSpacing: '1px', marginBottom: '6px', fontSize: '11px' }}>
                      ....................................................................................
                    </div>
                    <div style={{ color: greenText, letterSpacing: '1px', marginBottom: '6px', fontSize: '11px' }}>
                      ....................................................................................
                    </div>
                    <div>
                      Telp.{' '}
                      <span style={{ color: '#111827', fontWeight: 'bold' }}>
                        {bon.telpPelanggan || '...........................................................'}
                      </span>
                    </div>
                  </div>
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

                {/* ================= FOOTER & TANDA TANGAN (PERSIS GAMBAR 1) ================= */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginTop: '25px',
                    position: 'relative'
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
                        marginBottom: '2px'
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
                          maxWidth: '150px',
                          objectFit: 'contain'
                        }}
                      />
                    </div>

                    {/* Garis Nama Teknisi */}
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>
                      ( {bon.namaTeknisi || '........................................'} )
                    </div>
                  </div>

                  {/* TENGAH/KANAN: Stamp Biru Resmi SUMBER TEKNIK DUA + Garis Penerima */}
                  <div style={{ marginLeft: '40px', textAlign: 'center', width: '320px' }}>
                    {/* Cap Stamp Resmi */}
                    <div
                      style={{
                        height: '78px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '10px'
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
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', marginTop: '2px' }}>
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
