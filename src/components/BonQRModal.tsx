import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, Check, QrCode } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  if (!isOpen || !bon) return null;

  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://sumber-teknik-dua.vercel.app';

  const publicBonUrl = `${origin}/?bon=${encodeURIComponent(bon.id)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicBonUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-emerald-100">
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">QR Code &amp; Link Nota Digital</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable QR Box */}
        <div className="p-6 flex flex-col items-center">
          <div
            ref={printAreaRef}
            id="printable-bon-qr"
            className="w-full max-w-[320px] bg-white border-2 border-emerald-800 rounded-2xl p-5 shadow-md flex flex-col items-center text-center text-slate-800"
          >
            {/* Header with ST Logo */}
            <div className="border-b-2 border-emerald-800 pb-2 mb-3 w-full flex items-center justify-center gap-2">
              <img src="/logo-resmi.png" alt="ST Logo" className="w-7 h-7 object-contain" />
              <div>
                <h4 className="text-xs font-black tracking-wider text-emerald-950 uppercase">
                  SUMBER TEKNIK DUA
                </h4>
                <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-tight">
                  NOTA / BON TRANSAKSI
                </p>
              </div>
            </div>

            {/* Customer / Date Info (Tanpa label KEPADA YTH & Tanpa nomor STD) */}
            {(bon.kepadaYth || bon.tanggal) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 w-full mb-3 text-center">
                {bon.kepadaYth && (
                  <div className="text-sm font-black text-emerald-950 uppercase leading-tight">
                    {bon.kepadaYth}
                  </div>
                )}
                {bon.tanggal && (
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {bon.tanggal}
                  </div>
                )}
              </div>
            )}

            {/* QR Code Container */}
            <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-sm">
              <QRCodeSVG
                value={publicBonUrl}
                size={185}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-[10px] text-slate-400 mt-3 font-medium">
              Scan untuk melihat nota digital &amp; download PDF
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={handleDownloadJPG}
            disabled={isDownloading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{isDownloading ? 'Menyiapkan Gambar...' : 'Download Gambar QR (JPG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
