import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Download, QrCode } from 'lucide-react';
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

  if (!isOpen || !unit) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sumber-tekhnik-dua.vercel.app';
  // Link for public scanning: opens public view mode directly without login!
  const publicScanUrl = `${origin}/?view=${encodeURIComponent(unit.id)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('sticker-qrcode-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR-AC-${unit.ruanganLokasi.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-sm">Cetak Stiker QR Code AC</h3>
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
              <span className="text-[10px] tracking-widest uppercase font-bold text-brand-800 block">
                CV. SARANA REKATAMA BUANA
              </span>
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
            <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-sm mb-3">
              <QRCodeSVG
                id="sticker-qrcode-svg"
                value={publicScanUrl}
                size={175}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Instruction */}
            <p className="text-[10px] font-medium text-slate-600 leading-snug">
              Arahkan kamera smartphone ke QR Code ini untuk melihat riwayat servis & pemeliharaan resmi.
            </p>
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Tempelkan stiker ini pada bodi AC indoor/outdoor atau pintu ruangan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2.5">
          <button
            onClick={handleDownloadSVG}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Download Gambar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Stiker
          </button>
        </div>
      </div>
    </div>
  );
};
