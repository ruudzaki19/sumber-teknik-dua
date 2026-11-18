import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Bon } from '../types';

interface BonQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  bon: Bon | null;
}

export const BonQRModal: React.FC<BonQRModalProps> = ({
  isOpen,
  onClose,
  bon
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !bon) return null;

  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://sumber-teknik-dua.vercel.app';

  const publicBonUrl = `${origin}/?bon=${encodeURIComponent(bon.id)}`;

  const handleDownloadJPG = async () => {
    const stickerElement = document.getElementById('printable-bon-qr');
    if (!stickerElement) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(stickerElement, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      const jpgUrl = canvas.toDataURL('image/jpeg', 0.95);
      const downloadLink = document.createElement('a');
      const safeNum = bon.nomorBon.replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadLink.href = jpgUrl;
      downloadLink.download = `QR-Bon-${safeNum}.jpg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Gagal mengunduh gambar JPG:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-st-dark/65 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-st-white rounded-[24px] w-full max-w-md overflow-hidden shadow-[8px_8px_0px_#14402c] border-[3px] border-st-dark my-auto flex flex-col font-sora text-st-text"
      >
        {/* Header - Solid Forest Green */}
        <div className="bg-st-primary text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b-[3px] border-st-dark">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-st-dark border-2 border-st-pale/40 flex items-center justify-center shadow-[2px_2px_0px_#14402c]">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-st-light" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                QR Code &amp; Link Nota Digital
              </h3>
              <p className="text-st-pale text-[11px] font-bold">
                Format Resmi SUMBER TEKNIK DUA
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

        {/* Printable QR Box */}
        <div className="p-5 sm:p-6 flex flex-col items-center bg-st-cream/40 overflow-y-auto">
          <div
            ref={printAreaRef}
            id="printable-bon-qr"
            className="w-full max-w-[320px] bg-white border-[3px] border-st-dark rounded-2xl p-5 shadow-[5px_5px_0px_#14402c] flex flex-col items-center text-center text-st-text font-sora"
          >
            {/* Header with ST Logo */}
            <div className="border-b-2 border-st-dark/25 pb-3 mb-3.5 w-full flex items-center justify-center gap-2.5">
              <img src="/logo-resmi.png" alt="ST Logo" className="w-8 h-8 object-contain" />
              <div>
                <h4 className="text-xs font-black tracking-wider text-st-dark uppercase">
                  SUMBER TEKNIK DUA
                </h4>
                <p className="text-[10px] text-st-primary font-extrabold uppercase tracking-tight">
                  NOTA / BON TRANSAKSI
                </p>
              </div>
            </div>

            {/* Customer / Date Info */}
            {(bon.kepadaYth || bon.tanggal) && (
              <div className="bg-st-cream/80 border-2 border-st-dark/30 rounded-xl p-3 w-full mb-3.5 text-center">
                {bon.kepadaYth && (
                  <div className="text-sm font-extrabold text-st-dark uppercase leading-tight">
                    {bon.kepadaYth}
                  </div>
                )}
                {bon.tanggal && (
                  <div className="text-[11px] text-st-text font-bold tabular-nums mt-0.5">
                    {bon.tanggal}
                  </div>
                )}
              </div>
            )}

            {/* QR Code Container */}
            <div className="p-3.5 bg-white border-2 border-st-dark rounded-xl shadow-[2px_2px_0px_#14402c]">
              <QRCodeSVG
                value={publicBonUrl}
                size={185}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-[11px] text-st-text-muted mt-3 font-bold">
              Scan untuk melihat nota digital resmi
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-st-cream-dark border-t-[3px] border-st-dark">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadJPG}
            disabled={isDownloading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-st-primary hover:bg-st-dark text-white text-xs font-extrabold rounded-xl border-2 border-st-dark shadow-[4px_4px_0px_#14402c] active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{isDownloading ? 'Menyiapkan Gambar...' : 'Download Gambar QR (JPG)'}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
