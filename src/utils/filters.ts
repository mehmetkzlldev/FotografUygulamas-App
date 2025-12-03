export interface Filter {
  id: string;
  name: string;
  cssFilter: string;
  category?: 'basic' | 'color' | 'artistic' | 'vintage' | 'cinematic';
}

// Basit ve etkili CSS filtreler
export const filters: Filter[] = [
  {
    id: 'none',
    name: 'Orijinal',
    cssFilter: 'none',
    category: 'basic',
  },
  // VINTAGE / RETRO
  {
    id: 'vintage',
    name: 'Retro',
    cssFilter: 'sepia(0.5) contrast(1.1) brightness(1.05)',
    category: 'vintage',
  },
  {
    id: 'film',
    name: 'Film',
    cssFilter: 'contrast(1.15) saturate(0.85) brightness(1.08)',
    category: 'vintage',
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    cssFilter: 'brightness(1.1) contrast(1.05) saturate(0.95)',
    category: 'vintage',
  },
  // BLACK & WHITE
  {
    id: 'blackwhite',
    name: 'Siyah Beyaz',
    cssFilter: 'grayscale(1)',
    category: 'basic',
  },
  {
    id: 'dramatic_bw',
    name: 'Dramatik BW',
    cssFilter: 'grayscale(1) contrast(1.3) brightness(0.95)',
    category: 'artistic',
  },
  // COLOR GRADING
  {
    id: 'warm',
    name: 'Sıcak',
    cssFilter: 'brightness(1.05) contrast(1.05) saturate(1.1)',
    category: 'color',
  },
  {
    id: 'cool',
    name: 'Soğuk',
    cssFilter: 'brightness(1.05) contrast(1.05) saturate(0.9) hue-rotate(5deg)',
    category: 'color',
  },
  {
    id: 'dramatic',
    name: 'Dramatik',
    cssFilter: 'contrast(1.25) brightness(0.95) saturate(1.15)',
    category: 'cinematic',
  },
  {
    id: 'soft',
    name: 'Yumuşak',
    cssFilter: 'brightness(1.1) contrast(0.9) saturate(0.9)',
    category: 'color',
  },
  {
    id: 'vibrant',
    name: 'Canlı',
    cssFilter: 'saturate(1.3) contrast(1.1) brightness(1.03)',
    category: 'color',
  },
  {
    id: 'faded',
    name: 'Soluk',
    cssFilter: 'brightness(1.15) contrast(0.85) saturate(0.7)',
    category: 'artistic',
  },
  // CINEMATIC
  {
    id: 'cinematic',
    name: 'Sinematik',
    cssFilter: 'contrast(1.2) brightness(0.9) saturate(1.05)',
    category: 'cinematic',
  },
  {
    id: 'noir',
    name: 'Noir',
    cssFilter: 'grayscale(1) contrast(1.3) brightness(0.9)',
    category: 'cinematic',
  },
  {
    id: 'moody',
    name: 'Hüzünlü',
    cssFilter: 'brightness(0.9) contrast(1.15) saturate(0.85) hue-rotate(-5deg)',
    category: 'cinematic',
  },
  // ARTISTIC
  {
    id: 'pastel',
    name: 'Pastel',
    cssFilter: 'brightness(1.15) contrast(0.85) saturate(0.7)',
    category: 'artistic',
  },
  {
    id: 'highcontrast',
    name: 'Yüksek Kontrast',
    cssFilter: 'contrast(1.4) brightness(1.05)',
    category: 'artistic',
  },
  {
    id: 'sunset',
    name: 'Gün Batımı',
    cssFilter: 'brightness(1.08) contrast(1.1) saturate(1.2) hue-rotate(-3deg)',
    category: 'color',
  },
  {
    id: 'bluehour',
    name: 'Mavi Saat',
    cssFilter: 'brightness(0.97) contrast(1.12) saturate(1.1) hue-rotate(8deg)',
    category: 'color',
  },
  {
    id: 'morning',
    name: 'Sabah',
    cssFilter: 'brightness(1.12) contrast(1.05) saturate(1.08) hue-rotate(-2deg)',
    category: 'color',
  },
  {
    id: 'evening',
    name: 'Akşam',
    cssFilter: 'brightness(0.98) contrast(1.12) saturate(1.15) hue-rotate(5deg)',
    category: 'color',
  },
  // EK FİLTRELER
  {
    id: 'ludwig',
    name: 'Ludwig',
    cssFilter: 'brightness(1.1) contrast(1.1) saturate(1.1)',
    category: 'vintage',
  },
  {
    id: 'aden',
    name: 'Aden',
    cssFilter: 'brightness(1.15) contrast(0.9) saturate(0.85) hue-rotate(-10deg)',
    category: 'color',
  },
  {
    id: 'perpetua',
    name: 'Perpetua',
    cssFilter: 'brightness(1.05) contrast(1.1) saturate(1.15)',
    category: 'vintage',
  },
  {
    id: 'reyes',
    name: 'Reyes',
    cssFilter: 'brightness(1.15) contrast(0.85) saturate(0.75) sepia(0.22)',
    category: 'vintage',
  },
  {
    id: 'juno',
    name: 'Juno',
    cssFilter: 'brightness(1.15) contrast(1.1) saturate(1.2) hue-rotate(-10deg)',
    category: 'color',
  },
  {
    id: 'slumber',
    name: 'Slumber',
    cssFilter: 'brightness(1.1) contrast(0.9) saturate(0.8) sepia(0.15)',
    category: 'artistic',
  },
  {
    id: 'crema',
    name: 'Crema',
    cssFilter: 'brightness(1.08) contrast(1.05) saturate(1.1) sepia(0.2)',
    category: 'vintage',
  },
  {
    id: 'lark',
    name: 'Lark',
    cssFilter: 'brightness(1.1) contrast(1.05) saturate(1.25)',
    category: 'color',
  },
  {
    id: 'moon',
    name: 'Moon',
    cssFilter: 'brightness(1.15) contrast(0.95) saturate(0)',
    category: 'artistic',
  },
  {
    id: 'clarendon',
    name: 'Clarendon',
    cssFilter: 'contrast(1.2) saturate(1.35) brightness(1.05)',
    category: 'color',
  },
  {
    id: 'gingham',
    name: 'Gingham',
    cssFilter: 'brightness(1.05) contrast(0.95) saturate(0.9)',
    category: 'artistic',
  },
  {
    id: 'mayfair',
    name: 'Mayfair',
    cssFilter: 'brightness(1.1) contrast(1.05) saturate(1.15) hue-rotate(-5deg)',
    category: 'color',
  },
  {
    id: 'nashville',
    name: 'Nashville',
    cssFilter: 'sepia(0.2) contrast(1.2) brightness(1.05) saturate(1.2) hue-rotate(-15deg)',
    category: 'vintage',
  },
  {
    id: 'stinson',
    name: 'Stinson',
    cssFilter: 'brightness(1.1) contrast(0.95) saturate(0.85) sepia(0.15)',
    category: 'vintage',
  },
  {
    id: 'valencia',
    name: 'Valencia',
    cssFilter: 'brightness(1.08) contrast(1.05) saturate(1.08) sepia(0.08)',
    category: 'color',
  },
  {
    id: 'xpro2',
    name: 'X-Pro II',
    cssFilter: 'contrast(1.25) brightness(0.9) saturate(1.35) sepia(0.3)',
    category: 'vintage',
  },
  {
    id: 'lofi',
    name: 'Lo-Fi',
    cssFilter: 'contrast(1.4) saturate(1.1) brightness(1.05)',
    category: 'artistic',
  },
  {
    id: 'inkwell',
    name: 'Inkwell',
    cssFilter: 'grayscale(1) contrast(1.1) brightness(0.95)',
    category: 'basic',
  },
  {
    id: 'hefe',
    name: 'Hefe',
    cssFilter: 'contrast(1.3) brightness(1.05) saturate(1.2) sepia(0.15)',
    category: 'vintage',
  },
  {
    id: 'sierra',
    name: 'Sierra',
    cssFilter: 'brightness(1.05) contrast(1.1) saturate(0.85) sepia(0.25)',
    category: 'vintage',
  },
  {
    id: 'willow',
    name: 'Willow',
    cssFilter: 'brightness(1.1) contrast(0.95) saturate(0) sepia(0.2)',
    category: 'artistic',
  },
  {
    id: 'brooklyn',
    name: 'Brooklyn',
    cssFilter: 'brightness(1.15) contrast(0.9) saturate(0.75) sepia(0.25)',
    category: 'vintage',
  },
  {
    id: 'hudson',
    name: 'Hudson',
    cssFilter: 'brightness(1.2) contrast(1.15) saturate(1.1) hue-rotate(-10deg)',
    category: 'cinematic',
  },
  {
    id: 'earlybird',
    name: 'Earlybird',
    cssFilter: 'sepia(0.25) contrast(1.15) brightness(1.05) saturate(0.9)',
    category: 'vintage',
  },
  {
    id: 'brannan',
    name: 'Brannan',
    cssFilter: 'contrast(1.4) brightness(0.9) saturate(0.8) sepia(0.5)',
    category: 'vintage',
  },
  {
    id: 'sutro',
    name: 'Sutro',
    cssFilter: 'brightness(0.95) contrast(1.25) saturate(0.9) sepia(0.4)',
    category: 'cinematic',
  },
  {
    id: 'toaster',
    name: 'Toaster',
    cssFilter: 'brightness(0.95) contrast(1.5) saturate(0.9) sepia(0.4)',
    category: 'artistic',
  },
  {
    id: 'walden',
    name: 'Walden',
    cssFilter: 'brightness(1.1) saturate(1.35) sepia(0.3) hue-rotate(-10deg)',
    category: 'color',
  },
  {
    id: '1977',
    name: '1977',
    cssFilter: 'brightness(1.1) contrast(1.1) saturate(1.3) sepia(0.3) hue-rotate(-10deg)',
    category: 'vintage',
  },
  {
    id: 'kelvin',
    name: 'Kelvin',
    cssFilter: 'brightness(1.15) contrast(1.1) saturate(1.2) sepia(0.15) hue-rotate(-10deg)',
    category: 'color',
  },
  {
    id: 'amaro',
    name: 'Amaro',
    cssFilter: 'brightness(1.1) contrast(1.05) saturate(1.35) hue-rotate(-10deg)',
    category: 'color',
  },
  {
    id: 'rise',
    name: 'Rise',
    cssFilter: 'brightness(1.1) contrast(0.9) saturate(0.9) sepia(0.2)',
    category: 'vintage',
  },
];

export const getFilterById = (id: string): Filter | undefined => {
  return filters.find((filter) => filter.id === id);
};
