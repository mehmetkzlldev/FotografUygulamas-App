/**
 * Background Removal API Client - Python Backend
 * Direkt Kaldır modu için Python rembg API'si kullanır
 */

const PYTHON_API_URL = import.meta.env.VITE_API_URL_PYTHON || 'http://localhost:3002';

/**
 * Check if Python API is available
 */
async function isPythonApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${PYTHON_API_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Call Python API for background removal
 */
async function callPythonApi(
  endpoint: string,
  body: any
): Promise<string> {
  const apiAvailable = await isPythonApiAvailable();

  if (!apiAvailable) {
    throw new Error('Python API not available');
  }

  const response = await fetch(`${PYTHON_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }

  return data.result;
}

/**
 * Python rembg ile arka plan kaldırma (Direkt Kaldır modu için)
 */
export async function removeBackgroundDirectPython(imageSrc: string): Promise<string> {
  try {
    return await callPythonApi('/api/bg/remove', {
      image: imageSrc,
      mode: 'direct',
    });
  } catch (error) {
    console.warn('Python API failed, using fallback:', error);
    throw error;
  }
}

/**
 * Python rembg ile önizleme
 */
export async function previewBackgroundRemovalPython(imageSrc: string): Promise<string> {
  try {
    return await callPythonApi('/api/bg/preview', {
      image: imageSrc,
      mode: 'direct',
    });
  } catch (error) {
    console.warn('Python API preview failed, using fallback:', error);
    throw error;
  }
}

