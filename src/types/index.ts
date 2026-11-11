export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  role: 'teknisi' | 'admin';
  provider: 'google' | 'local';
}

export interface Room {
  id: string;
  namaRuangan: string; // e.g. "Gedung Galeri (Tengah)", "Ruang Admin", "Ruang Lobby", "Ruang Pak Andi"
  gedungArea?: string; // e.g. "Lantai 1", "Gedung Utama"
  deskripsi?: string;
  qrCodeId: string;    // Room-level QR identifier
  createdAt: number;
}

export interface ACUnit {
  id: string;
  roomId: string;
  mitra: string;              // Mitra / Klien (e.g. "PT. SAREBU MITRA" / Gedung Galeri)
  jenisAc: string;            // KASET, SPLIT, STANDING, CENTRAL, dll.
  merk: string;               // POLYTRON, DAIKIN, PANASONIC, GREE, SHARP, LG, dll.
  typeModel: string;          // Model / Tipe AC
  kapasitas: string;          // 0.5 PK, 1 PK, 1.5 PK, 2 PK, 5 PK, dll.
  noSeri: string;             // Nomor Seri Unit
  ruanganLokasi: string;      // e.g. "GEDUNG GALERI (TENGAH)"
  tahunPemasangan?: string;
  qrCodeId: string;           // AC-level QR identifier
  createdAt: number;
  updatedAt: number;
}

export interface MaintenanceRecord {
  id: string;
  unitId: string;
  nomorUrut?: number;         // 1 - 12 (seperti di kartu fisik)
  tanggal: string;            // Format DD-MM-YYYY atau YYYY-MM-DD
  uraianPekerjaan: string;    // "Ganti dinamo drain", "Cleaning", "Isi freon", dll.
  biaya: number;              // Biaya perbaikan / sparepart (Rp)
  qty: number;                // Jumlah unit/pekerjaan
  totalHarga: number;         // biaya * qty (Rp)
  parafUrl?: string;          // Tanda tangan/paraf digital (base64 image)
  keterangan?: string;
  teknisiNama?: string;
  status: 'Selesai' | 'Proses' | 'Menunggu Sparepart';
  createdAt: number;
}

export interface CompanySettings {
  namaPerusahaan: string;     // "CV. SARANA REKATAMA BUANA"
  slogan: string;             // "SUPPLIER - CONTRACTOR"
  alamat1: string;            // "Jl. Mustang No. 8 Sindangsana, Kel. Neglasari"
  alamat2: string;            // "Kec. Neglasari Kota Tangerang 15129"
  telepon: string;
  mitraDefault: string;
  tahunDefault: string;       // "2026"
  logoUrl?: string;
}
