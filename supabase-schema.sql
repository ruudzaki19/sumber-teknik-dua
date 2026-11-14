-- ============================================================
-- SQL SCHEMA UNTUK SUPABASE POSTGRESQL
-- SUMBER TEKNIK DUA: KARTU PEMELIHARAAN AC & PENCATATAN BON
-- ============================================================

-- 1. Tabel Pengguna / Autentikasi (users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' atau 'user'
  created_at BIGINT NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access users" ON users;
CREATE POLICY "Allow public access users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Akun Default Admin (admin@gmail.com / stdua)
INSERT INTO users (id, nama, email, password, role, created_at)
VALUES ('admin-01', 'Admin Sumber Teknik', 'admin@gmail.com', 'stdua', 'admin', 1794489000000)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'admin';

-- 2. Tabel Ruangan (rooms)
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  nama_ruangan TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Rooms" ON rooms;
DROP POLICY IF EXISTS "Allow All Insert Rooms" ON rooms;
DROP POLICY IF EXISTS "Allow All Update Rooms" ON rooms;
DROP POLICY IF EXISTS "Allow All Delete Rooms" ON rooms;

CREATE POLICY "Public Read Rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Rooms" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Rooms" ON rooms FOR DELETE USING (true);

-- 3. Tabel Unit AC (ac_units)
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

ALTER TABLE ac_units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read AC Units" ON ac_units;
DROP POLICY IF EXISTS "Allow All Insert Units" ON ac_units;
DROP POLICY IF EXISTS "Allow All Update Units" ON ac_units;
DROP POLICY IF EXISTS "Allow All Delete Units" ON ac_units;

CREATE POLICY "Public Read AC Units" ON ac_units FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Units" ON ac_units FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Units" ON ac_units FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Units" ON ac_units FOR DELETE USING (true);

-- 4. Tabel Catatan Pemeliharaan (maintenance_records)
CREATE TABLE IF NOT EXISTS maintenance_records (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES ac_units(id) ON DELETE CASCADE,
  nomor_urut INT DEFAULT 1,
  tanggal TEXT NOT NULL,
  uraian_pekerjaan TEXT NOT NULL,
  paraf_url TEXT DEFAULT '/paraf-fixed.png',
  created_at BIGINT NOT NULL
);

ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Records" ON maintenance_records;
DROP POLICY IF EXISTS "Allow All Insert Records" ON maintenance_records;
DROP POLICY IF EXISTS "Allow All Update Records" ON maintenance_records;
DROP POLICY IF EXISTS "Allow All Delete Records" ON maintenance_records;

CREATE POLICY "Public Read Records" ON maintenance_records FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Records" ON maintenance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Records" ON maintenance_records FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Records" ON maintenance_records FOR DELETE USING (true);

-- 5. Tabel Bon / Nota Transaksi (bons)
CREATE TABLE IF NOT EXISTS bons (
  id TEXT PRIMARY KEY,
  nomor_bon TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  kepada_yth TEXT NOT NULL,
  telp_pelanggan TEXT DEFAULT '',
  total_jumlah NUMERIC DEFAULT 0,
  nama_teknisi TEXT DEFAULT 'Sumber Teknik Dua',
  nama_penerima TEXT DEFAULT '',
  paraf_url TEXT DEFAULT '/paraf-fixed.png',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

ALTER TABLE bons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Bons" ON bons;
DROP POLICY IF EXISTS "Allow All Insert Bons" ON bons;
DROP POLICY IF EXISTS "Allow All Update Bons" ON bons;
DROP POLICY IF EXISTS "Allow All Delete Bons" ON bons;

CREATE POLICY "Public Read Bons" ON bons FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Bons" ON bons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Bons" ON bons FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Bons" ON bons FOR DELETE USING (true);

-- 6. Tabel Baris Item Bon (bon_items)
CREATE TABLE IF NOT EXISTS bon_items (
  id TEXT PRIMARY KEY,
  bon_id TEXT NOT NULL REFERENCES bons(id) ON DELETE CASCADE,
  banyaknya TEXT DEFAULT '1',
  keterangan TEXT NOT NULL,
  harga_satuan NUMERIC DEFAULT 0,
  jumlah NUMERIC DEFAULT 0,
  created_at BIGINT NOT NULL
);
-- Migrasi jika kolom sebelumnya adalah NUMERIC
ALTER TABLE bon_items ALTER COLUMN banyaknya TYPE TEXT USING banyaknya::TEXT;

ALTER TABLE bon_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Bon Items" ON bon_items;
DROP POLICY IF EXISTS "Allow All Insert Bon Items" ON bon_items;
DROP POLICY IF EXISTS "Allow All Update Bon Items" ON bon_items;
DROP POLICY IF EXISTS "Allow All Delete Bon Items" ON bon_items;

CREATE POLICY "Public Read Bon Items" ON bon_items FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Bon Items" ON bon_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Bon Items" ON bon_items FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Bon Items" ON bon_items FOR DELETE USING (true);

-- Enable Supabase Realtime publication on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE ac_units;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE bons;
ALTER PUBLICATION supabase_realtime ADD TABLE bon_items;
