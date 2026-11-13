import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, QrCode } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ACUnit } from '../types';

interface QRStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: ACUnit | null;
}

export const QRStickerModal: React.FC<QRStickerModalProps> = ({
  isOpen,
  onClose,
  unit
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !unit) return null;

  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://sumber-tehnik-dua.vercel.app';

  // Link for public scanning: opens public view mode directly without login!
  const publicScanUrl = `${origin}/?view=${encodeURIComponent(unit.id)}`;

  const handleDownloadJPG = async () => {
    const stickerElement = document.getElementById('printable-qr-sticker');
    if (!stickerElement) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(stickerElement, {
        scale: 3, // Resolusi tinggi agar hasil cetak sangat tajam
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      const jpgUrl = canvas.toDataURL('image/jpeg', 0.95);
      const downloadLink = document.createElement('a');
      const safeRoomName = unit.ruanganLokasi.replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadLink.href = jpgUrl;
      downloadLink.download = `QR-AC-${safeRoomName}.jpg`;
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
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-sm">Stiker QR Code AC</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Sticker Content */}
        <div className="p-6 flex flex-col items-center">
          <div
            ref={printAreaRef}
            id="printable-qr-sticker"
            className="w-full max-w-[320px] bg-white border-2 border-brand-900 rounded-2xl p-5 shadow-md flex flex-col items-center text-center text-slate-800"
          >
            {/* Header */}
            <div className="border-b-2 border-brand-800 pb-2 mb-3 w-full">
              <h4 className="text-xs font-black tracking-wider text-slate-900 uppercase">
                KARTU PEMELIHARAAN AC
              </h4>
            </div>

            {/* Room & Unit Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 w-full mb-3">
              <div className="text-[10px] text-blue-700 font-bold uppercase">LOKASI / RUANGAN</div>
              <div className="text-sm font-black text-brand-950 uppercase leading-tight">
                {unit.ruanganLokasi}
              </div>
              <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                {unit.merk} {unit.jenisAc} ({unit.kapasitas})
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-sm">
              <QRCodeSVG
                id="sticker-qrcode-svg"
                value={publicScanUrl}
                size={185}
                level="H"
                includeMargin={true}
              />
            </div>
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
            <span>{isDownloading ? 'Menyiapkan Gambar JPG...' : 'Download Gambar (JPG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
