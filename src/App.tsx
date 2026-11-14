import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  DoorClosed,
  Search,
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-bold">Memuat Sumber Teknik Dua...</p>
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
        banyaknya: number;
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 pb-16">
      {/* ============================================================== */}
      {/* 1. NAVIGASI UTAMA (3 MENU NAVBAR) - HIJAU TUA & PUTIH BERSIH */}
      {/* ============================================================== */}
      <header className="bg-brand-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Brand Info */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-emerald-400/30 shrink-0">
                <img src="/logo-resmi.png" alt="ST" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight uppercase">
                    SUMBER TEKNIK DUA
                  </h1>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isAdmin
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        : 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                    }`}
                  >
                    {isAdmin ? 'Admin' : 'User / Klien'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Profile & Logout (Mobile) */}
            <div className="sm:hidden flex items-center gap-2">
              <button
                onClick={logout}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                title="Keluar Akun"
              >
                <LogOut className="w-4 h-4 text-emerald-200" />
              </button>
            </div>
          </div>

          {/* 3 Navigasi Menu Tabs & User Section (Desktop) */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-800/60">
            <nav className="flex items-center gap-1 bg-emerald-950/60 p-1 rounded-2xl border border-emerald-800/80 w-full sm:w-auto justify-between sm:justify-start">
              {/* Menu 1: Beranda */}
              <button
                onClick={() => setActiveTab('beranda')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'beranda'
                    ? 'bg-white text-brand-900 shadow-sm'
                    : 'text-emerald-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </button>

              {/* Menu 2: Kartu Pemeliharaan */}
              <button
                onClick={() => setActiveTab('pemeliharaan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'pemeliharaan'
                    ? 'bg-white text-brand-900 shadow-sm'
                    : 'text-emerald-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <DoorClosed className="w-3.5 h-3.5" />
                <span>Kartu Pemeliharaan</span>
              </button>

              {/* Menu 3: Pencatatan Bon */}
              <button
                onClick={() => setActiveTab('bon')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'bon'
                    ? 'bg-white text-brand-900 shadow-sm'
                    : 'text-emerald-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Pencatatan Bon</span>
              </button>
            </nav>

            {/* User Profile & Logout (Desktop) */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-emerald-800/60">
              <span className="text-xs font-semibold text-emerald-100 max-w-[120px] truncate">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                title="Keluar Akun"
              >
                <LogOut className="w-4 h-4 text-emerald-200" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. KONTEN UTAMA BERDASARKAN TAB YANG AKTIF */}
      {/* ============================================================== */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-5 flex-1 w-full space-y-4">
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
          <div className="space-y-4">
            {/* Control Bar: Search & (Admin) Tambah Ruangan */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama ruangan atau merk AC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* + Tambah Ruangan (Khusus Admin) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingRoom(null);
                    setIsRoomModalOpen(true);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Ruangan</span>
                </button>
              )}
            </div>

            {/* Empty state when no rooms exist yet */}
            {!dataLoading && rooms.length === 0 && (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                  <DoorClosed className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {isAdmin ? 'Belum Ada Ruangan' : 'Belum Ada Data Ruangan'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  {isAdmin
                    ? 'Klik tombol "Tambah Ruangan" di atas untuk membuat ruangan baru.'
                    : 'Saat ini belum ada data ruangan yang didaftarkan oleh admin teknisi.'}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingRoom(null);
                      setIsRoomModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Ruangan Sekarang
                  </button>
                )}
              </div>
            )}

            {/* Search empty state */}
            {!dataLoading && rooms.length > 0 && filteredRooms.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
                <p className="text-sm font-semibold text-slate-600">
                  Tidak ada ruangan yang cocok dengan pencarian "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-brand-700 font-bold hover:underline"
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
                    className="bg-white rounded-3xl border border-slate-300 shadow-sm overflow-hidden"
                  >
                    {/* ROOM HEADER: Name on left, Actions on right (Admin Only) */}
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          <DoorClosed className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
                            {room.namaRuangan}
                          </h2>
                        </div>
                      </div>

                      {/* ACTION BUTTONS: Admin Only */}
                      {isAdmin && (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => {
                              setEditingRoom(room);
                              setIsRoomModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Ruangan</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetRoomForUnit(room);
                              setEditingUnit(null);
                              setIsUnitModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 px-3.5 py-1.5 rounded-xl shadow-sm transition-colors active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Unit AC</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ROOM BODY: List of AC Units inside this room */}
                    <div className="p-4 space-y-5">
                      {roomUnits.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          Belum ada unit AC di ruangan ini.
                          {isAdmin && (
                            <>
                              <br />
                              Klik tombol <strong>"Tambah Unit AC"</strong> di kanan atas untuk menambahkan.
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
                              className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-sm"
                            >
                              {/* Unit Title Bar */}
                              <div className="bg-brand-900 text-white p-3 px-4 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <span className="text-[10px] text-emerald-300 uppercase tracking-widest font-bold block">
                                    KARTU PEMELIHARAAN AC TAHUN 2026
                                  </span>
                                  <h3 className="text-sm sm:text-base font-extrabold uppercase mt-0.5">
                                    {unit.ruanganLokasi} — {unit.merk} {unit.jenisAc} ({unit.kapasitas})
                                  </h3>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                  {/* QR Code Sticker Button (Visible for all: Admin & User) */}
                                  <button
                                    onClick={() => {
                                      setActiveStickerUnit(unit);
                                      setIsQRStickerOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-2.5 py-1.5 rounded-lg transition-colors border border-white/20"
                                    title="Lihat & Cetak Stiker QR Code untuk AC ini"
                                  >
                                    <QrCode className="w-3.5 h-3.5 text-emerald-200" />
                                    <span>Stiker QR</span>
                                  </button>

                                  {/* Tambah Catatan Servis (Admin Only) */}
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        setActiveUnitForRecord(unit);
                                        setEditingRecord(null);
                                        setIsMaintenanceModalOpen(true);
                                      }}
                                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-brand-900 hover:bg-emerald-50 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Tambah Catatan Servis</span>
                                    </button>
                                  )}

                                  {/* Edit Unit (Admin Only) */}
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        setTargetRoomForUnit(room);
                                        setEditingUnit(unit);
                                        setIsUnitModalOpen(true);
                                      }}
                                      className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                      title="Edit Spesifikasi Unit"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Unit Meta Grid */}
                              <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">JENIS AC</span>
                                  <span className="font-bold text-slate-800">{unit.jenisAc || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">MERK</span>
                                  <span className="font-bold text-slate-800">{unit.merk || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">KAPASITAS</span>
                                  <span className="font-bold text-slate-800">{unit.kapasitas || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">NO. SERI</span>
                                  <span className="font-mono text-slate-700">{unit.noSeri || '-'}</span>
                                </div>
                              </div>

                              {/* 12-ROW TABLE (Clean work log with automatic paraf) */}
                              <div className="p-3">
                                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                                      <tr>
                                        <th className="w-12 py-2 px-3 text-center border-r border-slate-200">NO</th>
                                        <th className="w-32 py-2 px-3 border-r border-slate-200">TANGGAL</th>
                                        <th className="py-2 px-3 border-r border-slate-200">URAIAN PEKERJAAN</th>
                                        <th className={`w-24 py-2 px-2 text-center ${isAdmin ? 'border-r border-slate-200' : ''}`}>
                                          PARAF
                                        </th>
                                        {isAdmin && (
                                          <th className="w-16 py-2 px-2 text-center">AKSI</th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                      {unitRecords.length > 0 ? (
                                        unitRecords.map((rec, idx) => (
                                          <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-2 px-3 text-center font-bold text-slate-600 border-r border-slate-200 align-top">
                                              {rec.nomorUrut || idx + 1}
                                            </td>
                                            <td className="py-2 px-3 font-medium text-slate-800 border-r border-slate-200 whitespace-nowrap align-top">
                                              {rec.tanggal}
                                            </td>
                                            <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200 whitespace-pre-line leading-relaxed align-top">
                                              {rec.uraianPekerjaan}
                                            </td>
                                            <td className={`py-1 px-2 text-center align-top ${isAdmin ? 'border-r border-slate-200' : ''}`}>
                                              <img
                                                src={FIXED_SIGNATURE_PATH}
                                                alt="Paraf"
                                                className="h-6 max-w-[65px] mx-auto object-contain"
                                              />
                                            </td>
                                            {isAdmin && (
                                              <td className="py-2 px-2 text-center align-top">
                                                <button
                                                  onClick={() => {
                                                    setActiveUnitForRecord(unit);
                                                    setEditingRecord(rec);
                                                    setIsMaintenanceModalOpen(true);
                                                  }}
                                                  className="text-brand-700 hover:text-brand-900 font-bold text-[11px]"
                                                >
                                                  Edit
                                                </button>
                                              </td>
                                            )}
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={isAdmin ? 5 : 4} className="py-5 text-center text-slate-400">
                                            {isAdmin
                                              ? 'Belum ada catatan servis. Tekan tombol "Tambah Catatan Servis" di atas.'
                                              : 'Belum ada catatan servis terdaftar untuk unit ini.'}
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Direct Cetak PDF button at bottom of table */}
                                <div className="mt-3 flex justify-end">
                                  <button
                                    onClick={() => {
                                      setActivePdfUnit(unit);
                                      setIsPdfModalOpen(true);
                                    }}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors active:scale-95"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Cetak / Download PDF Kartu Pemeliharaan</span>
                                  </button>
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
