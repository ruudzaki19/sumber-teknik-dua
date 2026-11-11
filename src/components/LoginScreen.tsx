import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wrench, UserPlus, LogIn, CheckCircle2, ShieldCheck } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email) {
      setErrorMsg('Masukkan email Google Anda');
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithEmail(email, password);
    if (!res.success) {
      // If not found in email list, try loginWithGoogle
      await loginWithGoogle(email, email.split('@')[0]);
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name || !email) {
      setErrorMsg('Nama dan email wajib diisi');
      return;
    }

    setIsSubmitting(true);
    const res = await registerUser(name, email, password);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Gagal mendaftar');
    }
  };

  const handleQuickGoogle = (googleEmail: string, googleName: string) => {
    setIsSubmitting(true);
    loginWithGoogle(googleEmail, googleName).finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Banner - Sumber Tekhnik 2 */}
        <div className="bg-brand-900 text-white p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white mb-2 border border-white/20">
            <Wrench className="w-6 h-6 text-blue-300" />
          </div>
          <h1 className="text-xl font-black tracking-tight uppercase">Sumber Tekhnik 2</h1>
          <p className="text-blue-200 text-xs mt-0.5">
            Sistem Pemeliharaan AC & Kartu Perawatan
          </p>
        </div>

        {/* Tab Switcher: Login / Registrasi */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'login'
                ? 'border-brand-700 text-brand-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'register'
                ? 'border-brand-700 text-brand-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Daftar Akun (Registrasi)
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {activeTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Akun Google
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (Opsional)
                </label>
                <input
                  type="password"
                  placeholder="Masukkan password jika ada"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
              </button>

              {/* Quick Google Sign In options */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <span className="text-[11px] text-slate-400 block text-center font-medium">
                  Atau Masuk Cepat dengan Google:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickGoogle('ayah.sumbertekhnik@gmail.com', 'Ayah (Teknisi)')}
                    className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-brand-300 rounded-xl text-center transition-all"
                  >
                    <span className="text-xs font-bold text-slate-800 block">Akun Ayah</span>
                    <span className="text-[10px] text-slate-400 block">Teknisi AC</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickGoogle('rudja.admin@gmail.com', 'Rudja')}
                    className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-brand-300 rounded-xl text-center transition-all"
                  >
                    <span className="text-xs font-bold text-slate-800 block">Akun Rudja</span>
                    <span className="text-[10px] text-slate-400 block">Pengelola</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap / Panggilan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Google (@gmail.com)
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Buat password untuk akun ini"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Mendaftarkan...' : 'Daftar & Masuk'}
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Data tersimpan di perangkat lokal & siap hosting Vercel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
