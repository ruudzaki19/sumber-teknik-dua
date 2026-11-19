import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
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

  // Split kepadaYth multi-baris (maksimal 3 baris formal sejajar)
  const rawKepada = bon.kepadaYth || '';
  const kepadaLines = rawKepada.split('\n').map(l => l.trim());
  const line1 = kepadaLines[0] || '';
  const line2 = kepadaLines[1] || '';
  const line3 = kepadaLines.slice(2).join(' ') || '';

  // Garis solid 1.2px rapi & pas (tidak terlalu tebal dan konsisten)
  const solidBorder = '1.2px solid #1b6837';
  const greenText = '#1b6837';

  return (
    <div className="fixed inset-0 z-50 bg-st-dark/65 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-st-white rounded-[24px] w-full max-w-4xl overflow-hidden shadow-[8px_8px_0px_#14402c] border-[3px] border-st-dark flex flex-col max-h-[96vh] font-sora text-st-text"
      >
        {/* Header Bar Modal - Solid Forest Green */}
        <div className="bg-st-primary text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b-[3px] border-st-dark">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-st-dark border-2 border-st-pale/40 flex items-center justify-center shadow-[2px_2px_0px_#14402c]">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-st-light" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                Pratinjau Nota / Bon Transaksi
              </h3>
              <p className="text-st-pale text-[11px] font-bold">
                Format Resmi SUMBER TEKNIK DUA (Siap Simpan ke Galeri / Unduh JPG)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-st-dark hover:bg-black border-2 border-st-dark flex items-center justify-center text-st-pale hover:text-white transition-all shadow-[1px_1px_0px_#14402c] active:translate-y-0.5"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-st-cream-dark p-3 sm:p-4 px-4 sm:px-6 border-b-2 border-st-dark flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-st-dark hidden sm:inline">
            Ukuran Kertas: A4 (Resolusi Tinggi HD)
          </span>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadJPG}
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-st-primary hover:bg-st-dark text-white text-xs sm:text-sm font-extrabold rounded-xl border-2 border-st-dark shadow-[3px_3px_0px_#14402c] active:translate-y-0.5 disabled:opacity-50 transition-all"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{isGenerating ? 'Membuat Gambar JPG...' : 'Download Gambar Bon (JPG)'}</span>
          </motion.button>
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
                {/* ================= HEADER KOP SURAT BON (PERSIS GAMBAR 1, SEJAJAR TINGGI) ================= */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    width: '100%',
                    marginBottom: '22px'
                  }}
                >
                  {/* Kiri: Kop Surat Resmi Gambar 1 HD */}
                  <div style={{ width: '400px', height: '178px' }}>
                    <img
                      src="/kop-card-hd.png"
                      alt="SUMBER TEKNIK DUA"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'contain'
                      }}
                    />
                  </div>

                  {/* Kanan: Field Pelanggan Rapi Sejajar Tingginya dengan Kop Kiri (178px) */}
                  <div
                    style={{
                      width: '290px',
                      height: '178px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {/* Baris 1: Tangerang, [Tanggal] */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        minHeight: '26px'
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
                          fontFamily: '"Times New Roman", Times, serif',
                          fontSize: '17px',
                          paddingBottom: '2px',
                          paddingLeft: '4px',
                          minHeight: '20px'
                        }}
                      >
                        {bon.tanggal || ''}
                      </span>
                    </div>

                    {/* Baris 2: Kepada Yth, [Baris 1 Nama Pelanggan] (TANPA AUTO CAPSLOCK, Times New Roman 17px) */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        minHeight: '26px'
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
                          fontFamily: '"Times New Roman", Times, serif',
                          fontSize: '17px',
                          paddingBottom: '2px',
                          paddingLeft: '4px',
                          minHeight: '20px'
                        }}
                      >
                        {line1}
                      </span>
                    </div>

                    {/* Baris 3: Garis Titik-Titik dengan Baris 2 (Misal: PT Jaya - Sejajar Tanggal) */}
                    <div
                      style={{
                        minHeight: '26px',
                        borderBottom: '1.4px dotted #1b6837',
                        display: 'flex',
                        alignItems: 'flex-end',
                        paddingBottom: '2px'
                      }}
                    >
                      {/* Spacer 88px agar teks baris 2 sejajar lurus dengan tanggal & baris 1 */}
                      <span style={{ width: '88px', flexShrink: 0 }} />
                      <span
                        style={{
                          flex: 1,
                          color: '#111827',
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", Times, serif',
                          fontSize: '17px',
                          paddingLeft: '4px',
                          minHeight: '20px'
                        }}
                      >
                        {line2}
                      </span>
                    </div>

                    {/* Baris 4: Garis Titik-Titik dengan Baris 3 (Misal: Reni Jaya - Sejajar Tanggal) */}
                    <div
                      style={{
                        minHeight: '26px',
                        borderBottom: '1.4px dotted #1b6837',
                        display: 'flex',
                        alignItems: 'flex-end',
                        paddingBottom: '2px'
                      }}
                    >
                      {/* Spacer 88px agar teks baris 3 sejajar lurus dengan tanggal & baris 1 */}
                      <span style={{ width: '88px', flexShrink: 0 }} />
                      <span
                        style={{
                          flex: 1,
                          color: '#111827',
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", Times, serif',
                          fontSize: '17px',
                          paddingLeft: '4px',
                          minHeight: '20px'
                        }}
                      >
                        {line3}
                      </span>
                    </div>

                    {/* Baris 5: Telp. [No. HP Pelanggan] */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        minHeight: '26px'
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
                          fontFamily: '"Times New Roman", Times, serif',
                          fontSize: '17px',
                          paddingBottom: '2px',
                          paddingLeft: '4px',
                          minHeight: '20px'
                        }}
                      >
                        {bon.telpPelanggan || ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================= TABEL 13 BARIS LINE SOLID 2PX KONSISTEN ================= */}
                <div style={{ width: '100%', marginBottom: '0px' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14.5px',
                      border: solidBorder,
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          height: '40px',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        {/* Header 1: BANYAKNYA - Posisi Tepat di Tengah Optik */}
                        <th
                          style={{
                            width: '120px',
                            border: solidBorder,
                            padding: 0,
                            verticalAlign: 'middle',
                            textAlign: 'center',
                            height: '40px'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              width: '100%',
                              fontSize: '15px',
                              fontWeight: 900,
                              color: greenText,
                              letterSpacing: '0.5px',
                              paddingBottom: '3px' // Menaikkan posisi teks 3px agar tepat di tengah optik sel header
                            }}
                          >
                            BANYAKNYA
                          </div>
                        </th>

                        {/* Header 2: KETERANGAN - Posisi Tepat di Tengah Optik */}
                        <th
                          style={{
                            border: solidBorder,
                            padding: 0,
                            verticalAlign: 'middle',
                            textAlign: 'center',
                            height: '40px'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              width: '100%',
                              fontSize: '15px',
                              fontWeight: 900,
                              color: greenText,
                              letterSpacing: '0.5px',
                              paddingBottom: '3px' // Menaikkan posisi teks 3px agar tepat di tengah optik sel header
                            }}
                          >
                            KETERANGAN
                          </div>
                        </th>

                        {/* Header 3: HARGA SATUAN - Posisi Tepat di Tengah Optik */}
                        <th
                          style={{
                            width: '145px',
                            border: solidBorder,
                            padding: 0,
                            verticalAlign: 'middle',
                            textAlign: 'center',
                            height: '40px'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              width: '100%',
                              fontSize: '15px',
                              fontWeight: 900,
                              color: greenText,
                              letterSpacing: '0.5px',
                              paddingBottom: '3px' // Menaikkan posisi teks 3px agar tepat di tengah optik sel header
                            }}
                          >
                            HARGA SATUAN
                          </div>
                        </th>

                        {/* Header 4: JUMLAH - Posisi Tepat di Tengah Optik */}
                        <th
                          style={{
                            width: '165px',
                            border: solidBorder,
                            padding: 0,
                            verticalAlign: 'middle',
                            textAlign: 'center',
                            height: '40px'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              width: '100%',
                              fontSize: '15px',
                              fontWeight: 900,
                              color: greenText,
                              letterSpacing: '0.5px',
                              paddingBottom: '3px' // Menaikkan posisi teks 3px agar tepat di tengah optik sel header
                            }}
                          >
                            JUMLAH
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.map((item, index) => (
                        <tr
                          key={index}
                          style={{
                            height: '37px',
                            backgroundColor: '#ffffff'
                          }}
                        >
                          {/* Kolom 1: Banyaknya (Bisa Huruf atau Angka Bebas - Times New Roman 17px) */}
                          <td
                            style={{
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontFamily: '"Times New Roman", Times, serif',
                              fontSize: '17px',
                              border: solidBorder,
                              verticalAlign: 'middle',
                              padding: '4px 6px',
                              color: '#111827'
                            }}
                          >
                            {item ? item.banyaknya : ''}
                          </td>

                          {/* Kolom 2: Keterangan (TANPA AUTO CAPSLOCK, Times New Roman 17px Formal) */}
                          <td
                            style={{
                              padding: '4px 14px',
                              border: solidBorder,
                              verticalAlign: 'middle',
                              fontWeight: 'bold',
                              fontFamily: '"Times New Roman", Times, serif',
                              fontSize: '17px',
                              color: '#111827'
                            }}
                          >
                            {item ? item.keterangan : ''}
                          </td>

                          {/* Kolom 3: Harga Satuan (Auto Ada Rp. - Times New Roman 17.5px) */}
                          <td
                            style={{
                              padding: '4px 10px',
                              border: solidBorder,
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
                                <span style={{ color: greenText, fontWeight: 700, fontSize: '14px' }}>
                                  Rp.
                                </span>
                                <span style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 'bold', fontSize: '17.5px' }}>
                                  {formatNumber(item.hargaSatuan)}
                                </span>
                              </div>
                            ) : ''}
                          </td>

                          {/* Kolom 4: Jumlah (Auto Ada Rp. - Times New Roman 17.5px) */}
                          <td
                            style={{
                              padding: '4px 10px',
                              border: solidBorder,
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
                                <span style={{ color: greenText, fontWeight: 700, fontSize: '14px' }}>
                                  Rp.
                                </span>
                                <span style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 'bold', fontSize: '17.5px' }}>
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
                        borderRight: solidBorder,
                        fontWeight: 900,
                        fontSize: '15px',
                        color: greenText,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontFamily: '"Times New Roman", Times, serif'
                      }}
                    >
                      JUMLAH
                    </div>

                    {/* Kolom 4: Rp. [Total] dengan Garis Solid 2px Hijau (Times New Roman 18px) */}
                    <div
                      style={{
                        width: '165px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 10px',
                        borderLeft: solidBorder,
                        borderRight: solidBorder,
                        borderBottom: solidBorder,
                        fontWeight: 'bold',
                        fontSize: '18px',
                        color: '#111827',
                        fontFamily: '"Times New Roman", Times, serif',
                        boxSizing: 'border-box',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <span style={{ color: greenText, fontWeight: 700, fontSize: '14px' }}>Rp.</span>
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
      </motion.div>
    </div>
  );
};
