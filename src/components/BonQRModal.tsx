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
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-sm border border-slate-200"
      >
        {/* Header - Solid Forest Green */}
        <div className="bg-[#15803D] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#14532D]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-emerald-200" />
            </div>
            <h3 className="font-bold text-sm text-white">QR Code &amp; Link Nota Digital</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable QR Box */}
        <div className="p-5 flex flex-col items-center">
          <div
            ref={printAreaRef}
            id="printable-bon-qr"
            className="w-full max-w-[320px] bg-white border border-[#1b6837] rounded-xl p-4 shadow-xs flex flex-col items-center text-center text-slate-800"
          >
            {/* Header with ST Logo */}
            <div className="border-b border-[#1b6837] pb-2 mb-3 w-full flex items-center justify-center gap-2">
              <img src="/logo-resmi.png" alt="ST Logo" className="w-7 h-7 object-contain" />
              <div>
                <h4 className="text-xs font-black tracking-wider text-emerald-950 uppercase">
                  SUMBER TEKNIK DUA
                </h4>
                <p className="text-[9px] text-[#1b6837] font-bold uppercase tracking-tight">
                  NOTA / BON TRANSAKSI
                </p>
              </div>
            </div>

            {/* Customer / Date Info */}
            {(bon.kepadaYth || bon.tanggal) && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 w-full mb-3 text-center">
                {bon.kepadaYth && (
                  <div className="text-sm font-bold text-slate-900 uppercase leading-tight">
                    {bon.kepadaYth}
                  </div>
                )}
                {bon.tanggal && (
                  <div className="text-[11px] text-slate-600 font-medium tabular-nums mt-0.5">
                    {bon.tanggal}
                  </div>
                )}
              </div>
            )}

            {/* QR Code Container */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
              <QRCodeSVG
                value={publicBonUrl}
                size={185}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-[10px] text-slate-400 mt-2.5 font-medium">
              Scan untuk melihat nota digital resmi
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadJPG}
            disabled={isDownloading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{isDownloading ? 'Menyiapkan Gambar...' : 'Download Gambar QR (JPG)'}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
