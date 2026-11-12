import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wrench, Eye, EyeOff, Lock, Mail, User, ShieldCheck } from 'lucide-react';

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
      setErrorMsg('Masukkan alamat email Gmail Anda');
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
      setErrorMsg('Email Gmail wajib diisi');
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-brand-900 text-white p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white mb-2 border border-white/20">
            <Wrench className="w-6 h-6 text-blue-300" />
          </div>
          <h1 className="text-xl font-black tracking-tight uppercase">Sumber Tekhnik Dua</h1>
          <p className="text-blue-200 text-xs mt-0.5">
            Sistem Pemeliharaan AC Ruangan
          </p>
        </div>

        {/* Content Box */}
        <div className="p-6">
          <div className="mb-5 text-center">
            <h2 className="text-base font-bold text-slate-900">
              {isRegisterMode ? 'Buat Akun Baru' : 'Masuk ke Akun Anda'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRegisterMode
                ? 'Daftarkan akun Gmail dan buat password Anda sendiri'
                : 'Silakan login menggunakan akun Gmail dan password Anda'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {!isRegisterMode ? (
            /* =================== FORM LOGIN =================== */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Gmail (@gmail.com)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nama@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Masuk */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Memeriksa Akun...' : 'Masuk'}
              </button>

              {/* Link ke Registrasi */}
              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setErrorMsg(null);
                    }}
                    className="text-brand-700 hover:text-brand-900 font-bold hover:underline"
                  >
                    Daftar / Registrasi di sini
                  </button>
                </p>
              </div>

              {/* Info Akun Admin */}
              <div className="p-2.5 bg-blue-50/80 border border-blue-200/70 rounded-xl text-center">
                <p className="text-[11px] text-brand-900 font-medium">
                  Akun Admin Resmi: <span className="font-bold text-brand-700 font-mono">admin@gmail.com</span> (Sandi: <span className="font-bold text-brand-700 font-mono">1234</span>)
                </p>
              </div>
            </form>
          ) : (
            /* =================== FORM REGISTRASI =================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Email Gmail */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Gmail (@gmail.com)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nama@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Buat Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Buat Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 4 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi password di atas"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Daftar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Mendaftarkan Akun...' : 'Daftar & Masuk'}
              </button>

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
                    className="text-brand-700 hover:text-brand-900 font-bold hover:underline"
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
      </div>
    </div>
  );
};
