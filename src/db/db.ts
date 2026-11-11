import Dexie, { type Table } from 'dexie';
import { Room, ACUnit, MaintenanceRecord, CompanySettings, UserProfile } from '../types';

export class ACMakeDatabase extends Dexie {
  rooms!: Table<Room, string>;
  acUnits!: Table<ACUnit, string>;
  maintenanceRecords!: Table<MaintenanceRecord, string>;
  settings!: Table<CompanySettings & { id: string }, string>;
  users!: Table<UserProfile, string>;

  constructor() {
    super('SumberTekhnikACDB');
    this.version(1).stores({
      rooms: 'id, namaRuangan, qrCodeId, createdAt',
      acUnits: 'id, roomId, qrCodeId, merk, jenisAc, ruanganLokasi, createdAt',
      maintenanceRecords: 'id, unitId, tanggal, createdAt, status',
      settings: 'id',
      users: 'id, email'
    });
  }
}

export const db = new ACMakeDatabase();

// Default Kop Surat info matching user's image
export const DEFAULT_SETTINGS: CompanySettings = {
  namaPerusahaan: 'CV. SARANA REKATAMA BUANA',
  slogan: 'SUPPLIER - CONTRACTOR',
  alamat1: 'Jl. Mustang No. 8 Sindangsana, Kel. Neglasari',
  alamat2: 'Kec. Neglasari Kota Tangerang 15129',
  telepon: '0812-3456-7890',
  mitraDefault: '',
  tahunDefault: '2026',
  logoUrl: '/kartu-referensi.jpg'
};

// Sample Signature SVG Data URL (matching the user's paraf in image)
export const SAMPLE_SIGNATURE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 120 40'><path d='M10 25 C 25 10, 30 5, 45 20 C 50 25, 45 35, 60 20 C 70 10, 80 15, 95 28 M40 18 L 85 18 M65 22 C 75 30, 85 25, 100 30' stroke='%230f172a' stroke-width='2' fill='none' stroke-linecap='round'/></svg>";

