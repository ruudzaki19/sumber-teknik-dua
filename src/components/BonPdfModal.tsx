import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Image as ImageIcon } from 'lucide-react';
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
  // Tepat 13 baris data di dalam tabel bon sesuai format fisik resmi
  const TOTAL_ROWS = 13;
  const displayRows = Array.from({ length: TOTAL_ROWS }, (_, i) => items[i] || null);

  const formatNumber = (val: number) => {
    if (!val && val !== 0) return '';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const handleDownloadJPG = async () => {
    if (!printAreaRef.current) return;
    setIsGenerating(true);
    try {
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

      const jpgUrl = canvas.toDataURL('image/jpeg', 0.98);
      const safeNum = (bon.nomorBon || 'STD').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeName = (bon.kepadaYth || 'Pelanggan').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Nota_Bon_${safeNum}_${safeName}.jpg`;

      const link = document.createElement('a');
      link.href = jpgUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating JPG Bon:', err);
      alert('Gagal mendownload Gambar Bon (JPG).');
    } finally {
      setIsGenerating(false);
    }
  };

  const greenBorder = '1.8px solid #1b6837';
  const greenText = '#1b6837';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[96vh]">
        {/* Header Bar Modal */}
        <div className="bg-brand-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Pratinjau Nota / Bon Transaksi</h3>
              <p className="text-emerald-200 text-xs">
                Format Resmi SUMBER TEKNIK DUA (Siap Simpan ke Galeri / Unduh JPG)
              </p>
            </div>
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
            onClick={handleDownloadJPG}
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Membuat Gambar HD...' : 'Download Gambar Bon (JPG)'}</span>
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
              height: `${1120 * previewScale}px`,
              position: 'relative'
            }}
          >
            {/* The exact Bon Document (A4 format matching Format Resmi) */}
            <div
              ref={printAreaRef}
              id="printable-bon"
              style={{
                width: '794px',
                minWidth: '794px',
                maxWidth: '794px',
                minHeight: '1090px',
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
                {/* ================= HEADER KOP SURAT BON HD & BIDANG KEPADA YTH (UKURAN BESAR & HIJAU) ================= */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    width: '100%',
                    marginBottom: '20px',
                    gap: '24px'
                  }}
                >
                  {/* Kiri: Kop Surat HD SUMBER TEKNIK DUA (Besar & Tulisan Hijau) */}
                  <div style={{ flex: '1 1 56%', maxWidth: '425px' }}>
                    <img
                      src="/kop-card-hd.png"
                      alt="SUMBER TEKNIK DUA"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                  </div>

                  {/* Kanan: Field Pelanggan Rapi dengan Garis Titik-Titik Hijau (Ukuran Lebih Besar) */}
                  <div
                    style={{
                      flex: '1 1 42%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      paddingTop: '4px'
                    }}
                  >
                    {/* Baris 1: Tangerang, [Tanggal] */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        minHeight: '29px',
                        marginBottom: '7px'
                      }}
                    >
                      <span
                        style={{
                          color: greenText,
                          fontWeight: 700,
                          fontSize: '14.5px',
                          whiteSpace: 'nowrap',
                          marginRight: '6px'
                        }}
                      >
                        Tangerang,
                      </span>
                      <span
                        style={{
                          flex: 1,
                          borderBottom: '1.4px dotted #1b6837',
                          color: '#111827',
                          fontWeight: 'bold',
                          fontSize: '14.5px',
                          paddingBottom: '2px',
                          paddingLeft: '4px',
                          minHeight: '22px'
                        }}
                      >
                        {bon.tanggal || ''}
                      </span>
                    </div>

                    {/* Baris 2: Kepada Yth, [Nama Pelanggan] (TANPA AUTO CAPSLOCK) */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        minHeight: '29px',
                        marginBottom: '7px'
                      }}
                    >
                      <span
                        style={{
                          color: greenText,
                          fontWeight: 700,
                          fontSize: '14.5px',
                          whiteSpace: 'nowrap',
                          marginRight: '6px'
                        }}
                      >
                        Kepada Yth,
                      </span>
                      <span
                        style={{
                          flex: 1,
                          borderBottom: '1.4px dotted #1b6837',
                          color: '#111827',
                          fontWeight: 'bold',
                          fontSize: '14.5px',
                          paddingBottom: '2px',
                          paddingLeft: '4px',
                          minHeight: '22px'
                        }}
                      >
                        {bon.kepadaYth || ''}
                      </span>
                    </div>

                    {/* Baris 3: Garis Titik-Titik Kosong */}
                    <div
                      style={{
                        minHeight: '26px',
                        borderBottom: '1.4px dotted #1b6837',
                        marginBottom: '7px'
                      }}
                    />

                    {/* Baris 4: Garis Titik-Titik Kosong */}
                    <div
                      style={{
                        minHeight: '26px',
                        borderBottom: '1.4px dotted #1b6837',
                        marginBottom: '7px'
                      }}
                    />

                    {/* Baris 5: Telp. [No. HP Pelanggan] */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        minHeight: '29px'
                      }}
                    >
                      <span
                        style={{
                          color: greenText,
                          fontWeight: 700,
                          fontSize: '14.5px',
                          whiteSpace: 'nowrap',
                          marginRight: '6px'
                        }}
                      >
                        Telp.
                      </span>
                      <span
                        style={{
                          flex: 1,
                          borderBottom: '1.4px dotted #1b6837',
                          color: '#111827',
                          fontWeight: 'bold',
                          fontSize: '14.5px',
                          paddingBottom: '2px',
                          paddingLeft: '4px',
                          minHeight: '22px'
                        }}
                      >
                        {bon.telpPelanggan || ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================= TABEL 13 BARIS BORDER HIJAU ================= */}
                <div style={{ width: '100%', marginBottom: '0px' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14.5px',
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
                          fontSize: '15px',
                          letterSpacing: '0.5px',
                          textAlign: 'center',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <th style={{ width: '120px', padding: '6px 4px', borderRight: greenBorder, textAlign: 'center' }}>
                          BANYAKNYA
                        </th>
                        <th style={{ padding: '6px 12px', borderRight: greenBorder, textAlign: 'center' }}>
                          KETERANGAN
                        </th>
                        <th style={{ width: '145px', padding: '6px 8px', borderRight: greenBorder, textAlign: 'center' }}>
                          HARGA SATUAN
                        </th>
                        <th style={{ width: '165px', padding: '6px 8px', textAlign: 'center' }}>
                          JUMLAH
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.map((item, index) => (
                        <tr
                          key={index}
                          style={{
                            height: '37px',
                            borderBottom: greenBorder,
                            backgroundColor: '#ffffff'
                          }}
                        >
                          {/* Kolom 1: Banyaknya */}
                          <td
                            style={{
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: '14.5px',
                              borderRight: greenBorder,
                              verticalAlign: 'middle',
                              padding: '4px 6px',
                              color: '#111827'
                            }}
                          >
                            {item ? item.banyaknya : ''}
                          </td>

                          {/* Kolom 2: Keterangan (TANPA AUTO CAPSLOCK) */}
                          <td
                            style={{
                              padding: '4px 14px',
                              borderRight: greenBorder,
                              verticalAlign: 'middle',
                              fontWeight: 'bold',
                              fontSize: '14.5px',
                              color: '#111827'
                            }}
                          >
                            {item ? item.keterangan : ''}
                          </td>

                          {/* Kolom 3: Harga Satuan (Auto Ada Rp.) */}
                          <td
                            style={{
                              padding: '4px 10px',
                              borderRight: greenBorder,
                              verticalAlign: 'middle',
                              color: '#111827'
                            }}
                          >
                            {item && (item.hargaSatuan || item.hargaSatuan === 0) ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%'
                                }}
                              >
                                <span style={{ color: greenText, fontWeight: 700, fontSize: '13px' }}>
                                  Rp.
                                </span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14.5px' }}>
                                  {formatNumber(item.hargaSatuan)}
                                </span>
                              </div>
                            ) : ''}
                          </td>

                          {/* Kolom 4: Jumlah (Auto Ada Rp.) */}
                          <td
                            style={{
                              padding: '4px 10px',
                              verticalAlign: 'middle',
                              color: '#111827'
                            }}
                          >
                            {item && (item.jumlah || item.jumlah === 0) ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%'
                                }}
                              >
                                <span style={{ color: greenText, fontWeight: 700, fontSize: '13px' }}>
                                  Rp.
                                </span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '14.5px' }}>
                                  {formatNumber(item.jumlah)}
                                </span>
                              </div>
                            ) : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* ================= BARIS JUMLAH & RP DI BAWAH TABEL ================= */}
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
                        fontSize: '14.5px',
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
                        width: '165px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 10px',
                        borderLeft: greenBorder,
                        borderRight: greenBorder,
                        borderBottom: greenBorder,
                        fontWeight: 900,
                        fontSize: '15px',
                        color: '#111827',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                    >
                      <span style={{ color: greenText, fontWeight: 900, fontSize: '14px' }}>Rp.</span>
                      <span>{formatNumber(bon.totalJumlah)}</span>
                    </div>
                  </div>
                </div>

                {/* ================= FOOTER & TANDA TANGAN (YULIANTO + STEMPEL MENIMPA SEDIKIT) ================= */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: '28px',
                    padding: '0 10px',
                    position: 'relative'
                  }}
                >
                  {/* KIRI BAWAH: TEKNISI + Paraf Resmi + Nama Bapak Yulianto */}
                  <div style={{ textAlign: 'center', width: '220px', position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 900,
                        color: greenText,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '3px'
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
                          maxHeight: '74px',
                          maxWidth: '165px',
                          objectFit: 'contain'
                        }}
                      />
                    </div>

                    {/* Garis Nama Teknisi Permanen Yulianto */}
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginTop: '3px' }}>
                      ( Yulianto )
                    </div>
                  </div>

                  {/* KANAN: Stempel Biru Resmi Menempel & Sedikit Menimpa Tanda Tangan */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '-45px', // Menimpa sedikit ujung kanan tanda tangan secara alami
                      marginTop: '16px',
                      position: 'relative',
                      zIndex: 2,
                      mixBlendMode: 'multiply'
                    }}
                  >
                    <img
                      src="/stamp-clean.png"
                      alt="SUMBER TEKNIK DUA Telp. 0813 8895 9081"
                      style={{
                        maxHeight: '66px',
                        maxWidth: '290px',
                        objectFit: 'contain'
                      }}
                    />
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
