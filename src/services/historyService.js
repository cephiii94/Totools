import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'totools_history_guest';

/**
 * Menyimpan entri riwayat baru
 */
export async function saveToolHistory(user, toolType, title, content) {
  const item = {
    id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    tool_type: toolType,
    title,
    content,
    created_at: new Date().toISOString()
  };

  if (user && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('tool_history')
        .insert([{
          user_id: user.id,
          tool_type: toolType,
          title,
          content
        }])
        .select();

      if (!error && data && data[0]) {
        return { success: true, data: data[0], source: 'supabase' };
      }
    } catch (err) {
      console.error('Gagal menyimpan ke Supabase, beralih ke LocalStorage:', err);
    }
  }

  // Fallback ke LocalStorage (untuk Guest atau jika Supabase offline)
  try {
    const existing = getLocalHistory();
    const updated = [item, ...existing].slice(0, 50); // Simpan maks 50 entri lokal
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, data: item, source: 'local' };
  } catch (e) {
    console.error('Gagal menyimpan ke LocalStorage:', e);
    return { success: false, error: e };
  }
}

/**
 * Mengambil daftar riwayat penggunaan tool
 */
export async function getToolHistory(user, toolType = null) {
  if (user && isSupabaseConfigured) {
    try {
      let query = supabase
        .from('tool_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (toolType) {
        query = query.eq('tool_type', toolType);
      }

      const { data, error } = await query;
      if (!error) {
        return { success: true, data: data || [], source: 'supabase' };
      }
    } catch (err) {
      console.error('Gagal membaca dari Supabase, beralih ke LocalStorage:', err);
    }
  }

  // Fallback ke LocalStorage
  let localData = getLocalHistory();
  if (toolType) {
    localData = localData.filter((item) => item.tool_type === toolType);
  }
  return { success: true, data: localData, source: 'local' };
}

/**
 * Menghapus entri riwayat tertentu
 */
export async function deleteToolHistory(user, historyId) {
  if (user && isSupabaseConfigured && !historyId.toString().startsWith('local_')) {
    try {
      const { error } = await supabase
        .from('tool_history')
        .delete()
        .eq('id', historyId);

      if (!error) {
        return { success: true };
      }
    } catch (err) {
      console.error('Gagal menghapus dari Supabase:', err);
    }
  }

  // Hapus dari LocalStorage
  try {
    const existing = getLocalHistory();
    const filtered = existing.filter((item) => item.id !== historyId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (e) {
    return { success: false, error: e };
  }
}

function getLocalHistory() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
