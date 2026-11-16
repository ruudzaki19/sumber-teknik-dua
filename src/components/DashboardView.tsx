import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Wrench,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Award,
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence, useInView, useReducedMotion, type Variants } from 'framer-motion';
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
    title: 'Cuci Steam AC',
    subtitle: 'Pembersihan Evaporator, Blower & Kondensor',
    badge: 'Perawatan Berkala',
    image: '/ac-cuci-steam.jpg',
    desc: 'Pembersihan mendalam dengan jet steam bertekanan pas merontokkan lendir, jamur, dan debu pekat. Udara seketika dingin segar, bersih, dan hemat listrik.',
    specs: [
      { label: 'Metode', value: 'Jet Steam Air Presisi' },
      { label: 'Durasi', value: '± 45 - 60 Menit' },
      { label: 'Hasil', value: 'Dingin & Higienis' },
      { label: 'Siklus', value: 'Tiap 3 - 4 Bulan' }
    ],
    floatingBadge: {
      title: 'Filter Higienis 100%',
      detail: 'Hembusan Bersih Lancar'
    },
    actionLabel: 'Buka Kartu Pemeliharaan',
    targetTab: 'pemeliharaan'
  },
  {
    id: 'isi-freon',
    index: '02',
    title: 'Isi & Tambah Freon',
    subtitle: 'Refrigeran Murni R32, R410A & R22',
    badge: 'Optimalisasi Dingin',
    image: '/ac-isi-freon.jpg',
    desc: 'Pengisian gas freon presisi dengan manifold gauge digital. Disertai cek kebocoran nepel pipa dan uji ampere agar kompresor awet tahan lama.',
    specs: [
      { label: 'Tipe Gas', value: 'R32 / R410A / R22 Murni' },
      { label: 'Tekanan', value: '130 - 150 PSI Ideal' },
      { label: 'Uji Nepel', value: 'Deteksi Kebocoran Pipa' },
      { label: 'Ampere', value: 'Sesuai Standar Mesin' }
    ],
    floatingBadge: {
      title: 'Tekanan Akurat',
      detail: 'Kompresor Lebih Awet'
    },
    actionLabel: 'Cek Unit AC',
    targetTab: 'pemeliharaan'
  },
  {
    id: 'bongkar-pasang',
    index: '03',
    title: 'Bongkar Pasang AC',
    subtitle: 'Relokasi & Instalasi Rapi Siap Pakai',
    badge: 'Instalasi Presisi',
    image: '/ac-bongkar-pasang.jpg',
    desc: 'Pemasangan unit baru dan pemindahan AC dengan bracket kokoh, kemiringan pipa drainase terukur anti-bocor, serta proses vakum instalasi sebelum dinyalakan.',
    specs: [
      { label: 'Pipa Tembaga', value: 'Tebal Berkualitas Tinggi' },
      { label: 'Drainase Air', value: 'Kemiringan Gravitasi Rapi' },
      { label: 'Vakum Pipa', value: '2-Stage Vacuum Pump' },
      { label: 'Garansi', value: 'Garansi Pemasangan Rapi' }
    ],
    floatingBadge: {
      title: 'Instalasi Rapi',
      detail: 'Pipa Vakum Bebas Bocor'
    },
    actionLabel: 'Kelola Ruangan & Unit',
    targetTab: 'pemeliharaan'
  },
  {
    id: 'perbaikan-sparepart',
    index: '04',
    title: 'Perbaikan & Sparepart',
    subtitle: 'Kapasitor, Kompresor & Modul PCB',
    badge: 'Diagnosa Cepat',
    image: '/ac-perbaikan-sparepart.jpg',
    desc: 'Solusi tuntas untuk AC mati total, tidak dingin, atau hembusan fan lemah. Didukung alat ukur digital dan suku cadang original bergaransi resmi.',
    specs: [
      { label: 'Alat Ukur', value: 'Digital Multimeter & Clamp' },
      { label: 'Suku Cadang', value: 'Original & Teruji' },
      { label: 'Garansi', value: 'Garansi Servis Resmi' },
      { label: 'Uji Suhu', value: 'Normal Standar Pabrik' }
    ],
    floatingBadge: {
      title: 'Suku Cadang Asli',
      detail: 'Tahan Lama & Bergaransi'
    },
    actionLabel: 'Buat Nota / Bon',
    targetTab: 'bon'
  },
  {
    id: 'jual-beli-ac',
    index: '05',
    title: 'Jual Beli AC Berkualitas',
    subtitle: 'Unit Split Daikin, Panasonic, Sharp & Gree',
    badge: 'Unit Teruji',
    image: '/ac-showcase-modern.jpg',
    desc: 'Penyediaan unit AC baru resmi serta tukar-tambah unit seken rekondisi prima. Kompresi mesin normal 100%, siap kirim dan dipasang langsung oleh teknisi.',
    specs: [
      { label: 'Merk Tersedia', value: 'Daikin, Panasonic, Sharp, Gree' },
      { label: 'Kapasitas', value: '1/2 PK hingga 2 PK' },
      { label: 'Kondisi Mesin', value: 'Kompresi 100% Normal' },
      { label: 'Paket Pasang', value: 'Termasuk Pipa & Bracket' }
    ],
    floatingBadge: {
      title: 'Unit Siap Pasang',
      detail: 'Kondisi Prima & Bergaransi'
    },
    actionLabel: 'Catat Bon Penjualan',
    targetTab: 'bon'
  }
];

