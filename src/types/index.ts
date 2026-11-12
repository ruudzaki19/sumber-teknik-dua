export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  role: 'teknisi' | 'admin';
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
  parafUrl?: string;          // Gambar paraf tetap (Image 8)
  createdAt: number;
}

export interface CompanySettings {
  namaAplikasi: string;       // "Sumber Tekhnik Dua"
  tahunDefault: string;       // "2026"
}
