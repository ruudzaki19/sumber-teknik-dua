import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Wrench,
  Camera,
  Plus,
  DoorClosed,
  QrCode,
  FileDown,
  Settings as SettingsIcon,
  Search,
  ChevronRight,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Printer,
  Edit,
  ExternalLink,
  Cpu,
  Layers,
  ArrowLeft
} from 'lucide-react';

import { db, seedInitialDataIfNeeded, DEFAULT_SETTINGS } from './db/db';
import { ACUnit, MaintenanceRecord, Room, CompanySettings } from './types';
import { useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { QRScannerModal } from './components/QRScannerModal';
import { QRStickerModal } from './components/QRStickerModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { ACUnitModal } from './components/ACUnitModal';
import { RoomModal } from './components/RoomModal';
import { PdfExportModal } from './components/PdfExportModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  // Database live queries
  const rooms = useLiveQuery(() => db.rooms.orderBy('createdAt').reverse().toArray()) || [];
  const acUnits = useLiveQuery(() => db.acUnits.orderBy('createdAt').reverse().toArray()) || [];
  const maintenanceRecords = useLiveQuery(() => db.maintenanceRecords.toArray()) || [];
  const dbSettings = useLiveQuery(() => db.settings.get('default'));

  // Active view states
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ruangan' | 'unit' | 'servis'>('ruangan');

  // Modals state
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isQRStickerOpen, setIsQRStickerOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Forms modals
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ACUnit | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  // Initialize seed data
  useEffect(() => {
    seedInitialDataIfNeeded().then(() => {
      // Check URL parameters for scanned QR
      const params = new URLSearchParams(window.location.search);
      const unitQr = params.get('unit');
      const roomQr = params.get('room');

      if (unitQr) {
        db.acUnits.where('qrCodeId').equals(unitQr).first().then(unit => {
          if (unit) {
            setSelectedUnitId(unit.id);
            setSelectedRoomId(unit.roomId);
          }
        });
      } else if (roomQr) {
        db.rooms.where('qrCodeId').equals(roomQr).first().then(room => {
          if (room) {
            setSelectedRoomId(room.id);
          }
        });
      }
    });
  }, []);

  // Settings
  const currentSettings: CompanySettings = dbSettings || DEFAULT_SETTINGS;

  // Selected Unit & Room helpers
  const activeUnit = acUnits.find(u => u.id === selectedUnitId) || null;
  const activeRoom = rooms.find(r => r.id === (selectedRoomId || activeUnit?.roomId)) || null;

  // If activeUnit is selected, set selectedRoomId
  useEffect(() => {
    if (activeUnit && activeUnit.roomId !== selectedRoomId) {
      setSelectedRoomId(activeUnit.roomId);
    }
  }, [activeUnit]);

  // If only 1 room and no selection, default to first room
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId && !selectedUnitId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId, selectedUnitId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-semibold">Memuat Sistem Pemeliharaan AC...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Filtered lists
  const currentRoomUnits = selectedRoomId 
    ? acUnits.filter(u => u.roomId === selectedRoomId)
    : acUnits;

  const currentUnitRecords = selectedUnitId
    ? maintenanceRecords.filter(r => r.unitId === selectedUnitId).sort((a, b) => (a.nomorUrut || 0) - (b.nomorUrut || 0))
    : [];

  const totalBiayaUnit = currentUnitRecords.reduce(
    (sum, r) => sum + (r.totalHarga || (r.biaya * (r.qty || 1)) || 0), 
    0
  );

  // CRUD Handlers
  const handleSaveRoom = async (roomData: Omit<Room, 'id' | 'createdAt'> & { id?: string }) => {
    if (roomData.id) {
      await db.rooms.update(roomData.id, roomData);
    } else {
      const newId = `room-${Date.now().toString(36)}`;
      await db.rooms.add({
        ...roomData,
        id: newId,
        createdAt: Date.now()
      });
      setSelectedRoomId(newId);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    await db.rooms.delete(roomId);
    if (selectedRoomId === roomId) {
      setSelectedRoomId(rooms[0]?.id || null);
    }
  };

  const handleSaveUnit = async (unitData: Omit<ACUnit, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (unitData.id) {
      await db.acUnits.update(unitData.id, {
        ...unitData,
        updatedAt: Date.now()
      });
      setSelectedUnitId(unitData.id);
    } else {
      const newId = `unit-${Date.now().toString(36)}`;
      await db.acUnits.add({
        ...unitData,
        id: newId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setSelectedUnitId(newId);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    await db.acUnits.delete(unitId);
    await db.maintenanceRecords.where('unitId').equals(unitId).delete();
    setSelectedUnitId(null);
  };

  const handleSaveRecord = async (recordData: Omit<MaintenanceRecord, 'id' | 'createdAt'> & { id?: string }) => {
    if (recordData.id) {
      await db.maintenanceRecords.update(recordData.id, recordData);
    } else {
      const newId = `rec-${Date.now().toString(36)}`;
      await db.maintenanceRecords.add({
        ...recordData,
        id: newId,
        createdAt: Date.now()
      });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    await db.maintenanceRecords.delete(recordId);
  };

  const handleUpdateSettings = async (newSettings: CompanySettings) => {
    await db.settings.put({
      id: 'default',
      ...newSettings
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 pb-20 md:pb-6">
      {/* Top Navbar - Clean White & Corporate Navy Blue Theme */}
      <header className="bg-brand-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Wrench className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight">
                  {currentSettings.namaPerusahaan}
                </h1>
                <span className="hidden sm:inline-block text-[10px] bg-brand-700 text-blue-100 px-2 py-0.5 rounded font-mono font-medium">
                  Tahun {currentSettings.tahunDefault}
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Sistem Pemeliharaan AC & Scan QR Ruangan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Scan QR button in header */}
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Camera className="w-4 h-4 text-blue-200" />
              <span className="hidden xs:inline">Scan QR</span>
            </button>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Pengaturan & Backup"
            >
              <SettingsIcon className="w-4 h-4 text-blue-200" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 flex-1 w-full">
        {/* If an AC Unit is selected -> Show the Detailed "Kartu Pemeliharaan AC" (Identical to the Paper Blanko!) */}
        {activeUnit ? (
          <div className="space-y-4">
            {/* Breadcrumb / Back button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedUnitId(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-800 hover:text-brand-950 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar Ruangan
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsQRStickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5 text-brand-700" />
                  Stiker QR Unit
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak / Download PDF
                </button>
              </div>
            </div>

            {/* UNIT SPECIFICATION CARD (Reflects the paper box from the photo) */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
              <div className="bg-brand-800 text-white p-3.5 px-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">
                    KARTU PEMELIHARAAN AIR CONDITIONER TAHUN {currentSettings.tahunDefault}
                  </span>
                  <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                    {activeUnit.ruanganLokasi}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setEditingUnit(activeUnit);
                    setIsUnitModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Unit
                </button>
              </div>

              {/* Unit Details Grid */}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 text-xs border-b border-slate-200">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">JENIS AC</span>
                  <span className="font-bold text-slate-900 text-sm">{activeUnit.jenisAc}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">MERK</span>
                  <span className="font-bold text-slate-900 text-sm">{activeUnit.merk}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">KAPASITAS</span>
                  <span className="font-bold text-slate-900 text-sm">{activeUnit.kapasitas}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">NO. SERI</span>
                  <span className="font-mono text-slate-700">{activeUnit.noSeri || '-'}</span>
                </div>
              </div>

              {/* Summary Stats Bar */}
              <div className="px-4 py-2.5 bg-blue-50/80 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-4 text-brand-900 font-medium">
                  <span>
                    Total Pekerjaan: <strong>{currentUnitRecords.length} / 12 Baris</strong>
                  </span>
                  <span>
                    Mitra: <strong>{activeUnit.mitra || '-'}</strong>
                  </span>
                </div>
                <div className="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-200 font-mono">
                  Total Biaya Servis: Rp {totalBiayaUnit.toLocaleString('id-ID')}
                </div>
              </div>

              {/* 12-ROW TABLE (Physical card digital replica) */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Riwayat Pekerjaan & Paraf Teknisi
                  </h3>
                  <button
                    onClick={() => {
                      setEditingRecord(null);
                      setIsMaintenanceModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Tambah Catatan Servis
                  </button>
                </div>

                {/* Table representation */}
                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                      <tr>
                        <th className="w-12 py-2.5 px-3 text-center border-r border-slate-200">NO</th>
                        <th className="w-28 py-2.5 px-3 border-r border-slate-200">TANGGAL</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">URAIAN PEKERJAAN</th>
                        <th className="w-24 py-2.5 px-3 text-right border-r border-slate-200">BIAYA</th>
                        <th className="w-14 py-2.5 px-2 text-center border-r border-slate-200">QTY</th>
                        <th className="w-28 py-2.5 px-3 text-right border-r border-slate-200">TOTAL</th>
                        <th className="w-24 py-2.5 px-2 text-center border-r border-slate-200">PARAF</th>
                        <th className="w-16 py-2.5 px-2 text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {currentUnitRecords.length > 0 ? (
                        currentUnitRecords.map((rec, idx) => (
                          <tr key={rec.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-600 border-r border-slate-200">
                              {rec.nomorUrut || idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-200 whitespace-nowrap">
                              {rec.tanggal}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                              <div>{rec.uraianPekerjaan}</div>
                              {rec.keterangan && (
                                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                                  {rec.keterangan}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700 border-r border-slate-200">
                              Rp {(rec.biaya || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-medium border-r border-slate-200">
                              {rec.qty || 1}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                              Rp {(rec.totalHarga || (rec.biaya * (rec.qty || 1)) || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-1 px-2 text-center border-r border-slate-200">
                              {rec.parafUrl ? (
                                <img
                                  src={rec.parafUrl}
                                  alt="Paraf"
                                  className="h-7 max-w-[65px] mx-auto object-contain"
                                />
                              ) : (
                                <span className="text-[10px] text-slate-300 italic">-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button
                                onClick={() => {
                                  setEditingRecord(rec);
                                  setIsMaintenanceModalOpen(true);
                                }}
                                className="text-brand-700 hover:text-brand-900 font-semibold text-[11px] hover:underline"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            Belum ada catatan pemeliharaan untuk unit ini.
                            <br />
                            <button
                              onClick={() => {
                                setEditingRecord(null);
                                setIsMaintenanceModalOpen(true);
                              }}
                              className="mt-2 inline-flex items-center gap-1 text-xs text-brand-700 font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Tambah Catatan Pertama
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ROOMS & UNITS OVERVIEW VIEW */
          <div className="space-y-4">
            {/* Top Filter & Search */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari ruangan, unit, atau merk AC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    setEditingRoom(null);
                    setIsRoomModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                >
                  <DoorClosed className="w-3.5 h-3.5 text-brand-700" />
                  + Tambah Ruangan
                </button>

                <button
                  onClick={() => {
                    setEditingUnit(null);
                    setIsUnitModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Tambah Unit AC
                </button>
              </div>
            </div>

            {/* Room Tabs Horizontal Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedRoomId(null)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedRoomId === null
                    ? 'bg-brand-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                Semua Ruangan ({rooms.length})
              </button>
              {rooms.map((room) => {
                const count = acUnits.filter(u => u.roomId === room.id).length;
                const isSelected = selectedRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-brand-800 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <span>{room.namaRuangan}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count} AC
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Room Info Header if a specific room is selected */}
            {activeRoom && (
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-800">{activeRoom.namaRuangan}</h2>
                    {activeRoom.gedungArea && (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {activeRoom.gedungArea}
                      </span>
                    )}
                  </div>
                  {activeRoom.deskripsi && (
                    <p className="text-xs text-slate-500 mt-0.5">{activeRoom.deskripsi}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingRoom(activeRoom);
                      setIsRoomModalOpen(true);
                    }}
                    className="text-xs text-brand-700 hover:text-brand-900 font-semibold px-2 py-1"
                  >
                    Edit Ruangan
                  </button>
                </div>
              </div>
            )}

            {/* Grid of AC Units in this room */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentRoomUnits
                .filter(u => 
                  !searchQuery ||
                  u.ruanganLokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.merk.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.jenisAc.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((unit) => {
                  const unitRecords = maintenanceRecords.filter(r => r.unitId === unit.id);
                  const lastRecord = unitRecords[unitRecords.length - 1];
                  const totalBiaya = unitRecords.reduce((sum, r) => sum + (r.totalHarga || (r.biaya * (r.qty || 1)) || 0), 0);

                  return (
                    <div
                      key={unit.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[10px] font-bold text-brand-700 tracking-wider uppercase block">
                              {unit.jenisAc} • {unit.kapasitas}
                            </span>
                            <h3 className="text-base font-extrabold text-slate-900">
                              {unit.ruanganLokasi}
                            </h3>
                          </div>
                          <span className="text-xs font-mono font-bold bg-blue-50 text-brand-800 px-2 py-1 rounded-lg border border-blue-200">
                            {unit.merk}
                          </span>
                        </div>

                        {/* Specs row */}
                        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 my-2 text-slate-600">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Tipe / Model</span>
                            <span className="font-medium text-slate-800">{unit.typeModel || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">No. Seri</span>
                            <span className="font-mono text-slate-800">{unit.noSeri || '-'}</span>
                          </div>
                        </div>

                        {/* Last service info */}
                        <div className="text-xs text-slate-600 mb-3">
                          {lastRecord ? (
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Servis Terakhir ({lastRecord.tanggal}):</span>
                                <span className="font-semibold text-slate-800">{lastRecord.uraianPekerjaan}</span>
                              </div>
                              <span className="text-xs font-bold font-mono text-emerald-800">
                                Rp {(lastRecord.totalHarga || lastRecord.biaya || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                          ) : (
                            <div className="text-slate-400 italic text-[11px]">
                              Belum ada riwayat perbaikan
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-mono text-slate-500">
                          ID: {unit.qrCodeId}
                        </div>
                        <button
                          onClick={() => setSelectedUnitId(unit.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                        >
                          <span>Buka Kartu & Servis</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {currentRoomUnits.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                <DoorClosed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Belum ada unit AC di ruangan ini</p>
                <p className="text-xs text-slate-400 mt-1">Tambahkan unit AC untuk mulai mencatat riwayat servis.</p>
                <button
                  onClick={() => {
                    setEditingUnit(null);
                    setIsUnitModalOpen(true);
                  }}
                  className="mt-3 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Unit AC Sekarang
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation (Optimized for field technician phone usage!) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 md:hidden py-1.5 px-4 shadow-lg">
        <div className="flex items-center justify-around">
          <button
            onClick={() => {
              setSelectedUnitId(null);
              setActiveTab('ruangan');
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              !selectedUnitId ? 'text-brand-800' : 'text-slate-500'
            }`}
          >
            <DoorClosed className="w-5 h-5" />
            <span>Ruangan</span>
          </button>

          {/* Prominent Center Scan Button */}
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-brand-700 text-white shadow-lg border-2 border-white active:scale-95 transition-transform"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500 hover:text-brand-800"
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Pengaturan</span>
          </button>
        </div>
      </nav>

      {/* MODALS */}
      {/* 1. Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSelectUnit={(unit) => {
          setSelectedUnitId(unit.id);
          setSelectedRoomId(unit.roomId);
        }}
        onSelectRoom={(room) => {
          setSelectedRoomId(room.id);
          setSelectedUnitId(null);
        }}
      />

      {/* 2. QR Sticker Generator Modal */}
      <QRStickerModal
        isOpen={isQRStickerOpen}
        onClose={() => setIsQRStickerOpen(false)}
        unit={activeUnit}
        room={activeRoom}
        settings={currentSettings}
      />

      {/* 3. Official PDF Export & Print Modal */}
      {activeUnit && (
        <PdfExportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          unit={activeUnit}
          records={currentUnitRecords}
          settings={currentSettings}
        />
      )}

      {/* 4. Maintenance Record Form Modal */}
      {activeUnit && (
        <MaintenanceModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          record={editingRecord}
          unitId={activeUnit.id}
          nextNomorUrut={currentUnitRecords.length + 1}
          onSave={handleSaveRecord}
          onDelete={handleDeleteRecord}
        />
      )}

      {/* 5. AC Unit Form Modal */}
      <ACUnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        unit={editingUnit}
        defaultRoomId={selectedRoomId || undefined}
        rooms={rooms}
        onSave={handleSaveUnit}
        onDelete={handleDeleteUnit}
      />

      {/* 6. Room Form Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        room={editingRoom}
        onSave={handleSaveRoom}
        onDelete={handleDeleteRoom}
      />

      {/* 7. Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={currentSettings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};
