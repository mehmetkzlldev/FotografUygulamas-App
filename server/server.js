/**
 * Background Removal API Server
 * Express server for AI-powered background removal
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Temporary storage for uploaded files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

/**
 * Helper: Convert base64 to Buffer
 */
function base64ToBuffer(base64String) {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Helper: Convert Buffer to base64
 */
function bufferToBase64(buffer, mimeType = 'image/png') {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

/**
 * POST /api/bg/preview
 * Preview background removal (lower resolution, faster)
 */
app.post('/api/bg/preview', upload.single('image'), async (req, res) => {
  try {
    let imageBuffer;
    let isBase64 = false;

    // Handle base64 or file upload
    if (req.body.image) {
      // Base64 string
      imageBuffer = base64ToBuffer(req.body.image);
      isBase64 = true;
    } else if (req.file) {
      // File upload
      imageBuffer = req.file.buffer;
    } else {
      return res.status(400).json({ error: 'No image provided' });
    }

    const mode = req.body.mode || 'auto';
    const tolerance = parseFloat(req.body.tolerance) || 40;

    // Resize for preview (max 800px)
    let processedImage = sharp(imageBuffer);
    const metadata = await processedImage.metadata();
    
    let width = metadata.width;
    let height = metadata.height;
    const maxSize = 800;
    
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
      processedImage = processedImage.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const resizedBuffer = await processedImage.png().toBuffer();

    let resultBuffer;

    if (mode === 'auto') {
      // AI-powered background removal using @imgly/background-removal
      resultBuffer = await removeBackground(resizedBuffer);
    } else if (mode === 'direct') {
      // Fast direct removal - use simple algorithm
      resultBuffer = await removeBackgroundDirect(resizedBuffer, tolerance);
    } else if (mode === 'color' && req.body.targetColor) {
      // Color-based removal
      const targetColor = JSON.parse(req.body.targetColor);
      resultBuffer = await removeBackgroundByColor(resizedBuffer, targetColor, tolerance);
    } else {
      // Default to auto
      resultBuffer = await removeBackground(resizedBuffer);
    }

    const resultBase64 = bufferToBase64(resultBuffer, 'image/png');

    res.json({
      success: true,
      result: resultBase64,
      mode,
      resolution: { width, height },
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      error: 'Background removal failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/bg/remove
 * Full resolution background removal
 */
app.post('/api/bg/remove', upload.single('image'), async (req, res) => {
  try {
    let imageBuffer;
    let isBase64 = false;

    // Handle base64 or file upload
    if (req.body.image) {
      // Base64 string
      imageBuffer = base64ToBuffer(req.body.image);
      isBase64 = true;
    } else if (req.file) {
      // File upload
      imageBuffer = req.file.buffer;
    } else {
      return res.status(400).json({ error: 'No image provided' });
    }

    const mode = req.body.mode || 'auto';
    const tolerance = parseFloat(req.body.tolerance) || 40;

    let resultBuffer;

    if (mode === 'auto') {
      // AI-powered background removal
      resultBuffer = await removeBackground(imageBuffer);
    } else if (mode === 'direct') {
      // Fast direct removal
      resultBuffer = await removeBackgroundDirect(imageBuffer, tolerance);
    } else if (mode === 'color' && req.body.targetColor) {
      // Color-based removal
      const targetColor = JSON.parse(req.body.targetColor);
      resultBuffer = await removeBackgroundByColor(imageBuffer, targetColor, tolerance);
    } else {
      // Default to auto
      resultBuffer = await removeBackground(imageBuffer);
    }

    const resultBase64 = bufferToBase64(resultBuffer, 'image/png');

    res.json({
      success: true,
      result: resultBase64,
      mode,
    });
  } catch (error) {
    console.error('Remove error:', error);
    res.status(500).json({
      error: 'Background removal failed',
      message: error.message,
    });
  }
});

/**
 * Simple direct removal algorithm (fallback when AI is not available)
 */
async function removeBackgroundDirect(imageBuffer, tolerance = 50) {
  const image = sharp(imageBuffer);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Analyze edge colors
  const edgeWidth = Math.floor(Math.min(width, height) * 0.12);
  const edgeColors = [];

  // Sample edge pixels
  for (let y = 0; y < edgeWidth; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      edgeColors.push({
        r: pixels[idx],
        g: pixels[idx + 1],
        b: pixels[idx + 2],
      });
    }
  }

  // Find dominant color
  const dominantColor = findDominantColor(edgeColors);
  const normalizedTolerance = tolerance * 2.8;

  // Remove background
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const distance = colorDistance(r, g, b, dominantColor.r, dominantColor.g, dominantColor.b);

    if (distance <= normalizedTolerance) {
      pixels[i + 3] = 0; // Set alpha to 0
    }
  }

  return await sharp(pixels, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

/**
 * Color-based removal
 */
async function removeBackgroundByColor(imageBuffer, targetColor, tolerance = 40) {
  const image = sharp(imageBuffer);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  const normalizedTolerance = tolerance * 2.55;

  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const distance = colorDistance(r, g, b, targetColor.r, targetColor.g, targetColor.b);

    if (distance <= normalizedTolerance) {
      const fadeFactor = 1 - (distance / normalizedTolerance);
      const smoothFactor = fadeFactor * fadeFactor;
      pixels[i + 3] = Math.floor(255 * (1 - smoothFactor * 0.98));
    }
  }

  return await sharp(pixels, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

/**
 * Helper: Find dominant color
 */
function findDominantColor(colors) {
  const colorCounts = new Map();
  
  colors.forEach((color) => {
    const key = `${Math.floor(color.r / 10)}-${Math.floor(color.g / 10)}-${Math.floor(color.b / 10)}`;
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  });

  let maxCount = 0;
  let dominantKey = null;

  colorCounts.forEach((count, key) => {
    if (count > maxCount) {
      maxCount = count;
      dominantKey = key;
    }
  });

  if (!dominantKey) {
    return { r: 255, g: 255, b: 255 };
  }

  const [r, g, b] = dominantKey.split('-').map((n) => parseInt(n) * 10);
  return { r, g, b };
}

/**
 * Helper: Color distance calculation
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'background-removal-api' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Background Removal API server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   POST /api/bg/preview - Preview (low res)`);
  console.log(`   POST /api/bg/remove - Full resolution`);
  console.log(`   GET  /api/health - Health check`);
});

