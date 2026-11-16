# SUMBER TEKNIK DUA — DESIGN SYSTEM SPECIFICATION
**Version:** 1.0 (Human-Crafted Industrial UI / Anti-AI Slop)  
**Target:** Web Application & Logistics Maintenance System

---

## 1. Filosofi Desain: Utilitarian Field-Craft
Sistem visual **SUMBER TEKNIK DUA** dirancang untuk keandalan, kejelasan, dan kecepatan kerja teknisi lapangan serta staf administrasi. Desain mengutamakan estetika bengkel teknik presisi: fungsional, tegas, kontras tinggi, dan tanpa ornamen visual buatan AI yang tidak perlu (anti-AI slop).

### Larangan Keras (Anti-AI Slop Rules):
- ❌ **DILARANG** menggunakan efek gradasi berlebih (*linear/radial gradient slop* ungu-pink-cyan atau gradasi mengilap pada kartu/tombol).
- ❌ **DILARANG** menggunakan efek *glassmorphism* murahan (`backdrop-blur` semi-transparan dengan border putih pudar yang menurunkan keterbacaan teks).
- ❌ **DILARANG** menggunakan *drop-shadow* tebal, mengambang, atau kabur yang membuat elemen tampak melayang tidak teratur.
- ❌ **DILARANG** menggunakan teks kapital paksa (*forced all-caps*) pada form input dan data dinamis yang menyulitkan pembacaan data teknis.

---

## 2. Palet Warna (Solid Industrial Flat Palette — Hijau, Putih, Krem)

| Kategori | Hex Token | Tailwind Token | Penggunaan & Konteks |
|---|---|---|---|
| **Canvas Background (Krem)** | `#F6F1E4` | `bg-st-cream` | Latar belakang seluruh halaman aplikasi. Putih cream hangat anti silau. |
| **Krem Gelap (Aksen Permukaan)** | `#ECE4CF` | `bg-st-cream-dark` | Kontainer sekunder, thumbnail strip, card CTA. |
| **Surface (Card / Table Putih)** | `#FFFFFF` | `bg-st-white` / `bg-white` | Kartu informasi, panel form, baris tabel, modal dialog. Kontras tinggi di atas krem. |
| **Brand Primary (Hijau Utama)** | `#1F6F4A` | `bg-st-primary` | Tombol aksi utama, header aktif, badge status, highlight utama. |
| **Brand Dark (Hijau Tua)** | `#14402C` | `bg-st-dark` | Border tegas 2-3px, hard offset box-shadow (`#14402C`), footer. |
| **Brand Light (Hijau Muda)** | `#7FB58F` | `bg-st-light` | Garis hembusan angin sejuk AC, aksen border sekunder. |
| **Brand Pale (Hijau Pucat)** | `#DCEBD9` | `bg-st-pale` | Highlight box kata kunci judul, fallback foto, badge aktif. |
| **Primary Text (Slate Gelap)** | `#17261E` | `text-st-text` | Seluruh heading, judul extrabold, teks data. |
| **Secondary Text (Teks Redup)** | `#5D6F64` | `text-st-text-muted` | Sub-judul, metadata teknis, caption singkat. |

---

## 3. Background Animasi Tematik (Cooling Airflow — Flat Solid, Zero Gradient)
Aplikasi menggunakan komponen latar belakang dinamis `<CoolingAirflowBackground />` berdesain flat solid tanpa gradasi:
1. **Latar Solid Krem (`#F6F1E4`)**: Menggunakan token `bg-st-cream` yang hangat dan nyaman di mata.
2. **5 Lingkaran Solid Melayang**:
   - Hijau pucat (`#DCEBD9`), krem gelap (`#ECE4CF`), dan hijau muda semi-transparan (`#7FB58F`/35%).
   - Melayang perlahan 14–18 detik (`translate` + `scale`, alternate, delay bertingkat).
3. **4 Garis Tipis Hembusan Angin AC (`bg-st-light`)**:
   - Garis horizontal tipis 2px bergerak dari kiri ke kanan melintasi layar (loop 9 detik).
4. **Aksesibilitas (`prefers-reduced-motion`)**:
   - Menggunakan hook `useReducedMotion()`. Jika pengguna mengaktifkan preferensi minim gerak, animasi dinonaktifkan secara otomatis.

