import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { db } from '../db/db';
import { ACUnit, Room } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUnit: (unit: ACUnit) => void;
  onSelectRoom: (room: Room) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectUnit,
  onSelectRoom
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [units, setUnits] = useState<ACUnit[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load units and rooms for quick matching
    const loadData = async () => {
      const allUnits = await db.acUnits.toArray();
      const allRooms = await db.rooms.toArray();
      setUnits(allUnits);
      setRooms(allRooms);
    };
    loadData();

    const scannerElementId = 'qr-camera-stream';

    const startScanner = async () => {
      try {
        setErrorMessage(null);
        const html5QrCode = new Html5Qrcode(scannerElementId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // scan frame failure (normal while scanning)
          }
        );
        setIsScanning(true);
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setErrorMessage('Tidak dapat membuka kamera (periksa izin kamera di browser Anda atau gunakan pemilihan cepat di bawah).');
        setIsScanning(false);
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(console.error);
      }
    };
  }, [isOpen]);

  const handleScanSuccess = async (rawCode: string) => {
    // If it's a URL, extract search params or pathname
    let code = rawCode.trim();
    if (code.includes('view=')) {
      const match = code.match(/view=([^&#]+)/);
      if (match) code = match[1];
    } else if (code.includes('unit=')) {
      const match = code.match(/unit=([^&#]+)/);
      if (match) code = match[1];
    } else if (code.includes('room=')) {
      const match = code.match(/room=([^&#]+)/);
      if (match) code = match[1];
    }

    // Try finding AC Unit by qrCodeId or ID
    const matchedUnit = await db.acUnits.get(code)
      || await db.acUnits.filter(u => u.qrCodeId === code).first();

    if (matchedUnit) {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      onSelectUnit(matchedUnit);
      onClose();
      return;
    }

    // Try finding Room by qrCodeId or ID
    const matchedRoom = await db.rooms.get(code)
      || await db.rooms.filter(r => r.qrCodeId === code).first();

    if (matchedRoom) {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      onSelectRoom(matchedRoom);
      onClose();
      return;
    }

    setErrorMessage(`Kode QR tidak terdaftar di sistem: "${code}"`);
  };

  if (!isOpen) return null;

  const filteredUnits = units.filter(u => 
    u.ruanganLokasi.toLowerCase().includes(quickSearch.toLowerCase()) ||
    u.merk.toLowerCase().includes(quickSearch.toLowerCase()) ||
    (u.qrCodeId && u.qrCodeId.toLowerCase().includes(quickSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-brand-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Scan QR Code AC / Ruangan</h3>
              <p className="text-blue-100 text-[11px]">Arahkan kamera ke stiker QR AC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="p-4 flex-1 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[280px] bg-slate-950 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-brand-500">
            <div id="qr-camera-stream" className="w-full h-full" />
            
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-48 h-48 border-2 border-brand-400/80 rounded-xl relative">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-brand-300"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-brand-300"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-brand-300"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-brand-300"></div>
              </div>
              <p className="text-[11px] text-white/80 mt-3 bg-black/60 px-2 py-0.5 rounded-full font-medium">
                Posisikan QR di dalam kotak
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="w-full mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Fallback / Quick Selection */}
          <div className="w-full mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Atau Pilih Cepat Lokasi / Unit AC:
              </span>
              <span className="text-[11px] text-slate-400">Tanpa kamera</span>
            </div>

            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama ruangan / merk AC..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => {
                      onSelectUnit(unit);
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-brand-800">
                        {unit.ruanganLokasi}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {unit.merk} {unit.jenisAc} ({unit.kapasitas})
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-700">
                      <span>Buka</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-3 text-xs text-slate-400">
                  Tidak ditemukan unit yang cocok
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
