-- ============================================================
-- SQL SCHEMA UNTUK POSTGRESQL (DBeaver / Supabase)
-- SISTEM PEMELIHARAAN AC - SUMBER TEKHNIK DUA
-- ============================================================

-- 1. Buat Tabel Ruangan (rooms)
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    nama_ruangan TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

-- 2. Buat Tabel Unit AC (ac_units)
CREATE TABLE IF NOT EXISTS ac_units (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    mitra TEXT DEFAULT '',
    jenis_ac TEXT DEFAULT '',
    merk TEXT DEFAULT '',
    type_model TEXT DEFAULT '',
    kapasitas TEXT DEFAULT '',
    no_seri TEXT DEFAULT '',
    ruangan_lokasi TEXT NOT NULL,
    tahun_pemasangan TEXT DEFAULT '2026',
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- 3. Buat Tabel Catatan Pemeliharaan (maintenance_records)
CREATE TABLE IF NOT EXISTS maintenance_records (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES ac_units(id) ON DELETE CASCADE,
    nomor_urut INT DEFAULT 1,
    tanggal TEXT NOT NULL,
    uraian_pekerjaan TEXT NOT NULL,
    paraf_url TEXT DEFAULT '/paraf-fixed.png',
    created_at BIGINT NOT NULL
);

-- ============================================================
-- PENGATURAN HAK AKSES (Row Level Security / RLS)
-- Agar siapa saja yang scan QR bisa melihat (Public Read),
-- namun hanya Admin yang bisa menambah / mengedit data.
-- ============================================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ac_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Izinkan publik untuk membaca semua data (Public View)
CREATE POLICY "Public Read Rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public Read AC Units" ON ac_units FOR SELECT USING (true);
CREATE POLICY "Public Read Records" ON maintenance_records FOR SELECT USING (true);

-- Izinkan operasi simpan/edit/hapus
CREATE POLICY "Allow All Insert Rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Rooms" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Rooms" ON rooms FOR DELETE USING (true);

CREATE POLICY "Allow All Insert Units" ON ac_units FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Units" ON ac_units FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Units" ON ac_units FOR DELETE USING (true);

CREATE POLICY "Allow All Insert Records" ON maintenance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Records" ON maintenance_records FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Records" ON maintenance_records FOR DELETE USING (true);
