import { AdjustSettings } from '../store/useAppStore';

// Adjust ayarlarını CSS filter string'ine çevir
export const adjustSettingsToCSSFilter = (settings: AdjustSettings): string => {
  const filters: string[] = [];

  // Brightness: -100 to 100 -> -1 to 1 CSS brightness
  if (settings.brightness !== 0) {
    const value = 1 + (settings.brightness / 100) * 0.5; // Max ±50% brightness change
    filters.push(`brightness(${value.toFixed(2)})`);
  }

  // Contrast: -100 to 100 -> -1 to 1 CSS contrast
  if (settings.contrast !== 0) {
    const value = 1 + (settings.contrast / 100) * 0.5; // Max ±50% contrast change
    filters.push(`contrast(${value.toFixed(2)})`);
  }

  // Saturation: -100 to 100 -> 0 to 2 CSS saturate
  if (settings.saturation !== 0) {
    const value = 1 + (settings.saturation / 100); // 0 to 2 range
    filters.push(`saturate(${value.toFixed(2)})`);
  }

  // Hue rotation: -180 to 180 degrees
  if (settings.hue !== 0) {
    filters.push(`hue-rotate(${settings.hue}deg)`);
  }

  // Warmth: combine with sepia and hue for temperature effect
  if (settings.warmth !== 0) {
    if (settings.warmth > 0) {
      // Warm (orange/yellow)
      const sepiaValue = (settings.warmth / 100) * 0.3;
      filters.push(`sepia(${sepiaValue.toFixed(2)})`);
    } else {
      // Cool (blue/cyan) - use hue rotate
      const hueValue = (Math.abs(settings.warmth) / 100) * 10;
      filters.push(`hue-rotate(${hueValue}deg)`);
    }
  }

  // Shadows: darken shadows using brightness with blend mode approximation
  // Highlights: brighten highlights using brightness with blend mode approximation
  // Note: CSS filters don't support true shadows/highlights, so we approximate
  // For better results, Canvas API would be needed
  
  // Shadows effect - approximate with slight brightness reduction
  if (settings.shadows !== 0) {
    const shadowValue = 1 - (settings.shadows / 100) * 0.15; // Max ±15% brightness for shadows
    if (shadowValue !== 1) {
      filters.push(`brightness(${shadowValue.toFixed(2)})`);
    }
  }

  // Highlights effect - approximate with slight brightness increase
  if (settings.highlights !== 0) {
    const highlightValue = 1 + (settings.highlights / 100) * 0.15; // Max ±15% brightness for highlights
    if (highlightValue !== 1) {
      filters.push(`brightness(${highlightValue.toFixed(2)})`);
    }
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
};

// Adjust ayarlarını filtre ile birleştir
export const combineFilters = (baseFilter: string, adjustFilter: string): string => {
  if (baseFilter === 'none' && adjustFilter === 'none') return 'none';
  if (baseFilter === 'none') return adjustFilter;
  if (adjustFilter === 'none') return baseFilter;
  return `${baseFilter} ${adjustFilter}`;
};

