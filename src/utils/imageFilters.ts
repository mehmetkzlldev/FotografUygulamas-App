// Canvas API ile gelişmiş filtre uygulama fonksiyonları

export interface FilterParams {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  hue?: number; // -180 to 180
  sepia?: number; // 0 to 100
  grayscale?: number; // 0 to 100
  blur?: number; // 0 to 10
  vignette?: number; // 0 to 100
  warmth?: number; // -100 to 100 (blue to orange)
  shadows?: number; // -100 to 100
  highlights?: number; // -100 to 100
}

export const applyFilter = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  params: FilterParams
): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  canvas.width = image.width;
  canvas.height = image.height;

  // Orijinal görseli çiz
  ctx.drawImage(image, 0, 0);

  // ImageData al
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Her piksel için işlem yap
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    if (params.brightness !== undefined) {
      const adjust = params.brightness * 2.55;
      r = clamp(r + adjust);
      g = clamp(g + adjust);
      b = clamp(b + adjust);
    }

    // Contrast
    if (params.contrast !== undefined) {
      const factor = (259 * (params.contrast + 100)) / (259 - params.contrast);
      r = clamp((factor * (r - 128)) + 128);
      g = clamp((factor * (g - 128)) + 128);
      b = clamp((factor * (b - 128)) + 128);
    }

    // Saturation - daha doğal renk koruması
    if (params.saturation !== undefined) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const factor = params.saturation / 100;
      // Doygunluğu artırırken renk dengesini koru
      r = clamp(gray + (1 + factor) * (r - gray));
      g = clamp(gray + (1 + factor) * (g - gray));
      b = clamp(gray + (1 + factor) * (b - gray));
    }

    // Hue rotation
    if (params.hue !== undefined) {
      const hsl = rgbToHsl(r, g, b);
      hsl[0] = (hsl[0] + params.hue / 360) % 1;
      const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
      r = rgb[0];
      g = rgb[1];
      b = rgb[2];
    }

    // Sepia
    if (params.sepia !== undefined && params.sepia > 0) {
      const sepiaFactor = params.sepia / 100;
      const tr = 0.393 * r + 0.769 * g + 0.189 * b;
      const tg = 0.349 * r + 0.686 * g + 0.168 * b;
      const tb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = clamp(lerp(r, tr, sepiaFactor));
      g = clamp(lerp(g, tg, sepiaFactor));
      b = clamp(lerp(b, tb, sepiaFactor));
    }

    // Grayscale
    if (params.grayscale !== undefined && params.grayscale > 0) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const grayFactor = params.grayscale / 100;
      r = clamp(lerp(r, gray, grayFactor));
      g = clamp(lerp(g, gray, grayFactor));
      b = clamp(lerp(b, gray, grayFactor));
    }

    // Warmth (color temperature) - daha doğal geçiş
    if (params.warmth !== undefined) {
      const temp = params.warmth / 100;
      if (temp > 0) {
        // Warm (more orange/yellow) - daha yumuşak geçiş
        const warmFactor = Math.min(temp, 1);
        r = clamp(r + warmFactor * 15);
        g = clamp(g + warmFactor * 5);
        b = clamp(b - warmFactor * 12);
      } else {
        // Cool (more blue/cyan) - daha yumuşak geçiş
        const coolFactor = Math.max(temp, -1);
        r = clamp(r + coolFactor * 10);
        g = clamp(g + coolFactor * 3);
        b = clamp(b - coolFactor * 15);
      }
    }

    // Shadows & Highlights - daha doğal ton eşleme
    if (params.shadows !== undefined || params.highlights !== undefined) {
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      if (params.shadows !== undefined && luminance < 128) {
        // Shadows için daha yumuşak eğri
        const shadowFactor = Math.pow((128 - luminance) / 128, 1.5);
        const adjust = (params.shadows / 100) * shadowFactor * 40;
        r = clamp(r + adjust);
        g = clamp(g + adjust);
        b = clamp(b + adjust);
      }
      
      if (params.highlights !== undefined && luminance > 128) {
        // Highlights için daha yumuşak eğri
        const highlightFactor = Math.pow((luminance - 128) / 128, 1.5);
        const adjust = (params.highlights / 100) * highlightFactor * 40;
        r = clamp(r + adjust);
        g = clamp(g + adjust);
        b = clamp(b + adjust);
      }
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  // Vignette efekti
  if (params.vignette !== undefined && params.vignette > 0) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const vignetteFactor = params.vignette / 100;

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const vignette = 1 - (distance / maxDistance) * vignetteFactor;

      data[i] = clamp(data[i] * vignette);
      data[i + 1] = clamp(data[i + 1] * vignette);
      data[i + 2] = clamp(data[i + 2] * vignette);
    }
  }

  // Değişiklikleri uygula
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/jpeg', 0.95);
};

// Yardımcı fonksiyonlar
const clamp = (value: number): number => {
  return Math.max(0, Math.min(255, value));
};

const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
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
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
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
};

// Görseli yükle ve filtre uygula
export const applyFilterToImage = async (
  imageSrc: string,
  params: FilterParams
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const result = applyFilter(canvas, img, params);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

