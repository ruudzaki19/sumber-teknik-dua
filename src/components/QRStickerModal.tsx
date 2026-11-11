import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Download, QrCode } from 'lucide-react';
import { ACUnit, Room, CompanySettings } from '../types';

interface QRStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: ACUnit | null;
  room?: Room | null;
  settings: CompanySettings;
}

export const QRStickerModal: React.FC<QRStickerModalProps> = ({
  isOpen,
  onClose,
  unit,
  room,
  settings
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const targetTitle = unit ? unit.ruanganLokasi : (room ? room.namaRuangan : 'Ruangan AC');
  const targetSub = unit ? `${unit.merk} ${unit.jenisAc} - ${unit.kapasitas}` : (room?.gedungArea || 'Semua Unit AC');
  const qrValue = unit ? unit.qrCodeId : (room ? room.qrCodeId : 'AC-MAINTENANCE');
  
  // Create scan URL that works on localhost or production Vercel
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sumber-tekhnik.vercel.app';
  const fullScanUrl = unit 
    ? `${origin}/?unit=${encodeURIComponent(unit.qrCodeId)}`
    : `${origin}/?room=${encodeURIComponent(room?.qrCodeId || '')}`;

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
    downloadLink.download = `QR-${targetTitle.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-brand-800 text-white p-4 flex items-center justify-between">
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

        {/* Printable Sticker Preview */}
        <div className="p-6 flex flex-col items-center">
          <div
            ref={printAreaRef}
            id="printable-qr-sticker"
            className="w-full max-w-[320px] bg-white border-2 border-brand-800 rounded-2xl p-5 shadow-md flex flex-col items-center text-center text-slate-800"
          >
            {/* Header / Company */}
            <div className="border-b-2 border-brand-700 pb-2 mb-3 w-full">
              <span className="text-[10px] tracking-widest uppercase font-bold text-brand-700 block">
                {settings.namaPerusahaan}
              </span>
              <h4 className="text-xs font-black tracking-wider text-slate-900 uppercase">
                KARTU PEMELIHARAAN AC
              </h4>
            </div>

            {/* Room & Unit Label */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 w-full mb-3">
              <div className="text-[10px] text-blue-600 font-semibold uppercase">LOKASI / RUANGAN</div>
              <div className="text-sm font-extrabold text-brand-900 leading-tight">
                {targetTitle}
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                {targetSub}
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-sm mb-3">
              <QRCodeSVG
                id="sticker-qrcode-svg"
                value={fullScanUrl}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* ID & Scan Instructions */}
            <div className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full mb-2">
              ID: {qrValue}
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Arahkan kamera smartphone ke QR Code ini untuk membuka riwayat servis & update pemeliharaan.
            </p>
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Cetak stiker ini lalu tempelkan di bodi AC indoor atau dinding ruangan.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleDownloadSVG}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Download SVG
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Stiker
          </button>
        </div>
      </div>
    </div>
  );
};
