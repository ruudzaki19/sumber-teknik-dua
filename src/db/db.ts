import Dexie, { type Table } from 'dexie';
import { Room, ACUnit, MaintenanceRecord, CompanySettings, UserProfile, Bon, BonItem } from '../types';

export class ACMakeDatabase extends Dexie {
  rooms!: Table<Room, string>;
  acUnits!: Table<ACUnit, string>;
  maintenanceRecords!: Table<MaintenanceRecord, string>;
  bons!: Table<Bon, string>;
  bonItems!: Table<BonItem, string>;
  settings!: Table<CompanySettings & { id: string }, string>;
  users!: Table<UserProfile, string>;

  constructor() {
    super('SumberTeknikDuaDB');
    this.version(3).stores({
      rooms: 'id, namaRuangan, qrCodeId, createdAt',
      acUnits: 'id, roomId, qrCodeId, merk, jenisAc, ruanganLokasi, createdAt',
      maintenanceRecords: 'id, unitId, tanggal, createdAt',
      bons: 'id, nomorBon, tanggal, kepadaYth, createdAt',
      bonItems: 'id, bonId, createdAt',
      settings: 'id',
      users: 'id, email'
    });
  }
}

export const db = new ACMakeDatabase();

export const DEFAULT_SETTINGS: CompanySettings = {
  namaAplikasi: 'SUMBER TEKNIK DUA',
  tahunDefault: '2026',
  telepon: '0813 8895 9081',
  alamat: 'Komp. Griya Serpong Blok H4/2, Serpong - Tangerang'
};

export const FIXED_SIGNATURE_PATH = '/paraf-fixed.png';
export const FIXED_LOGO_PATH = '/logo-st.svg';
export const SAMPLE_SIGNATURE = FIXED_SIGNATURE_PATH;

// Initial setup
export async function seedInitialDataIfNeeded() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put({
      id: 'default',
      ...DEFAULT_SETTINGS
    });
  }
}

// Clear all room and unit data
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
  const bons = await db.bons.toArray();
  const bonItems = await db.bonItems.toArray();
  const settings = await db.settings.toArray();

  const backupData = {
    version: '3.0',
    appName: 'SUMBER TEKNIK DUA',
    exportDate: new Date().toISOString(),
    rooms,
    acUnits,
    maintenanceRecords,
    bons,
    bonItems,
    settings: settings[0] || DEFAULT_SETTINGS
  };

  return JSON.stringify(backupData, null, 2);
}

// Import database from JSON string
export async function importDatabaseBackup(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    await db.transaction('rw', [db.rooms, db.acUnits, db.maintenanceRecords, db.bons, db.bonItems, db.settings], async () => {
      await db.rooms.clear();
      await db.acUnits.clear();
      await db.maintenanceRecords.clear();
      await db.bons.clear();
      await db.bonItems.clear();

      if (data.rooms && data.rooms.length > 0) {
        await db.rooms.bulkAdd(data.rooms);
      }
      if (data.acUnits && data.acUnits.length > 0) {
        await db.acUnits.bulkAdd(data.acUnits);
      }
      if (data.maintenanceRecords && data.maintenanceRecords.length > 0) {
        await db.maintenanceRecords.bulkAdd(data.maintenanceRecords);
      }
      if (data.bons && data.bons.length > 0) {
        await db.bons.bulkAdd(data.bons);
      }
      if (data.bonItems && data.bonItems.length > 0) {
        await db.bonItems.bulkAdd(data.bonItems);
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