// Animated Number Counter Component
const CountUpNumber: React.FC<{ end: number; suffix?: string; prefix?: string; duration?: number }> = ({
  end,
  suffix = '',
  prefix = '',
  duration = 1.6
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const [value, setValue] = useState(shouldReduceMotion ? end : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setValue(end);
      return;
    }
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, end, duration, shouldReduceMotion]);

  return (
    <span ref={ref} className="tabular-nums font-sora font-extrabold">
      {prefix}
      {value.toLocaleString('id-ID')}
      {suffix}
    </span>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const activeService = SERVICES[currentIndex];

  // Auto-advance carousel every 6 seconds when not paused by user
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SERVICES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SERVICES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SERVICES.length);
  };

  // Scroll reveal animation variants (fade + slide-up 36px)
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 36 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' }
    }
  };

  const containerStagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12 pb-16 font-sora text-st-text">
      {/* ============================================================== */}
      {/* 1. HERO SECTION (HEADLINE + 2 TOMBOL + CAROUSEL FOTO BOBBING) */}
      {/* ============================================================== */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionVariants}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-st-white border-2 border-st-dark rounded-full shadow-[3px_3px_0px_#14402c]">
              <span className="w-2 h-2 rounded-full bg-st-primary"></span>
              <span className="text-xs font-bold text-st-dark uppercase tracking-wider">
                Bengkel Resmi AC &amp; Pendingin
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-st-text leading-[1.15] tracking-tight">
              Spesialis{' '}
              <span className="bg-st-pale text-st-dark border-2 border-st-dark px-2.5 py-0.5 rounded-xl inline-block shadow-[3px_3px_0px_#14402c]">
                Servis AC
              </span>{' '}
              &amp; Pendingin Terpercaya di Tangerang
            </h1>

            <p className="text-sm sm:text-base text-st-text-muted font-normal leading-relaxed max-w-xl">
              Layanan servis cuci steam, tambah freon, instalasi bongkar-pasang, serta perbaikan modul dan kompresor bergaransi resmi untuk hunian, kantor, dan komersial.
            </p>

            {/* 2 Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <motion.a
                href="https://wa.me/6281388959081"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-st-primary hover:bg-st-dark text-white rounded-xl font-bold text-sm border-2 border-st-dark shadow-[4px_4px_0px_#14402c] transition-colors"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Konsultasi Servis (WhatsApp)</span>
              </motion.a>

              <motion.button
                onClick={() => onNavigateTab('pemeliharaan')}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-st-white hover:bg-st-cream-dark text-st-dark rounded-xl font-bold text-sm border-2 border-st-dark shadow-[4px_4px_0px_#14402c] transition-colors"
              >
                <CalendarCheck className="w-4 h-4 text-st-primary" />
                <span>Lihat Kartu Pemeliharaan</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Micro Trust Points */}
            <div className="pt-2 flex items-center gap-6 text-xs text-st-text-muted font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-st-primary" />
                <span>Teknisi Berpengalaman</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-st-primary" />
                <span>Garansi Pengerjaan</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Photo Block with 5s Bobbing + Flat Carousel */}
          <div className="lg:col-span-6">
            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, -8, 0]
                    }
              }
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="bg-st-white rounded-[24px] p-4 sm:p-5 border-[3px] border-st-dark shadow-[8px_8px_0px_#14402c] space-y-4"
            >
              {/* Carousel Header & Counter */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-st-dark">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-st-primary"></span>
                  <span className="text-xs font-extrabold uppercase tracking-wide text-st-dark">
                    Layanan #{activeService.index}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-st-pale border-2 border-st-dark rounded-lg text-xs font-bold text-st-dark font-mono tabular-nums">
                    <span>{activeService.index}</span>
                    <span className="text-st-text-muted mx-1">/</span>
                    <span>05</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrev}
                      className="w-8 h-8 rounded-lg bg-st-white hover:bg-st-cream-dark text-st-dark border-2 border-st-dark flex items-center justify-center font-bold transition-colors active:translate-y-0.5"
                      title="Layanan Sebelumnya"
                      aria-label="Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="w-8 h-8 rounded-lg bg-st-primary hover:bg-st-dark text-white border-2 border-st-dark flex items-center justify-center font-bold transition-colors active:translate-y-0.5"
                      title="Layanan Berikutnya"
                      aria-label="Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Showcase Photo Frame */}
              <div className="relative rounded-[20px] overflow-hidden border-[3px] border-st-dark bg-st-pale aspect-[4/3] group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeService.image}
                    src={activeService.image}
                    alt={`Aktivitas ${activeService.title} Sumber Teknik Dua`}
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                </AnimatePresence>

                {/* Floating Technical Badge (Flat Neo-Brutalist Card) */}
                <div className="absolute top-3 right-3 bg-st-white text-st-dark rounded-xl p-2.5 border-2 border-st-dark shadow-[4px_4px_0px_#14402c] max-w-[200px]">
                  <div className="flex items-center gap-1.5 text-st-primary font-extrabold text-[10px] uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5 text-st-primary shrink-0" />
                    <span>{activeService.floatingBadge.title}</span>
                  </div>
                  <p className="text-[11px] font-bold text-st-text mt-0.5 leading-tight">
                    {activeService.floatingBadge.detail}
                  </p>
                </div>

                {/* Bottom Photo Title Overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-st-dark text-white px-3 py-2 rounded-xl border-2 border-st-dark flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide truncate">
                    {activeService.title}
                  </span>
                  <span className="text-[10px] font-bold text-st-light bg-st-dark/80 px-2 py-0.5 rounded border border-st-light/30 shrink-0">
                    {activeService.badge}
                  </span>
                </div>
              </div>

              {/* Service Explanation Text */}
              <div className="pt-1">
                <p className="text-xs sm:text-sm text-st-text font-medium leading-snug">
                  {activeService.desc}
                </p>
              </div>

              {/* Clickable Thumbnail Strip */}
              <div className="pt-1">
                <div className="grid grid-cols-5 gap-2">
                  {SERVICES.map((srv, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={srv.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all bg-st-pale ${
                          isActive
                            ? 'border-st-dark ring-2 ring-st-primary shadow-[2px_2px_0px_#14402c] scale-[1.02]'
                            : 'border-st-dark/40 opacity-70 hover:opacity-100 hover:border-st-dark'
                        }`}
                        title={srv.title}
                      >
                        <img
                          src={srv.image}
                          alt={srv.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-st-dark text-white text-[9px] font-extrabold py-0.5 text-center">
                          #{srv.index}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ============================================================== */}
      {/* 2. LAYANAN SECTION (5 CARDS WITH HOVER -1.5DEG, GREEN BG, WHITE TEXT, SHADOW) */}
      {/* ============================================================== */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionVariants}
        className="space-y-6"
      >
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-st-white border-2 border-st-dark rounded-full shadow-[2px_2px_0px_#14402c] text-xs font-bold text-st-dark">
            <Wrench className="w-3.5 h-3.5 text-st-primary" />
            <span>SOLUSI LENGKAP PENDINGIN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-st-text tracking-tight">
            Layanan Spesialis Kami
          </h2>
          <p className="text-xs sm:text-sm text-st-text-muted">
            Pekerjaan ditangani langsung oleh teknisi berpengalaman dengan peralatan digital presisi.
          </p>
        </div>

        <motion.div
          variants={containerStagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {SERVICES.map((srv) => (
            <motion.div
              key={srv.id}
              variants={sectionVariants}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: -8,
                      rotate: -1.5
                    }
              }
              transition={{ duration: 0.3 }}
              className="group bg-st-white hover:bg-st-primary rounded-[20px] p-5 border-[3px] border-st-dark shadow-[6px_6px_0px_#14402c] hover:shadow-[8px_8px_0px_#14402c] transition-colors duration-300 flex flex-col justify-between cursor-pointer"
              onClick={() => onNavigateTab(srv.targetTab)}
            >
              <div className="space-y-4">
                {/* Card Top: Index & Badge */}
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-st-pale group-hover:bg-st-white text-st-dark font-mono font-extrabold text-xs flex items-center justify-center border-2 border-st-dark transition-colors">
                    {srv.index}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-st-cream-dark group-hover:bg-st-dark text-st-dark group-hover:text-st-pale border-2 border-st-dark transition-colors">
                    {srv.badge}
                  </span>
                </div>

                {/* Card Photo */}
                <div className="relative rounded-xl overflow-hidden border-2 border-st-dark bg-st-pale aspect-[16/9]">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>

                {/* Title & Desc */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-st-text group-hover:text-white transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-st-text-muted group-hover:text-st-pale font-medium leading-relaxed transition-colors">
                    {srv.desc}
                  </p>
                </div>
              </div>

              {/* Action Button Link inside Card */}
              <div className="pt-4 mt-2 border-t-2 border-st-dark/20 group-hover:border-white/30 flex items-center justify-between">
                <span className="text-xs font-bold text-st-primary group-hover:text-white transition-colors">
                  {srv.actionLabel}
                </span>
                <span className="w-7 h-7 rounded-lg bg-st-pale group-hover:bg-white text-st-dark flex items-center justify-center border-2 border-st-dark transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ============================================================== */}
      {/* 3. AKTIVITAS KAMI SECTION (SHOWCASE FOTO ASLI LAPANGAN) */}
      {/* ============================================================== */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionVariants}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-st-white border-2 border-st-dark rounded-full shadow-[2px_2px_0px_#14402c] text-xs font-bold text-st-dark mb-2">
              <Award className="w-3.5 h-3.5 text-st-primary" />
              <span>DOKUMENTASI PEKERJAAN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-st-text tracking-tight">
              Aktivitas Teknisi Kami
            </h2>
            <p className="text-xs sm:text-sm text-st-text-muted">
              Dokumentasi nyata kegiatan pengerjaan servis dan instalasi pendingin di lapangan.
            </p>
          </div>

          <a
            href="https://wa.me/6281388959081"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-st-primary hover:text-st-dark inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Tanya Jadwal Servis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.slice(0, 3).map((item) => (
            <div
              key={`act-${item.id}`}
              className="bg-st-white rounded-[20px] p-4 border-[3px] border-st-dark shadow-[6px_6px_0px_#14402c] space-y-3 group"
            >
              <div className="relative rounded-xl overflow-hidden border-2 border-st-dark bg-st-pale aspect-[4/3]">
                <img
                  src={item.image}
                  alt={`Aktivitas ${item.title} di lapangan`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-st-dark text-white rounded text-[10px] font-mono font-bold">
                  DOK-0{item.index}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-st-text">
                  {item.title}
                </h4>
                <p className="text-xs text-st-text-muted mt-0.5 leading-snug">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ============================================================== */}
      {/* 4. STATISTIK SECTION (3 ANGKA COUNT-UP DALAM BLOK HIJAU SOLID) */}
      {/* ============================================================== */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionVariants}
      >
        <div className="bg-st-primary text-white rounded-[24px] sm:rounded-3xl border-[3px] border-st-dark shadow-[8px_8px_0px_#14402c] p-6 sm:p-8">
          <div className="max-w-xl mb-6">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-st-pale block">
              PENCAPAIAN LAYANAN
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Dipercaya untuk Kenyamanan Udara Bersih &amp; Dingin
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t-2 border-white/20">
            {/* Stat 1 */}
            <div className="bg-st-dark/40 p-4 rounded-2xl border-2 border-st-dark">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                <CountUpNumber end={1250} suffix="+" />
              </div>
              <span className="text-xs font-bold text-st-pale block mt-1">
                Unit AC Ditangani
              </span>
              <p className="text-[11px] text-st-pale/80 mt-0.5">
                Perawatan berkala &amp; perbaikan di Serpong
              </p>
            </div>

            {/* Stat 2 */}
            <div className="bg-st-dark/40 p-4 rounded-2xl border-2 border-st-dark">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                <CountUpNumber end={99} suffix="%" />
              </div>
              <span className="text-xs font-bold text-st-pale block mt-1">
                Kepuasan Pelanggan
              </span>
              <p className="text-[11px] text-st-pale/80 mt-0.5">
                Feedback positif atas hasil pengerjaan rapi
              </p>
            </div>

            {/* Stat 3 */}
            <div className="bg-st-dark/40 p-4 rounded-2xl border-2 border-st-dark">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                &lt; <CountUpNumber end={60} suffix=" Mnt" />
              </div>
              <span className="text-xs font-bold text-st-pale block mt-1">
                Waktu Respon Cepat
              </span>
              <p className="text-[11px] text-st-pale/80 mt-0.5">
                Konfirmasi panggilan cepat via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ============================================================== */}
      {/* 5. CTA SECTION ("AC BERMASALAH?" + CHAT WHATSAPP) */}
      {/* ============================================================== */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionVariants}
      >
        <div className="bg-st-cream-dark border-[3px] border-st-dark rounded-[24px] shadow-[8px_8px_0px_#14402c] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-st-dark bg-st-white px-2.5 py-1 rounded-lg border-2 border-st-dark inline-block shadow-[2px_2px_0px_#14402c]">
              BANTUAN CEPAT TEKNISI
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-st-text">
              AC Bermasalah atau Tidak Dingin?
            </h3>
            <p className="text-xs sm:text-sm text-st-text-muted max-w-lg">
              Hubungi tim teknisi Sumber Teknik Dua sekarang. Kami siap datang ke lokasi Anda dengan peralatan lengkap dan jaminan garansi servis.
            </p>
          </div>

          <motion.a
            href="https://wa.me/6281388959081"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={shouldReduceMotion ? undefined : { y: -3 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2.5 px-6 py-4 bg-st-primary hover:bg-st-dark text-white rounded-xl font-bold text-sm border-2 border-st-dark shadow-[4px_4px_0px_#14402c] transition-colors shrink-0"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>Chat WhatsApp Sekarang</span>
          </motion.a>
        </div>
      </motion.section>

      {/* ============================================================== */}
      {/* 6. FOOTER HIJAU TUA (OFFICIAL WORKSHOP & CONTACT) */}
      {/* ============================================================== */}
      <footer className="bg-st-dark text-st-pale rounded-[24px] border-[3px] border-st-dark shadow-[8px_8px_0px_#14402c] p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b-2 border-white/15">
          {/* Brand Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center border-2 border-st-dark shrink-0">
                <img src="/logo-resmi.png" alt="ST Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-base font-extrabold text-white uppercase tracking-tight">
                Sumber Teknik Dua
              </span>
            </div>
            <p className="text-xs text-st-pale/90 leading-relaxed">
              Layanan profesional servis AC, isi freon, bongkar pasang, perbaikan sparepart, dan jual-beli unit AC bergaransi.
            </p>
          </div>

          {/* Workshop Address */}
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-st-light" />
              <span>Alamat Workshop</span>
            </span>
            <p className="text-xs text-st-pale font-medium">
              Komp. Griya Serpong Blok H4/2
            </p>
            <p className="text-xs text-st-pale/80">
              Serpong - Tangerang, Banten
            </p>
          </div>

          {/* Operational Hours & Phone */}
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-st-light" />
              <span>Kontak &amp; Operasional</span>
            </span>
            <p className="text-xs text-white font-mono font-bold tabular-nums">
              0813 8895 9081
            </p>
            <p className="text-xs text-st-pale/80">
              Senin — Sabtu (08.00 - 17.00 WIB)
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-st-pale/70 pt-1">
          <p>
            &copy; {new Date().getFullYear()} Sumber Teknik Dua. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigateTab('pemeliharaan')}
              className="hover:text-white transition-colors"
            >
              Kartu Pemeliharaan
            </button>
            <span>&bull;</span>
            <button
              onClick={() => onNavigateTab('bon')}
              className="hover:text-white transition-colors"
            >
              Pencatatan Bon
            </button>
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* 7. FLOATING WHATSAPP BUTTON (PULSE ANIMATION DI KANAN BAWAH) */}
      {/* ============================================================== */}
      <motion.a
        href="https://wa.me/6281388959081"
        target="_blank"
        rel="noopener noreferrer"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 1.08, 1]
              }
        }
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.12 }}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-3 bg-st-primary hover:bg-st-dark text-white rounded-full font-bold text-xs sm:text-sm border-2 border-st-dark shadow-[4px_4px_0px_#14402c] transition-colors"
        title="Chat Teknisi via WhatsApp"
        aria-label="Hubungi WhatsApp Sumber Teknik Dua"
      >
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        <span className="font-extrabold">WhatsApp</span>
      </motion.a>
    </div>
  );
};
