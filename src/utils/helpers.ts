/**
 * General Helper Utilities
 * Genel kullanım için yardımcı fonksiyonlar
 */

/**
 * Benzersiz ID oluştur
 * @returns Benzersiz ID string
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Format file size
 * @param bytes - Byte cinsinden boyut
 * @returns Formatlanmış boyut string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * URL'den dosya uzantısını al
 * @param url - URL veya dosya adı
 * @returns Uzantı (örn: 'jpg', 'png')
 */
export function getFileExtension(url: string): string {
  return url.split('.').pop()?.toLowerCase() || '';
}

/**
 * Dosya adını uzantısız al
 * @param filename - Dosya adı
 * @returns Uzantısız dosya adı
 */
export function getFileNameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Renk hex'ini rgba'ya çevir
 * @param hex - Hex renk kodu (#RRGGBB veya #RRGGBBAA)
 * @param alpha - Alpha değeri (0-1)
 * @returns RGBA string
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Copy text to clipboard
 * @param text - Kopyalanacak metin
 * @returns Başarılı mı?
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}

/**
 * Download URL'i aç (yeni sekmede)
 * @param url - URL
 */
export function openUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Share API kullanarak paylaş
 * @param data - Paylaşılacak data
 * @returns Başarılı mı?
 */
export async function shareData(data: {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    } else {
      // Fallback: URL'i kopyala
      if (data.url) {
        return await copyToClipboard(data.url);
      }
      return false;
    }
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
}

/**
 * Get image dimensions
 * @param src - Görsel URL'i
 * @returns Görsel boyutları
 */
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Sleep/delay fonksiyonu
 * @param ms - Milisaniye
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deep clone objesi
 * @param obj - Klonlanacak obje
 * @returns Klonlanmış obje
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Obje'nin boş olup olmadığını kontrol et
 * @param obj - Kontrol edilecek obje
 * @returns Boş mu?
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

