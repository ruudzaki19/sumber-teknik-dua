import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Wrench,
  Plus,
  DoorClosed,
  Search,
  Printer,
  Edit,
  Trash2,
  LogOut,
  Calendar
} from 'lucide-react';

import { db, seedInitialDataIfNeeded, FIXED_SIGNATURE_PATH } from './db/db';
import { ACUnit, MaintenanceRecord, Room } from './types';
import { useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { MaintenanceModal } from './components/MaintenanceModal';
import { ACUnitModal } from './components/ACUnitModal';
import { RoomModal } from './components/RoomModal';
import { PdfExportModal } from './components/PdfExportModal';

export const App: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();

  // Database live queries
  const rooms = useLiveQuery(() => db.rooms.orderBy('createdAt').reverse().toArray()) || [];
  const acUnits = useLiveQuery(() => db.acUnits.orderBy('createdAt').reverse().toArray()) || [];
  const maintenanceRecords = useLiveQuery(() => db.maintenanceRecords.toArray()) || [];

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activePdfUnit, setActivePdfUnit] = useState<ACUnit | null>(null);

  // Forms modals
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ACUnit | null>(null);
  const [targetRoomForUnit, setTargetRoomForUnit] = useState<Room | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [activeUnitForRecord, setActiveUnitForRecord] = useState<ACUnit | null>(null);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  // Initialize
  useEffect(() => {
    seedInitialDataIfNeeded();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-semibold">Memuat Sumber Tekhnik 2...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Handle Room CRUD
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
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    await db.rooms.delete(roomId);
    const relatedUnits = await db.acUnits.where('roomId').equals(roomId).toArray();
    for (const u of relatedUnits) {
      await db.maintenanceRecords.where('unitId').equals(u.id).delete();
    }
    await db.acUnits.where('roomId').equals(roomId).delete();
  };

  // Handle Unit CRUD
  const handleSaveUnit = async (unitData: Omit<ACUnit, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (unitData.id) {
      await db.acUnits.update(unitData.id, {
        ...unitData,
        updatedAt: Date.now()
      });
    } else {
      const newId = `unit-${Date.now().toString(36)}`;
      await db.acUnits.add({
        ...unitData,
        id: newId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    await db.acUnits.delete(unitId);
    await db.maintenanceRecords.where('unitId').equals(unitId).delete();
  };

  // Handle Record CRUD
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

  // Search filter
  const q = searchQuery.trim().toLowerCase();
  const filteredRooms = rooms.filter(room => {
    if (!q) return true;
    const matchesRoom = room.namaRuangan.toLowerCase().includes(q);
    const roomUnits = acUnits.filter(u => u.roomId === room.id);
    const matchesUnit = roomUnits.some(u => 
      u.merk.toLowerCase().includes(q) ||
      u.jenisAc.toLowerCase().includes(q) ||
      u.ruanganLokasi.toLowerCase().includes(q) ||
      u.kapasitas.toLowerCase().includes(q)
    );
    return matchesRoom || matchesUnit;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 pb-16">
      {/* Top Navbar - Sumber Tekhnik 2 (Tanpa Scan QR) */}
      <header className="bg-brand-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Wrench className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight uppercase">
                  Sumber Tekhnik 2
                </h1>
                <span className="text-[10px] bg-brand-700 text-blue-100 px-2 py-0.5 rounded font-mono font-medium">
                  Tahun 2026
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Sistem Pemeliharaan AC Ruangan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2">
              <span className="hidden sm:inline text-xs font-semibold text-blue-100">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors inline-flex items-center gap-1 text-xs"
                title="Keluar / Ganti Akun"
              >
                <LogOut className="w-4 h-4 text-blue-200" />
                <span className="hidden xs:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-5 flex-1 w-full space-y-4">
        {/* Top Control Bar: Search & Tambah Ruangan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
                className="text-[10px] text-slate-400 hover:text-slate-600 absolute right-3 top-3 font-bold"
              >
                Reset
              </button>
            )}
          </div>

          {/* + Tambah Ruangan */}
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
        </div>

        {/* Empty state when no rooms exist yet */}
        {rooms.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 text-brand-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <DoorClosed className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum Ada Ruangan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Klik tombol <strong>"Tambah Ruangan"</strong> di atas untuk membuat ruangan baru.
            </p>
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
          </div>
        )}

        {/* If rooms exist, list them */}
        {rooms.length > 0 && filteredRooms.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-600">Tidak ada ruangan yang cocok dengan pencarian "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs text-brand-700 font-bold"
            >
              Hapus pencarian
            </button>
          </div>
        )}

        {/* ROOMS LIST */}
        <div className="space-y-6">
          {filteredRooms.map((room) => {
            const roomUnits = acUnits.filter(u => u.roomId === room.id);

            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden"
              >
                {/* ROOM HEADER: Name on left (tanpa QR ID), [Edit Ruangan] & [+ Tambah Unit AC] on right */}
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center font-bold">
                      <DoorClosed className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
                        {room.namaRuangan}
                      </h2>
                    </div>
                  </div>

                  {/* ACTION BUTTONS: [Edit Ruangan] and [+ Tambah Unit AC] right next to it */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setEditingRoom(room);
                        setIsRoomModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Ruangan
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
                      + Tambah Unit AC
                    </button>
                  </div>
                </div>

                {/* ROOM BODY: List of AC Units inside this room */}
                <div className="p-4 space-y-5">
                  {roomUnits.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Belum ada unit AC di ruangan ini.
                      <br />
                      Klik tombol <strong>"+ Tambah Unit AC"</strong> di kanan atas untuk menambahkan.
                    </div>
                  ) : (
                    roomUnits.map((unit) => {
                      const unitRecords = maintenanceRecords
                        .filter(r => r.unitId === unit.id)
                        .sort((a, b) => (a.nomorUrut || 0) - (b.nomorUrut || 0));

                      return (
                        <div
                          key={unit.id}
                          className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-sm"
                        >
                          {/* Unit Title Bar */}
                          <div className="bg-brand-900 text-white p-3 px-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold block">
                                KARTU PEMELIHARAAN AC TAHUN 2026
                              </span>
                              <h3 className="text-sm sm:text-base font-extrabold uppercase">
                                {unit.ruanganLokasi} — {unit.merk} {unit.jenisAc} ({unit.kapasitas})
                              </h3>
                            </div>

                            {/* Direct Action Buttons: [+ Tambah Catatan Servis] & [Cetak PDF] */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setActiveUnitForRecord(unit);
                                  setEditingRecord(null);
                                  setIsMaintenanceModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-brand-900 hover:bg-blue-50 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                + Tambah Catatan Servis
                              </button>

                              <button
                                onClick={() => {
                                  setActivePdfUnit(unit);
                                  setIsPdfModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-700 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-colors border border-white/20"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Cetak PDF
                              </button>

                              <button
                                onClick={() => {
                                  setTargetRoomForUnit(room);
                                  setEditingUnit(unit);
                                  setIsUnitModalOpen(true);
                                }}
                                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                                title="Edit Spesifikasi Unit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
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

                          {/* 12-ROW TABLE (Clean work log without prices, supports multiline text) */}
                          <div className="p-3">
                            <div className="overflow-x-auto border border-slate-300 rounded-lg">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                                  <tr>
                                    <th className="w-12 py-2 px-3 text-center border-r border-slate-200">NO</th>
                                    <th className="w-32 py-2 px-3 border-r border-slate-200">TANGGAL</th>
                                    <th className="py-2 px-3 border-r border-slate-200">URAIAN PEKERJAAN</th>
                                    <th className="w-24 py-2 px-2 text-center border-r border-slate-200">PARAF</th>
                                    <th className="w-16 py-2 px-2 text-center">AKSI</th>
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
                                        <td className="py-1 px-2 text-center border-r border-slate-200 align-top">
                                          <img
                                            src={FIXED_SIGNATURE_PATH}
                                            alt="Paraf"
                                            className="h-6 max-w-[65px] mx-auto object-contain"
                                          />
                                        </td>
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
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={5} className="py-5 text-center text-slate-400">
                                        Belum ada catatan servis. Tekan tombol <strong>"+ Tambah Catatan Servis"</strong> di atas.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Direct Cetak PDF button at bottom of table */}
                            {unitRecords.length > 0 && (
                              <div className="mt-3 flex justify-end">
                                <button
                                  onClick={() => {
                                    setActivePdfUnit(unit);
                                    setIsPdfModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  Cetak / Download PDF Kartu Pemeliharaan
                                </button>
                              </div>
                            )}
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
      </main>

      {/* MODALS */}
      {/* 1. Official PDF Export & Print Modal (Fixed A4 proportions matching Gambar 5) */}
      {activePdfUnit && (
        <PdfExportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          unit={activePdfUnit}
          records={maintenanceRecords.filter(r => r.unitId === activePdfUnit.id)}
          year="2026"
        />
      )}

      {/* 2. Maintenance Record Form Modal (Multiline Textarea & Fixed Paraf) */}
      {activeUnitForRecord && (
        <MaintenanceModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          record={editingRecord}
          unitId={activeUnitForRecord.id}
          nextNomorUrut={
            maintenanceRecords.filter(r => r.unitId === activeUnitForRecord.id).length + 1
          }
          onSave={handleSaveRecord}
          onDelete={handleDeleteRecord}
        />
      )}

      {/* 3. AC Unit Form Modal (Locked room, clean fields) */}
      {targetRoomForUnit && (
        <ACUnitModal
          isOpen={isUnitModalOpen}
          onClose={() => setIsUnitModalOpen(false)}
          unit={editingUnit}
          targetRoom={targetRoomForUnit}
          onSave={handleSaveUnit}
          onDelete={handleDeleteUnit}
        />
      )}

      {/* 4. Room Form Modal (Clean name only) */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        room={editingRoom}
        onSave={handleSaveRoom}
        onDelete={handleDeleteRoom}
      />
    </div>
  );
};
