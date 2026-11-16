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

## 2. Palet Warna (Solid Industrial Technical Palette)

| Kategori | Hex Token | Tailwind Class | Penggunaan & Konteks |
|---|---|---|---|
| **Canvas Background (Putih Cream)** | `#F9F6F0` | `bg-[#F9F6F0]` | Latar belakang seluruh halaman aplikasi. Putih cream hangat (warm ivory cream) agar mata tidak lelah dan tidak terkesan putih polos. |
| **Surface (Card / Table)** | `#FFFFFF` | `bg-white` | Kartu informasi, panel form, baris tabel, modal dialog. Kontras tinggi di atas kanvas cream. |
| **Crisp Border** | `#E7E2D6` / `#E2E8F0` | `border-stone-200` / `border-slate-200` | Batas tegas 1px pada seluruh kartu, baris tabel, dan input field. |
| **Brand Primary (Technical Green)** | `#15803D` / `#166534` | `bg-emerald-700` / `bg-emerald-800` | Header navbar, tombol aksi utama (Simpan, Cetak, Tambah), aksen aktif terpilih. |
| **Brand Accent / Hover** | `#14532D` | `hover:bg-emerald-900` | State hover tombol primer dan highlight status teknis. |
| **Subtle Tint (Active/Focus)** | `#F0FDF4` | `bg-emerald-50` | Latar belakang elemen aktif, fokus input field, banner informasi penting. |
| **Primary Text** | `#0F172A` | `text-slate-900` | Seluruh heading, label penting, nilai nominal, dan isi data. Kontras tinggi (WCAG AAA). |
| **Secondary Text** | `#475569` | `text-slate-600` | Sub-judul, keterangan teknis, tanggal sekunder, metadata. |
| **Muted Text / Placeholder** | `#94A3B8` | `text-slate-400` | Placeholder input, ikon non-interaktif, border sekunder. |
| **Status Dot: Lunas / Siap** | `#16A34A` | `bg-emerald-600` | Indikator `• Selesai`, `• Normal`, `• Lunas`. |
| **Status Dot: Pending / Perlu Servis** | `#D97706` | `bg-amber-600` | Indikator `• Perlu Servis`, `• Pending`. |
| **Status Dot: Bahaya / Rusak** | `#DC2626` | `bg-rose-600` | Indikator `• Rusak`, `• Batal`. |

---

## 3. Background Animasi Tematik (Cooling Airflow & Blueprint)
Aplikasi menggunakan komponen latar belakang dinamis `<CoolingAirflowBackground />` yang dirancang khusus untuk tema pendingin AC & bengkel teknik:
1. **Tekstur Blueprint Dot-Matrix (`#CDC5B4`)**: Pola titik-titik geometris grid teknik berjarak 28px yang halus menyerupai kertas milimeter blok kalkir teknik.
2. **Gelombang Aliran Angin Sejuk AC (`Cooling Breeze Waves`)**: Tiga jalur pita angin hembusan AC beranimasi halus melintas horizontal dengan gradien hembusan sejuk (emerald `#15803D`, teal `#10B981`, dan ice cyan `#0EA5E9`).
3. **Partikel Hawa Sejuk Melayang (`Cool Air Particles`)**: 14 partikel embun/udara sejuk mikro melayang perlahan ke atas dengan pergerakan meliuk natural.
4. **Watermark Roda Gigi Mesin ST (`Mechanical Gear`)**: Siluet roda gigi 8 gigi resmi ST berputar sangat lambat (120 detik per putaran) di sudut latar belakang dengan opasitas sangat rendah (0.045) untuk menegaskan identitas teknik tanpa mengganggu keterbacaan teks.

---

## 3. Tipografi & Angka Tabular (Tabular Nums)

1. **Font Standar:** Inter / Sistem Sans-Serif Bersih (`font-sans`).
2. **Kewajiban Tabular Nums:**
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
