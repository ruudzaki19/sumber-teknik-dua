import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Wind,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* ============================================================== */}
      {/* 1. HERO PROFILE BANNER "SUMBER TEKNIK DUA" (ANTI-AI SLOP / SOLID INDUSTRIAL) */}
      {/* ============================================================== */}
      <div className="bg-[#15803D] rounded-2xl p-6 sm:p-8 text-white border border-[#14532D] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Logo & Headline */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 max-w-2xl">
            <div className="w-20 h-20 rounded-xl bg-white p-2.5 shadow-sm flex items-center justify-center shrink-0 border border-emerald-200">
              <img src="/logo-resmi.png" alt="ST Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-900/60 text-emerald-100 border border-emerald-600/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                Workshop &amp; Layanan Teknik Pendingin
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                SUMBER TEKNIK DUA
              </h1>
              <p className="text-emerald-50 text-xs sm:text-sm leading-relaxed font-normal">
                Penyedia layanan profesional pemeliharaan, perawatan berkala, perbaikan kelistrikan,
                serta jual-beli unit Air Conditioner (AC). Didukung oleh teknisi berpengalaman
                dengan standar pengerjaan bersih, presisi, dan bertanggung jawab.
              </p>
            </div>
          </div>

          {/* AC Unit Technical Graphic Badge */}
          <div className="bg-[#166534] border border-[#14532D] rounded-xl p-4 sm:p-5 flex flex-col justify-center gap-3 shrink-0 lg:max-w-xs w-full">
            <div className="flex items-center gap-2.5 text-emerald-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-800/80 border border-emerald-700 flex items-center justify-center text-emerald-200">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white block">
                  Spesialisasi Pendingin AC
                </span>
                <span className="text-[10px] text-emerald-200">Perumahan, Kantor &amp; Komersial</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-700/60">
              <div className="flex items-center gap-1.5 text-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Cuci Steam Bersih</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Isi / Tambah Freon</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Bongkar &amp; Pasang</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Ganti Kapasitor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. INFORMASI LOKASI WORKSHOP & KONTAK (SOLID WHITE CARDS, CRISP BORDER) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alamat Workshop */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-emerald-800 flex items-center justify-center shrink-0 border border-slate-200">
            <MapPin className="w-5 h-5 text-emerald-700" />
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-emerald-800 flex items-center justify-center shrink-0 border border-slate-200">
            <Phone className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Kontak Layanan Pelanggan
            </span>
            <p className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              0813 8895 9081
            </p>
            <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
              Telepon &amp; WhatsApp Resmi
            </span>
          </div>
        </div>

        {/* Waktu Operasional */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-emerald-800 flex items-center justify-center shrink-0 border border-slate-200">
            <Clock className="w-5 h-5 text-emerald-700" />
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
