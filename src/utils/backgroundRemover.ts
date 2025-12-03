/**
 * Background Removal Utilities - Çok Daha İyileştirilmiş Versiyon
 * Daha agresif ve tutarlı arka plan kaldırma
 * Hata kontrolü ve performans optimizasyonları eklendi
 */

/**
 * Renk mesafesi hesaplama
 */
function colorDistance(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const rgbDistance = Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );

  const hsl1 = rgbToHsl(r1, g1, b1);
  const hsl2 = rgbToHsl(r2, g2, b2);
  
  const hslDistance = Math.sqrt(
    Math.pow((hsl1[0] - hsl2[0]) * 360, 2) * 2 +
    Math.pow((hsl1[1] - hsl2[1]) * 100, 2) +
    Math.pow((hsl1[2] - hsl2[2]) * 100, 2)
  );

  return (rgbDistance * 0.7 + hslDistance * 0.3);
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
 * Çok Daha Güçlü Edge Detection
 */
function detectEdges(data: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const edges = new Uint8Array(width * height);
  
  // Gaussian blur (gürültü azaltma)
  const blurred = new Uint8ClampedArray(data.length);
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const kernelSum = 16;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumR = 0, sumG = 0, sumB = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const k = kernel[(ky + 1) * 3 + (kx + 1)];
          sumR += data[idx] * k;
          sumG += data[idx + 1] * k;
          sumB += data[idx + 2] * k;
        }
      }
      const idx = (y * width + x) * 4;
      blurred[idx] = sumR / kernelSum;
      blurred[idx + 1] = sumG / kernelSum;
      blurred[idx + 2] = sumB / kernelSum;
      blurred[idx + 3] = data[idx + 3];
    }
  }

  // Sobel edge detection - daha agresif
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = 0.299 * blurred[idx] + 0.587 * blurred[idx + 1] + 0.114 * blurred[idx + 2];
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += gray * sobelX[kernelIdx];
          gy += gray * sobelY[kernelIdx];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, magnitude * 2.5); // Daha agresif boost
    }
  }

  return edges;
}

/**
 * ÇOK DAHA İYİ Nesne Algılama - Çoklu strateji
 */
