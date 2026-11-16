import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { CoolingAirflowBackground } from './CoolingAirflowBackground';

export const LoginScreen: React.FC = () => {
  const { loginWithEmail, registerUser } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Masukkan alamat email Anda');
      return;
    }
    if (!password) {
      setErrorMsg('Masukkan password Anda');
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithEmail(email.trim(), password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Email atau password salah');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Alamat email wajib diisi');
      return;
    }
    if (!password) {
      setErrorMsg('Password wajib dibuat');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password minimal 4 karakter');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok');
      return;
    }

    setIsSubmitting(true);
    const res = await registerUser(name.trim(), email.trim(), password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Gagal mendaftarkan akun');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col justify-center items-center px-4 py-8 relative">
      <CoolingAirflowBackground />
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E7E2D6] overflow-hidden relative z-10"
      >
        {/* Header Banner - Solid Industrial Green */}
        <div className="bg-[#15803D] text-white p-6 text-center border-b border-[#14532D]">
          <div className="flex flex-col items-center">
            {/* Logo Roda Gigi Hijau ST Resmi */}
            <div className="w-16 h-16 rounded-xl bg-white p-2 shadow-xs mb-3 flex items-center justify-center border border-emerald-300">
              <img src="/logo-resmi.png" alt="Logo Sumber Teknik Dua" className="w-full h-full object-contain" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-white">
              SUMBER TEKNIK DUA
            </h1>
            <p className="text-emerald-100 text-xs font-medium mt-1">
              Pemeliharaan AC Ruangan &amp; Pencatatan Bon
            </p>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-6 sm:p-7">
          <div className="mb-5 text-center">
            <h2 className="text-sm font-bold text-slate-900">
              {isRegisterMode ? 'Registrasi Akun Klien Baru' : 'Masuk ke Sistem'}
            </h2>
            {isRegisterMode && (
              <p className="text-xs text-slate-500 mt-1">
                Daftarkan nama dan email Anda untuk akses laporan servis &amp; bon
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* =================== FORM LOGIN =================== */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium text-slate-900 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium text-slate-900 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Masuk */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Memverifikasi Akun...' : 'Masuk ke Sistem'}
              </motion.button>

              {/* Link ke Registrasi */}
              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Klien baru belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setErrorMsg(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
                  >
                    Daftar / Registrasi di sini
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* =================== FORM REGISTRASI =================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap / Instansi
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Bambang / CV Mandiri"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium text-slate-900 transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium text-slate-900 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Buat Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buat Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 4 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium text-slate-900 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi password di atas"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium text-slate-900 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Daftar */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
              >
                <span>{isSubmitting ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}</span>
              </motion.button>

              {/* Link ke Login */}
              <div className="pt-4 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setErrorMsg(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terkoneksi aman dengan Cloud PostgreSQL Supabase</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