// Seed initial data if empty
export async function seedInitialDataIfNeeded() {
  const roomCount = await db.rooms.count();
  if (roomCount > 0) return;

  // Insert settings
  await db.settings.put({
    id: 'default',
    ...DEFAULT_SETTINGS
  });

  // Insert Rooms
  const roomGaleriId = 'room-galeri';
  const roomAdminId = 'room-admin';
  const roomLobbyId = 'room-lobby';
  const roomPakAndiId = 'room-pak-andi';

  await db.rooms.bulkAdd([
    {
      id: roomGaleriId,
      namaRuangan: 'Gedung Galeri (Tengah)',
      gedungArea: 'Gedung Utama - Lantai 1',
      deskripsi: 'Area pameran galeri tengah, AC Kaset 5 PK',
      qrCodeId: 'QR-ROOM-GALERI',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30
    },
    {
      id: roomAdminId,
      namaRuangan: 'Ruang Admin',
      gedungArea: 'Gedung Kantor - Lantai 2',
      deskripsi: 'Ruangan operasional administrasi',
      qrCodeId: 'QR-ROOM-ADMIN',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25
    },
    {
      id: roomLobbyId,
      namaRuangan: 'Ruang Lobby',
      gedungArea: 'Gedung Utama - Depan',
      deskripsi: 'Lobby utama penerimaan tamu',
      qrCodeId: 'QR-ROOM-LOBBY',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20
    },
    {
      id: roomPakAndiId,
      namaRuangan: 'Ruang Pak Andi',
      gedungArea: 'Gedung Kantor - Lantai 2',
      deskripsi: 'Ruangan pimpinan Pak Andi',
      qrCodeId: 'QR-ROOM-PAK-ANDI',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15
    }
  ]);

  // Insert AC Units (The first unit strictly matches the user's uploaded image!)
  const unitGaleri1Id = 'unit-galeri-1';
  const unitAdmin1Id = 'unit-admin-1';
  const unitLobby1Id = 'unit-lobby-1';
  const unitPakAndi1Id = 'unit-pakandi-1';

  await db.acUnits.bulkAdd([
    {
      id: unitGaleri1Id,
      roomId: roomGaleriId,
      mitra: 'Gedung Galeri Seni & Bisnis',
      jenisAc: 'KASET',
      merk: 'POLYTRON',
      typeModel: 'PAC-50VZ',
      kapasitas: '5 PK',
      noSeri: 'PLT-2024-KST-089',
      ruanganLokasi: 'GEDUNG GALERI (TENGAH)',
      tahunPemasangan: '2024',
      qrCodeId: 'AC-QR-GALERI-TENGAH-01',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
      updatedAt: Date.now()
    },
    {
      id: unitAdmin1Id,
      roomId: roomAdminId,
      mitra: 'Kantor Cabang',
      jenisAc: 'SPLIT WALL',
      merk: 'DAIKIN',
      typeModel: 'FTKC25TVM4',
      kapasitas: '1 PK',
      noSeri: 'DKN-2023-SP-412',
      ruanganLokasi: 'RUANG ADMIN',
      tahunPemasangan: '2023',
      qrCodeId: 'AC-QR-ADMIN-01',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
      updatedAt: Date.now()
    },
    {
      id: unitLobby1Id,
      roomId: roomLobbyId,
      mitra: 'Gedung Utama',
      jenisAc: 'STANDING FLOOR',
      merk: 'PANASONIC',
      typeModel: 'CS-J18FFP',
      kapasitas: '2 PK',
      noSeri: 'PNS-2022-SF-801',
      ruanganLokasi: 'RUANG LOBBY DEPAN',
      tahunPemasangan: '2022',
      qrCodeId: 'AC-QR-LOBBY-01',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
      updatedAt: Date.now()
    },
    {
      id: unitPakAndi1Id,
      roomId: roomPakAndiId,
      mitra: 'Kantor Direksi',
      jenisAc: 'SPLIT INVERTER',
      merk: 'MITSUBISHI',
      typeModel: 'SRK13YXP',
      kapasitas: '1.5 PK',
      noSeri: 'MSH-2024-IV-119',
      ruanganLokasi: 'RUANG PAK ANDI',
      tahunPemasangan: '2024',
      qrCodeId: 'AC-QR-PAK-ANDI-01',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
      updatedAt: Date.now()
    }
  ]);

  // Insert Maintenance Records for Gedung Galeri (Tengah) strictly from the photo:
  // 1. 29-1-2026: Ganti dinamo drain + Paraf
  // 2. Cleaning
  // 3. Isi freon
  await db.maintenanceRecords.bulkAdd([
    {
      id: 'rec-galeri-1',
      unitId: unitGaleri1Id,
      nomorUrut: 1,
      tanggal: '29-01-2026',
      uraianPekerjaan: 'Ganti dinamo drain',
      biaya: 450000,
      qty: 1,
      totalHarga: 450000,
      parafUrl: SAMPLE_SIGNATURE,
      keterangan: 'Dinamo drain lama macet & air menetes. Sudah diganti unit baru.',
      teknisiNama: 'Ayah (Teknisi)',
      status: 'Selesai',
      createdAt: new Date('2026-01-29T09:30:00').getTime()
    },
    {
      id: 'rec-galeri-2',
      unitId: unitGaleri1Id,
      nomorUrut: 2,
      tanggal: '29-01-2026',
      uraianPekerjaan: 'Cleaning',
      biaya: 150000,
      qty: 1,
      totalHarga: 150000,
      parafUrl: SAMPLE_SIGNATURE,
      keterangan: 'Cuci filter, blower indoor, dan kondensor outdoor.',
      teknisiNama: 'Ayah (Teknisi)',
      status: 'Selesai',
      createdAt: new Date('2026-01-29T10:45:00').getTime()
    },
    {
      id: 'rec-galeri-3',
      unitId: unitGaleri1Id,
      nomorUrut: 3,
      tanggal: '29-01-2026',
      uraianPekerjaan: 'Isi freon',
      biaya: 300000,
      qty: 1,
      totalHarga: 300000,
      parafUrl: SAMPLE_SIGNATURE,
      keterangan: 'Penambahan freon R410A tekanan 130 psi. Pendinginan optimal.',
      teknisiNama: 'Ayah (Teknisi)',
      status: 'Selesai',
      createdAt: new Date('2026-01-29T11:30:00').getTime()
    }
  ]);
}

// Export database as JSON string for backup
export async function exportDatabaseBackup(): Promise<string> {
  const rooms = await db.rooms.toArray();
  const acUnits = await db.acUnits.toArray();
  const maintenanceRecords = await db.maintenanceRecords.toArray();
  const settings = await db.settings.toArray();

  const backupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    rooms,
    acUnits,
    maintenanceRecords,
    settings: settings[0] || DEFAULT_SETTINGS
  };

  return JSON.stringify(backupData, null, 2);
}

// Import database from JSON string
export async function importDatabaseBackup(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.rooms || !data.acUnits || !data.maintenanceRecords) {
      throw new Error('Format file backup tidak valid');
    }

    await db.transaction('rw', [db.rooms, db.acUnits, db.maintenanceRecords, db.settings], async () => {
      await db.rooms.clear();
      await db.acUnits.clear();
      await db.maintenanceRecords.clear();

      await db.rooms.bulkAdd(data.rooms);
      await db.acUnits.bulkAdd(data.acUnits);
      await db.maintenanceRecords.bulkAdd(data.maintenanceRecords);

      if (data.settings) {
        await db.settings.put({ id: 'default', ...data.settings });
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to import backup:', error);
    return false;
  }
}
