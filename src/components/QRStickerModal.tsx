import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Download, QrCode, Layers } from 'lucide-react';
import { ACUnit, Room } from '../types';

interface QRStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: ACUnit | null;
  room?: Room | null;
  allUnits?: ACUnit[];
  settings?: any;
}

export const QRStickerModal: React.FC<QRStickerModalProps> = ({
  isOpen,
  onClose,
  unit,
  room,
  allUnits = []
}) => {
  const [isBatchMode, setIsBatchMode] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sumber-tekhnik.vercel.app';

  const targetTitle = unit ? unit.ruanganLokasi : (room ? room.namaRuangan : 'Ruangan AC');
  const targetSub = unit ? `${unit.merk} ${unit.jenisAc} (${unit.kapasitas})` : 'Unit AC';
  const qrValue = unit ? unit.qrCodeId : (room ? room.qrCodeId : 'AC-MAINTENANCE');

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
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="font-bold text-sm">Cetak Stiker QR Code AC</h3>
              <p className="text-blue-200 text-[11px]">Tempelkan pada unit AC indoor/outdoor atau pintu ruangan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        {allUnits.length > 1 && (
          <div className="bg-slate-100 p-2.5 px-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-slate-700">Pilihan Cetak:</span>
            <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-300">
              <button
                type="button"
                onClick={() => setIsBatchMode(false)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  !isBatchMode ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Stiker Satuan Ini
              </button>
              <button
                type="button"
                onClick={() => setIsBatchMode(true)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  isBatchMode ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Lembar Semua Unit ({allUnits.length} Stiker)
              </button>
            </div>
          </div>
        )}

        {/* Printable Viewport */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div ref={printAreaRef} id="printable-qr-sticker" className="w-full flex flex-col items-center">
            {!isBatchMode ? (
              /* SINGLE STICKER PREVIEW */
              <div className="w-full max-w-[320px] bg-white border-2 border-brand-800 rounded-2xl p-5 shadow-md flex flex-col items-center text-center text-slate-800">
                <div className="border-b-2 border-brand-700 pb-2 mb-3 w-full">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-brand-700 block">
                    CV. SARANA REKATAMA BUANA
                  </span>
                  <h4 className="text-xs font-black tracking-wider text-slate-900 uppercase">
                    KARTU PEMELIHARAAN AC
                  </h4>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 w-full mb-3">
                  <div className="text-[10px] text-blue-600 font-semibold uppercase">LOKASI / RUANGAN</div>
                  <div className="text-sm font-extrabold text-brand-900 leading-tight">
                    {targetTitle}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {targetSub}
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-sm mb-3">
                  <QRCodeSVG
                    id="sticker-qrcode-svg"
                    value={fullScanUrl}
                    size={170}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full mb-2">
                  ID: {qrValue}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Arahkan kamera smartphone ke QR Code ini untuk membuka & mengedit riwayat servis.
                </p>
              </div>
            ) : (
              /* BATCH SHEET */
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allUnits.map((u) => {
                  const uScanUrl = `${origin}/?unit=${encodeURIComponent(u.qrCodeId)}`;
                  return (
                    <div
                      key={u.id}
                      className="bg-white border-2 border-brand-800 rounded-xl p-3 shadow-sm flex flex-col items-center text-center text-slate-800"
                    >
                      <div className="border-b border-brand-700 pb-1 mb-2 w-full">
                        <span className="text-[8px] tracking-wider uppercase font-bold text-brand-700 block">
                          CV. SARANA REKATAMA BUANA
                        </span>
                        <h4 className="text-[10px] font-black uppercase">
                          KARTU PEMELIHARAAN AC
                        </h4>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded p-1.5 w-full mb-2">
                        <div className="text-[11px] font-bold text-brand-900 leading-tight uppercase">
                          {u.ruanganLokasi}
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium">
                          {u.merk} {u.jenisAc} ({u.kapasitas})
                        </div>
                      </div>

                      <div className="p-1 bg-white border border-slate-300 rounded-lg shadow-sm mb-2">
                        <QRCodeSVG
                          value={uScanUrl}
                          size={120}
                          level="H"
                          includeMargin={true}
                        />
                      </div>

                      <div className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full mb-1">
                        ID: {u.qrCodeId}
                      </div>
                      <p className="text-[9px] text-slate-400">
                        Scan kamera HP untuk catatan servis
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          {!isBatchMode && (
            <button
              onClick={handleDownloadSVG}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Download SVG
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            {isBatchMode ? 'Cetak Semua Lembar Stiker' : 'Cetak Stiker Ini'}
          </button>
        </div>
      </div>
    </div>
  );
};
