/**
 * Image Processing Utilities
 * Görsel işleme ve canvas manipülasyon fonksiyonları
 */

/**
 * Görseli yükle ve canvas'a çiz
 * @param src - Görsel URL'i veya data URL
 * @returns Promise<HTMLImageElement>
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    
    img.src = src;
  });
}

/**
 * Canvas'tan data URL oluştur
 * @param canvas - Canvas elementi
 * @param quality - JPEG kalitesi (0-1)
 * @param format - Görsel formatı
 * @returns Data URL
 */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  quality: number = 0.95,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): string {
  return canvas.toDataURL(format, quality);
}

/**
 * Data URL'den blob oluştur
 * @param dataURL - Data URL
 * @returns Promise<Blob>
 */
export function dataURLToBlob(dataURL: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const byteString = atob(dataURL.split(',')[1]);
      const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      resolve(new Blob([ab], { type: mimeString }));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Görseli indir
 * @param dataURL - Data URL
 * @param filename - Dosya adı
 */
export async function downloadImage(dataURL: string, filename: string = 'edited-image.jpg'): Promise<void> {
  try {
    const blob = await dataURLToBlob(dataURL);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Memory cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Canvas'a görsel çiz ve tüm efektleri uygula
 * @param canvas - Canvas elementi
 * @param image - Görsel elementi
 * @param filters - CSS filter string
 * @param textElements - Text elementleri
 * @param stickerElements - Sticker elementleri
 * @returns Processed data URL
 */
export async function renderCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  filters: string = 'none',
  textElements: any[] = [],
  stickerElements: any[] = []
): Promise<string> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // Canvas boyutunu ayarla
  canvas.width = image.width;
  canvas.height = image.height;

  // Görseli çiz
  ctx.drawImage(image, 0, 0);

  // CSS filter'lar canvas'a doğrudan uygulanamaz, bu yüzden
  // burada sadece görseli çiziyoruz
  // Gerçek filter uygulaması için pixel manipülasyonu gerekir

  // Text elementlerini çiz
  for (const text of textElements) {
    drawTextElement(ctx, text, canvas.width, canvas.height);
  }

  // Sticker elementlerini çiz (emoji'ler için text rendering)
  for (const sticker of stickerElements) {
    drawStickerElement(ctx, sticker, canvas.width, canvas.height);
  }

  return canvasToDataURL(canvas);
}

/**
 * Canvas'a text elementi çiz
 */
function drawTextElement(
  ctx: CanvasRenderingContext2D,
  textElement: any,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.save();

  // Pozisyon hesapla
  const x = (textElement.x / 100) * canvasWidth;
  const y = (textElement.y / 100) * canvasHeight;

  // Transform
  ctx.translate(x, y);
  ctx.rotate((textElement.rotation * Math.PI) / 180);

  // Font ayarları
  const fontWeight = textElement.fontWeight || 'normal';
  ctx.font = `${fontWeight} ${textElement.fontSize}px ${textElement.fontFamily}`;
  ctx.textAlign = textElement.alignment || 'center';
  ctx.textBaseline = 'middle';

  // Opacity
  ctx.globalAlpha = (textElement.opacity || 100) / 100;

  // Background
  if (textElement.hasBackground && textElement.backgroundColor) {
    const metrics = ctx.measureText(textElement.text);
    ctx.fillStyle = textElement.backgroundColor;
    ctx.fillRect(
      -metrics.width / 2 - 10,
      -textElement.fontSize / 2 - 5,
      metrics.width + 20,
      textElement.fontSize + 10
    );
  }

  // Text color (gradient support basit)
  if (textElement.hasGradient && textElement.gradientColors) {
    const gradient = ctx.createLinearGradient(-100, 0, 100, 0);
    textElement.gradientColors.forEach((color: string, i: number) => {
      gradient.addColorStop(i / (textElement.gradientColors.length - 1), color);
    });
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = textElement.color || '#000000';
  }

  // Outline
  if (textElement.hasOutline && textElement.outlineWidth > 0) {
    ctx.strokeStyle = textElement.outlineColor || '#FFFFFF';
    ctx.lineWidth = textElement.outlineWidth * 2;
    ctx.strokeText(textElement.text, 0, 0);
  }

  // Shadow
  if (textElement.hasShadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  // Text çiz
  ctx.fillText(textElement.text, 0, 0);

  ctx.restore();
}

/**
 * Canvas'a sticker elementi çiz (emoji rendering)
 */
async function drawStickerElement(
  ctx: CanvasRenderingContext2D,
  stickerElement: any,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  // Emoji rendering için daha gelişmiş bir yöntem gerekir
  // Şimdilik basit bir placeholder
  ctx.save();

  const x = (stickerElement.x / 100) * canvasWidth;
  const y = (stickerElement.y / 100) * canvasHeight;

  ctx.translate(x, y);
  ctx.rotate((stickerElement.rotation * Math.PI) / 180);
  ctx.globalAlpha = (stickerElement.opacity || 100) / 100;

  // Scale
  const scaleX = stickerElement.flipHorizontal ? -1 : 1;
  const scaleY = stickerElement.flipVertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Emoji rendering için font kullan
  ctx.font = `${stickerElement.size}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Sticker'ın emoji'sini al (bu stickerElement.stickerId'den gelmeli)
  // Basit placeholder
  const emoji = '😀'; // Bu getStickerById ile alınmalı

  ctx.fillText(emoji, 0, 0);

  ctx.restore();
}

/**
 * Görsel boyutunu optimize et
 * @param file - File objesi
 * @param maxWidth - Maksimum genişlik
 * @param maxHeight - Maksimum yükseklik
 * @param quality - Kalite (0-1)
 * @returns Optimize edilmiş data URL
 */
export async function optimizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.9
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Boyut hesapla
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Görseli çiz
        ctx.drawImage(img, 0, 0, width, height);

        // Data URL oluştur
        resolve(canvasToDataURL(canvas, quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Base64 string'i File objesine çevir
 * @param dataURL - Data URL
 * @param filename - Dosya adı
 * @returns File objesi
 */
export async function dataURLToFile(
  dataURL: string,
  filename: string = 'image.jpg'
): Promise<File> {
  const blob = await dataURLToBlob(dataURL);
  return new File([blob], filename, { type: blob.type });
}

