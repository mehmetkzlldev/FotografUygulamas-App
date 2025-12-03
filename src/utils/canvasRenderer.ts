/**
 * Canvas Renderer - Tüm efektleri canvas'a uygulayarak yüksek kaliteli kayıt
 */

import { AdjustSettings } from '../store/useAppStore';
import { TextElement, StickerElement } from '../store/useAppStore';
import { Filter } from './filters';
import { getStickerById } from './stickers';

/**
 * Canvas'a tüm efektleri uygula ve render et
 */
export async function renderImageWithEffects(
  imageSrc: string,
  filter: Filter | null,
  adjustSettings: AdjustSettings,
  textElements: TextElement[],
  stickerElements: StickerElement[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { 
          alpha: true, 
          willReadFrequently: true 
        });
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 4K çözünürlük için boyut hesapla
        // Maksimum 4K (3840x2160) ile sınırla, orijinal boyutu koru
        const max4KWidth = 3840;
        const max4KHeight = 2160;
        
        let finalWidth = img.width;
        let finalHeight = img.height;
        const aspectRatio = img.width / img.height;
        
        // Eğer görsel 4K'dan büyükse, 4K'ya scale et (aspect ratio korunarak)
        if (img.width > max4KWidth || img.height > max4KHeight) {
          if (aspectRatio > max4KWidth / max4KHeight) {
            // Landscape - genişliği 4K yap
            finalWidth = max4KWidth;
            finalHeight = max4KWidth / aspectRatio;
          } else {
            // Portrait - yüksekliği 4K yap
            finalHeight = max4KHeight;
            finalWidth = max4KHeight * aspectRatio;
          }
        }
        // Eğer görsel 4K'dan küçükse, orijinal boyutu koru (kalite kaybı olmasın)
        
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // Yüksek kaliteli rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 1. Görseli yüksek kalitede çiz (4K için scale et)
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

        // 2. Adjust ayarlarını uygula (pixel manipülasyonu)
        applyAdjustments(ctx, adjustSettings, finalWidth, finalHeight);

        // 3. Filter'ı uygula
        if (filter && filter.cssFilter !== 'none') {
          applyCSSFilterToCanvas(ctx, filter.cssFilter, finalWidth, finalHeight);
        }

        // 4. Text elementlerini çiz (4K çözünürlüğe göre scale et)
        textElements.forEach((text) => {
          drawTextElement(ctx, text, finalWidth, finalHeight);
        });

        // 5. Sticker elementlerini çiz (4K çözünürlüğe göre scale et)
        stickerElements.forEach((sticker) => {
          drawStickerElement(ctx, sticker, finalWidth, finalHeight);
        });

        // 6. Yüksek kalitede export (PNG formatı lossless, 4K için ideal)
        // PNG kullanarak tam kalite korunur
        const dataURL = canvas.toDataURL('image/png', 1.0);
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

/**
 * Adjust ayarlarını canvas'a uygula
 */
function applyAdjustments(
  ctx: CanvasRenderingContext2D,
  settings: AdjustSettings,
  width: number,
  height: number
): void {
  if (
    settings.brightness === 0 &&
    settings.contrast === 0 &&
    settings.saturation === 0 &&
    settings.hue === 0 &&
    settings.warmth === 0 &&
    settings.shadows === 0 &&
    settings.highlights === 0
  ) {
    return; // Değişiklik yok
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    if (settings.brightness !== 0) {
      const adjust = (settings.brightness / 100) * 255;
      r = clamp(r + adjust);
      g = clamp(g + adjust);
      b = clamp(b + adjust);
    }

    // Contrast
    if (settings.contrast !== 0) {
      const factor = (259 * (settings.contrast + 100)) / (259 - settings.contrast);
      r = clamp((factor * (r - 128)) + 128);
      g = clamp((factor * (g - 128)) + 128);
      b = clamp((factor * (b - 128)) + 128);
    }

    // Saturation
    if (settings.saturation !== 0) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const factor = settings.saturation / 100;
      r = clamp(gray + (1 + factor) * (r - gray));
      g = clamp(gray + (1 + factor) * (g - gray));
      b = clamp(gray + (1 + factor) * (b - gray));
    }

    // Hue rotation
    if (settings.hue !== 0) {
      const hsl = rgbToHsl(r, g, b);
      hsl[0] = (hsl[0] + settings.hue / 360) % 1;
      const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
      r = rgb[0];
      g = rgb[1];
      b = rgb[2];
    }

    // Warmth
    if (settings.warmth !== 0) {
      const temp = settings.warmth / 100;
      if (temp > 0) {
        r = clamp(r + temp * 15);
        g = clamp(g + temp * 5);
        b = clamp(b - temp * 12);
      } else {
        const coolFactor = Math.max(temp, -1);
        r = clamp(r + coolFactor * 10);
        b = clamp(b - coolFactor * 15);
      }
    }

    // Shadows & Highlights
    if (settings.shadows !== 0 || settings.highlights !== 0) {
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      if (settings.shadows !== 0 && luminance < 128) {
        const shadowFactor = Math.pow((128 - luminance) / 128, 1.5);
        const adjust = (settings.shadows / 100) * shadowFactor * 40;
        r = clamp(r + adjust);
        g = clamp(g + adjust);
        b = clamp(b + adjust);
      }
      
      if (settings.highlights !== 0 && luminance > 128) {
        const highlightFactor = Math.pow((luminance - 128) / 128, 1.5);
        const adjust = (settings.highlights / 100) * highlightFactor * 40;
        r = clamp(r + adjust);
        g = clamp(g + adjust);
        b = clamp(b + adjust);
      }
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * CSS filter'ı canvas'a uygula (basit yaklaşım - filter property kullanarak)
 */
function applyCSSFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  cssFilter: string,
  width: number,
  height: number
): void {
  // CSS filter'ları canvas'a uygulamak için temporary canvas kullan
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;

  // Mevcut görseli temp canvas'a kopyala
  tempCtx.drawImage(ctx.canvas, 0, 0);

  // Filter uygula (canvas filter property ile)
  // Not: Bu bazı tarayıcılarda çalışmayabilir, alternatif olarak
  // CSS filter'ları parse edip pixel manipülasyonu yapılabilir
  // Şimdilik basit yaklaşım kullanıyoruz
  ctx.clearRect(0, 0, width, height);
  
  // Filter'ı parse et ve uygula
  const filters = parseCSSFilter(cssFilter);
  
  // Her filter'ı uygula
  const imageData = tempCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  filters.forEach((filter) => {
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      switch (filter.type) {
        case 'sepia':
          const tr = 0.393 * r + 0.769 * g + 0.189 * b;
          const tg = 0.349 * r + 0.686 * g + 0.168 * b;
          const tb = 0.272 * r + 0.534 * g + 0.131 * b;
          r = clamp(lerp(r, tr, filter.value));
          g = clamp(lerp(g, tg, filter.value));
          b = clamp(lerp(b, tb, filter.value));
          break;
        case 'grayscale':
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = clamp(lerp(r, gray, filter.value));
          g = clamp(lerp(g, gray, filter.value));
          b = clamp(lerp(b, gray, filter.value));
          break;
        case 'brightness':
          r = clamp(r * filter.value);
          g = clamp(g * filter.value);
          b = clamp(b * filter.value);
          break;
        case 'contrast':
          const factor = (259 * (filter.value * 100 + 255)) / (259 - filter.value * 100);
          r = clamp((factor * (r - 128)) + 128);
          g = clamp((factor * (g - 128)) + 128);
          b = clamp((factor * (b - 128)) + 128);
          break;
        case 'saturate':
          const graySat = 0.299 * r + 0.587 * g + 0.114 * b;
          r = clamp(graySat + filter.value * (r - graySat));
          g = clamp(graySat + filter.value * (g - graySat));
          b = clamp(graySat + filter.value * (b - graySat));
          break;
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  });

  ctx.putImageData(imageData, 0, 0);
}

/**
 * CSS filter string'ini parse et
 */
function parseCSSFilter(cssFilter: string): Array<{ type: string; value: number }> {
  const filters: Array<{ type: string; value: number }> = [];
  const regex = /(\w+)\(([^)]+)\)/g;
  let match;

  while ((match = regex.exec(cssFilter)) !== null) {
    const type = match[1];
    const value = parseFloat(match[2]);
    filters.push({ type, value });
  }

  return filters;
}

/**
 * Text elementi çiz
 */
function drawTextElement(
  ctx: CanvasRenderingContext2D,
  textElement: TextElement,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.save();

  const x = (textElement.x / 100) * canvasWidth;
  const y = (textElement.y / 100) * canvasHeight;

  ctx.translate(x, y);
  ctx.rotate((textElement.rotation * Math.PI) / 180);

  const fontWeight = textElement.fontWeight || 'normal';
  const fontSize = Math.max(textElement.fontSize * (canvasWidth / 800), 12); // Scale based on canvas size
  ctx.font = `${fontWeight} ${fontSize}px ${textElement.fontFamily}`;
  ctx.textAlign = textElement.alignment || 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = (textElement.opacity || 100) / 100;

  // Background
  if (textElement.hasBackground && textElement.backgroundColor) {
    const metrics = ctx.measureText(textElement.text);
    ctx.fillStyle = textElement.backgroundColor;
    ctx.fillRect(
      -metrics.width / 2 - 10,
      -fontSize / 2 - 5,
      metrics.width + 20,
      fontSize + 10
    );
  }

  // Text color / gradient
  if (textElement.hasGradient && textElement.gradientColors) {
    const gradient = ctx.createLinearGradient(-100, 0, 100, 0);
    textElement.gradientColors.forEach((color, i) => {
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

  ctx.fillText(textElement.text, 0, 0);
  ctx.restore();
}

/**
 * Sticker elementi çiz (emoji rendering)
 */
function drawStickerElement(
  ctx: CanvasRenderingContext2D,
  stickerElement: StickerElement,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  const sticker = getStickerById(stickerElement.stickerId);
  if (!sticker) return;

  ctx.save();

  const x = (stickerElement.x / 100) * canvasWidth;
  const y = (stickerElement.y / 100) * canvasHeight;

  ctx.translate(x, y);
  ctx.rotate((stickerElement.rotation * Math.PI) / 180);
  ctx.globalAlpha = (stickerElement.opacity || 100) / 100;

  const scaleX = stickerElement.flipHorizontal ? -1 : 1;
  const scaleY = stickerElement.flipVertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // 4K için sticker boyutunu scale et (800px referans genişliği)
  const size = Math.max(stickerElement.size * (canvasWidth / 800), 12);
  ctx.font = `${size}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Shadow
  if (stickerElement.shadow) {
    ctx.shadowColor = stickerElement.shadowColor || '#000000';
    ctx.shadowBlur = stickerElement.shadowBlur || 5;
    ctx.shadowOffsetX = stickerElement.shadowOffsetX || 2;
    ctx.shadowOffsetY = stickerElement.shadowOffsetY || 2;
  }

  // Blur (basit implementasyon)
  if (stickerElement.blur > 0) {
    ctx.filter = `blur(${stickerElement.blur}px)`;
  }

  ctx.fillText(sticker.emoji, 0, 0);
  ctx.restore();
}

// Helper functions
function clamp(value: number): number {
  return Math.min(255, Math.max(0, value));
}

function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

