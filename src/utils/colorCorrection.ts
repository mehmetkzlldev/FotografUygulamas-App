/**
 * Color Correction Utilities - Resim Tipine Göre Akıllı Düzeltme
 * Görsel analizi ile otomatik mod seçimi ve özelleştirilmiş düzeltme
 */

/**
 * Clamp value between 0-255
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

/**
 * RGB to HSL conversion
 */
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

/**
 * HSL to RGB conversion
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Görsel Tipi: Analiz edip resmin türünü tespit et
 */
export type ImageMode = 'portrait' | 'landscape' | 'night' | 'indoor' | 'balanced';

interface ImageAnalysis {
  mode: ImageMode;
  avgLuminance: number;
  contrast: number;
  saturation: number;
  skinToneRatio: number;
  skyRatio: number;
  blueRatio: number;
  warmRatio: number;
}

/**
 * Görsel analizi yap ve mod belirle
 */
export function analyzeImage(data: Uint8ClampedArray, width: number, height: number): ImageAnalysis {
  let totalLum = 0;
  let minLum = 255;
  let maxLum = 0;
  let totalSaturation = 0;
  let skinToneCount = 0;
  let skyCount = 0; // Üst %30 alanda mavi/gri tonlar
  let blueCount = 0;
  let warmCount = 0;
  let count = 0;

  const topRegionHeight = Math.floor(height * 0.3); // Üst %30 (gökyüzü için)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const luminance = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
    totalLum += luminance;
    minLum = Math.min(minLum, luminance);
    maxLum = Math.max(maxLum, luminance);

    const hsl = rgbToHsl(r, g, b);
    totalSaturation += hsl[1];

    // Skin tone detection (portre için)
    const hue = hsl[0];
    if ((hue > 0.05 && hue < 0.15) && hsl[1] > 0.15 && hsl[1] < 0.7 && hsl[2] > 0.3 && hsl[2] < 0.9) {
      skinToneCount++;
    }

    // Sky detection (üst bölgede mavi/gri)
    const y = Math.floor((i / 4) / width);
    if (y < topRegionHeight) {
      const isBlue = (hue > 0.5 && hue < 0.7) || (hue > 0.4 && hue < 0.6 && hsl[2] > 0.5);
      const isGray = hsl[1] < 0.2 && hsl[2] > 0.4 && hsl[2] < 0.8;
      if (isBlue || isGray) {
        skyCount++;
      }
    }

    // Blue colors (mavi tonlar)
    if (hue > 0.5 && hue < 0.7) {
      blueCount++;
    }

    // Warm colors (turuncu/sarı/kırmızı)
    if (hue < 0.15 || hue > 0.9) {
      warmCount++;
    }

    count++;
  }

  const avgLuminance = totalLum / count;
  const contrast = maxLum - minLum;
  const saturation = totalSaturation / count;
  const skinToneRatio = skinToneCount / count;
  const skyRatio = skyCount / (topRegionHeight * width);
  const blueRatio = blueCount / count;
  const warmRatio = warmCount / count;

  // Mod belirleme mantığı
  let mode: ImageMode = 'balanced';

  // Gece fotoğrafı (düşük parlaklık, düşük kontrast)
  if (avgLuminance < 70 && contrast < 120) {
    mode = 'night';
  }
  // Portre (yüksek skin tone oranı)
  else if (skinToneRatio > 0.15) {
    mode = 'portrait';
  }
  // Manzara (gökyüzü var, mavi tonlar fazla)
  else if (skyRatio > 0.4 && blueRatio > 0.2) {
    mode = 'landscape';
  }
  // İç mekan (warm tonlar fazla, orta parlaklık)
  else if (warmRatio > 0.3 && avgLuminance > 80 && avgLuminance < 150) {
    mode = 'indoor';
  }

  return {
    mode,
    avgLuminance,
    contrast,
    saturation,
    skinToneRatio,
    skyRatio,
    blueRatio,
    warmRatio,
  };
}

/**
 * Mod bazlı White Balance
 */
