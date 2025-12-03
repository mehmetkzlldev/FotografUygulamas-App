/**
 * LocalStorage Utilities
 * Tarayıcı storage işlemleri için yardımcı fonksiyonlar
 */

const STORAGE_PREFIX = 'fotografApp_';

/**
 * LocalStorage'a veri kaydet
 * @param key - Anahtar
 * @param value - Değer (otomatik JSON.stringify yapılır)
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * LocalStorage'dan veri oku
 * @param key - Anahtar
 * @param defaultValue - Varsayılan değer
 * @returns Okunan değer veya varsayılan değer
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * LocalStorage'dan veri sil
 * @param key - Anahtar
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/**
 * Tüm app storage'ını temizle
 */
export function clearAppStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing app storage:', error);
  }
}

/**
 * Storage'daki tüm anahtarları listele
 * @returns Anahtar listesi (prefix olmadan)
 */
export function getStorageKeys(): string[] {
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.replace(STORAGE_PREFIX, ''));
  } catch (error) {
    console.error('Error getting storage keys:', error);
    return [];
  }
}

/**
 * Storage kullanılabilir mi kontrol et
 * @returns Storage kullanılabilir mi?
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