function detectObject(
  data: Uint8ClampedArray,
  edges: Uint8Array,
  width: number,
  height: number,
  tolerance: number = 30
): boolean[] {
  const isObject = new Array(width * height).fill(false);
  const visited = new Array(width * height).fill(false);
  
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  
  // Çok daha geniş merkez alanı (portre için optimize)
  const centerRadius = Math.min(width, height) * 0.45;
  
  // Daha düşük edge threshold (daha hassas)
  const edgeThreshold = 35;
  
  // Çok daha fazla seed point (tüm merkez alanından)
  const seedPoints: { x: number; y: number }[] = [];
  const seedRadius = Math.min(width, height) * 0.2;
  
  // Merkez çevresinde grid pattern ile seed points
  for (let dy = -seedRadius; dy <= seedRadius; dy += seedRadius * 0.4) {
    for (let dx = -seedRadius; dx <= seedRadius; dx += seedRadius * 0.4) {
      const x = centerX + dx;
      const y = centerY + dy;
      if (x >= 0 && x < width && y >= 0 && y < height) {
        seedPoints.push({ x, y });
      }
    }
  }

  // Her seed point için flood fill
  for (const seed of seedPoints) {
    const queue: number[] = [];
    const startIdx = seed.y * width + seed.x;
    
    if (visited[startIdx]) continue;
    
    queue.push(startIdx);
    visited[startIdx] = true;
    
    const seedIdx = (seed.y * width + seed.x) * 4;
    const seedColor = {
      r: data[seedIdx],
      g: data[seedIdx + 1],
      b: data[seedIdx + 2],
    };
    
    let maxIterations = width * height * 0.3; // Performans için limit
    let iterations = 0;
    
    while (queue.length > 0 && iterations < maxIterations) {
      iterations++;
      const idx = queue.shift()!;
      const x = idx % width;
      const y = Math.floor(idx / width);
      
      const distFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      const edgeStrength = edges[idx];
      const isNearCenter = distFromCenter < centerRadius * 1.2; // Daha geniş
      
      const pixelIdx = (y * width + x) * 4;
      const pixelColor = {
        r: data[pixelIdx],
        g: data[pixelIdx + 1],
        b: data[pixelIdx + 2],
      };
      
      const colorDist = colorDistance(
        pixelColor.r, pixelColor.g, pixelColor.b,
        seedColor.r, seedColor.g, seedColor.b
      );
      
      // Çok daha esnek kriterler
      const shouldMark = isNearCenter || 
                        edgeStrength > edgeThreshold ||
                        (colorDist < tolerance * 3 && distFromCenter < centerRadius * 2.5);
      
      if (shouldMark) {
        isObject[idx] = true;
        
        // 8-directional neighbors
        const neighbors = [
          { x: x - 1, y: y - 1 }, { x, y: y - 1 }, { x: x + 1, y: y - 1 },
          { x: x - 1, y },                         { x: x + 1, y },
          { x: x - 1, y: y + 1 }, { x, y: y + 1 }, { x: x + 1, y: y + 1 }
        ];
        
        for (const neighbor of neighbors) {
          if (neighbor.x >= 0 && neighbor.x < width && 
              neighbor.y >= 0 && neighbor.y < height) {
            const nIdx = neighbor.y * width + neighbor.x;
            
            if (!visited[nIdx]) {
              visited[nIdx] = true;
              
              const nEdgeStrength = edges[nIdx];
              const nDistFromCenter = Math.sqrt(
                Math.pow(neighbor.x - centerX, 2) + Math.pow(neighbor.y - centerY, 2)
              );
              
              const nPixelIdx = (neighbor.y * width + neighbor.x) * 4;
              const nColor = {
                r: data[nPixelIdx],
                g: data[nPixelIdx + 1],
                b: data[nPixelIdx + 2],
              };
              
              const nColorDist = colorDistance(
                nColor.r, nColor.g, nColor.b,
                seedColor.r, seedColor.g, seedColor.b
              );
              
              // Çok esnek eşikler
              if (nEdgeStrength > edgeThreshold * 0.5 || 
                  nColorDist < tolerance * 3.5 || 
                  nDistFromCenter < centerRadius * 3) {
                queue.push(nIdx);
              }
            }
          }
        }
      }
    }
  }
  
  // Morphological closing - 3 pass (küçük delikleri doldur)
  for (let pass = 0; pass < 3; pass++) {
    const temp = [...isObject];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (!temp[idx]) {
          let objectNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nIdx = (y + dy) * width + (x + dx);
              if (temp[nIdx]) objectNeighbors++;
            }
          }
          // Eğer 5+ komşu nesne ise, bu da nesne olsun
          if (objectNeighbors >= 5) {
            isObject[idx] = true;
          }
        }
      }
    }
  }
  
  // Kenarları temizle (ama daha az agresif)
  const edgeWidth = Math.floor(Math.min(width, height) * 0.04);
  for (let y = 0; y < edgeWidth; y++) {
    for (let x = 0; x < width; x++) {
      isObject[y * width + x] = false;
    }
  }
  for (let y = height - edgeWidth; y < height; y++) {
    for (let x = 0; x < width; x++) {
      isObject[y * width + x] = false;
    }
  }
  for (let x = 0; x < edgeWidth; x++) {
    for (let y = 0; y < height; y++) {
      isObject[y * width + x] = false;
    }
  }
  for (let x = width - edgeWidth; x < width; x++) {
    for (let y = 0; y < height; y++) {
      isObject[y * width + x] = false;
    }
  }
  
  return isObject;
}

/**
 * Ana Fonksiyon - Çok İyileştirilmiş
 */
export function removeBackgroundAuto(imageSrc: string, tolerance: number = 50): Promise<string> {
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

        // Edge detection
        const edges = detectEdges(data, canvas.width, canvas.height);

        // Nesne algılama
        const isObject = detectObject(data, edges, canvas.width, canvas.height, tolerance);

        // Arka planı kaldır - çok daha temiz
        for (let i = 0; i < data.length; i += 4) {
          const x = (i / 4) % canvas.width;
          const y = Math.floor((i / 4) / canvas.width);
          const idx = y * canvas.width + x;

          if (!isObject[idx]) {
            // Arka plan - direkt transparan yap
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
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
 * Preview için - aynı algoritma ama düşük çözünürlük
 */
export function previewBackgroundRemoval(
  imageSrc: string,
  mode: 'auto' | 'direct' | 'color',
  targetColor?: { r: number; g: number; b: number },
  tolerance: number = 40
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
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

        // Auto mode - aynı algoritma
        if (mode === 'auto') {
          const edges = detectEdges(data, width, height);
          const isObject = detectObject(data, edges, width, height, tolerance);

          for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            const idx = y * width + x;

            if (!isObject[idx]) {
              data[i + 3] = 0;
            }
          }
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