function modeBasedWhiteBalance(data: Uint8ClampedArray, mode: ImageMode, analysis: ImageAnalysis): { rGain: number; gGain: number; bGain: number } {
  let totalR = 0, totalG = 0, totalB = 0;
  let count = 0;

  // Moda göre farklı sample alma stratejisi
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    let include = true;

    // Portre: Skin tone'ları atla (doğal ten rengini koru)
    if (mode === 'portrait') {
      const hsl = rgbToHsl(r, g, b);
      const isSkinTone = (hsl[0] > 0.05 && hsl[0] < 0.15) && hsl[1] > 0.15;
      if (isSkinTone) include = false;
    }
    // Manzara: Çok parlak gökyüzünü atla
    else if (mode === 'landscape' && luminance > 220) {
      include = false;
    }
    // Gece: Çok koyu pikselleri atla
    else if (mode === 'night' && luminance < 30) {
      include = false;
    }

    if (include) {
      totalR += r;
      totalG += g;
      totalB += b;
      count++;
    }
  }

  if (count === 0) {
    // Fallback: tüm pikseller
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }
  }

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;
  const avgLuminance = (avgR + avgG + avgB) / 3;

  let rGain = avgLuminance / (avgR || 1);
  let gGain = avgLuminance / (avgG || 1);
  let bGain = avgLuminance / (avgB || 1);

  // Mod bazlı gain ayarlamaları
  if (mode === 'night') {
    // Gece: Biraz daha warm (sıcak)
    rGain *= 1.05;
    bGain *= 0.95;
  } else if (mode === 'landscape') {
    // Manzara: Biraz daha cool (serin)
    rGain *= 0.98;
    bGain *= 1.02;
  } else if (mode === 'indoor') {
    // İç mekan: Biraz daha warm
    rGain *= 1.03;
    bGain *= 0.97;
  }

  // Normalize
  const maxGain = Math.max(rGain, gGain, bGain);
  const normalizeFactor = Math.min(maxGain, 1.8);

  return {
    rGain: 0.7 + (rGain / normalizeFactor - 1) * 0.3,
    gGain: 0.7 + (gGain / normalizeFactor - 1) * 0.3,
    bGain: 0.7 + (bGain / normalizeFactor - 1) * 0.3,
  };
}

/**
 * Mod bazlı Exposure
 */
function modeBasedExposure(data: Uint8ClampedArray, mode: ImageMode, analysis: ImageAnalysis): { exposure: number; shadows: number } {
  const { avgLuminance, contrast } = analysis;
  let exposureAdjust = 0;
  let shadowsAdjust = 0;

  if (mode === 'night') {
    // Gece: Biraz aydınlat, shadow lift güçlü
    const targetLum = 85;
    exposureAdjust = (targetLum - avgLuminance) / 200;
    shadowsAdjust = Math.min(0.35, (80 - avgLuminance) / 100);
  } else if (mode === 'portrait') {
    // Portre: Yumuşak exposure, hafif shadow lift
    const targetLum = 120;
    exposureAdjust = (targetLum - avgLuminance) / 250;
    shadowsAdjust = avgLuminance < 110 ? 0.15 : 0;
  } else if (mode === 'landscape') {
    // Manzara: Dengeli, shadow lift orta
    const targetLum = 115;
    exposureAdjust = (targetLum - avgLuminance) / 220;
    shadowsAdjust = contrast < 150 ? 0.2 : 0.1;
  } else if (mode === 'indoor') {
    // İç mekan: Biraz parlaklaştır
    const targetLum = 125;
    exposureAdjust = (targetLum - avgLuminance) / 240;
    shadowsAdjust = 0.1;
  } else {
    // Balanced: Genel yaklaşım
    const targetLum = 110;
    exposureAdjust = (targetLum - avgLuminance) / 180;
    shadowsAdjust = avgLuminance < 90 ? 0.2 : 0;
  }

  return {
    exposure: Math.max(-0.4, Math.min(0.4, exposureAdjust)),
    shadows: Math.max(0, Math.min(0.35, shadowsAdjust)),
  };
}

