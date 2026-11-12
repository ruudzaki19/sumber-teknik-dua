import React, { useState } from 'react';
import { X, Database, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured, saveSupabaseConfig } from '../lib/supabase';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [url, setUrl] = useState(
    localStorage.getItem('sumber_tekhnik_supabase_url') || ''
  );
  const [anonKey, setAnonKey] = useState(
    localStorage.getItem('sumber_tekhnik_supabase_anon_key') || ''
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    onClose();
  };

  const sqlSchema = `-- Buka DBeaver atau Supabase SQL Editor lalu jalankan:
CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, nama_ruangan TEXT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS ac_units (id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, mitra TEXT, jenis_ac TEXT, merk TEXT, type_model TEXT, kapasitas TEXT, no_seri TEXT, ruangan_lokasi TEXT NOT NULL, tahun_pemasangan TEXT DEFAULT '2026', created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS maintenance_records (id TEXT PRIMARY KEY, unit_id TEXT NOT NULL REFERENCES ac_units(id) ON DELETE CASCADE, nomor_urut INT DEFAULT 1, tanggal TEXT NOT NULL, uraian_pekerjaan TEXT NOT NULL, paraf_url TEXT DEFAULT '/paraf-fixed.png', created_at BIGINT NOT NULL);
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY; ALTER TABLE ac_units ENABLE ROW LEVEL SECURITY; ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Rooms" ON rooms FOR SELECT USING (true); CREATE POLICY "Public Read AC Units" ON ac_units FOR SELECT USING (true); CREATE POLICY "Public Read Records" ON maintenance_records FOR SELECT USING (true);
CREATE POLICY "Allow All Rooms" ON rooms FOR ALL USING (true); CREATE POLICY "Allow All Units" ON ac_units FOR ALL USING (true); CREATE POLICY "Allow All Records" ON maintenance_records FOR ALL USING (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="font-bold text-sm">Koneksi Database Cloud PostgreSQL</h3>
              <p className="text-blue-200 text-[11px]">Agar HP Ayah & HP User/Klien sinkron realtime</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {/* Status Indicator */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              isSupabaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold block">
                {isSupabaseConfigured
                  ? 'Status: Terkoneksi ke Cloud PostgreSQL (Supabase)'
                  : 'Status: Masih Menggunakan Database Lokal (HP Ini Saja)'}
              </span>
              <span className="text-[11px] opacity-90">
                {isSupabaseConfigured
                  ? 'Setiap data yang ayah simpan langsung online & otomatis tampil di HP user yang scan QR.'
                  : 'Untuk menghubungkan banyak HP & scan QR realtime, masukkan URL dan Anon Key Supabase di bawah.'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project URL (Supabase)
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Anon Public API Key (Supabase)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-sm transition-colors text-xs"
            >
              Simpan & Hubungkan Database
            </button>
          </form>

          {/* DBeaver & Setup Guide */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Cara Konek DBeaver & Supabase (Gratis):</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
              <li>
                Daftar akun gratis di{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-700 font-bold underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                lalu buat project baru (misal: <em>sumber-tekhnik</em>).
              </li>
              <li>
                Buka menu <strong>Project Settings</strong> &gt; <strong>API</strong>. Salin <strong>Project URL</strong> dan <strong>anon key</strong> ke form di atas.
              </li>
              <li>
                Buka menu <strong>SQL Editor</strong> di Supabase (atau di DBeaver), salin kode SQL di bawah lalu klik <strong>Run</strong> untuk membuat tabel otomatis.
              </li>
              <li>
                <strong>Untuk DBeaver:</strong> Buka Project Settings &gt; Database &gt; Connection String (URI). Salin URI PostgreSQL tersebut dan buka di DBeaver pada laptopmu!
              </li>
            </ol>

            <button
              type="button"
              onClick={copySql}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 inline-flex items-center justify-center gap-1.5 text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Kode SQL Berhasil Disalin!' : 'Salin Kode SQL Tabel untuk DBeaver / Supabase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
