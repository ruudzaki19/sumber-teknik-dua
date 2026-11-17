import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Plus,
  DoorClosed,
  Search,
  Download,
  Printer,
  Edit,
  LogOut,
  QrCode,
  LayoutDashboard,
  Receipt,
  FileText
} from 'lucide-react';

import { ACUnit, MaintenanceRecord, Room, Bon, AppTab } from './types';
import { useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { MaintenanceModal } from './components/MaintenanceModal';
import { ACUnitModal } from './components/ACUnitModal';
import { RoomModal } from './components/RoomModal';
import { PdfExportModal } from './components/PdfExportModal';
import { QRStickerModal } from './components/QRStickerModal';
import { PublicQRView } from './components/PublicQRView';
import { PublicBonView } from './components/PublicBonView';
import { DashboardView } from './components/DashboardView';
import { BonListView } from './components/BonListView';
import { BonModal } from './components/BonModal';
import { BonPdfModal } from './components/BonPdfModal';
import { BonQRModal } from './components/BonQRModal';
import { CoolingAirflowBackground } from './components/CoolingAirflowBackground';
import { dataService } from './db/dataService';
import { supabase } from './lib/supabase';
import { FIXED_SIGNATURE_PATH } from './db/db';

export const App: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();

  // Navigation tab state: 'beranda' | 'pemeliharaan' | 'bon'
  const [activeTab, setActiveTab] = useState<AppTab>('beranda');

  // Public URL View states: e.g. ?view=unit-xxx or ?bon=bon-xxx
  const [publicUnitId, setPublicUnitId] = useState<string | null>(null);
  const [publicBonId, setPublicBonId] = useState<string | null>(null);

  // Data states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [acUnits, setAcUnits] = useState<ACUnit[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [bons, setBons] = useState<Bon[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Search filter for maintenance tab
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Pemeliharaan AC
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activePdfUnit, setActivePdfUnit] = useState<ACUnit | null>(null);

  const [isQRStickerOpen, setIsQRStickerOpen] = useState(false);
  const [activeStickerUnit, setActiveStickerUnit] = useState<ACUnit | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ACUnit | null>(null);
  const [targetRoomForUnit, setTargetRoomForUnit] = useState<Room | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [activeUnitForRecord, setActiveUnitForRecord] = useState<ACUnit | null>(null);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  // Modals for Pencatatan Bon
  const [isBonModalOpen, setIsBonModalOpen] = useState(false);
  const [editingBon, setEditingBon] = useState<Bon | null>(null);

  const [isBonPdfOpen, setIsBonPdfOpen] = useState(false);
  const [activePdfBon, setActivePdfBon] = useState<Bon | null>(null);

  const [isBonQROpen, setIsBonQROpen] = useState(false);
  const [activeQRBon, setActiveQRBon] = useState<Bon | null>(null);

  // Check URL on load for ?view=... or ?bon=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get('view');
    const bonParam = params.get('bon');

    if (viewId) {
      setPublicUnitId(viewId);
    } else if (bonParam) {
      setPublicBonId(bonParam);
    }
  }, []);

  // Load all data from Supabase & Dexie
  const refreshAllData = async () => {
    setDataLoading(true);
    const [fetchedRooms, fetchedUnits, fetchedRecords, fetchedBons] = await Promise.all([
      dataService.getRooms(),
      dataService.getUnits(),
      dataService.getRecords(),
      dataService.getBons()
    ]);
    setRooms(fetchedRooms);
    setAcUnits(fetchedUnits);
    setMaintenanceRecords(fetchedRecords);
    setBons(fetchedBons);
    setDataLoading(false);
  };

  // Initial load & Supabase Realtime Subscription across all 5 tables
  useEffect(() => {
    if (user && !publicUnitId && !publicBonId) {
      refreshAllData();

      let channel: any = null;
      if (supabase) {
        channel = supabase
          .channel('public:sumber-teknik-dua-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'rooms' },
            () => refreshAllData()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'ac_units' },
            () => refreshAllData()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'maintenance_records' },
            () => refreshAllData()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bons' },
            () => refreshAllData()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bon_items' },
            () => refreshAllData()
          )
          .subscribe();
      }

      return () => {
        if (channel && supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [user, publicUnitId, publicBonId]);

  // If visiting via AC QR code scan (?view=unit-xxx)
  if (publicUnitId) {
    return (
      <PublicQRView
        unitId={publicUnitId}
        onAdminLoginClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          window.history.pushState({}, '', url.toString());
          setPublicUnitId(null);
        }}
      />
    );
  }

  // If visiting via Bon QR code scan (?bon=bon-xxx)
  if (publicBonId) {
    return (
      <PublicBonView
        bonId={publicBonId}
        onBackClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('bon');
          window.history.pushState({}, '', url.toString());
          setPublicBonId(null);
        }}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center relative">
        <CoolingAirflowBackground />
        <div className="text-center relative z-10">
          <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-700 font-bold">Memuat Sumber Teknik Dua...</p>
        </div>
      </div>
    );
  }

  // If not logged in -> Show Login/Register
  if (!user) {
    return <LoginScreen />;
  }

  // Check role: Admin vs User
  const isAdmin = user.role === 'admin';

  // Room CRUD Handlers
  const handleSaveRoom = async (roomData: Omit<Room, 'id' | 'createdAt'> & { id?: string }) => {
    await dataService.saveRoom(roomData);
    await refreshAllData();
  };

  const handleDeleteRoom = async (roomId: string) => {
    await dataService.deleteRoom(roomId);
    await refreshAllData();
  };

  // Unit CRUD Handlers
  const handleSaveUnit = async (unitData: Omit<ACUnit, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    await dataService.saveUnit(unitData);
    await refreshAllData();
  };

  const handleDeleteUnit = async (unitId: string) => {
    await dataService.deleteUnit(unitId);
    await refreshAllData();
  };

  // Record CRUD Handlers
  const handleSaveRecord = async (recordData: Omit<MaintenanceRecord, 'id' | 'createdAt'> & { id?: string }) => {
    await dataService.saveRecord(recordData);
    await refreshAllData();
  };

  const handleDeleteRecord = async (recordId: string) => {
    await dataService.deleteRecord(recordId);
    await refreshAllData();
  };

  // Bon CRUD Handlers
  const handleSaveBon = async (
    bonData: Omit<Bon, 'id' | 'createdAt' | 'updatedAt' | 'items'> & {
      id?: string;
      items: Array<{
        banyaknya: string | number;
        keterangan: string;
        hargaSatuan: number;
        jumlah: number;
      }>;
    }
  ) => {
    await dataService.saveBon(bonData);
    await refreshAllData();
  };

  const handleDeleteBon = async (bonId: string) => {
    await dataService.deleteBon(bonId);
    await refreshAllData();
  };

  // Search filter for Pemeliharaan
  const q = searchQuery.trim().toLowerCase();
  const filteredRooms = rooms.filter((room) => {
    if (!q) return true;
    const matchesRoom = room.namaRuangan.toLowerCase().includes(q);
    const roomUnits = acUnits.filter((u) => u.roomId === room.id);
    const matchesUnit = roomUnits.some(
      (u) =>
        u.merk.toLowerCase().includes(q) ||
        u.jenisAc.toLowerCase().includes(q) ||
        u.ruanganLokasi.toLowerCase().includes(q) ||
        u.kapasitas.toLowerCase().includes(q)
    );
    return matchesRoom || matchesUnit;
  });

  const navTabs: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'beranda', label: 'Beranda', icon: LayoutDashboard },
    { id: 'pemeliharaan', label: 'Kartu Pemeliharaan', icon: DoorClosed },
    { id: 'bon', label: 'Pencatatan Bon', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col text-slate-900 pb-16 relative">
      {/* Background Animasi Aliran Angin Sejuk AC & Blueprint Teknik */}
      <CoolingAirflowBackground />

      {/* ============================================================== */}
      {/* 1. NAVIGASI UTAMA (3 MENU NAVBAR) - SOLID FOREST GREEN */}
      {/* ============================================================== */}
      <header className="bg-st-primary text-white sticky top-0 z-40 border-b-2 border-st-dark relative font-sora">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Logo & Brand Info (Tanpa Badge Admin/User) */}
          <div className="flex items-center justify-between md:justify-start gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center border-2 border-st-dark shrink-0 shadow-[2px_2px_0px_#14402c]">
                <img src="/logo-resmi.png" alt="ST" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight uppercase text-white whitespace-nowrap">
                SUMBER TEKNIK DUA
              </h1>
            </div>

            {/* Mobile Logout Button (Merah, Logo Saja) */}
            <div className="md:hidden flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all border-2 border-st-dark shadow-[2px_2px_0px_#14402c] active:translate-y-0.5"
                title="Keluar Akun"
                aria-label="Keluar"
              >
                <LogOut className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Center: 3 Navigasi Menu Tabs (Posisi di Tengah Navbar) */}
          <div className="flex-1 flex justify-center items-center w-full md:w-auto">
            <nav className="relative flex items-center gap-1 bg-st-dark p-1 rounded-xl border-2 border-st-dark w-full md:w-auto justify-between md:justify-center shadow-[2px_2px_0px_#14402c]">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 z-10 whitespace-nowrap ${
                      isActive ? 'text-st-text' : 'text-st-pale hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-white rounded-lg shadow-xs z-[-1]"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-st-primary' : 'text-st-pale'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Nama Akun & Tombol Keluar Merah (Desktop) */}
          <div className="hidden md:flex items-center gap-3 shrink-0 justify-end">
            <span className="text-xs font-bold text-st-pale whitespace-nowrap max-w-[180px] truncate">
              {user.name}
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all border-2 border-st-dark shadow-[2px_2px_0px_#14402c] active:translate-y-0.5 flex items-center justify-center"
              title="Keluar Akun"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. KONTEN UTAMA BERDASARKAN TAB YANG AKTIF */}
      {/* ============================================================== */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-5 flex-1 w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="w-full space-y-4"
          >
            {/* ================= TAB 1: BERANDA ================= */}
            {activeTab === 'beranda' && (
              <DashboardView
                user={user}
                rooms={rooms}
                acUnits={acUnits}
                bons={bons}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenAddRoom={() => {
                  setEditingRoom(null);
                  setIsRoomModalOpen(true);
                }}
                onOpenAddBon={() => {
                  setEditingBon(null);
                  setIsBonModalOpen(true);
                }}
              />
            )}

            {/* ================= TAB 2: KARTU PEMELIHARAAN AC ================= */}
            {activeTab === 'pemeliharaan' && (
              <div className="space-y-6 font-sora text-st-text">
                {/* Control Bar: Search & (Admin) Tambah Ruangan */}
                <div className="bg-st-white p-4 sm:p-5 rounded-[20px] border-[3px] border-st-dark shadow-[6px_6px_0px_#14402c] flex flex-col sm:flex-row gap-3 items-center justify-between">
                  {/* Search Box */}
                  <div className="relative w-full sm:w-96">
                    <Search className="w-4 h-4 text-st-dark absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Cari nama ruangan atau merk AC..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-14 py-2.5 text-xs bg-st-cream border-2 border-st-dark rounded-xl font-semibold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-st-dark hover:text-rose-600 absolute right-3 top-2.5 font-bold px-1.5 py-0.5 rounded bg-st-cream-dark border border-st-dark"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* + Tambah Ruangan (Khusus Admin) */}
                  {isAdmin && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setEditingRoom(null);
                        setIsRoomModalOpen(true);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-st-primary hover:bg-st-dark text-white text-xs font-extrabold rounded-xl border-2 border-st-dark shadow-[3px_3px_0px_#14402c] active:translate-y-0.5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Ruangan</span>
                    </motion.button>
                  )}
                </div>

                {/* Empty state when no rooms exist yet */}
                {!dataLoading && rooms.length === 0 && (
                  <div className="bg-st-white rounded-[20px] border-[3px] border-dashed border-st-dark p-12 text-center shadow-[6px_6px_0px_#14402c]">
                    <div className="w-14 h-14 bg-st-pale text-st-dark rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-st-dark shadow-[3px_3px_0px_#14402c]">
                      <DoorClosed className="w-7 h-7 text-st-primary" />
                    </div>
                    <h3 className="text-base font-extrabold text-st-text uppercase tracking-tight">
                      {isAdmin ? 'Belum Ada Ruangan' : 'Belum Ada Data Ruangan'}
                    </h3>
                    <p className="text-xs text-st-text-muted max-w-sm mx-auto mt-1 mb-5 font-medium">
                      {isAdmin
                        ? 'Klik tombol "Tambah Ruangan" di atas untuk membuat ruangan baru.'
                        : 'Saat ini belum ada data ruangan yang didaftarkan oleh admin teknisi.'}
                    </p>
                    {isAdmin && (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setEditingRoom(null);
                          setIsRoomModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-st-primary hover:bg-st-dark text-white text-xs font-extrabold rounded-xl inline-flex items-center gap-2 border-2 border-st-dark shadow-[3px_3px_0px_#14402c] active:translate-y-0.5 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Ruangan Sekarang</span>
                      </motion.button>
                    )}
                  </div>
                )}

                {/* Search empty state */}
                {!dataLoading && rooms.length > 0 && filteredRooms.length === 0 && (
                  <div className="bg-st-white rounded-[20px] border-[3px] border-st-dark p-8 text-center text-st-text-muted shadow-[6px_6px_0px_#14402c]">
                    <p className="text-xs font-bold text-st-text">
                      Tidak ada ruangan yang cocok dengan pencarian "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-xs text-st-primary font-extrabold hover:underline"
                    >
                      Hapus pencarian
                    </button>
                  </div>
                )}

                {/* ROOMS LIST */}
                <div className="space-y-6">
                  {filteredRooms.map((room) => {
                    const roomUnits = acUnits.filter((u) => u.roomId === room.id);

                    return (
                      <div
                        key={room.id}
                        className="bg-st-white rounded-[20px] border-[3px] border-st-dark shadow-[6px_6px_0px_#14402c] overflow-hidden"
                      >
                        {/* ROOM HEADER: Name on left, Actions on right (Admin Only) */}
                        <div className="bg-st-cream-dark p-4 sm:p-5 border-b-[3px] border-st-dark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-st-white text-st-primary flex items-center justify-center font-bold border-2 border-st-dark shadow-[2px_2px_0px_#14402c]">
                              <DoorClosed className="w-5 h-5 text-st-primary" />
                            </div>
                            <div>
                              <span className="text-[10px] text-st-text-muted uppercase tracking-wider font-extrabold block">
                                LOKASI RUANGAN
                              </span>
                              <h2 className="text-base sm:text-lg font-extrabold text-st-text tracking-tight uppercase">
                                {room.namaRuangan}
                              </h2>
                            </div>
                          </div>

                          {/* ACTION BUTTONS: Admin Only */}
                          {isAdmin && (
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setEditingRoom(room);
                                  setIsRoomModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-st-dark bg-st-white hover:bg-st-cream border-2 border-st-dark px-3 py-2 rounded-xl transition-all shadow-[2px_2px_0px_#14402c] active:translate-y-0.5"
                              >
                                <Edit className="w-3.5 h-3.5 text-st-dark" />
                                <span>Edit Ruangan</span>
                              </motion.button>

                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setTargetRoomForUnit(room);
                                  setEditingUnit(null);
                                  setIsUnitModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-st-primary hover:bg-st-dark px-4 py-2 rounded-xl shadow-[3px_3px_0px_#14402c] border-2 border-st-dark active:translate-y-0.5 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Unit AC</span>
                              </motion.button>
                            </div>
                          )}
                        </div>

                        {/* ROOM BODY: List of AC Units inside this room */}
                        <div className="p-4 sm:p-5 space-y-5">
                          {roomUnits.length === 0 ? (
                            <div className="text-center py-8 text-st-text-muted text-xs bg-st-cream/60 rounded-xl border-2 border-dashed border-st-dark/30 font-medium">
                              Belum ada unit AC di ruangan ini.
                              {isAdmin && (
                                <>
                                  <br />
                                  Klik tombol <strong>"Tambah Unit AC"</strong> di kanan atas untuk menambahkan unit.
                                </>
                              )}
                            </div>
                          ) : (
                            roomUnits.map((unit) => {
                              const unitRecords = maintenanceRecords
                                .filter((r) => r.unitId === unit.id)
                                .sort((a, b) => (a.nomorUrut || 0) - (b.nomorUrut || 0));

                              return (
                                <div
                                  key={unit.id}
                                  className="bg-st-white rounded-[16px] border-2 border-st-dark overflow-hidden shadow-[4px_4px_0px_#14402c]"
                                >
                                  {/* Unit Title Bar: Solid Forest Green */}
                                  <div className="bg-st-primary text-white p-3.5 px-4 sm:px-5 flex flex-wrap items-center justify-between gap-2 border-b-2 border-st-dark">
                                    <div>
                                      <span className="text-[10px] text-st-pale uppercase tracking-wider font-extrabold block">
                                        KARTU PEMELIHARAAN AC TAHUN 2026
                                      </span>
                                      <h3 className="text-xs sm:text-sm font-extrabold uppercase mt-0.5 text-white tracking-tight">
                                        {unit.ruanganLokasi} — {unit.merk} {unit.jenisAc} ({unit.kapasitas})
                                      </h3>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                      {/* QR Code Sticker Button (Visible for all: Admin & User) */}
                                      <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                          setActiveStickerUnit(unit);
                                          setIsQRStickerOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-st-dark hover:bg-black text-white px-3 py-1.5 rounded-xl transition-all border border-st-pale/40"
                                        title="Lihat & Cetak Stiker QR Code untuk AC ini"
                                      >
                                        <QrCode className="w-3.5 h-3.5 text-st-light" />
                                        <span>Stiker QR</span>
                                      </motion.button>

                                      {/* Tambah Catatan Servis (Admin Only) */}
                                      {isAdmin && (
                                        <motion.button
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() => {
                                            setActiveUnitForRecord(unit);
                                            setEditingRecord(null);
                                            setIsMaintenanceModalOpen(true);
                                          }}
                                          className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-st-white text-st-dark hover:bg-st-cream-dark px-3.5 py-1.5 rounded-xl shadow-[2px_2px_0px_#14402c] border-2 border-st-dark active:translate-y-0.5 transition-all"
                                        >
                                          <Plus className="w-3.5 h-3.5 text-st-primary" />
                                          <span>Tambah Catatan Servis</span>
                                        </motion.button>
                                      )}

                                      {/* Edit Unit (Admin Only) */}
                                      {isAdmin && (
                                        <motion.button
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() => {
                                            setTargetRoomForUnit(room);
                                            setEditingUnit(unit);
                                            setIsUnitModalOpen(true);
                                          }}
                                          className="p-1.5 bg-st-dark hover:bg-black text-white rounded-xl transition-colors border border-st-pale/40"
                                          title="Edit Spesifikasi Unit"
                                        >
                                          <Edit className="w-4 h-4 text-st-pale" />
                                        </motion.button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Unit Meta Grid */}
                                  <div className="p-3.5 bg-st-cream/80 border-b-2 border-st-dark grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div>
                                      <span className="text-[10px] text-st-text-muted block uppercase font-extrabold">JENIS AC</span>
                                      <span className="font-extrabold text-st-text">{unit.jenisAc || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-st-text-muted block uppercase font-extrabold">MERK</span>
                                      <span className="font-extrabold text-st-text">{unit.merk || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-st-text-muted block uppercase font-extrabold">KAPASITAS</span>
                                      <span className="font-extrabold tabular-nums text-st-text">{unit.kapasitas || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-st-text-muted block uppercase font-extrabold">NO. SERI</span>
                                      <span className="font-mono tabular-nums text-st-text font-bold">{unit.noSeri || '-'}</span>
                                    </div>
                                  </div>

                                  {/* 12-ROW TABLE (Clean work log with automatic paraf) */}
                                  <div className="p-3 sm:p-4">
                                    <div className="overflow-x-auto border-2 border-st-dark rounded-xl">
                                      <table className="w-full text-xs text-left">
                                        <thead className="bg-st-cream-dark border-b-2 border-st-dark font-extrabold text-st-dark text-[11px] uppercase tracking-wider">
                                          <tr>
                                            <th className="w-12 py-2.5 px-3 text-center border-r-2 border-st-dark">NO</th>
                                            <th className="w-32 py-2.5 px-3 border-r-2 border-st-dark">TANGGAL</th>
                                            <th className="py-2.5 px-3 border-r-2 border-st-dark">URAIAN PEKERJAAN</th>
                                            <th className={`w-24 py-2.5 px-2 text-center ${isAdmin ? 'border-r-2 border-st-dark' : ''}`}>
                                              PARAF
                                            </th>
                                            {isAdmin && (
                                              <th className="w-16 py-2.5 px-2 text-center">AKSI</th>
                                            )}
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y border-st-dark/20 bg-st-white">
                                          {unitRecords.length > 0 ? (
                                            unitRecords.map((rec, idx) => (
                                              <tr key={rec.id} className="hover:bg-st-pale/30 transition-colors">
                                                <td className="py-2.5 px-3 text-center font-extrabold font-mono tabular-nums text-st-dark border-r border-st-dark/20 align-top">
                                                  {rec.nomorUrut || idx + 1}
                                                </td>
                                                <td className="py-2.5 px-3 font-bold tabular-nums text-st-text border-r border-st-dark/20 whitespace-nowrap align-top">
                                                  {rec.tanggal}
                                                </td>
                                                <td className="py-2.5 px-3 font-medium text-st-text border-r border-st-dark/20 whitespace-pre-line leading-relaxed align-top">
                                                  {rec.uraianPekerjaan}
                                                </td>
                                                <td className={`py-1.5 px-2 text-center align-top ${isAdmin ? 'border-r border-st-dark/20' : ''}`}>
                                                  <img
                                                    src={FIXED_SIGNATURE_PATH}
                                                    alt="Paraf"
                                                    className="h-6 max-w-[65px] mx-auto object-contain"
                                                  />
                                                </td>
                                                {isAdmin && (
                                                  <td className="py-2.5 px-2 text-center align-top">
                                                    <button
                                                      onClick={() => {
                                                        setActiveUnitForRecord(unit);
                                                        setEditingRecord(rec);
                                                        setIsMaintenanceModalOpen(true);
                                                      }}
                                                      className="text-st-primary hover:text-st-dark font-extrabold text-xs underline"
                                                    >
                                                      Edit
                                                    </button>
                                                  </td>
                                                )}
                                              </tr>
                                            ))
                                          ) : (
                                            <tr>
                                              <td colSpan={isAdmin ? 5 : 4} className="py-6 text-center text-st-text-muted font-medium">
                                                {isAdmin
                                                  ? 'Belum ada catatan servis. Tekan tombol "Tambah Catatan Servis" di atas.'
                                                  : 'Belum ada catatan servis terdaftar untuk unit ini.'}
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* Direct Download JPG button at bottom of table */}
                                    <div className="mt-4 flex justify-end">
                                      <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                          setActivePdfUnit(unit);
                                          setIsPdfModalOpen(true);
                                        }}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-st-primary hover:bg-st-dark text-white text-xs font-extrabold rounded-xl border-2 border-st-dark shadow-[3px_3px_0px_#14402c] active:translate-y-0.5 transition-all"
                                      >
                                        <Download className="w-4 h-4" />
                                        <span>Download Gambar Kartu Pemeliharaan (JPG)</span>
                                      </motion.button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 3: PENCATATAN BON ================= */}
            {activeTab === 'bon' && (
              <BonListView
                bons={bons}
                isAdmin={isAdmin}
                onOpenCreate={() => {
                  setEditingBon(null);
                  setIsBonModalOpen(true);
                }}
                onOpenEdit={(b) => {
                  setEditingBon(b);
                  setIsBonModalOpen(true);
                }}
                onOpenPdf={(b) => {
                  setActivePdfBon(b);
                  setIsBonPdfOpen(true);
                }}
                onOpenQR={(b) => {
                  setActiveQRBon(b);
                  setIsBonQROpen(true);
                }}
                onDelete={handleDeleteBon}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ============================================================== */}
      {/* 3. MODALS (PEMELIHARAAN & PENCATATAN BON) */}
      {/* ============================================================== */}
      {/* 1. Official PDF Export & Print Modal (Kartu Pemeliharaan) */}
      {activePdfUnit && (
        <PdfExportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          unit={activePdfUnit}
          records={maintenanceRecords.filter((r) => r.unitId === activePdfUnit.id)}
          year="2026"
        />
      )}

      {/* 2. QR Sticker Generator Modal (AC Unit) */}
      {activeStickerUnit && (
        <QRStickerModal
          isOpen={isQRStickerOpen}
          onClose={() => {
            setIsQRStickerOpen(false);
            setActiveStickerUnit(null);
          }}
          unit={activeStickerUnit}
        />
      )}

      {/* 3. Maintenance Record Form Modal (Admin Only) */}
      {isAdmin && activeUnitForRecord && (
        <MaintenanceModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          record={editingRecord}
          unitId={activeUnitForRecord.id}
          nextNomorUrut={
            maintenanceRecords.filter((r) => r.unitId === activeUnitForRecord.id).length + 1
          }
          onSave={handleSaveRecord}
          onDelete={handleDeleteRecord}
        />
      )}

      {/* 4. AC Unit Form Modal (Admin Only) */}
      {isAdmin && targetRoomForUnit && (
        <ACUnitModal
          isOpen={isUnitModalOpen}
          onClose={() => setIsUnitModalOpen(false)}
          unit={editingUnit}
          targetRoom={targetRoomForUnit}
          onSave={handleSaveUnit}
          onDelete={handleDeleteUnit}
        />
      )}

      {/* 5. Room Form Modal (Admin Only) */}
      {isAdmin && (
        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          room={editingRoom}
          onSave={handleSaveRoom}
          onDelete={handleDeleteRoom}
        />
      )}

      {/* 6. Bon Form Modal (Admin Only) */}
      {isAdmin && (
        <BonModal
          isOpen={isBonModalOpen}
          onClose={() => {
            setIsBonModalOpen(false);
            setEditingBon(null);
          }}
          bon={editingBon}
          onSave={handleSaveBon}
          onDelete={handleDeleteBon}
        />
      )}

      {/* 7. Bon PDF Export & Print Modal */}
      {activePdfBon && (
        <BonPdfModal
          isOpen={isBonPdfOpen}
          onClose={() => {
            setIsBonPdfOpen(false);
            setActivePdfBon(null);
          }}
          bon={activePdfBon}
        />
      )}

      {/* 8. Bon QR Code & Share Modal */}
      {activeQRBon && (
        <BonQRModal
          isOpen={isBonQROpen}
          onClose={() => {
            setIsBonQROpen(false);
            setActiveQRBon(null);
          }}
          bon={activeQRBon}
        />
      )}
    </div>
  );
};