/**
 * Mod bazlı Saturation
 */
function modeBasedSaturation(data: Uint8ClampedArray, mode: ImageMode, analysis: ImageAnalysis): { saturation: number } {
  const { saturation: avgSaturation, skinToneRatio } = analysis;
  let targetSaturation = 0.45;
  let saturationAdjust = 0;

  if (mode === 'portrait') {
    // Portre: Düşük saturation (doğal ten)
    targetSaturation = 0.35;
    saturationAdjust = (targetSaturation - avgSaturation) * 1.0;
    // Skin tone koruma
    if (skinToneRatio > 0.1) {
      saturationAdjust *= (1 - skinToneRatio * 0.5);
    }
  } else if (mode === 'landscape') {
    // Manzara: Yüksek saturation (canlı doğa)
    targetSaturation = 0.55;
    saturationAdjust = (targetSaturation - avgSaturation) * 1.3;
  } else if (mode === 'night') {
    // Gece: Orta saturation (doğal gece görünümü)
    targetSaturation = 0.4;
    saturationAdjust = (targetSaturation - avgSaturation) * 1.1;
  } else if (mode === 'indoor') {
    // İç mekan: Orta-yüksek saturation
    targetSaturation = 0.5;
    saturationAdjust = (targetSaturation - avgSaturation) * 1.2;
  } else {
    // Balanced
    saturationAdjust = (targetSaturation - avgSaturation) * 1.2;
  }

  return {
    saturation: Math.max(-0.15, Math.min(0.7, saturationAdjust)),
  };
}

/**
 * Mod bazlı Contrast
 */
function modeBasedContrast(data: Uint8ClampedArray, mode: ImageMode, analysis: ImageAnalysis): number {
  const { contrast } = analysis;
  let targetRange = 200;
  let contrastAdjust = 0;

  if (mode === 'portrait') {
    // Portre: Yumuşak kontrast
    targetRange = 180;
    if (contrast < 140) {
      contrastAdjust = (targetRange - contrast) / 250;
    }
  } else if (mode === 'landscape') {
    // Manzara: Güçlü kontrast
    targetRange = 220;
    if (contrast < 160) {
      contrastAdjust = (targetRange - contrast) / 180;
    }
  } else if (mode === 'night') {
    // Gece: Orta kontrast
    targetRange = 190;
    if (contrast < 130) {
      contrastAdjust = (targetRange - contrast) / 220;
    }
  } else {
    // Balanced/Indoor
    if (contrast < 140) {
      contrastAdjust = (targetRange - contrast) / 200;
    }
  }

  return Math.max(0, Math.min(0.5, contrastAdjust));
}

/**
 * Mod bilgisini metin olarak döndür
 */
export function getModeDescription(mode: ImageMode): string {
  const descriptions: Record<ImageMode, string> = {
    portrait: 'Portre - Cilt tonlarını koruyarak doğal görünüm',
    landscape: 'Manzara - Gökyüzü ve doğa renklerini canlandırma',
    night: 'Gece - Düşük ışık koşulları için optimize',
    indoor: 'İç Mekan - Sıcak tonlar ve yumuşak ışık',
    balanced: 'Dengeli - Genel amaçlı otomatik düzeltme',
  };
  return descriptions[mode];
}

/**
 * Ana Fonksiyon: Resim Tipine Göre Akıllı Renk Düzeltme
 */
