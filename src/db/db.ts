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
    this.version(2).stores({
      rooms: 'id, namaRuangan, qrCodeId, createdAt',
      acUnits: 'id, roomId, qrCodeId, merk, jenisAc, ruanganLokasi, createdAt',
      maintenanceRecords: 'id, unitId, tanggal, createdAt',
      settings: 'id',
      users: 'id, email'
    });
  }
}

export const db = new ACMakeDatabase();

export const DEFAULT_SETTINGS: CompanySettings = {
  namaAplikasi: 'Sumber Tekhnik 2',
  tahunDefault: '2026'
};

export const FIXED_SIGNATURE_PATH = '/paraf-fixed.png';
export const FIXED_KOP_PATH = '/kop-surat.png';
export const SAMPLE_SIGNATURE = FIXED_SIGNATURE_PATH;

// Initial data: Start EMPTY as requested by the user!
export async function seedInitialDataIfNeeded() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put({
      id: 'default',
      ...DEFAULT_SETTINGS
    });
  }
}

// Clear all room and unit data so initial page starts clean
export async function clearAllRoomsAndUnits() {
  await db.rooms.clear();
  await db.acUnits.clear();
  await db.maintenanceRecords.clear();
}

// Export database as JSON string for backup
export async function exportDatabaseBackup(): Promise<string> {
  const rooms = await db.rooms.toArray();
  const acUnits = await db.acUnits.toArray();
  const maintenanceRecords = await db.maintenanceRecords.toArray();
  const settings = await db.settings.toArray();

  const backupData = {
    version: '2.0',
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
    await db.transaction('rw', [db.rooms, db.acUnits, db.maintenanceRecords, db.settings], async () => {
      await db.rooms.clear();
      await db.acUnits.clear();
      await db.maintenanceRecords.clear();

      if (data.rooms && data.rooms.length > 0) {
        await db.rooms.bulkAdd(data.rooms);
      }
      if (data.acUnits && data.acUnits.length > 0) {
        await db.acUnits.bulkAdd(data.acUnits);
      }
      if (data.maintenanceRecords && data.maintenanceRecords.length > 0) {
        await db.maintenanceRecords.bulkAdd(data.maintenanceRecords);
      }
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
