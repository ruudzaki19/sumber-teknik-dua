import React from 'react';
import {
  MapPin,
  Phone,
  Clock
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
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 max-w-3xl">
            <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0 border-2 border-emerald-300/40">
              <img src="/logo-resmi.png" alt="ST Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-2">
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
              Senin — Sabtu
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold block">
              Siap Panggilan Servis ke Lokasi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
