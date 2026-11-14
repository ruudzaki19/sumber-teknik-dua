import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Wind,
  ShieldCheck,
  Sparkles,
  Gauge,
  Zap,
  Snowflake,
  Layers,
  ThermometerSnowflake
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

export const DashboardView: React.FC<DashboardViewProps> = () => {
  const acCategories = [
    {
      title: 'AC Split Wall',
      capacity: '1/2 PK — 2.5 PK',
      desc: 'Unit pendingin ruangan hunian & kantor. Perawatan cuci steam menyeluruh pada evaporator indoor, fan blower, serta kondensor outdoor.',
      tag: 'Paling Populer',
      features: ['Cuci Steam Bersih', 'Cek Freon R32 / R410A', 'Pembersihan Drainase']
    },
    {
      title: 'AC Standing Floor',
      capacity: '3 PK — 10 PK',
      desc: 'Unit pendingin kapasitas tinggi untuk aula pertemuan, restoran, dan lobby gedung perkantoran dengan sirkulasi udara bertenaga kuat.',
      tag: 'Kapasitas Besar',
      features: ['Pembersihan Filter Blower', 'Uji Kompresor 3-Phase', 'Flushing Kondensor']
    },
    {
      title: 'AC Cassette Ceiling',
      capacity: '2 PK — 5 PK',
      desc: 'Pendingin terintegrasi plafon untuk estetika ruang meeting dan ruang kerja modern dengan aliran hembusan angin 4 arah.',
      tag: 'Desain Minimalis',
      features: ['Perawatan Pompa Drain', 'Desinfeksi Grill Udara', 'Cek Kelistrikan Modul']
    },
    {
      title: 'AC Inverter Multi-Split',
      capacity: 'Hemat Energi',
      desc: 'Sistem pendingin inverter hemat listrik dengan teknologi kendali suhu presisi untuk kenyamanan maksimal sepanjang hari.',
      tag: 'Efisiensi Daya',
      features: ['Diagnostik Modul PCB', 'Pengukuran Tekanan Presisi', 'Deteksi Kebocoran Mikro']
    }
  ];

  const serviceStandards = [
    {
      title: 'Cuci Steam Tekanan Tinggi',
      desc: 'Membersihkan debu membandel, jamur, dan lendir pada unit indoor serta outdoor untuk udara yang lebih higienis dan dingin optimal.',
      icon: Wind
    },
    {
      title: 'Cek Tekanan Freon Sesuai Standar',
      desc: 'Pengukuran akurat menggunakan manifold gauge pada refrigeran R32, R410A, maupun R22 demi efisiensi pendinginan kompresor.',
      icon: Gauge
    },
    {
      title: 'Pemeriksaan Arus Listrik & Komponen',
      desc: 'Pengecekan arus ampere motor kompresor, kapasitor, kontaktor kelistrikan, serta jalur kabel untuk menjamin keamanan operasional.',
      icon: Zap
    },
    {
      title: 'Pembersihan & Uji Aliran Drainase',
      desc: 'Flushing jalur pipa pembuangan air kondensasi untuk mencegah kebocoran air (water drop) yang dapat merusak interior ruangan.',
      icon: ThermometerSnowflake
    }
  ];

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. HERO PROFILE BANNER "SUMBER TEKNIK DUA" (ABOUT US) */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-brand-900 via-emerald-800 to-brand-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Headline */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 max-w-2xl">
            <div className="w-20 h-20 rounded-2xl bg-white p-2.5 shadow-lg flex items-center justify-center shrink-0 border-2 border-emerald-300/40">
              <img src="/logo-st.svg" alt="ST Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-emerald-200 text-xs font-bold border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Spesialis Pendingin Udara (Air Conditioner)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
                SUMBER TEKNIK DUA
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                Penyedia layanan profesional pemeliharaan, perawatan rutin, perbaikan kelistrikan,
                serta jual-beli unit Air Conditioner (AC). Didukung oleh teknisi berpengalaman
                dengan standar pengerjaan bersih, rapi, dan bertanggung jawab.
              </p>
            </div>
          </div>

          {/* Decorative AC Emblem Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 text-center shrink-0 w-full md:w-auto shadow-inner">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center mb-2.5 text-emerald-200">
              <Snowflake className="w-8 h-8 animate-pulse text-emerald-300" />
            </div>
            <span className="block text-xs font-bold text-white tracking-wide uppercase">
              Service &amp; Jual-Beli AC
            </span>
            <span className="text-[11px] text-emerald-200">
              Rumah • Kantor • Komersial
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. INFORMASI LOKASI WORKSHOP & KONTAK (STATIC CARD, NO BUTTONS) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alamat Workshop */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Alamat Workshop Resmi
            </span>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5 leading-snug">
              Komp. Griya Serpong Blok H4/2
            </p>
            <span className="text-[11px] text-slate-500 font-medium block">
              Serpong - Tangerang
            </span>
          </div>
        </div>

        {/* Nomor Telepon */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Kontak Layanan Pelanggan
            </span>
            <p className="text-sm font-black text-emerald-900 font-mono mt-0.5">
              0813 8895 9081
            </p>
            <span className="text-[11px] text-slate-500 font-medium block">
              Telepon &amp; WhatsApp Resmi
            </span>
          </div>
        </div>

        {/* Waktu Operasional */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Waktu Operasional
            </span>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">
              Senin — Minggu (Buka Setiap Hari)
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold block">
              Siap Panggilan Servis ke Lokasi
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. SHOWCASE SPESIALISASI UNIT AC (DEKORASI AC MEMPERBAGUS WEB) */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Spesialisasi Pendingin Udara</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Jenis Unit AC yang Kami Tangani
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Mencakup Seluruh Merk Terkemuka (Daikin, Panasonic, Sharp, Gree, LG, Mitsubishi, dll.)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {acCategories.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 border border-emerald-200/60 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {item.capacity}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-emerald-100">
                {item.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. STANDAR PENGERJAAN SERVIS AC BERKUALITAS */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Standar Pemeliharaan Teknisi</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Prosedur Kerja Servis Sumber Teknik Dua
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap pengerjaan dilakukan teliti untuk memastikan unit AC bekerja optimal, dingin maksimal, dan tahan lama.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceStandards.map((std, idx) => {
            const Icon = std.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-900 text-emerald-300 flex items-center justify-center mb-3 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 mb-1 leading-snug">
                  {std.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                  {std.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};