/**
 * MongoDB Utilities
 * MongoDB bağlantısı ve istatistik işlemleri
 * NOT: MongoDB browser'da çalışmaz, bu fonksiyonlar şimdilik localStorage kullanıyor
 */

/**
 * İstatistik interface'i
 */
export interface AppStatistics {
  _id?: string;
  photosEdited: number;
  filtersCount: number;
  activeUsers: number;
  lastUpdated: Date;
  createdAt?: Date;
}

// localStorage key'leri
const STORAGE_KEYS = {
  PHOTOS_EDITED: 'fotografapp_stats_photos_edited',
  FILTERS_COUNT: 'fotografapp_stats_filters_count',
  ACTIVE_USERS: 'fotografapp_stats_active_users',
};

/**
 * localStorage'dan istatistikleri oku
 */
function getLocalStorageStats(): AppStatistics {
  try {
    // localStorage'dan oku, yoksa 0'dan başla
    const photosEdited = parseInt(localStorage.getItem(STORAGE_KEYS.PHOTOS_EDITED) || '0', 10);
    const filtersCount = parseInt(localStorage.getItem(STORAGE_KEYS.FILTERS_COUNT) || '53', 10);
    const activeUsers = parseInt(localStorage.getItem(STORAGE_KEYS.ACTIVE_USERS) || '0', 10);

    return {
      photosEdited,
      filtersCount,
      activeUsers,
      lastUpdated: new Date(),
    };
  } catch (error) {
    // localStorage erişilemezse varsayılan değerler
    return {
      photosEdited: 0,
      filtersCount: 53,
      activeUsers: 0,
      lastUpdated: new Date(),
    };
  }
}

/**
 * localStorage'a istatistikleri kaydet
 */
function saveLocalStorageStats(stats: Partial<AppStatistics>): void {
  const current = getLocalStorageStats();
  if (stats.photosEdited !== undefined) {
    localStorage.setItem(STORAGE_KEYS.PHOTOS_EDITED, stats.photosEdited.toString());
  }
  if (stats.filtersCount !== undefined) {
    localStorage.setItem(STORAGE_KEYS.FILTERS_COUNT, stats.filtersCount.toString());
  }
  if (stats.activeUsers !== undefined) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USERS, stats.activeUsers.toString());
  }
}

/**
 * İstatistikleri oku (localStorage'dan)
 */
export async function getStatistics(): Promise<AppStatistics | null> {
  try {
    // Browser'da çalışıyoruz, localStorage kullan
    return getLocalStorageStats();
  } catch (error) {
    console.error('İstatistik okuma hatası:', error);
    return null;
  }
}

/**
 * İstatistikleri kaydet (localStorage'a)
 */
export async function saveStatistics(stats: Partial<AppStatistics>): Promise<boolean> {
  try {
    saveLocalStorageStats(stats);
    console.log('İstatistikler kaydedildi (localStorage):', stats);
    return true;
  } catch (error) {
    console.error('İstatistik kaydetme hatası:', error);
    return false;
  }
}

/**
 * Düzenlenen fotoğraf sayısını artır
 */
export async function incrementPhotosEdited(): Promise<void> {
  try {
    const current = getLocalStorageStats();
    const newCount = (current.photosEdited || 0) + 1;
    saveLocalStorageStats({ photosEdited: newCount });
    console.log('Fotoğraf sayısı artırıldı:', newCount);
  } catch (error) {
    console.error('Fotoğraf sayısı artırma hatası:', error);
  }
}

/**
 * Aktif kullanıcı sayısını artır
 */
export async function incrementActiveUsers(): Promise<void> {
  try {
    const current = getLocalStorageStats();
    const newCount = (current.activeUsers || 0) + 1;
    saveLocalStorageStats({ activeUsers: newCount });
    console.log('Kullanıcı sayısı artırıldı:', newCount);
  } catch (error) {
    console.error('Kullanıcı sayısı artırma hatası:', error);
  }
}

/**
 * İstatistikleri artır (toplu)
 */
export async function updateStatistics(updates: {
  photosEdited?: number;
  filtersCount?: number;
  activeUsers?: number;
}): Promise<boolean> {
  try {
    saveLocalStorageStats(updates);
    return true;
  } catch (error) {
    console.error('İstatistik güncelleme hatası:', error);
    return false;
  }
}

