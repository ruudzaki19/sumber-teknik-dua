import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from './db';
import { Room, ACUnit, MaintenanceRecord } from '../types';

export const dataService = {
  // ================= ROOMS =================
  async getRooms(): Promise<Room[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const rooms: Room[] = data.map(r => ({
          id: r.id,
          namaRuangan: r.nama_ruangan,
          createdAt: Number(r.created_at)
        }));
        // Mirror to local db
        await db.rooms.clear();
        if (rooms.length > 0) await db.rooms.bulkAdd(rooms);
        return rooms;
      }
    }
    return db.rooms.orderBy('createdAt').reverse().toArray();
  },

  async saveRoom(roomData: Omit<Room, 'id' | 'createdAt'> & { id?: string }): Promise<string> {
    const id = roomData.id || `room-${Date.now().toString(36)}`;
    const createdAt = Date.now();

    if (isSupabaseConfigured && supabase) {
      if (roomData.id) {
        await supabase
          .from('rooms')
          .update({ nama_ruangan: roomData.namaRuangan })
          .eq('id', roomData.id);
      } else {
        await supabase
          .from('rooms')
          .insert({ id, nama_ruangan: roomData.namaRuangan, created_at: createdAt });
      }
    }

    if (roomData.id) {
      await db.rooms.update(roomData.id, { namaRuangan: roomData.namaRuangan });
    } else {
      await db.rooms.add({ id, namaRuangan: roomData.namaRuangan, createdAt });
    }

    return id;
  },

  async deleteRoom(roomId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('rooms').delete().eq('id', roomId);
    }
    await db.rooms.delete(roomId);
    const relatedUnits = await db.acUnits.where('roomId').equals(roomId).toArray();
    for (const u of relatedUnits) {
      await db.maintenanceRecords.where('unitId').equals(u.id).delete();
    }
    await db.acUnits.where('roomId').equals(roomId).delete();
  },

  // ================= AC UNITS =================
  async getUnits(): Promise<ACUnit[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ac_units')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const units: ACUnit[] = data.map(u => ({
          id: u.id,
          roomId: u.room_id,
          mitra: u.mitra || '',
          jenisAc: u.jenis_ac || '',
          merk: u.merk || '',
          typeModel: u.type_model || '',
          kapasitas: u.kapasitas || '',
          noSeri: u.no_seri || '',
          ruanganLokasi: u.ruangan_lokasi || '',
          tahunPemasangan: u.tahun_pemasangan || '2026',
          createdAt: Number(u.created_at),
          updatedAt: Number(u.updated_at)
        }));
        await db.acUnits.clear();
        if (units.length > 0) await db.acUnits.bulkAdd(units);
        return units;
      }
    }
    return db.acUnits.orderBy('createdAt').reverse().toArray();
  },

  async getUnitById(unitId: string): Promise<{ unit: ACUnit | null; records: MaintenanceRecord[] }> {
    if (isSupabaseConfigured && supabase) {
      const { data: unitData } = await supabase
        .from('ac_units')
        .select('*')
        .eq('id', unitId)
        .single();

      if (unitData) {
        const unit: ACUnit = {
          id: unitData.id,
          roomId: unitData.room_id,
          mitra: unitData.mitra || '',
          jenisAc: unitData.jenis_ac || '',
          merk: unitData.merk || '',
          typeModel: unitData.type_model || '',
          kapasitas: unitData.kapasitas || '',
          noSeri: unitData.no_seri || '',
          ruanganLokasi: unitData.ruangan_lokasi || '',
          tahunPemasangan: unitData.tahun_pemasangan || '2026',
          createdAt: Number(unitData.created_at),
          updatedAt: Number(unitData.updated_at)
        };

        const { data: recData } = await supabase
          .from('maintenance_records')
          .select('*')
          .eq('unit_id', unitId)
          .order('nomor_urut', { ascending: true });

        const records: MaintenanceRecord[] = (recData || []).map(r => ({
          id: r.id,
          unitId: r.unit_id,
          nomorUrut: r.nomor_urut,
          tanggal: r.tanggal,
          uraianPekerjaan: r.uraian_pekerjaan,
          parafUrl: r.paraf_url || '/paraf-fixed.png',
          createdAt: Number(r.created_at)
        }));

        return { unit, records };
      }
    }

    // Local fallback
    const localUnit = await db.acUnits.get(unitId);
    if (localUnit) {
      const localRecords = await db.maintenanceRecords
        .where('unitId')
        .equals(unitId)
        .sortBy('nomorUrut');
      return { unit: localUnit, records: localRecords };
    }

    return { unit: null, records: [] };
  },

  async saveUnit(unitData: Omit<ACUnit, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> {
    const id = unitData.id || `unit-${Date.now().toString(36)}`;
    const now = Date.now();

    if (isSupabaseConfigured && supabase) {
      const payload = {
        room_id: unitData.roomId,
        mitra: unitData.mitra,
        jenis_ac: unitData.jenisAc,
        merk: unitData.merk,
        type_model: unitData.typeModel,
        kapasitas: unitData.kapasitas,
        no_seri: unitData.noSeri,
        ruangan_lokasi: unitData.ruanganLokasi,
        tahun_pemasangan: unitData.tahunPemasangan || '2026',
        updated_at: now
      };

      if (unitData.id) {
        await supabase.from('ac_units').update(payload).eq('id', unitData.id);
      } else {
        await supabase.from('ac_units').insert({ id, ...payload, created_at: now });
      }
    }

    if (unitData.id) {
      await db.acUnits.update(unitData.id, { ...unitData, updatedAt: now });
    } else {
      await db.acUnits.add({ id, ...unitData, createdAt: now, updatedAt: now });
    }

    return id;
  },

  async deleteUnit(unitId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('ac_units').delete().eq('id', unitId);
    }
    await db.acUnits.delete(unitId);
    await db.maintenanceRecords.where('unitId').equals(unitId).delete();
  },

  // ================= MAINTENANCE RECORDS =================
  async getRecords(): Promise<MaintenanceRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .order('nomor_urut', { ascending: true });

      if (!error && data) {
        const records: MaintenanceRecord[] = data.map(r => ({
          id: r.id,
          unitId: r.unit_id,
          nomorUrut: r.nomor_urut,
          tanggal: r.tanggal,
          uraianPekerjaan: r.uraian_pekerjaan,
          parafUrl: r.paraf_url || '/paraf-fixed.png',
          createdAt: Number(r.created_at)
        }));
        await db.maintenanceRecords.clear();
        if (records.length > 0) await db.maintenanceRecords.bulkAdd(records);
        return records;
      }
    }
    return db.maintenanceRecords.toArray();
  },

  async saveRecord(recordData: Omit<MaintenanceRecord, 'id' | 'createdAt'> & { id?: string }): Promise<string> {
    const id = recordData.id || `rec-${Date.now().toString(36)}`;
    const now = Date.now();

    if (isSupabaseConfigured && supabase) {
      const payload = {
        unit_id: recordData.unitId,
        nomor_urut: recordData.nomorUrut || 1,
        tanggal: recordData.tanggal,
        uraian_pekerjaan: recordData.uraianPekerjaan,
        paraf_url: recordData.parafUrl || '/paraf-fixed.png'
      };

      if (recordData.id) {
        await supabase.from('maintenance_records').update(payload).eq('id', recordData.id);
      } else {
        await supabase.from('maintenance_records').insert({ id, ...payload, created_at: now });
      }
    }

    if (recordData.id) {
      await db.maintenanceRecords.update(recordData.id, recordData);
    } else {
      await db.maintenanceRecords.add({ id, ...recordData, createdAt: now });
    }

    return id;
  },

  async deleteRecord(recordId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('maintenance_records').delete().eq('id', recordId);
    }
    await db.maintenanceRecords.delete(recordId);
  }
};