export function autoColorCorrection(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: true });
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Try-catch ile hata kontrolü
        if (!data || data.length === 0) {
          reject(new Error('Image data is empty'));
          return;
        }

        // Görsel analizi
        const analysis = analyzeImage(data, canvas.width, canvas.height);
        const { mode } = analysis;

        // Mod bazlı düzeltmeler
        const whiteBalance = modeBasedWhiteBalance(data, mode, analysis);
        const exposureData = modeBasedExposure(data, mode, analysis);
        const saturationData = modeBasedSaturation(data, mode, analysis);
        const contrastAdjust = modeBasedContrast(data, mode, analysis);

        // Düzeltmeleri uygula
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // 1. White Balance
          r = r * whiteBalance.rGain;
          g = g * whiteBalance.gGain;
          b = b * whiteBalance.bGain;

          // 2. Exposure
          const exposureFactor = 1 + exposureData.exposure;
          r = r * exposureFactor;
          g = g * exposureFactor;
          b = b * exposureFactor;

          // 3. Shadows
          if (exposureData.shadows > 0) {
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            if (luminance < 100) {
              const shadowFactor = Math.pow((100 - luminance) / 100, 1.2);
              const shadowLift = exposureData.shadows * shadowFactor * 40;
              r += shadowLift;
              g += shadowLift;
              b += shadowLift;
            }
          }

          // 4. Contrast
          if (contrastAdjust > 0) {
            const factor = (259 * (contrastAdjust * 100 + 100)) / (259 - contrastAdjust * 100);
            r = (factor * (r - 128)) + 128;
            g = (factor * (g - 128)) + 128;
            b = (factor * (b - 128)) + 128;
          }

          // 5. Saturation
          if (saturationData.saturation !== 0) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const factor = saturationData.saturation;
            r = gray + (1 + factor) * (r - gray);
            g = gray + (1 + factor) * (g - gray);
            b = gray + (1 + factor) * (b - gray);
          }

          data[i] = clamp(r);
          data[i + 1] = clamp(g);
          data[i + 2] = clamp(b);
        }

        ctx.putImageData(imageData, 0, 0);
        const dataURL = canvas.toDataURL('image/png', 1.0);
        resolve(dataURL);
      } catch (error) {
        console.error('ColorCorrection error:', error);
        reject(error);
      }
    };

    img.onerror = (e) => {
      console.error('Image load error:', e);
      reject(new Error('Failed to load image'));
    };
    img.src = imageSrc;
  });
}

/**
 * Görsel analiz fonksiyonu (dışa aktarıldı)
 */

/**
 * Preview için renk düzeltme (analiz + düzeltme)
 */
export function previewColorCorrection(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Preview için düşük çözünürlük
        const maxPreviewSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > maxPreviewSize || height > maxPreviewSize) {
          const ratio = Math.min(maxPreviewSize / width, maxPreviewSize / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: true });
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Analiz
        const analysis = analyzeImage(data, width, height);
        const { mode } = analysis;

        // Mod bazlı düzeltmeler
        const whiteBalance = modeBasedWhiteBalance(data, mode, analysis);
        const exposureData = modeBasedExposure(data, mode, analysis);
        const saturationData = modeBasedSaturation(data, mode, analysis);
        const contrastAdjust = modeBasedContrast(data, mode, analysis);

        // Uygula
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          r = r * whiteBalance.rGain;
          g = g * whiteBalance.gGain;
          b = b * whiteBalance.bGain;

          const exposureFactor = 1 + exposureData.exposure;
          r = r * exposureFactor;
          g = g * exposureFactor;
          b = b * exposureFactor;

          if (exposureData.shadows > 0) {
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            if (luminance < 100) {
              const shadowFactor = Math.pow((100 - luminance) / 100, 1.2);
              const shadowLift = exposureData.shadows * shadowFactor * 40;
              r += shadowLift;
              g += shadowLift;
              b += shadowLift;
            }
          }

          if (contrastAdjust > 0) {
            const factor = (259 * (contrastAdjust * 100 + 100)) / (259 - contrastAdjust * 100);
            r = (factor * (r - 128)) + 128;
            g = (factor * (g - 128)) + 128;
            b = (factor * (b - 128)) + 128;
          }

          if (saturationData.saturation !== 0) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const factor = saturationData.saturation;
            r = gray + (1 + factor) * (r - gray);
            g = gray + (1 + factor) * (g - gray);
            b = gray + (1 + factor) * (b - gray);
          }

          data[i] = clamp(r);
          data[i + 1] = clamp(g);
          data[i + 2] = clamp(b);
        }

        ctx.putImageData(imageData, 0, 0);
        const dataURL = canvas.toDataURL('image/png', 0.9);
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}
