/**
 * Error Handling Utilities
 * Hata yönetimi ve logging fonksiyonları
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: number;
  context?: Record<string, any>;
}

/**
 * Hata yakalama ve loglama
 * @param error - Hata objesi
 * @param context - Ek bağlam bilgileri
 */
export function handleError(error: unknown, context?: Record<string, any>): void {
  const errorInfo: ErrorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: Date.now(),
    context,
  };

  // Console'a yazdır
  console.error('Error:', errorInfo);

  // Production'da bir error tracking servisine gönderilebilir
  // Örn: Sentry, LogRocket, vs.
  if (process.env.NODE_ENV === 'production') {
    // trackError(errorInfo);
  }
}

/**
 * Try-catch wrapper - Async fonksiyonları güvenli çalıştır
 * @param fn - Çalıştırılacak async fonksiyon
 * @param fallback - Hata durumunda çalışacak fallback değer
 * @returns Fonksiyon sonucu veya fallback
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    handleError(error);
    return fallback;
  }
}

/**
 * Try-catch wrapper - Sync fonksiyonları güvenli çalıştır
 * @param fn - Çalıştırılacak fonksiyon
 * @param fallback - Hata durumunda çalışacak fallback değer
 * @returns Fonksiyon sonucu veya fallback
 */
export function safeSync<T>(fn: () => T, fallback?: T): T | undefined {
  try {
    return fn();
  } catch (error) {
    handleError(error);
    return fallback;
  }
}

/**
 * Retry mekanizması - Başarısız olan işlemi tekrar dene
 * @param fn - Çalıştırılacak async fonksiyon
 * @param maxRetries - Maksimum deneme sayısı
 * @param delay - Her deneme arası bekleme süresi (ms)
 * @returns Fonksiyon sonucu
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Timeout wrapper - İşlemi zaman aşımına uğrat
 * @param promise - Çalıştırılacak promise
 * @param timeout - Zaman aşımı süresi (ms)
 * @returns Promise sonucu
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeout)
    ),
  ]);
}

