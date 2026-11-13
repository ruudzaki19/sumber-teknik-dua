# SUMBER TEKNIK DUA
### Sistem Manajemen Pemeliharaan AC & Pencatatan Bon Transaksi
**Service, Jual-Beli AC Rumah, AC Mobil, Kulkas, Freezer, Water Heater, Mesin Cuci, Dispenser**  
*Komp. Griya Serpong Blok H4/2, Telp. 0813 8895 9081, Serpong - Tangerang*

---

## 🌟 Ringkasan Pembaruan Sistem (Tema Hijau & Putih)

Aplikasi web terpadu **SUMBER TEKNIK DUA** berbasis **React, TypeScript, Vite, Tailwind CSS, dan Supabase PostgreSQL** yang menggabungkan dua modul utama ke dalam satu sistem dengan antarmuka profesional bertema **Hijau dan Putih**:

1. **Navigasi Utama (3 Menu Navbar)**:
   - **Beranda**: Dashboard ringkasan berisi statistik real-time (total ruangan, total unit AC, total bon tercatat, dan total omset transaksi), profil resmi usaha Sumber Teknik Dua lengkap dengan layanan & kontak WhatsApp/telepon, serta tombol pintas akses cepat.
   - **Kartu Pemeliharaan**: Modul pemeliharaan unit AC per ruangan dengan alur CRUD lengkap, paraf otomatis teknisi (`/paraf-fixed.png`), stiker QR Code AC siap unduh JPG, dan cetak PDF kartu pemeliharaan ber-kop surat resmi baru Sumber Teknik Dua.
   - **Pencatatan Bon**: Modul pembuatan dan pencatatan nota/bon transaksi baru dengan rincian item dinamis (Banyaknya, Keterangan, Harga Satuan, Jumlah otomatis), cetak/unduh PDF berformat nota fisik resmi (border hijau, paraf teknisi & tanda tangan penerima), serta link/QR nota digital untuk pelanggan.

2. **Sistem Autentikasi & Role Akses**:
   - **Admin (`admin`)**:
     - Login langsung menggunakan email: `admin@gmail.com` dan password: `stdua` (tanpa perlu registrasi).
     - Hak akses penuh (**Full CRUD**) pada Kartu Pemeliharaan dan Pencatatan Bon (tambah, edit, hapus data, download stiker QR JPG, cetak PDF).
   - **User / Klien (`user`)**:
     - Pengunjung / klien baru mendaftar melalui form **Registrasi** (Nama Lengkap, Email, Password).
     - Masuk dalam **Mode Read-Only**: dapat melihat daftar ruangan, riwayat pemeliharaan AC, scan QR Code, serta melihat dan mengunduh PDF kartu pemeliharaan atau bon transaksi miliknya tanpa tombol edit/hapus.

3. **Database Supabase PostgreSQL & Realtime Sync**:
   - Skema tabel SQL lengkap tersedia pada `supabase-schema.sql`:
     1. `users` (id, nama, email, password, role, created_at)
     2. `rooms` (id, nama_ruangan, created_at)
     3. `ac_units` (id, room_id, mitra, jenis_ac, merk, type_model, kapasitas, no_seri, ruangan_lokasi, tahun_pemasangan, created_at, updated_at)
     4. `maintenance_records` (id, unit_id, nomor_urut, tanggal, uraian_pekerjaan, paraf_url, created_at)
     5. `bons` (id, nomor_bon, tanggal, kepada_yth, telp_pelanggan, total_jumlah, nama_teknisi, nama_penerima, paraf_url, created_at, updated_at)
     6. `bon_items` (id, bon_id, banyaknya, keterangan, harga_satuan, jumlah, created_at)
   - Sinkronisasi realtime otomatis (`supabase.channel`) sehingga data yang ditambah/diubah oleh teknisi di HP langsung muncul pada layar klien/admin tanpa perlu refresh halaman.
   - Dilengkapi penyimpanan lokal Dexie (IndexedDB) sebagai fallback andal saat offline.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Menjalankan di Komputer Lokal (Development)
```bash
# Pastikan berada di folder proyek
cd "c:\Users\rudja\OneDrive\Desktop\sumber teknik dua"

# Jalankan server lokal
npm run dev
```
Buka browser pada URL yang tampil (contoh: `http://localhost:5173`).

### 2. Membangun untuk Produksi (Build)
```bash
npm run build
```
File build siap saji akan dibuat di folder `dist/`.

---

## 🔐 Kredensial Akun

| Peran (Role) | Email | Password | Hak Akses |
|---|---|---|---|
| **Admin** | `admin@gmail.com` | `stdua` | Akses Penuh (CRUD Ruangan, AC, Riwayat Servis, Bon & Nota) |
| **User / Klien** | Terdaftar via Registrasi | Password Pribadi | Mode Lihat (Read-Only), Unduh PDF & Scan QR |

---

## 📄 Format Cetak & PDF Resmi

1. **PDF Kartu Pemeliharaan AC**:
   - Kop Surat: Logo Roda Gigi Hijau "ST", SUMBER TEKNIK DUA, Service & Jual-Beli, alamat dan telepon resmi.
   - Metadata lengkap unit AC & tabel riwayat 12 baris dengan paraf teknisi.
2. **PDF Bon / Nota Transaksi**:
   - Header kiri: Logo ST + Identitas lengkap Sumber Teknik Dua.
   - Header kanan: Tanggal nota, Kepada Yth, Nomor Telepon.
   - Tabel item berborder hijau: Banyaknya, Keterangan, Harga Satuan, Jumlah, dan Total Otomatis.
   - Footer: Tanda tangan Teknisi resmi (paraf otomatis) dan tanda tangan/cap Penerima.
