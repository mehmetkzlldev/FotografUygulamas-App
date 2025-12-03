/**
 * Performance Utilities
 * Debounce, throttle ve diğer performans optimizasyon fonksiyonları
 */

/**
 * Debounce - Fonksiyonun çağrılmasını belirli bir süre geciktirir
 * @param func - Geciktirilecek fonksiyon
 * @param wait - Bekleme süresi (ms)
 * @returns Debounced fonksiyon
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle - Fonksiyonun belirli aralıklarla çağrılmasını sağlar
 * @param func - Throttle edilecek fonksiyon
 * @param limit - Minimum çağrılma aralığı (ms)
 * @returns Throttled fonksiyon
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request Animation Frame Throttle - Daha akıcı animasyonlar için
 * @param func - Throttle edilecek fonksiyon
 * @returns Throttled fonksiyon
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func(...args);
        rafId = null;
      });
    }
  };
}

/**
 * Clamp - Değeri min ve max arasında tutar
 * @param value - Değer
 * @param min - Minimum değer
 * @param max - Maksimum değer
 * @returns Clamped değer
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Lerp - Linear interpolation
 * @param start - Başlangıç değeri
 * @param end - Bitiş değeri
 * @param factor - İnterpolasyon faktörü (0-1)
 * @returns İnterpolasyon sonucu
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Ease In Out Cubic - Yumuşak geçiş fonksiyonu
 * @param t - Zaman faktörü (0-1)
 * @returns Eased değer
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Memory efficient array chunk
 * @param array - Bölünecek array
 * @param size - Her chunk'ın boyutu
 * @returns Chunk'lara bölünmüş array
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

