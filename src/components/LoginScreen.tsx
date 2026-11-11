import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Wrench, CheckCircle2 } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loading } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleQuickLogin = (email: string, name: string) => {
    loginWithGoogle(email, name);
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    loginWithGoogle(customEmail, customName || customEmail.split('@')[0]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Banner - White and Navy Blue Theme */}
        <div className="bg-brand-800 text-white p-6 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 text-white mb-3 backdrop-blur-sm border border-white/20">
            <Wrench className="w-7 h-7 text-blue-200" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">KARTU PEMELIHARAAN AC</h1>
          <p className="text-blue-100 text-xs mt-1 font-medium tracking-wide uppercase">
            CV. Sarana Rekatama Buana • Tangerang
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Masuk Akun Teknisi</h2>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan akun Google untuk mengakses & mencatat riwayat pemeliharaan AC ruangan.
            </p>
          </div>

          {/* Primary Google Login Button */}
          <div className="space-y-3">
            <button
              onClick={() => handleQuickLogin('ayah.sumbertekhnik@gmail.com', 'Ayah (Teknisi AC)')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl border border-slate-300 shadow-sm transition-all duration-150 active:scale-[0.99] disabled:opacity-50"
            >
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Memproses...' : 'Lanjutkan sebagai Ayah (Teknisi)'}</span>
            </button>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full text-center text-xs text-brand-700 hover:text-brand-900 font-medium py-1"
            >
              {showAdvanced ? 'Tutup opsi akun lain' : 'Masuk dengan email Google lain'}
            </button>

            {showAdvanced && (
              <form onSubmit={handleSubmitCustom} className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Teknisi / Petugas
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Contoh: Bpk. Bambang"
                    className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Email Google (@gmail.com)
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Masuk Sekarang
                </button>
              </form>
            )}
          </div>

          {/* Feature List */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Scan QR Ruangan:</strong> Cukup arahkan kamera HP langsung buka data AC.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Edit Langsung di HP:</strong> Input perbaikan, jumlah unit & total harga tanpa repot WPS Office.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Tersimpan Lokal & Offline:</strong> Data aman tersimpan di HP walau sinyal minim di lokasi.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>1-Klik Download PDF:</strong> Dilengkapi Kop Surat CV. SARANA REKATAMA BUANA & paraf digital.</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Data tersimpan aman di perangkat lokal & siap di-hosting ke Vercel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
