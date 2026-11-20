import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Bon, BonItem } from '../types';
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
  const TOTAL_PHYSICAL_ROWS = 13;
  const ROW_UNIT_HEIGHT = 37;

  // Hitung berapa baris fisik yang dikonsumsi oleh teks keterangan
  const calculateKeteranganLines = (text: string): number => {
    if (!text || !text.trim()) return 1;
    const rawLines = text.split('\n');
    let totalLines = 0;
    const MAX_CHARS_PER_LINE = 28; // Estimasi presisi lebar kolom 280px Times New Roman bold 15.5px

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
    item: BonItem;
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
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('printable-bon');
          if (clonedElement) {
            if (clonedElement.parentElement) {
              clonedElement.parentElement.style.width = '794px';
              clonedElement.parentElement.style.height = '1123px';
              clonedElement.parentElement.style.minHeight = '1123px';
            }
            clonedElement.style.transform = 'none';
            clonedElement.style.webkitTransform = 'none';
            clonedElement.style.position = 'static';
            clonedElement.style.width = '794px';
            clonedElement.style.minWidth = '794px';
            clonedElement.style.maxWidth = '794px';
            clonedElement.style.height = '1123px';
            clonedElement.style.minHeight = '1123px';
            clonedElement.style.margin = '0 auto';
            clonedElement.style.padding = '34px 42px 48px 42px';
            clonedElement.style.boxSizing = 'border-box';

            // Penyesuaian halus posisi optik teks di canvas agar pas di tengah sel
            const cellContents = clonedElement.querySelectorAll('.bon-cell-content');
            cellContents.forEach((el: any) => {
              el.style.transform = 'translateY(-3px)';
            });

            // Teks keterangan multi-baris digeser ke atas agar persis di tengah seperti pratinjau (tidak mepet bawah)
            const keteranganTexts = clonedElement.querySelectorAll('.bon-keterangan-text');
            keteranganTexts.forEach((el: any) => {
              el.style.transform = 'translateY(-3px)';
              el.style.overflow = 'visible';
            });
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
        <div className="bg-st-cream-dark p-3 sm:p-4 px-4 sm:px-6 border-b-2 border-st-dark flex items-center justify-end shrink-0">
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
              height: `${1140 * previewScale}px`,
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
                minHeight: '1140px',
                backgroundColor: '#ffffff',
                padding: '36px 42px 64px 42px',
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
                    marginBottom: '18px'
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
                          paddingBottom: '4px',
                          lineHeight: '1.2',
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
                          paddingBottom: '4px',
                          lineHeight: '1.2',
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
                        paddingBottom: '4px'
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
                          lineHeight: '1.2',
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
                        paddingBottom: '4px'
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
                          lineHeight: '1.2',
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
                          paddingBottom: '4px',
                          lineHeight: '1.2',
                          paddingLeft: '4px',
                          minHeight: '20px'
                        }}
                      >
                        {bon.telpPelanggan || ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================= TABEL 13 BARIS LINE SOLID 1.2PX (STRUKTUR INTEGRASI PRESISI, TANPA MENCONG) ================= */}
                <div style={{ width: '710px', margin: '0 auto', boxSizing: 'border-box' }}>
                  {/* Header Tabel */}
                  <div
                    style={{
                      display: 'flex',
                      width: '710px',
                      height: '40px',
                      borderTop: solidBorder,
                      borderBottom: solidBorder,
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Header 1: BANYAKNYA */}
                    <div
                      style={{
                        width: '120px',
                        flexShrink: 0,
                        height: '100%',
                        borderLeft: solidBorder,
                        borderRight: solidBorder,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: 900,
                        color: greenText,
                        letterSpacing: '0.5px',
                        boxSizing: 'border-box'
                      }}
                    >
                      BANYAKNYA
                    </div>

                    {/* Header 2: KETERANGAN */}
                    <div
                      style={{
                        width: '280px',
                        flexShrink: 0,
                        height: '100%',
                        borderRight: solidBorder,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: 900,
                        color: greenText,
                        letterSpacing: '0.5px',
                        boxSizing: 'border-box'
                      }}
                    >
                      KETERANGAN
                    </div>

                    {/* Header 3: HARGA SATUAN */}
                    <div
                      style={{
                        width: '145px',
                        flexShrink: 0,
                        height: '100%',
                        borderRight: solidBorder,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: 900,
                        color: greenText,
                        letterSpacing: '0.5px',
                        boxSizing: 'border-box'
                      }}
                    >
                      HARGA SATUAN
                    </div>

                    {/* Header 4: JUMLAH */}
                    <div
                      style={{
                        width: '165px',
                        flexShrink: 0,
                        height: '100%',
                        borderRight: solidBorder,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: 900,
                        color: greenText,
                        letterSpacing: '0.5px',
                        boxSizing: 'border-box'
                      }}
                    >
                      JUMLAH
                    </div>
                  </div>

                  {/* Baris Data (Kotak Pas Sesuai Isi Teks, Tanpa Space Makan Tempat & Jumlah di Tengah) */}
                  {processedRows.map((r, idx) => {
                    const item = r.item;

                    return (
                      <div
                        key={`item-${idx}`}
                        style={{
                          display: 'flex',
                          width: '710px',
                          height: `${r.rowHeight}px`,
                          borderBottom: solidBorder,
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Kolom 1: Banyaknya (Selalu di Tengah-Tengah Vertikal) */}
                        <div
                          style={{
                            width: '120px',
                            flexShrink: 0,
                            height: '100%',
                            borderLeft: solidBorder,
                            borderRight: solidBorder,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div
                            className="bon-cell-content"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontFamily: '"Times New Roman", Times, serif',
                              fontSize: '15.5px',
                              color: '#111827'
                            }}
                          >
                            {item ? item.banyaknya : ''}
                          </div>
                        </div>

                        {/* Kolom 2: Keterangan (Pas Sesuai Teks, Padding Seimbang Atas Bawah, Bebas Potong) */}
                        <div
                          style={{
                            width: '280px',
                            flexShrink: 0,
                            height: '100%',
                            borderRight: solidBorder,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            padding: '0 14px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div
                            className="bon-keterangan-text"
                            style={{
                              width: '100%',
                              fontWeight: 'bold',
                              fontFamily: '"Times New Roman", Times, serif',
                              fontSize: '15px',
                              color: '#111827',
                              lineHeight: '21px',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              overflow: 'visible'
                            }}
                          >
                            {item ? item.keterangan : ''}
                          </div>
                        </div>

                        {/* Kolom 3: Harga Satuan (Selalu di Tengah-Tengah Vertikal, Manual Rp Warna Hitam) */}
                        <div
                          style={{
                            width: '145px',
                            flexShrink: 0,
                            height: '100%',
                            borderRight: solidBorder,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isManualRp(item?.hargaSatuan) ? 'space-between' : 'flex-end',
                            padding: '0 10px',
                            boxSizing: 'border-box'
                          }}
                        >
                          {item && hasPrice(item.hargaSatuan) ? (
                            <div
                              className="bon-cell-content"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isManualRp(item.hargaSatuan) ? 'space-between' : 'flex-end',
                                width: '100%',
                                boxSizing: 'border-box',
                                fontFamily: '"Times New Roman", Times, serif',
                                fontWeight: 'bold',
                                fontSize: '15.5px',
                                color: '#111827'
                              }}
                            >
                              {isManualRp(item.hargaSatuan) && (
                                <span style={{ color: '#111827', fontWeight: 'bold', fontSize: '14.5px' }}>
                                  Rp.
                                </span>
                              )}
                              <span>{formatPriceValue(item.hargaSatuan)}</span>
                            </div>
                          ) : null}
                        </div>

                        {/* Kolom 4: Jumlah (Selalu di Tengah-Tengah Vertikal Sesuai Permintaan, Manual Rp Warna Hitam) */}
                        <div
                          style={{
                            width: '165px',
                            flexShrink: 0,
                            height: '100%',
                            borderRight: solidBorder,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isManualRp(item?.jumlah) ? 'space-between' : 'flex-end',
                            padding: '0 10px',
                            boxSizing: 'border-box'
                          }}
                        >
                          {item && hasPrice(item.jumlah) ? (
                            <div
                              className="bon-cell-content"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isManualRp(item.jumlah) ? 'space-between' : 'flex-end',
                                width: '100%',
                                boxSizing: 'border-box',
                                fontFamily: '"Times New Roman", Times, serif',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                color: '#111827'
                              }}
                            >
                              {isManualRp(item.jumlah) && (
                                <span style={{ color: '#111827', fontWeight: 'bold', fontSize: '14.5px' }}>
                                  Rp.
                                </span>
                              )}
                              <span>{formatPriceValue(item.jumlah)}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}

                  {/* Sisa Baris Kosong (Menjaga Total Visual Tepat 481px Presisi Tanpa Miring) */}
                  {emptyRowHeights.map((h, emptyIdx) => (
                    <div
                      key={`empty-${emptyIdx}`}
                      style={{
                        display: 'flex',
                        width: '710px',
                        height: `${h}px`,
                        borderBottom: solidBorder,
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ width: '120px', flexShrink: 0, height: '100%', borderLeft: solidBorder, borderRight: solidBorder, boxSizing: 'border-box' }} />
                      <div style={{ width: '280px', flexShrink: 0, height: '100%', borderRight: solidBorder, boxSizing: 'border-box' }} />
                      <div style={{ width: '145px', flexShrink: 0, height: '100%', borderRight: solidBorder, boxSizing: 'border-box' }} />
                      <div style={{ width: '165px', flexShrink: 0, height: '100%', borderRight: solidBorder, boxSizing: 'border-box' }} />
                    </div>
                  ))}

                  {/* ================= BARIS JUMLAH & RP DI BAWAH TABEL (SEJAJAR LURUS SEMPURNA) ================= */}
                  <div
                    style={{
                      display: 'flex',
                      width: '710px',
                      height: '40px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Kolom 1: Kosong tanpa border */}
                    <div style={{ width: '120px', flexShrink: 0, boxSizing: 'border-box' }}></div>

                    {/* Kolom 2: Kosong tanpa border */}
                    <div style={{ width: '280px', flexShrink: 0, boxSizing: 'border-box' }}></div>

                    {/* Kolom 3: JUMLAH (Garis Kanan Sejajar Lurus Kolom 3 di Atasnya) */}
                    <div
                      style={{
                        width: '145px',
                        flexShrink: 0,
                        height: '100%',
                        borderRight: solidBorder,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div
                        className="bon-cell-content"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
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
                    </div>

                    {/* Kolom 4: Total (Garis Kanan & Bawah Solid 1.2px, Kotak Tertutup Sempurna) */}
                    <div
                      style={{
                        width: '165px',
                        flexShrink: 0,
                        height: '100%',
                        borderRight: solidBorder,
                        borderBottom: solidBorder,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: anyItemHasManualRp ? 'space-between' : 'flex-end',
                        padding: '0 10px',
                        boxSizing: 'border-box',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div
                        className="bon-cell-content"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: anyItemHasManualRp ? 'space-between' : 'flex-end',
                          width: '100%',
                          height: '100%',
                          fontWeight: 'bold',
                          fontSize: '17px',
                          color: '#111827',
                          fontFamily: '"Times New Roman", Times, serif'
                        }}
                      >
                        {anyItemHasManualRp && (
                          <span style={{ color: '#111827', fontWeight: 'bold', fontSize: '15px' }}>Rp.</span>
                        )}
                        <span>{formatNumber(bon.totalJumlah)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= FOOTER & TANDA TANGAN (YULIANTO + STEMPEL MENIMPA SEDIKIT) ================= */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: '22px',
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
              <div style={{ height: '36px' }}></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
