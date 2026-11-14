export type AppTab = 'beranda' | 'pemeliharaan' | 'bon';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  role: 'admin' | 'user';
  provider: 'google' | 'local';
}

export interface Room {
  id: string;
  namaRuangan: string; // e.g. "Ruang Admin", "Ruang BKAL"
  qrCodeId?: string;   // Room-level QR identifier
  createdAt: number;
}

export interface ACUnit {
  id: string;
  roomId: string;
  mitra: string;              // Mitra / Klien
  jenisAc: string;            // Kaset, Split, Standing, dll.
  merk: string;               // Polytron, Daikin, dll.
  typeModel: string;          // Model / Tipe AC
  kapasitas: string;          // Kapasitas (PK)
  noSeri: string;             // Nomor Seri Unit
  ruanganLokasi: string;      // Ruangan / Lokasi tercetak di kartu
  tahunPemasangan?: string;
  qrCodeId?: string;          // AC-level QR identifier
  createdAt: number;
  updatedAt: number;
}

export interface MaintenanceRecord {
  id: string;
  unitId: string;
  nomorUrut?: number;         // 1 - 12 (seperti di kartu fisik)
  tanggal: string;            // Format DD-MM-YYYY
  uraianPekerjaan: string;    // Uraian pekerjaan / servis
  parafUrl?: string;          // Gambar paraf tetap (/paraf-fixed.png)
  createdAt: number;
}

export interface CompanySettings {
  namaAplikasi: string;       // "SUMBER TEKNIK DUA"
  tahunDefault: string;       // "2026"
  telepon: string;            // "0813 8895 9081"
  alamat: string;             // "Komp. Griya Serpong Blok H4/2, Serpong - Tangerang"
}

// ================= MODUL PENCATATAN BON =================

export interface BonItem {
  id: string;
  bonId: string;
  banyaknya: string | number; // Qty / Satuan (angka atau huruf: "1", "1 Unit", "2 Pk", "Set", dll)
  keterangan: string;         // Deskripsi item / servis / sparepart
  hargaSatuan: number;        // Nominal harga satuan (Rp)
  jumlah: number;             // Banyaknya * HargaSatuan (Rp)
  createdAt?: number;
}

export interface Bon {
  id: string;
  nomorBon: string;           // Nomor nota fisik/digital e.g. "STD-202611-001"
  tanggal: string;            // Format "DD-MM-YYYY" atau "DD MMMM YYYY"
  kepadaYth: string;          // Nama Pelanggan / Instansi
  telpPelanggan: string;      // Nomor telepon pelanggan
  totalJumlah: number;        // Total keseluruhan (Rp)
  namaTeknisi: string;        // Nama teknisi penanggung jawab
  namaPenerima: string;       // Nama pelanggan / penerima
  parafUrl?: string;          // Gambar paraf resmi (/paraf-fixed.png)
  items?: BonItem[];          // Daftar baris item pekerjaan / sparepart
  createdAt: number;
  updatedAt: number;
}
