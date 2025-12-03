import { create } from 'zustand';

interface AdjustSettings {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // -180 to 180
  warmth: number; // -100 to 100
  shadows: number; // -100 to 100
  highlights: number; // -100 to 100
}

export interface TextElement {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number;
  fontFamily: string;
  color: string;
  hasShadow: boolean;
  hasOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  alignment: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing: number;
  lineHeight: number;
  rotation: number;
  opacity: number;
  backgroundColor: string;
  hasBackground: boolean;
  blur: number;
  hasGradient: boolean;
  gradientColors: string[];
  gradientDirection: number;
}

export interface StickerElement {
  id: string;
  stickerId: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number;
  rotation: number;
  opacity: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  blur: number; // 0-20
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number; // 0-20
  shadowOffsetX: number; // -20 to 20
  shadowOffsetY: number; // -20 to 20
  zIndex: number; // for layering
}

interface AppState {
  isPremium: boolean;
  selectedImage: string | null;
  recentEdits: string[];
  currentFilter: string;
  adjustSettings: AdjustSettings;
  textElements: TextElement[];
  stickerElements: StickerElement[];
  setPremium: (value: boolean) => void;
  setSelectedImage: (uri: string | null) => void;
  addRecentEdit: (uri: string) => void;
  setCurrentFilter: (filterId: string) => void;
  updateAdjustSetting: (key: keyof AdjustSettings, value: number) => void;
  resetAdjustSettings: () => void;
  addTextElement: (text: TextElement) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  deleteTextElement: (id: string) => void;
  clearAllTexts: () => void;
  addStickerElement: (sticker: StickerElement) => void;
  updateStickerElement: (id: string, updates: Partial<StickerElement>) => void;
  deleteStickerElement: (id: string) => void;
  clearAllStickers: () => void;
}

const defaultAdjustSettings: AdjustSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  warmth: 0,
  shadows: 0,
  highlights: 0,
};

export const useAppStore = create<AppState>((set) => ({
  isPremium: false,
  selectedImage: null,
  recentEdits: [],
  currentFilter: 'none',
  adjustSettings: defaultAdjustSettings,
  textElements: [],
  stickerElements: [],
  setPremium: (value) => set({ isPremium: value }),
  setSelectedImage: (uri) => set({ 
    selectedImage: uri, 
    adjustSettings: defaultAdjustSettings,
    textElements: [],
    stickerElements: [],
  }),
  addRecentEdit: (uri) =>
    set((state) => ({
      recentEdits: [uri, ...state.recentEdits.filter((item) => item !== uri)].slice(0, 10),
    })),
  setCurrentFilter: (filterId) => set({ currentFilter: filterId }),
  updateAdjustSetting: (key, value) =>
    set((state) => ({
      adjustSettings: { ...state.adjustSettings, [key]: value },
    })),
  resetAdjustSettings: () => set({ adjustSettings: defaultAdjustSettings }),
  addTextElement: (text) =>
    set((state) => ({
      textElements: [...state.textElements, text],
    })),
  updateTextElement: (id, updates) =>
    set((state) => ({
      textElements: state.textElements.map((text) =>
        text.id === id ? { ...text, ...updates } : text
      ),
    })),
  deleteTextElement: (id) =>
    set((state) => ({
      textElements: state.textElements.filter((text) => text.id !== id),
    })),
  clearAllTexts: () => set({ textElements: [] }),
  addStickerElement: (sticker) =>
    set((state) => ({
      stickerElements: [...state.stickerElements, sticker],
    })),
  updateStickerElement: (id, updates) =>
    set((state) => ({
      stickerElements: state.stickerElements.map((sticker) =>
        sticker.id === id ? { ...sticker, ...updates } : sticker
      ),
    })),
  deleteStickerElement: (id) =>
    set((state) => ({
      stickerElements: state.stickerElements.filter((sticker) => sticker.id !== id),
    })),
  clearAllStickers: () => set({ stickerElements: [] }),
}));

