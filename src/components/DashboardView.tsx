import React from 'react';
import {
  DoorClosed,
  Cpu,
  Receipt,
  ArrowRight,
  Phone,
  MessageCircle,
  MapPin,
  Wrench,
  ShieldCheck,
  Plus,
  Coins,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Room, ACUnit, Bon, UserProfile } from '../types';

interface DashboardViewProps {
  user: UserProfile;
  rooms: Room[];
  acUnits: ACUnit[];
  bons: Bon[];
  onNavigateTab: (tab: 'beranda' | 'pemeliharaan' | 'bon') => void;
  onOpenAddRoom?: () => void;
  onOpenAddBon?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  rooms,
  acUnits,
  bons,
  onNavigateTab,
  onOpenAddRoom,
  onOpenAddBon
}) => {
  const isAdmin = user.role === 'admin';

  // Calculate total omset bon
  const totalOmset = bons.reduce((sum, b) => sum + (b.totalJumlah || 0), 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const services = [
    { title: 'AC Rumah & Kantor', desc: 'Cuci steam, tambah freon, instalasi baru & relokasi' },
    { title: 'AC Mobil', desc: 'Perawatan kompresor, filter kabin & flushing' },
    { title: 'Kulkas & Freezer', desc: 'Perbaikan sirkulasi dingin, thermostat & kompresor' },
    { title: 'Water Heater', desc: 'Pengecekan elemen pemanas, instalasi & servis' },
    { title: 'Mesin Cuci', desc: 'Perbaikan motor, pengering & modul otomatis' },
    { title: 'Dispenser', desc: 'Pembersihan tangki, perbaikan pendingin & pemanas' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-emerald-800 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/40">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-emerald-200 text-xs font-bold border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Sistem Manajemen Terintegrasi 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Selamat Datang, {user.name}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Platform terpadu <strong className="text-white">SUMBER TEKNIK DUA</strong> untuk pengelolaan
              kartu riwayat pemeliharaan unit AC per ruangan serta pencatatan &amp; cetak nota bon transaksi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin && onOpenAddBon && (
              <button
                onClick={onOpenAddBon}
                className="px-4 py-2.5 bg-white text-brand-900 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Bon Baru</span>
              </button>
            )}
            {isAdmin && onOpenAddRoom && (
              <button
                onClick={onOpenAddRoom}
                className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 border border-emerald-500/40 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Ruangan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Ruangan */}
        <div
          onClick={() => onNavigateTab('pemeliharaan')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DoorClosed className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-emerald-700 font-bold flex items-center">
              Lihat <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {rooms.length}
          </div>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Total Ruangan</p>
        </div>

        {/* Total Unit AC */}
        <div
          onClick={() => onNavigateTab('pemeliharaan')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-emerald-700 font-bold flex items-center">
              Lihat <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {acUnits.length}
          </div>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Total Unit AC</p>
        </div>

        {/* Total Bon / Nota */}
        <div
          onClick={() => onNavigateTab('bon')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-emerald-700 font-bold flex items-center">
              Lihat <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {bons.length}
          </div>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Total Bon / Nota</p>
        </div>

        {/* Total Nilai Bon */}
        <div
          onClick={() => onNavigateTab('bon')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-emerald-700 font-bold flex items-center">
              Total <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-800 font-mono truncate">
            {formatRupiah(totalOmset)}
          </div>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Total Nilai Transaksi</p>
        </div>
      </div>

      {/* Profil Perusahaan "SUMBER TEKNIK DUA" & Akses Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kartu Profil Perusahaan */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 p-2 border-2 border-emerald-200 shrink-0 flex items-center justify-center">
              <img src="/logo-st.svg" alt="ST Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase tracking-wider mb-1">
                Profil Resmi Usaha
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                SUMBER TEKNIK DUA
              </h2>
              <p className="text-xs text-emerald-700 font-bold">
                Service, Jual-Beli AC Rumah, AC Mobil, Kulkas, Freezer, Water Heater, Mesin Cuci, Dispenser
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Alamat Workshop</span>
                <span className="font-semibold text-slate-800">
                  Komp. Griya Serpong Blok H4/2, Serpong - Tangerang
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Kontak Telepon / WhatsApp</span>
                <span className="font-bold text-slate-900 font-mono">
                  0813 8895 9081
                </span>
              </div>
            </div>
          </div>

          {/* Hubungi Langsung Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <a
              href="https://wa.me/6281388959081?text=Halo%20Sumber%20Teknik%20Dua,%20saya%20ingin%20konsultasi%20layanan%20service."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi via WhatsApp</span>
            </a>
            <a
              href="tel:081388959081"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Telepon Langsung (0813 8895 9081)</span>
            </a>
          </div>

          {/* Cakupan Layanan */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Layanan Spesialisasi Kami
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {services.map((srv, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{srv.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{srv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Akses Cepat ke Menu Utama */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Menu 2: Kartu Pemeliharaan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <DoorClosed className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Kartu Pemeliharaan AC
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Kelola data ruangan, spesifikasi unit AC, riwayat servis berkala per baris lengkap dengan paraf teknisi resmi, serta cetak kartu dan stiker QR Code.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('pemeliharaan')}
              className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <span>Buka Kartu Pemeliharaan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Menu 3: Pencatatan Bon */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Pencatatan Bon / Nota
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Buat dan kelola nota transaksi pekerjaan servis atau jual-beli unit/sparepart, hitung otomatis, cetak PDF resmi, dan bagikan QR link ke pelanggan.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('bon')}
              className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <span>Buka Pencatatan Bon</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
