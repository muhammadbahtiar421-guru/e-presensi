import { supabase } from './supabaseClient';
import { AppState } from './types';
import { INITIAL_DATA } from './constants';

// Key untuk backup lokal (jaga-jaga jika internet mati)
const LOCAL_BACKUP_KEY = 'sman1_data_backup';

/**
 * [SYNCHRONOUS] Load Data Awal
 * Fungsi ini dipanggil saat inisialisasi state React (useState).
 * Karena useState tidak bisa menunggu (async), kita return data default/backup dulu.
 * Data asli dari cloud akan dimuat oleh useEffect di App.tsx.
 */
export const loadData = (): AppState => {
  try {
    // Coba ambil backup dari local storage agar tampilan tidak kosong melompong
    const localBackup = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (localBackup) {
      return JSON.parse(localBackup);
    }
  } catch (error) {
    console.warn("Gagal membaca backup lokal:", error);
  }
  // Jika tidak ada backup, gunakan data default (kosong)
  return INITIAL_DATA;
};

/**
 * [ASYNCHRONOUS] Fetch Data dari Supabase
 * Fungsi ini dipanggil oleh useEffect di App.tsx
 */
export const fetchDataFromSupabase = async (): Promise<AppState> => {
  try {
    // Ambil baris dengan ID 1 dari tabel app_state
    const { data, error } = await supabase
      .from('app_state')
      .select('content')
      .eq('id', 1)
      .single();

    if (error) {
      // Jika errornya karena data belum ada (baris kosong), kembalikan default
      if (error.code === 'PGRST116') { 
        console.log("Data belum ada di database, menggunakan data awal.");
        return INITIAL_DATA;
      }
      throw error;
    }

    // Jika content di database kosong, kembalikan INITIAL_DATA
    if (!data || !data.content) {
      return INITIAL_DATA;
    }

    // Kembalikan data dari database
    return data.content as AppState;

  } catch (err) {
    console.error("Gagal mengambil data dari Supabase:", err);
    // Jika gagal ambil online, fallback ke loadData() (backup lokal)
    return loadData();
  }
};

/**
 * [ASYNCHRONOUS] Save Data ke Supabase
 * Fungsi ini dipanggil otomatis setiap kali ada perubahan data (Auto-save)
 */
export const saveDataToSupabase = async (newData: AppState) => {
  try {
    // 1. Simpan ke Local Storage dulu sebagai backup instan
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(newData));

    // 2. Simpan ke Supabase (Cloud)
    const { error } = await supabase
      .from('app_state')
      .update({ 
        content: newData,
        updated_at: new Date() // Pastikan kolom ini ada di tabel, atau hapus baris ini jika tidak perlu
      })
      .eq('id', 1);

    if (error) throw error;
    
    console.log("Data berhasil disimpan ke cloud.");

  } catch (err) {
    console.error("Gagal menyimpan data ke Supabase:", err);
    // Tidak perlu throw error agar aplikasi tidak crash, cukup log saja
    // Data tetap aman di localStorage
  }
};

/**
 * Fungsi Legacy (Untuk kompatibilitas kode lama jika ada yang memanggil)
 * Sekarang hanya melakukan backup lokal.
 */
export const saveData = (data: AppState) => {
  localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(data));
};