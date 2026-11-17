import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
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
    <div className="min-h-screen bg-st-cream flex flex-col justify-center items-center px-4 py-8 relative font-sora text-st-text">
      <CoolingAirflowBackground />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-st-white rounded-[24px] shadow-[8px_8px_0px_#14402c] border-[3px] border-st-dark overflow-hidden relative z-10"
      >
        {/* Header Banner - Solid Forest Green */}
        <div className="bg-st-primary text-white p-6 sm:p-7 text-center border-b-[3px] border-st-dark">
          <div className="flex flex-col items-center">
            {/* Logo Roda Gigi Hijau ST Resmi */}
            <div className="w-16 h-16 rounded-2xl bg-white p-2 border-2 border-st-dark shadow-[3px_3px_0px_#14402c] mb-3 flex items-center justify-center">
              <img src="/logo-resmi.png" alt="Logo Sumber Teknik Dua" className="w-full h-full object-contain" />
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight uppercase text-white">
              SUMBER TEKNIK DUA
            </h1>
            <p className="text-st-pale text-xs font-bold mt-1">
              Pemeliharaan AC Ruangan &amp; Pencatatan Bon
            </p>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-6 sm:p-7">
          <div className="mb-5 text-center">
            <h2 className="text-base font-extrabold text-st-text uppercase tracking-wide">
              {isRegisterMode ? 'Registrasi Akun Klien Baru' : 'Masuk ke Sistem'}
            </h2>
            {isRegisterMode && (
              <p className="text-xs text-st-text-muted mt-1 font-medium">
                Daftarkan nama dan email Anda untuk akses laporan servis &amp; bon
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border-2 border-rose-600 text-rose-800 text-xs rounded-xl font-bold flex items-center gap-2 shadow-[2px_2px_0px_#991b1b]">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* =================== FORM LOGIN =================== */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-bold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
                  />
                  <Mail className="w-4 h-4 text-st-dark absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-11 py-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-bold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
                  />
                  <Lock className="w-4 h-4 text-st-dark absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-st-dark hover:text-st-primary focus:outline-none"
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
                className="w-full py-3 bg-st-primary hover:bg-st-dark text-white text-xs font-extrabold rounded-xl border-2 border-st-dark shadow-[3px_3px_0px_#14402c] active:translate-y-0.5 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isSubmitting ? 'Memverifikasi Akun...' : 'Masuk ke Sistem'}
              </motion.button>

              {/* Link ke Registrasi */}
              <div className="pt-4 text-center border-t-2 border-st-dark/15">
                <p className="text-xs text-st-text-muted font-medium">
                  Klien baru belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setErrorMsg(null);
                    }}
                    className="text-st-primary hover:text-st-dark font-extrabold underline transition-colors"
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
                <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                  Nama Lengkap / Instansi
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Bambang / CV Mandiri"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-bold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
                  />
                  <User className="w-4 h-4 text-st-dark absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-bold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
                  />
                  <Mail className="w-4 h-4 text-st-dark absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Buat Password */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                  Buat Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 4 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-11 py-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-bold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
                  />
                  <Lock className="w-4 h-4 text-st-dark absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-st-dark hover:text-st-primary focus:outline-none"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-st-dark mb-1.5">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi password di atas"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-11 py-2.5 bg-st-cream border-2 border-st-dark rounded-xl font-bold text-st-text placeholder:text-st-text-muted focus:outline-none focus:border-st-primary shadow-inner transition-colors"
                  />
                  <Lock className="w-4 h-4 text-st-dark absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-2.5 text-st-dark hover:text-st-primary focus:outline-none"
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
                className="w-full py-3 bg-st-primary hover:bg-st-dark text-white text-xs font-extrabold rounded-xl border-2 border-st-dark shadow-[3px_3px_0px_#14402c] active:translate-y-0.5 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>{isSubmitting ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}</span>
              </motion.button>

              {/* Link ke Login */}
              <div className="pt-4 text-center border-t-2 border-st-dark/15">
                <p className="text-xs text-st-text-muted font-medium">
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setErrorMsg(null);
                    }}
                    className="text-st-primary hover:text-st-dark font-extrabold underline transition-colors"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
