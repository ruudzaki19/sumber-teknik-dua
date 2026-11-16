import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Wind,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  Wrench,
  Sparkles,
  Zap,
  Gauge,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface ServiceItem {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  desc: string;
  specs: { label: string; value: string }[];
  floatingBadge: { title: string; detail: string };
  actionLabel: string;
  targetTab: 'pemeliharaan' | 'bon';
}

const SERVICES: ServiceItem[] = [
  {
    id: 'cuci-steam',
    index: '01',
    title: 'CUCI STEAM AC',
    subtitle: 'Pembersihan Evaporator, Blower & Kondensor',
    badge: 'Perawatan Rutin Berkala',
    image: '/ac-cuci-steam.jpg',
    desc: 'Pembersihan mendalam menggunakan jet steam bertekanan pas untuk merontokkan lendir, lumut, jamur, serta debu pekat pada evaporator indoor dan kondensor outdoor. Menjadikan hembusan angin seketika dingin kencang, higienis, bebas bau apek, dan menghemat konsumsi listrik.',
    specs: [
      { label: 'Metode', value: 'Jet Steam Air Presisi' },
      { label: 'Durasi Pengerjaan', value: '± 45 - 60 Menit' },
      { label: 'Hasil Hembusan', value: 'Dingin Segar & Higienis' },
      { label: 'Rekomendasi', value: 'Rutin Tiap 3 - 4 Bulan' }
    ],
    floatingBadge: {
      title: 'Filter Higienis 100%',
      detail: 'Bebas Debu & Aliran Lancar'
    },
    actionLabel: 'Lihat Kartu Pemeliharaan',
    targetTab: 'pemeliharaan'
  },
  {
    id: 'isi-freon',
    index: '02',
    title: 'ISI & TAMBAH FREON',
    subtitle: 'Refrigeran Murni R32, R410A & R22',
    badge: 'Optimalisasi Suhu Dingin',
    image: '/ac-isi-freon.jpg',
    desc: 'Pengecekan dan pengisian gas refrigeran presisi menggunakan manifold gauge digital berstandar pabrikan. Disertai pengecekan kebocoran nepel pipa dan uji ampere kompresor agar mesin tidak overload serta menghasilkan pendinginan maksimal tahan lama.',
    specs: [
      { label: 'Tipe Freon', value: 'R32 / R410A / R22 Murni' },
      { label: 'Tekanan Ideal', value: '130 - 150 PSI' },
      { label: 'Uji Kebocoran', value: 'Deteksi Nepel & Sambungan' },
      { label: 'Ampere Mesin', value: 'Sesuai Standar Nameplate' }
    ],
    floatingBadge: {
      title: 'Tekanan Freon Akurat',
      detail: 'Kompresor Aman & Awet'
    },
    actionLabel: 'Buka Catatan Servis',
    targetTab: 'pemeliharaan'
  },
  {
    id: 'bongkar-pasang',
    index: '03',
    title: 'BONGKAR PASANG AC',
    subtitle: 'Relokasi & Instalasi Rapi Siap Pakai',
    badge: 'Instalasi Presisi',
    image: '/ac-bongkar-pasang.jpg',
    desc: 'Pemasangan unit baru atau pemindahan AC antar ruangan dengan teknik instalasi rapi. Pemasangan bracket kokoh, kemiringan pipa drainase terukur anti-bocor air, perapian instalasi listrik, serta proses vakum instalasi pipa tembaga sebelum unit dioperasikan.',
    specs: [
      { label: 'Pipa Tembaga', value: 'Standar Tebal Berkualitas' },
      { label: 'Drainase Air', value: 'Kemiringan Gravitasi Rapi' },
      { label: 'Vakum Instalasi', value: '2-Stage Vacuum Pump' },
      { label: 'Garansi', value: 'Garansi Pemasangan Rapi' }
    ],
    floatingBadge: {
      title: 'Instalasi Bebas Bocor',
      detail: 'Bracket Kokoh & Drainase Pas'
    },
    actionLabel: 'Kelola Unit AC Ruangan',
    targetTab: 'pemeliharaan'
  },
  {
    id: 'perbaikan-sparepart',
    index: '04',
    title: 'PERBAIKAN & SPAREPART',
    subtitle: 'Kompresor, Kapasitor & Modul PCB',
    badge: 'Diagnosa Akurat',
    image: '/ac-perbaikan-sparepart.jpg',
    desc: 'Solusi tuntas untuk masalah AC mati total, tidak dingin, kompresor macet, atau hembusan fan lemah. Didukung peralatan ukur digital dan stok suku cadang original seperti kapasitor, sensor thermistor, motor swing, hingga perbaikan sirkuit modul PCB.',
    specs: [
      { label: 'Alat Ukur', value: 'Digital Multimeter & Clamp' },
      { label: 'Suku Cadang', value: 'Kapasitor & Modul Original' },
      { label: 'Garansi Servis', value: 'Garansi Resmi Pengerjaan' },
      { label: 'Uji Suhu', value: 'Pendinginan Normal Teruji' }
    ],
    floatingBadge: {
      title: 'Komponen Original',
      detail: 'Tahan Lama & Bergaransi'
    },
    actionLabel: 'Buat Nota / Bon Servis',
    targetTab: 'bon'
  },
  {
    id: 'jual-beli-ac',
    index: '05',
    title: 'JUAL-BELI AC BERKUALITAS',
    subtitle: 'Unit Split Daikin, Panasonic, Sharp & Gree',
    badge: 'Unit Teruji & Bergaransi',
    image: '/ac-showcase-modern.jpg',
    desc: 'Penyediaan unit AC baru resmi serta tukar-tambah AC bekas rekondisi berkualitas prima. Setiap unit telah melalui pengujian kompresi mesin, pembersihan evaporator menyeluruh, pengecatan rapi, dan siap dikirim serta dipasang langsung oleh teknisi kami.',
    specs: [
      { label: 'Merk Tersedia', value: 'Daikin, Panasonic, Sharp, Gree' },
      { label: 'Kapasitas', value: '1/2 PK, 3/4 PK, 1 PK, 2 PK' },
      { label: 'Kondisi Mesin', value: 'Kompresi 100% Normal' },
      { label: 'Paket Lengkap', value: 'Tersedia Paket Pasang Baru' }
    ],
    floatingBadge: {
      title: 'Unit Siap Pasang',
      detail: 'Kondisi Prima Bergaransi'
    },
    actionLabel: 'Catat Transaksi Penjualan',
    targetTab: 'bon'
  }
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeService = SERVICES[currentIndex];

  // Auto-advance slider every 6.5 seconds when not paused by mouse hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SERVICES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SERVICES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SERVICES.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* ============================================================== */}
      {/* 1. HERO SHOWCASE WITH INTERACTIVE SERVICE SLIDER (INSPIRASI FRESHBOOKS & FOXICO) */}
      {/* ============================================================== */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="bg-[#14532D] text-white rounded-3xl p-5 sm:p-7 lg:p-9 shadow-md border border-[#166534] relative overflow-hidden"
      >
        {/* Subtle Organic Background Accents & Technical Blueprint Pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #86EFAC 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Ambient Top Glow */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)'
          }}
        />

        {/* Brand Header Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-emerald-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 border border-emerald-300 shadow-xs">
              <img src="/logo-resmi.png" alt="ST Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black tracking-tight uppercase text-white">
                  SUMBER TEKNIK DUA
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700/80 font-mono">
                  RESMI
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 font-medium">
                Spesialis Servis, Perawatan, Bongkar-Pasang &amp; Jual-Beli AC
              </p>
            </div>
          </div>

          {/* Slider Progress Indicator & Navigation Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-200 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/80">
              <span className="text-white tabular-nums">{activeService.index}</span>
              <span className="text-emerald-500">/</span>
              <span className="text-emerald-300 tabular-nums">05</span>
            </div>

            <div className="flex items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handlePrev}
                className="w-9 h-9 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-white flex items-center justify-center border border-emerald-800/80 transition-colors"
                title="Layanan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 text-emerald-200" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleNext}
                className="w-9 h-9 rounded-xl bg-white text-[#15803D] hover:bg-emerald-50 flex items-center justify-center shadow-xs transition-colors font-bold"
                title="Layanan Berikutnya"
              >
                <ChevronRight className="w-4 h-4 text-[#15803D]" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Interactive Stage: Left Details + Right Showcase & Preview Cards */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pt-6 items-center">
          {/* ================= LEFT PANE: SERVICE DETAILS & EXPLANATION ================= */}
          <div className="lg:col-span-6 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3.5"
              >
                {/* Tagline Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-900/80 text-emerald-200 border border-emerald-700/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{activeService.badge}</span>
                </div>

                {/* Big Bold Headline */}
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                  {activeService.title}
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                  {activeService.subtitle}
                </p>

                {/* Comprehensive Description */}
                <p className="text-xs sm:text-sm text-emerald-100 font-normal leading-relaxed">
                  {activeService.desc}
                </p>

                {/* Key Technical Specs Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {activeService.specs.map((sp, idx) => (
                    <div
                      key={idx}
                      className="bg-emerald-950/60 border border-emerald-800/80 p-2.5 rounded-xl"
                    >
                      <span className="text-[10px] text-emerald-300 font-medium block uppercase tracking-wider">
                        {sp.label}
                      </span>
                      <span className="text-xs font-bold text-white block mt-0.5 tabular-nums">
                        {sp.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Direct Action Button to App Feature */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigateTab(activeService.targetTab)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#14532D] hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <span>{activeService.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>

                  <a
                    href="https://wa.me/6281388959081"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-900/80 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold border border-emerald-700/80 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Panggil Teknisi (WhatsApp)</span>
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ================= RIGHT PANE: REALISTIC PHOTO SHOWCASE & THUMBNAIL SLIDER ================= */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Showcase Photo with Floating Technical Badge (Like FreshBooks Image 1) */}
            <div className="relative rounded-2xl overflow-hidden border border-emerald-600/50 shadow-xl bg-emerald-950 group aspect-[4/3]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeService.image}
                  src={activeService.image}
                  alt={activeService.title}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Subtle Cool Air Breeze Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.1) 50%, rgba(21, 128, 61, 0.2) 100%)'
                }}
              />

              {/* Floating Technical Badge (Like Floating Invoice in Image 1) */}
              <motion.div
                key={`badge-${activeService.id}`}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.24, delay: 0.1 }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 text-slate-900 rounded-xl p-2.5 sm:p-3 shadow-lg border border-slate-200/80 backdrop-blur-xs max-w-[210px]"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px] uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{activeService.floatingBadge.title}</span>
                </div>
                <p className="text-[11px] font-bold text-slate-800 mt-0.5 leading-tight">
                  {activeService.floatingBadge.detail}
                </p>
              </motion.div>

              {/* Active Service Label on Image Bottom */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-white">
                <span className="text-[10px] font-mono text-emerald-300 font-bold block">
                  AKTIVITAS TEKNIK #{activeService.index}
                </span>
                <span className="text-sm sm:text-base font-black uppercase text-white drop-shadow-sm">
                  {activeService.title}
                </span>
              </div>
            </div>

            {/* Interactive Carousel Cards Strip (Inspired by Foxico Image 2) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                  Pilih Aktivitas Layanan:
                </span>
                <span className="text-[10px] text-emerald-300 italic">
                  Klik foto untuk melihat rincian
                </span>
              </div>

              {/* Horizontal Scrollable Thumbnails */}
              <div className="grid grid-cols-5 gap-2">
                {SERVICES.map((srv, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <motion.button
                      key={srv.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative rounded-xl overflow-hidden text-left transition-all aspect-[4/3] group border-2 ${
                        isActive
                          ? 'border-white shadow-md ring-2 ring-emerald-400'
                          : 'border-emerald-800/80 opacity-70 hover:opacity-100 hover:border-emerald-600'
                      }`}
                    >
                      <img
                        src={srv.image}
                        alt={srv.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      <div className="absolute bottom-1 left-1.5 right-1.5">
                        <span className="text-[9px] font-bold font-mono text-emerald-300 block">
                          #{srv.index}
                        </span>
                        <span className="text-[10px] font-bold text-white uppercase truncate block leading-tight">
                          {srv.title.split(' ')[0]}
                        </span>
                      </div>

                      {/* Active Indicator Bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSliderThumb"
                          className="absolute top-0 left-0 right-0 h-1 bg-emerald-400"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof / Trust Highlights (Like FreshBooks Image 1 Bottom Bar) */}
        <div className="mt-8 pt-5 border-t border-emerald-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-emerald-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-900/80 flex items-center justify-center text-amber-300">
              <Star className="w-4 h-4 fill-amber-300" />
            </div>
            <div>
              <span className="font-bold text-white block">4.9 / 5.0 Rating</span>
              <span className="text-[10px] text-emerald-200">Kepuasan Pelanggan</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-900/80 flex items-center justify-center text-emerald-300">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Teknisi Ahli</span>
              <span className="text-[10px] text-emerald-200">Berpengalaman &amp; Rapi</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-900/80 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Garansi Servis</span>
              <span className="text-[10px] text-emerald-200">Bertanggung Jawab Penuh</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-900/80 flex items-center justify-center text-emerald-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Respon Cepat</span>
              <span className="text-[10px] text-emerald-200">Siap Panggilan Lokasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. INFORMASI LOKASI WORKSHOP & KONTAK (WARM CREAM & CRISP BORDERS) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alamat Workshop */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7E2D6] shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F9F6F0] text-emerald-800 flex items-center justify-center shrink-0 border border-[#E7E2D6]">
            <MapPin className="w-5 h-5 text-[#15803D]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Alamat Workshop Resmi
            </span>
            <p className="text-xs font-bold text-slate-900 mt-1 leading-snug">
              Komp. Griya Serpong Blok H4/2
            </p>
            <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
              Serpong - Tangerang
            </span>
          </div>
        </div>

        {/* Nomor Telepon */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7E2D6] shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F9F6F0] text-emerald-800 flex items-center justify-center shrink-0 border border-[#E7E2D6]">
            <Phone className="w-5 h-5 text-[#15803D]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Kontak Layanan Pelanggan
            </span>
            <p className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              0813 8895 9081
            </p>
            <a
              href="https://wa.me/6281388959081"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-emerald-700 font-semibold hover:underline block mt-0.5"
            >
              Hubungi via WhatsApp &rarr;
            </a>
          </div>
        </div>

        {/* Waktu Operasional */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7E2D6] shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F9F6F0] text-emerald-800 flex items-center justify-center shrink-0 border border-[#E7E2D6]">
            <Clock className="w-5 h-5 text-[#15803D]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Waktu Operasional
            </span>
            <p className="text-xs font-bold text-slate-900 mt-1">
              Senin — Sabtu
            </p>
            <div className="mt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Siap Panggilan Servis Lapangan
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