---

## 4. Tipografi & Angka Tabular (Sora & Tabular Nums)

1. **Font Standar:** Sora (`font-sora`, Google Fonts). Judul menggunakan bobot `font-extrabold`.
2. **Penulisan Brand Resmi:** Ditulis secara konsisten **"Sumber Teknik Dua"** (menggunakan huruf, bukan angka).
3. **Kewajiban Tabular Nums:**
   - **Wajib gunakan kelas `tabular-nums`** (angka monospace sejajar vertikal) untuk:
     - Seluruh nominal mata uang Rupiah (`Rp 150.000`).
     - Nomor seri unit AC (`STD-2026-001`).
     - Kode ruangan / nomor unit (`01`, `02`).
     - Tanggal transaksi (`14-11-2026`).
     - Kuantitas pekerjaan / unit (`1`, `2 PK`).
   - Angka mata uang dan total **wajib rata kanan (`text-right tabular-nums`)** pada tabel agar mempermudah rekonsiliasi kasir.
3. **Hirarki Teks:**
   - H1: `text-xl font-bold tracking-tight text-slate-900`
   - H2: `text-base font-semibold text-slate-900`
   - Body: `text-sm text-slate-700 leading-relaxed`
   - Caption / Meta: `text-xs font-medium text-slate-500`

---

## 4. Kerapihan Informasi & Komponen Utilitarian

### A. Badge Status Presisi (Dot Indicator)
Gunakan format dot bulat solid 6px diikuti teks ringkas, bukan pill warna-warni yang mencolok:
```html
<!-- Contoh Status Siap / Lunas -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
  <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
  Selesai
</span>

<!-- Contoh Status Perlu Servis -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
  <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
  Perlu Servis
</span>
```

### B. Tabel Industrial Bergaris Tegas
- Header tabel: `bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 sticky top-0`.
- Baris tabel: `border-b border-slate-100 hover:bg-slate-50/70 transition-colors`.
- Padding tabel: `px-4 py-3 text-sm`.

### C. Nota Fisik & Kartu Pemeliharaan (Bon Engine)
- Meniru nota rangkap bengkel teknik profesional.
- Garis tabel solid seragam (`1.2px solid #1b6837` atau `border-slate-300`).
- Kop surat HD dengan rasio natural (tanpa distorsi vertikal/horizontal).
- Kolom tanda tangan teknisi dengan stempel basah tumpang tindih (*overlap natural*).
- Format unduhan instan: Gambar High-Resolution JPG (300 DPI) agar langsung tersimpan di galeri perangkat teknisi.

---

## 5. Micro-Interactions & Framer Motion Specs

Animasi berfungsi sebagai pengarah fokus fungsional dan feedback fisik, bukan dekorasi lambat.

```typescript
// Easing Kurva Fisik Standar
export const industrialSpring = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

export const snappyEase = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1]
};

// 1. Feedback Taktil Tombol
export const buttonTapMotion = {
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 }
};

// 2. Transisi Halaman / Tab (layoutId Active Pill)
// Gunakan layoutId="activeTabPill" untuk indikator menu bergeser mulus tanpa kedip.

// 3. Staggered Entry untuk List / Kartu AC / Bon
export const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
  }
};

// 4. Modal Dialog Natural Open/Close
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: 4,
    transition: { duration: 0.15 }
  }
};
```

---

## 6. Checklist Implementasi
- [x] Background seluruh aplikasi bertema Alabaster/Off-white (`#F8FAFC`).
- [x] Navbar solid Forest Green (`#15803D`) tanpa gradasi, dilengkapi navigasi tab `layoutId` yang halus.
- [x] Seluruh angka nominal rupiah, serial, tanggal, dan kuantitas menggunakan `tabular-nums`.
- [x] Card permukaan putih solid `#FFFFFF` dengan border tipis `1px solid #E2E8F0` dan radius `rounded-xl`.
- [x] Feedback taktil `whileTap={{ scale: 0.98 }}` pada setiap tombol aksi.
- [x] Staggered entrance animation pada data tabel AC dan daftar Bon.
- [x] Modal popup memiliki overlay bersih dan animasi scale-up natural.
- [x] Logika Supabase, state aplikasi, dan skema database tetap 100% utuh.
