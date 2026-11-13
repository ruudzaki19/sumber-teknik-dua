import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from './db';
import { Room, ACUnit, MaintenanceRecord, Bon, BonItem } from '../types';

export const dataService = {
  // ================= ROOMS =================
  async getRooms(): Promise<Room[]> {
    if (isSupabaseConfigured && supabase) {
      try {
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
          await db.rooms.clear();
          if (rooms.length > 0) await db.rooms.bulkAdd(rooms);
          return rooms;
        }
      } catch (err) {
        console.warn('Supabase getRooms error, using local fallback:', err);
      }
    }
    return db.rooms.orderBy('createdAt').reverse().toArray();
  },

  async saveRoom(roomData: Omit<Room, 'id' | 'createdAt'> & { id?: string }): Promise<string> {
    const id = roomData.id || `room-${Date.now().toString(36)}`;
    const createdAt = Date.now();

    if (isSupabaseConfigured && supabase) {
      try {
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
      } catch (err) {
        console.warn('Supabase saveRoom error:', err);
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
      try {
        await supabase.from('rooms').delete().eq('id', roomId);
      } catch (err) {
        console.warn('Supabase deleteRoom error:', err);
      }
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
      try {
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
      } catch (err) {
        console.warn('Supabase getUnits error, using local fallback:', err);
      }
    }
    return db.acUnits.orderBy('createdAt').reverse().toArray();
  },

  async getUnitById(unitId: string): Promise<{ unit: ACUnit | null; records: MaintenanceRecord[] }> {
    if (isSupabaseConfigured && supabase) {
      try {
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
      } catch (err) {
        console.warn('Supabase getUnitById error, using local fallback:', err);
      }
    }

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
      try {
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
      } catch (err) {
        console.warn('Supabase saveUnit error:', err);
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
      try {
        await supabase.from('ac_units').delete().eq('id', unitId);
      } catch (err) {
        console.warn('Supabase deleteUnit error:', err);
      }
    }
    await db.acUnits.delete(unitId);
    await db.maintenanceRecords.where('unitId').equals(unitId).delete();
  },

  // ================= MAINTENANCE RECORDS =================
  async getRecords(): Promise<MaintenanceRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
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
      } catch (err) {
        console.warn('Supabase getRecords error, using local fallback:', err);
      }
    }
    return db.maintenanceRecords.toArray();
  },

  async saveRecord(recordData: Omit<MaintenanceRecord, 'id' | 'createdAt'> & { id?: string }): Promise<string> {
    const id = recordData.id || `rec-${Date.now().toString(36)}`;
    const now = Date.now();

    if (isSupabaseConfigured && supabase) {
      try {
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
      } catch (err) {
        console.warn('Supabase saveRecord error:', err);
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
      try {
        await supabase.from('maintenance_records').delete().eq('id', recordId);
      } catch (err) {
        console.warn('Supabase deleteRecord error:', err);
      }
    }
    await db.maintenanceRecords.delete(recordId);
  },

  // ================= BONS / NOTA TRANSAKSI =================
  async getBons(): Promise<Bon[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: bonsData, error: bonErr } = await supabase
          .from('bons')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: itemsData } = await supabase
          .from('bon_items')
          .select('*')
          .order('created_at', { ascending: true });

        if (!bonErr && bonsData) {
          const allItems: BonItem[] = (itemsData || []).map(it => ({
            id: it.id,
            bonId: it.bon_id,
            banyaknya: Number(it.banyaknya) || 1,
            keterangan: it.keterangan || '',
            hargaSatuan: Number(it.harga_satuan) || 0,
            jumlah: Number(it.jumlah) || 0,
            createdAt: Number(it.created_at)
          }));

          const bons: Bon[] = bonsData.map(b => ({
            id: b.id,
            nomorBon: b.nomor_bon,
            tanggal: b.tanggal,
            kepadaYth: b.kepada_yth,
            telpPelanggan: b.telp_pelanggan || '',
            totalJumlah: Number(b.total_jumlah) || 0,
            namaTeknisi: b.nama_teknisi || 'Sumber Teknik Dua',
            namaPenerima: b.nama_penerima || '',
            parafUrl: b.paraf_url || '/paraf-fixed.png',
            items: allItems.filter(it => it.bonId === b.id),
            createdAt: Number(b.created_at),
            updatedAt: Number(b.updated_at)
          }));

          // Mirror locally
          await db.bons.clear();
          await db.bonItems.clear();
          if (bons.length > 0) await db.bons.bulkAdd(bons);
          if (allItems.length > 0) await db.bonItems.bulkAdd(allItems);

          return bons;
        }
      } catch (err) {
        console.warn('Supabase getBons error, using local fallback:', err);
      }
    }

    // Local DB fallback
    const localBons = await db.bons.orderBy('createdAt').reverse().toArray();
    const localItems = await db.bonItems.toArray();
    return localBons.map(b => ({
      ...b,
      items: localItems.filter(it => it.bonId === b.id)
    }));
  },

  async getBonById(bonId: string): Promise<{ bon: Bon | null; items: BonItem[] }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: bData } = await supabase
          .from('bons')
          .select('*')
          .eq('id', bonId)
          .maybeSingle();

        if (bData) {
          const { data: itData } = await supabase
            .from('bon_items')
            .select('*')
            .eq('bon_id', bonId)
            .order('created_at', { ascending: true });

          const items: BonItem[] = (itData || []).map(it => ({
            id: it.id,
            bonId: it.bon_id,
            banyaknya: Number(it.banyaknya) || 1,
            keterangan: it.keterangan || '',
            hargaSatuan: Number(it.harga_satuan) || 0,
            jumlah: Number(it.jumlah) || 0,
            createdAt: Number(it.created_at)
          }));

          const bon: Bon = {
            id: bData.id,
            nomorBon: bData.nomor_bon,
            tanggal: bData.tanggal,
            kepadaYth: bData.kepada_yth,
            telpPelanggan: bData.telp_pelanggan || '',
            totalJumlah: Number(bData.total_jumlah) || 0,
            namaTeknisi: bData.nama_teknisi || 'Sumber Teknik Dua',
            namaPenerima: bData.nama_penerima || '',
            parafUrl: bData.paraf_url || '/paraf-fixed.png',
            items,
            createdAt: Number(bData.created_at),
            updatedAt: Number(bData.updated_at)
          };

          return { bon, items };
        }
      } catch (err) {
        console.warn('Supabase getBonById error:', err);
      }
    }

    const localBon = await db.bons.get(bonId);
    if (localBon) {
      const items = await db.bonItems.where('bonId').equals(bonId).toArray();
      return { bon: localBon, items };
    }

    return { bon: null, items: [] };
  },

  async saveBon(
    bonData: Omit<Bon, 'id' | 'createdAt' | 'updatedAt' | 'items'> & {
      id?: string;
      items: Array<{
        banyaknya: number;
        keterangan: string;
        hargaSatuan: number;
        jumlah: number;
      }>;
    }
  ): Promise<string> {
    const id = bonData.id || `bon-${Date.now().toString(36)}`;
    const now = Date.now();

    // Calculate total from items
    const calculatedTotal = bonData.items.reduce((sum, it) => sum + (Number(it.jumlah) || 0), 0);

    const bonPayload = {
      nomor_bon: bonData.nomorBon,
      tanggal: bonData.tanggal,
      kepada_yth: bonData.kepadaYth,
      telp_pelanggan: bonData.telpPelanggan || '',
      total_jumlah: calculatedTotal,
      nama_teknisi: bonData.namaTeknisi || 'Sumber Teknik Dua',
      nama_penerima: bonData.namaPenerima || '',
      paraf_url: bonData.parafUrl || '/paraf-fixed.png',
      updated_at: now
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (bonData.id) {
          await supabase.from('bons').update(bonPayload).eq('id', bonData.id);
          // Delete old items then re-insert
          await supabase.from('bon_items').delete().eq('bon_id', bonData.id);
        } else {
          await supabase.from('bons').insert({ id, ...bonPayload, created_at: now });
        }

        if (bonData.items.length > 0) {
          const insertItems = bonData.items.map((it, idx) => ({
            id: `item-${Date.now().toString(36)}-${idx}`,
            bon_id: id,
            banyaknya: Number(it.banyaknya) || 1,
            keterangan: it.keterangan || '',
            harga_satuan: Number(it.hargaSatuan) || 0,
            jumlah: Number(it.jumlah) || 0,
            created_at: now + idx
          }));
          await supabase.from('bon_items').insert(insertItems);
        }
      } catch (err) {
        console.warn('Supabase saveBon error:', err);
      }
    }

    // Mirror to local DB
    if (bonData.id) {
      await db.bons.update(bonData.id, {
        nomorBon: bonData.nomorBon,
        tanggal: bonData.tanggal,
        kepadaYth: bonData.kepadaYth,
        telpPelanggan: bonData.telpPelanggan || '',
        totalJumlah: calculatedTotal,
        namaTeknisi: bonData.namaTeknisi || 'Sumber Teknik Dua',
        namaPenerima: bonData.namaPenerima || '',
        parafUrl: bonData.parafUrl || '/paraf-fixed.png',
        updatedAt: now
      });
      await db.bonItems.where('bonId').equals(bonData.id).delete();
    } else {
      await db.bons.add({
        id,
        nomorBon: bonData.nomorBon,
        tanggal: bonData.tanggal,
        kepadaYth: bonData.kepadaYth,
        telpPelanggan: bonData.telpPelanggan || '',
        totalJumlah: calculatedTotal,
        namaTeknisi: bonData.namaTeknisi || 'Sumber Teknik Dua',
        namaPenerima: bonData.namaPenerima || '',
        parafUrl: bonData.parafUrl || '/paraf-fixed.png',
        createdAt: now,
        updatedAt: now
      });
    }

    if (bonData.items.length > 0) {
      const localInsertItems: BonItem[] = bonData.items.map((it, idx) => ({
        id: `item-${Date.now().toString(36)}-${idx}`,
        bonId: id,
        banyaknya: Number(it.banyaknya) || 1,
        keterangan: it.keterangan || '',
        hargaSatuan: Number(it.hargaSatuan) || 0,
        jumlah: Number(it.jumlah) || 0,
        createdAt: now + idx
      }));
      await db.bonItems.bulkAdd(localInsertItems);
    }

    return id;
  },

  async deleteBon(bonId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bon_items').delete().eq('bon_id', bonId);
        await supabase.from('bons').delete().eq('id', bonId);
      } catch (err) {
        console.warn('Supabase deleteBon error:', err);
      }
    }
    await db.bonItems.where('bonId').equals(bonId).delete();
    await db.bons.delete(bonId);
  }
};
