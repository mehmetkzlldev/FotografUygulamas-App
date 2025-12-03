/**
 * Image Sharpening & Upscaling - Yumuşak ve Doğal Versiyon
 * Fotoğrafları 4K'ya upscale edip doğal görünümlü netleştirme
 */

const TARGET_WIDTH = 3840;
const TARGET_HEIGHT = 2160;

/**
 * Clamp value between 0-255
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

/**
 * Yumuşak Gaussian blur uygula
 */
function applyGaussianBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number = 1
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data);
  
  // Basit 3x3 blur kernel (daha yumuşak)
  const kernel = [
    0.0625, 0.125,  0.0625,
    0.125,  0.25,   0.125,
    0.0625, 0.125,  0.0625
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB only
        let sum = 0;
        let kernelIndex = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[idx] * kernel[kernelIndex];
            kernelIndex++;
          }
        }
        
        const idx = (y * width + x) * 4 + c;
        result[idx] = sum;
      }
    }
  }
  
  // Alpha channel ve kenarları koru
  for (let i = 0; i < data.length; i += 4) {
    result[i + 3] = data[i + 3]; // Alpha
  }
  
  return result;
}

/**
 * Yumuşak Unsharp Mask - Daha doğal görünüm
 */
function applySoftUnsharpMask(
  data: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray {
  // Önce blur uygula
  const blurred = applyGaussianBlur(data, width, height, 1);
  
  // Unsharp mask: original + (original - blurred) * amount (daha yumuşak)
  const result = new Uint8ClampedArray(data);
  const amount = 0.6; // Daha düşük amount - daha yumuşak
  
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const original = data[i + c];
      const blurValue = blurred[i + c];
      const diff = original - blurValue;
      
      // Sadece belirgin farklar varsa netleştir
      if (Math.abs(diff) > 5) {
        result[i + c] = clamp(original + diff * amount);
      } else {
        result[i + c] = original; // Küçük farklarda orijinali koru
      }
    }
    result[i + 3] = data[i + 3]; // Alpha channel
  }
  
  return result;
}

/**
 * Ana fonksiyon: Yumuşak Netleştirme ve 4K Upscaling
 */
export function smartSharpen(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Orijinal boyutlar
        const origWidth = img.width;
        const origHeight = img.height;

        // Aspect ratio'yu koru: Yeni boyutları hesapla
        const ratio = Math.min(TARGET_WIDTH / origWidth, TARGET_HEIGHT / origHeight);
        const newWidth = Math.floor(origWidth * ratio);
        const newHeight = Math.floor(origHeight * ratio);

        // Canvas'ı 4K yap
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;

        // Yüksek kaliteli smoothing ayarla
        ctx.imageSmoothingQuality = 'high';
        ctx.imageSmoothingEnabled = true;

        // Upscale edilmiş görüntüyü çiz
        const upscaleCanvas = document.createElement('canvas');
        upscaleCanvas.width = newWidth;
        upscaleCanvas.height = newHeight;
        const upscaleCtx = upscaleCanvas.getContext('2d');
        
        if (!upscaleCtx) {
          reject(new Error('Upscale canvas context not available'));
          return;
        }

        upscaleCtx.imageSmoothingQuality = 'high';
        upscaleCtx.imageSmoothingEnabled = true;
        upscaleCtx.drawImage(img, 0, 0, newWidth, newHeight);

        // 4K canvas'a ortala (siyah arka plan)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        const pasteX = (TARGET_WIDTH - newWidth) / 2;
        const pasteY = (TARGET_HEIGHT - newHeight) / 2;
        ctx.drawImage(upscaleCanvas, pasteX, pasteY);

        // Yumuşak netleştirme uygula
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Yumuşak unsharp mask
        const sharpened = applySoftUnsharpMask(data, width, height);

        // İşlenmiş data'yı canvas'a uygula
        const finalImageData = new ImageData(new Uint8ClampedArray(sharpened), width, height);
        ctx.putImageData(finalImageData, 0, 0);

        // JPEG olarak kaydet
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(dataUrl);
      } catch (error) {
        console.error('SmartSharpen error:', error);
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
 * Preview için yumuşak netleştirme
 */
export function previewSharpen(imageSrc: string): Promise<string> {
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
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = width;
        canvas.height = height;

        // Yüksek kaliteli smoothing
        ctx.imageSmoothingQuality = 'high';
        ctx.imageSmoothingEnabled = true;
        
        // Beyaz arka plan (transparent sorununu önle)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Görseli çiz
        ctx.drawImage(img, 0, 0, width, height);

        // Yumuşak netleştirme uygula
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Yumuşak unsharp mask (preview için daha hafif)
        const blurred = applyGaussianBlur(data, width, height, 1);
        const result = new Uint8ClampedArray(data);
        const amount = 0.5; // Preview için daha hafif

        for (let i = 0; i < data.length; i += 4) {
          for (let c = 0; c < 3; c++) {
            const original = data[i + c];
            const blurValue = blurred[i + c];
            const diff = original - blurValue;
            
            if (Math.abs(diff) > 5) {
              result[i + c] = clamp(original + diff * amount);
            } else {
              result[i + c] = original;
            }
          }
          result[i + 3] = data[i + 3];
        }

        const finalImageData = new ImageData(result, width, height);
        ctx.putImageData(finalImageData, 0, 0);
        
        // JPEG olarak kaydet
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch (error) {
        console.error('PreviewSharpen error:', error);
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
