import { AdjustSettings } from '../store/useAppStore';

export interface AdjustPreset {
  id: string;
  name: string;
  icon: string;
  settings: AdjustSettings;
}

export const adjustPresets: AdjustPreset[] = [
  {
    id: 'vivid',
    name: 'Canlı',
    icon: '🌈',
    settings: {
      brightness: 10,
      contrast: 20,
      saturation: 30,
      hue: 0,
      warmth: 5,
      shadows: -10,
      highlights: 10,
    },
  },
  {
    id: 'soft',
    name: 'Yumuşak',
    icon: '💫',
    settings: {
      brightness: 15,
      contrast: -10,
      saturation: -15,
      hue: 0,
      warmth: 10,
      shadows: 15,
      highlights: 5,
    },
  },
  {
    id: 'dramatic',
    name: 'Dramatik',
    icon: '🎭',
    settings: {
      brightness: -10,
      contrast: 40,
      saturation: 10,
      hue: 0,
      warmth: -5,
      shadows: -30,
      highlights: -20,
    },
  },
  {
    id: 'warm',
    name: 'Sıcak',
    icon: '🔥',
    settings: {
      brightness: 10,
      contrast: 10,
      saturation: 15,
      hue: 5,
      warmth: 30,
      shadows: 0,
      highlights: 5,
    },
  },
  {
    id: 'cool',
    name: 'Soğuk',
    icon: '❄️',
    settings: {
      brightness: 10,
      contrast: 10,
      saturation: 15,
      hue: -5,
      warmth: -30,
      shadows: 0,
      highlights: 5,
    },
  },
  {
    id: 'cinematic',
    name: 'Sinematik',
    icon: '🎬',
    settings: {
      brightness: -5,
      contrast: 25,
      saturation: -10,
      hue: 0,
      warmth: 10,
      shadows: -20,
      highlights: -10,
    },
  },
  {
    id: 'bright',
    name: 'Parlak',
    icon: '☀️',
    settings: {
      brightness: 30,
      contrast: 15,
      saturation: 20,
      hue: 0,
      warmth: 5,
      shadows: 20,
      highlights: 25,
    },
  },
  {
    id: 'moody',
    name: 'Kasvetli',
    icon: '🌑',
    settings: {
      brightness: -20,
      contrast: 30,
      saturation: -25,
      hue: 0,
      warmth: -10,
      shadows: -40,
      highlights: -30,
    },
  },
];

export const getPresetById = (id: string): AdjustPreset | undefined => {
  return adjustPresets.find((preset) => preset.id === id);
};

