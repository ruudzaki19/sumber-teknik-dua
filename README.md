# Sistem Kartu Pemeliharaan AC Digital (QR-Maintenance)
### CV. SARANA REKATAMA BUANA • Tangerang (Sumber Tekhnik)

Aplikasi manajemen dan kartu pemeliharaan AC digital berbasis web (Mobile-First) yang dirancang khusus untuk teknisi AC di lapangan. Menggantikan proses manual (scan QR statis -> edit di WPS Office -> unduh PDF -> upload ulang) menjadi **CRUD interaktif serba cepat langsung dari smartphone**.

---

## 🌟 Solusi & Fitur Utama

1. **Tema Bersih & Elegan (Putih - Biru Profesional)**:
   - Dirancang tanpa tampilan "AI website" yang berlebihan/norak.
   - Bersih, kontras tinggi, tombol jari besar, responsif di layar HP.
2. **Scan QR Code Ruangan & Unit AC**:
   - Teknisi cukup membuka kamera langsung dari aplikasi untuk scan QR code di unit AC / pintu ruangan.
   - Otomatis membuka **Kartu Pemeliharaan AC** untuk ruangan/unit yang bersangkutan.
   - Dilengkapi fallback pencarian cepat tanpa kamera jika di ruangan gelap.
3. **CRUD Data Lengkap**:
   - **Kelola Ruangan**: Ruang Admin, Gedung Galeri (Tengah), Ruang Lobby, Ruang Pak Andi, dll.
   - **Kelola Unit AC**: Mitra, Jenis AC (Kaset, Split, Standing, dll), Merk (Polytron, Daikin, Panasonic, dll), Tipe, Kapasitas (PK), Nomor Seri, Lokasi.
   - **Catatan Pemeliharaan**: Tanggal, Uraian Pekerjaan (dengan rekomendasi tombol cepat: *Cleaning*, *Ganti dinamo drain*, *Isi freon*, dll).
4. **Hitung Harga & Total Otomatis**:
   - Input harga satuan perbaikan dan jumlah unit (Qty).
   - Sistem langsung menghitung total biaya perbaikan dan estimasi tagihan servis secara otomatis.
5. **Paraf / Tanda Tangan Digital**:
   - Dilengkapi kanvas tanda tangan langsung menggunakan goresan jari di layar HP (*touch-screen*).
   - Tersedia tombol cepat "Gunakan Paraf Otomatis".
6. **Download & Cetak PDF Persis 1:1 Kartu Fisik**:
   - **Kop Surat Resmi**: CV. SARANA REKATAMA BUANA (Supplier - Contractor), Jl. Mustang No. 8 Sindangsana, Kec. Neglasari, Kota Tangerang.
   - **Tabel 12 Baris Lengkap**: Nomor 1 sampai 12 sesuai format blanko fisik resmi.
   - Pilihan mode: **Format Blanko Fisik** atau **Format Rekap Biaya & Total**.
   - 1-Klik **Download PDF** atau **Cetak Langsung**.
7. **Cetak Stiker QR Code**:
   - Buat & cetak stiker label QR siap tempel di unit indoor/outdoor atau pintu ruangan.
8. **Penyimpanan Lokal (IndexedDB) & Siap Vercel**:
   - Data otomatis tersimpan permanen di memori lokal HP/laptop via IndexedDB (Dexie.js).
   - **Bekerja 100% Offline** (tidak hilang meski di basement atau area tanpa sinyal).
   - Fitur **Download Backup (JSON)** dan **Pulihkan Data** jika berganti HP.
   - Otomatis kompatibel untuk di-hosting ke **Vercel** (`vercel.json` sudah tersedia).
9. **Masuk dengan Akun Google**:
   - Akses cepat akun teknisi Google dengan profil tersimpan.

---

## 🚀 Cara Menjalankan Secara Lokal

```bash
# 1. Masuk ke folder proyek
cd "c:\Users\rudja\OneDrive\Desktop\Sumber Tekhnik 2"

# 2. Jalankan server dev
npm run dev
```

Buka URL yang ditampilkan di browser (misal: `http://localhost:3000` atau buka melalui IP lokal untuk dicoba langsung di HP yang satu jaringan Wi-Fi).

---

## 🌐 Cara Hosting ke Vercel

Aplikasi ini sudah dilengkapi file konfigurasi `vercel.json` dan siap dideploy langsung ke Vercel:

### Metode 1: Menggunakan Vercel Dashboard (Rekomendasi)
1. Buat repositori baru di GitHub (misal: `sumber-tekhnik-ac`).
2. Push folder proyek ini ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sistem Kartu Pemeliharaan AC"
   git branch -M main
   git remote add origin https://github.com/USERNAME/sumber-tekhnik-ac.git
   git push -u origin main
   ```
3. Buka [https://vercel.com](https://vercel.com) dan login.
4. Klik **"Add New Project"** -> Pilih repositori GitHub Anda.
5. Biarkan pengaturan default (Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).
6. Klik **Deploy**! Website Anda akan langsung online (contoh: `https://sumber-tekhnik-ac.vercel.app`).

### Metode 2: Menggunakan Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 📱 Cara Ayah Menggunakan di HP Lapangan

1. **Jadikan Aplikasi di Layar Utama HP (Add to Home Screen)**:
   - Buka link Vercel di Google Chrome (Android) atau Safari (iPhone).
   - Tekan menu titik tiga / tombol bagikan -> Pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
   - Aplikasi akan memiliki ikon sendiri seperti aplikasi asli di HP ayah!
2. **Saat di Lokasi AC**:
   - Buka aplikasi -> Tekan tombol bundar **Kamera (Scan QR)** di tengah bawah.
   - Arahkan ke stiker QR AC di ruangan tersebut.
   - Halaman kartu pemeliharaan AC ruangan langsung terbuka otomatis.
   - Tekan **"+ Tambah Catatan Servis"** -> Isi tanggal, pilih perbaikan (cth: *Cleaning*, *Isi freon*), ketik biaya, bubuhkan paraf dengan jari -> Tekan **Simpan**.
   - Jika mitra/klien meminta arsip fisik: Tekan **"Cetak / Download PDF"** -> Download file PDF ber-kop surat resmi CV. SAREBU.
