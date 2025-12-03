import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAppStore, TextElement, StickerElement } from '../store/useAppStore';
import { filters, getFilterById } from '../utils/filters';
import { adjustSettingsToCSSFilter, combineFilters } from '../utils/adjustUtils';
import { adjustPresets } from '../utils/adjustPresets';
import { TextElement as TextElementComponent } from '../components/TextElement';
import { StickerElement as StickerElementComponent } from '../components/StickerElement';
import { stickerCategories, getStickersByCategory } from '../utils/stickers';
import { generateId } from '../utils/helpers';
import { renderImageWithEffects } from '../utils/canvasRenderer';
import { downloadImage } from '../utils/imageUtils';
import { useMountAnimation } from '../hooks/useAnimation';
import { incrementPhotosEdited } from '../utils/mongodb';
import { removeBackgroundAuto, previewBackgroundRemoval } from '../utils/backgroundRemover';
import { removeBackgroundDirectPython, previewBackgroundRemovalPython } from '../utils/backgroundRemoverApi';
import { autoColorCorrection, previewColorCorrection } from '../utils/colorCorrection';
import { smartSharpen, previewSharpen } from '../utils/imageSharpening';
import '../utils/animations.js'; // JavaScript animasyonları yükle
import './EditorScreen.css';

const EditorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    selectedImage, 
    setSelectedImage,
    addRecentEdit, 
    currentFilter, 
    setCurrentFilter,
    adjustSettings,
    updateAdjustSetting,
    resetAdjustSettings,
    textElements,
    addTextElement,
    updateTextElement,
    deleteTextElement,
    clearAllTexts,
    stickerElements,
    addStickerElement,
    updateStickerElement,
    deleteStickerElement,
    clearAllStickers,
  } = useAppStore();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<string>('emoji');
  const [filterSearch, setFilterSearch] = useState('');
  const [pendingStickerId, setPendingStickerId] = useState<string | null>(null);
  const [stickerSettings, setStickerSettings] = useState({
    size: 64,
    rotation: 0,
    opacity: 100,
    flipHorizontal: false,
    flipVertical: false,
    blur: 0,
    shadow: false,
    shadowColor: '#000000',
    shadowBlur: 5,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
  });
  const [textInput, setTextInput] = useState('');
  const [showBgRemover, setShowBgRemover] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [bgRemoverPreview, setBgRemoverPreview] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [showColorCorrection, setShowColorCorrection] = useState(false);
  const [colorCorrectionPreview, setColorCorrectionPreview] = useState<string | null>(null);
  const [isApplyingColorCorrection, setIsApplyingColorCorrection] = useState(false);
  const [isGeneratingColorPreview, setIsGeneratingColorPreview] = useState(false);
  const [showSharpen, setShowSharpen] = useState(false);
  const [sharpenPreview, setSharpenPreview] = useState<string | null>(null);
  const [isApplyingSharpen, setIsApplyingSharpen] = useState(false);
  const [isGeneratingSharpenPreview, setIsGeneratingSharpenPreview] = useState(false);
  const [textSettings, setTextSettings] = useState({
    fontSize: 32,
    fontFamily: 'Arial',
    color: '#FFFFFF',
    hasShadow: true,
    hasOutline: false,
    outlineColor: '#000000',
    outlineWidth: 2,
    alignment: 'center' as 'left' | 'center' | 'right',
    fontWeight: 'bold' as 'normal' | 'bold',
    textTransform: 'none' as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
    letterSpacing: 0,
    lineHeight: 1.2,
    rotation: 0,
    opacity: 100,
    backgroundColor: '#000000',
    hasBackground: false,
    blur: 0,
    hasGradient: false,
    gradientColors: ['#FFFFFF', '#000000'],
    gradientDirection: 90,
  });
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Seçili metin ayarlarını yükle
  React.useEffect(() => {
    if (selectedTextId) {
      const selectedText = textElements.find((t) => t.id === selectedTextId);
      if (selectedText) {
        setTextSettings({
          fontSize: selectedText.fontSize,
          fontFamily: selectedText.fontFamily,
          color: selectedText.color,
          hasShadow: selectedText.hasShadow,
          hasOutline: selectedText.hasOutline,
          outlineColor: selectedText.outlineColor,
          outlineWidth: selectedText.outlineWidth,
          alignment: selectedText.alignment,
          fontWeight: selectedText.fontWeight,
          textTransform: selectedText.textTransform,
          letterSpacing: selectedText.letterSpacing,
          lineHeight: selectedText.lineHeight,
          rotation: selectedText.rotation,
          opacity: selectedText.opacity,
          backgroundColor: selectedText.backgroundColor,
          hasBackground: selectedText.hasBackground,
          blur: selectedText.blur,
          hasGradient: selectedText.hasGradient,
          gradientColors: selectedText.gradientColors,
          gradientDirection: selectedText.gradientDirection,
        });
      }
    }
  }, [selectedTextId, textElements]);

  // Seçili sticker ayarlarını yükle
  React.useEffect(() => {
    if (selectedStickerId) {
      const selectedSticker = stickerElements.find((s) => s.id === selectedStickerId);
      if (selectedSticker) {
        setStickerSettings({
          size: selectedSticker.size,
          rotation: selectedSticker.rotation,
          opacity: selectedSticker.opacity,
          flipHorizontal: selectedSticker.flipHorizontal,
          flipVertical: selectedSticker.flipVertical,
          blur: selectedSticker.blur || 0,
          shadow: selectedSticker.shadow || false,
          shadowColor: selectedSticker.shadowColor || '#000000',
          shadowBlur: selectedSticker.shadowBlur || 5,
          shadowOffsetX: selectedSticker.shadowOffsetX || 2,
          shadowOffsetY: selectedSticker.shadowOffsetY || 2,
        });
      }
    }
  }, [selectedStickerId, stickerElements]);

  const handleAddSticker = (stickerId: string) => {
    if (!selectedImage) return;

    // Direkt görselin ortasına ekle
    const newSticker: StickerElement = {
      id: generateId(),
      stickerId,
      x: 50,
      y: 50,
      size: stickerSettings.size,
      rotation: stickerSettings.rotation,
      opacity: stickerSettings.opacity,
      flipHorizontal: stickerSettings.flipHorizontal,
      flipVertical: stickerSettings.flipVertical,
      blur: stickerSettings.blur,
      shadow: stickerSettings.shadow,
      shadowColor: stickerSettings.shadowColor,
      shadowBlur: stickerSettings.shadowBlur,
      shadowOffsetX: stickerSettings.shadowOffsetX,
      shadowOffsetY: stickerSettings.shadowOffsetY,
      zIndex: stickerElements.length,
    };

    addStickerElement(newSticker);
    setSelectedStickerId(newSticker.id);
    
    // Alternatif: Görsel üzerine tıklayarak ekleme modunu da destekle
    // setPendingStickerId(stickerId);
  };

  const handleImageContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Butona tıklanmışsa işlem yapma
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    // Sticker veya text element'ine tıklanmışsa işlem yapma
    if (target.closest('.sticker-element, .text-element')) {
      return;
    }
    
    if (!pendingStickerId) {
      return;
    }
    
    if (!selectedImage || !imageContainerRef.current) {
      return;
    }
    
    // Görsel container'ına tıklandığında sticker ekle
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newSticker: StickerElement = {
      id: generateId(),
      stickerId: pendingStickerId,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      size: stickerSettings.size,
      rotation: stickerSettings.rotation,
      opacity: stickerSettings.opacity,
      flipHorizontal: stickerSettings.flipHorizontal,
      flipVertical: stickerSettings.flipVertical,
      blur: stickerSettings.blur,
      shadow: stickerSettings.shadow,
      shadowColor: stickerSettings.shadowColor,
      shadowBlur: stickerSettings.shadowBlur,
      shadowOffsetX: stickerSettings.shadowOffsetX,
      shadowOffsetY: stickerSettings.shadowOffsetY,
      zIndex: stickerElements.length, // New stickers appear on top
    };

    addStickerElement(newSticker);
    setSelectedStickerId(newSticker.id);
    setPendingStickerId(null);
  };

  const tools = [
    { id: 'filters', label: 'Filtreler', icon: '🎨' },
    { id: 'adjust', label: 'Düzenle', icon: '✨' },
    { id: 'text', label: 'Metin', icon: '📝' },
    { id: 'sticker', label: 'Sticker', icon: '🖼️' },
    { id: 'ai', label: 'AI', icon: '🤖' },
  ];


  const handleAddText = () => {
    if (!textInput.trim() || !selectedImage) return;

    const newText: TextElement = {
      id: generateId(),
      text: textInput.trim(),
      x: 50,
      y: 50,
      fontSize: textSettings.fontSize,
      fontFamily: textSettings.fontFamily,
      color: textSettings.color,
      hasShadow: textSettings.hasShadow,
      hasOutline: textSettings.hasOutline,
      outlineColor: textSettings.outlineColor,
      outlineWidth: textSettings.outlineWidth,
      alignment: textSettings.alignment,
      fontWeight: textSettings.fontWeight,
      textTransform: textSettings.textTransform,
      letterSpacing: textSettings.letterSpacing,
      lineHeight: textSettings.lineHeight,
      rotation: textSettings.rotation,
      opacity: textSettings.opacity,
      backgroundColor: textSettings.backgroundColor,
      hasBackground: textSettings.hasBackground,
      blur: textSettings.blur,
      hasGradient: textSettings.hasGradient,
      gradientColors: textSettings.gradientColors,
      gradientDirection: textSettings.gradientDirection,
    };

    addTextElement(newText);
    setTextInput('');
    setSelectedTextId(newText.id);
  };

  const handleSave = async () => {
    if (!selectedImage) return;

    try {
      // Loading göster
      const saveButton = document.querySelector('.header-button:last-child') as HTMLButtonElement;
      const originalText = saveButton?.textContent;
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Kaydediliyor...';
      }

      // Aktif filtreyi al
      const activeFilter = getFilterById(currentFilter);

      // Tüm efektleri uygula ve render et
      const processedImage = await renderImageWithEffects(
        selectedImage,
        activeFilter || null,
        adjustSettings,
        textElements,
        stickerElements
      );

      // Yüksek kalitede indir
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await downloadImage(processedImage, `edited-${timestamp}.png`);

      // Recent edits'e ekle
      addRecentEdit(processedImage);

      // MongoDB'ye istatistik kaydet (async, hata olursa devam et)
      incrementPhotosEdited().catch((err: Error) => {
        console.error('İstatistik kaydetme hatası:', err);
      });

      // Başarı mesajı
      alert('Başarılı! Fotoğraf yüksek kalitede kaydedildi!');

      // Butonu geri yükle
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = originalText || 'Kaydet';
      }

      navigate('/');
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      
      // Butonu geri yükle
      const saveButton = document.querySelector('.header-button:last-child') as HTMLButtonElement;
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Kaydet';
      }
    }
  };

  const handleToolPress = (tool: typeof tools[0]) => {
    setActiveTool(activeTool === tool.id ? null : tool.id);
  };

  const editorRef = useMountAnimation('fade', 100);
  const toolPanelRef = useRef<HTMLDivElement>(null);

  // Tool panel açıldığında animasyon - JavaScript'ten
  useEffect(() => {
    if (activeTool && toolPanelRef.current) {
      // Animasyonların yüklenmesini bekle
      const initAnimation = () => {
        if (window.Animations && window.Animations.slideIn && toolPanelRef.current) {
          window.Animations.slideIn(toolPanelRef.current, 'right', 300).catch(console.error);
        }
      };
      
      // Eğer animasyonlar yüklü değilse bekle
      if (window.Animations) {
        initAnimation();
      } else {
        // Animasyonların yüklenmesini bekle (max 2 saniye)
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          if (window.Animations || attempts > 20) {
            clearInterval(checkInterval);
            if (window.Animations) {
              initAnimation();
            }
          }
        }, 100);
        
        return () => clearInterval(checkInterval);
      }
    }
  }, [activeTool]);

  if (!selectedImage) {
    return (
      <div className="editor-screen">
        <div className="editor-wrapper">
          <p className="error-text">Fotoğraf seçilmedi</p>
          <Button title="Geri Dön" onPress={() => navigate('/')} variant="secondary" />
        </div>
      </div>
    );
  }

  return (
    <div ref={editorRef as any} className="editor-screen">
      <div className="editor-wrapper">
        {/* Editor Header */}
        <header className="editor-header">
          <h2 className="header-title">Fotoğraf Düzenleme</h2>
          <div className="header-actions">
            <button onClick={handleSave} className="header-button primary">
              Kaydet
            </button>
          </div>
        </header>

        {/* Image Container */}
        <div 
          className={`image-container ${pendingStickerId ? 'image-container-pending-sticker' : ''}`}
          ref={imageContainerRef}
          onClick={handleImageContainerClick}
        >
          <div 
            className={`image-wrapper ${pendingStickerId ? 'image-wrapper-pending-sticker' : ''}`}
            onClick={(e) => {
              // Wrapper'a tıklama da container'a ulaşsın
              if (pendingStickerId && e.target === e.currentTarget) {
                handleImageContainerClick(e as any);
              }
            }}
          >
            {/* Before/After Toggle */}
            <button
              className="before-after-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setShowBeforeAfter(!showBeforeAfter);
              }}
              title={showBeforeAfter ? 'Düzenlenmiş göster' : 'Orijinal göster'}
            >
              {showBeforeAfter ? '👁️' : '👁️‍🗨️'}
            </button>
            
            {showBeforeAfter ? (
              <img 
                src={selectedImage} 
                alt="Orijinal" 
                className="editor-image"
                style={{ 
                  filter: 'none',
                  cursor: pendingStickerId ? 'crosshair' : 'default',
                }}
                onClick={(e) => {
                  // Görsele tıklama container'a ulaşsın
                  if (pendingStickerId) {
                    e.stopPropagation();
                    handleImageContainerClick(e as any);
                  }
                }}
              />
            ) : (
              <>
                <img 
                  ref={imageRef}
                  src={selectedImage} 
                  alt="Düzenleniyor" 
                  className="editor-image"
                  style={{
                    filter: combineFilters(
                      getFilterById(currentFilter)?.cssFilter || 'none',
                      adjustSettingsToCSSFilter(adjustSettings)
                    ),
                    cursor: pendingStickerId ? 'crosshair' : 'default',
                  }}
                  onClick={(e) => {
                    // Görsele tıklama container'a ulaşsın
                    if (pendingStickerId) {
                      e.stopPropagation();
                      handleImageContainerClick(e as any);
                    }
                  }}
                />
                
                {/* Sticker Elements */}
                {imageContainerRef.current && stickerElements.map((sticker) => (
                  <StickerElementComponent
                    key={sticker.id}
                    stickerElement={sticker}
                    onUpdate={(updates) => updateStickerElement(sticker.id, updates)}
                    onDelete={() => deleteStickerElement(sticker.id)}
                    onSelect={() => {
                      setSelectedStickerId(sticker.id);
                      setSelectedTextId(null);
                    }}
                    isSelected={selectedStickerId === sticker.id}
                    containerWidth={imageContainerRef.current?.offsetWidth || 0}
                    containerHeight={imageContainerRef.current?.offsetHeight || 0}
                  />
                ))}

                {/* Text Elements */}
                {imageContainerRef.current && textElements.map((text) => (
                  <TextElementComponent
                    key={text.id}
                    textElement={text}
                    onUpdate={(updates) => updateTextElement(text.id, updates)}
                    onDelete={() => deleteTextElement(text.id)}
                    onSelect={() => {
                      setSelectedTextId(text.id);
                      setSelectedStickerId(null);
                    }}
                    isSelected={selectedTextId === text.id}
                    containerWidth={imageContainerRef.current?.offsetWidth || 0}
                    containerHeight={imageContainerRef.current?.offsetHeight || 0}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Tool Panel */}
        {activeTool && (
          <div className="tool-panel">
            <h3 className="tool-panel-title">
              {tools.find((t) => t.id === activeTool)?.label}
            </h3>
            <div className="tool-content">
              {activeTool === 'filters' ? (
                <div className="filters-container">
                  {/* Filter Search */}
                  <div className="filter-search-section">
                    <input
                      type="text"
                      placeholder="Filtre ara..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="filter-search-input"
                    />
                  </div>

                  <div className="filters-grid">
                    {filters
                      .filter((filter) =>
                        filter.name.toLowerCase().includes(filterSearch.toLowerCase())
                      )
                      .map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setCurrentFilter(filter.id);
                        }}
                        className={`filter-item ${
                          currentFilter === filter.id ? 'filter-item-active' : ''
                        }`}
                      >
                        <div 
                          className="filter-preview"
                          style={{
                            filter: filter.cssFilter === 'none' || !filter.cssFilter ? 'none' : filter.cssFilter,
                            backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {!selectedImage && <span>📷</span>}
                        </div>
                        <span className="filter-name">{filter.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeTool === 'adjust' ? (
                <div className="adjust-container">
                  {/* Adjust Presets */}
                  <div className="adjust-presets-section">
                    <div className="adjust-presets-scroll">
                      {adjustPresets.map((preset) => (
                        <button
                          key={preset.id}
                          className="adjust-preset-btn"
                          onClick={() => {
                            updateAdjustSetting('brightness', preset.settings.brightness);
                            updateAdjustSetting('contrast', preset.settings.contrast);
                            updateAdjustSetting('saturation', preset.settings.saturation);
                            updateAdjustSetting('hue', preset.settings.hue);
                            updateAdjustSetting('warmth', preset.settings.warmth);
                            updateAdjustSetting('shadows', preset.settings.shadows);
                            updateAdjustSetting('highlights', preset.settings.highlights);
                          }}
                          title={preset.name}
                        >
                          <span className="adjust-preset-icon">{preset.icon}</span>
                          <span className="adjust-preset-name">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="adjust-controls">
                    {/* Brightness */}
                    <div className="adjust-control-item">
                      <div className="adjust-label-row">
                        <label className="adjust-label">
                          <span className="adjust-icon">☀️</span>
                          Parlaklık
                        </label>
                        <span className="adjust-value">{adjustSettings.brightness}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustSettings.brightness}
                        onChange={(e) => updateAdjustSetting('brightness', Number(e.target.value))}
                        className="adjust-slider"
                      />
                    </div>

                    {/* Contrast */}
                    <div className="adjust-control-item">
                      <div className="adjust-label-row">
                        <label className="adjust-label">
                          <span className="adjust-icon">⚡</span>
                          Kontrast
                        </label>
                        <span className="adjust-value">{adjustSettings.contrast}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustSettings.contrast}
                        onChange={(e) => updateAdjustSetting('contrast', Number(e.target.value))}
                        className="adjust-slider"
                      />
                    </div>

                    {/* Saturation */}
                    <div className="adjust-control-item">
                      <div className="adjust-label-row">
                        <label className="adjust-label">
                          <span className="adjust-icon">🌈</span>
                          Doygunluk
                        </label>
                        <span className="adjust-value">{adjustSettings.saturation}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustSettings.saturation}
                        onChange={(e) => updateAdjustSetting('saturation', Number(e.target.value))}
                        className="adjust-slider"
                      />
                    </div>

                    {/* Warmth */}
                    <div className="adjust-control-item">
                      <div className="adjust-label-row">
                        <label className="adjust-label">
                          <span className="adjust-icon">🔥</span>
                          Sıcaklık
                        </label>
                        <span className="adjust-value">{adjustSettings.warmth}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustSettings.warmth}
                        onChange={(e) => updateAdjustSetting('warmth', Number(e.target.value))}
                        className="adjust-slider"
                      />
                    </div>

                    {/* Hue */}
                    <div className="adjust-control-item">
                      <div className="adjust-label-row">
                        <label className="adjust-label">
                          <span className="adjust-icon">🎨</span>
                          Renk Tonu
                        </label>
                        <span className="adjust-value">{adjustSettings.hue}</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={adjustSettings.hue}
                        onChange={(e) => updateAdjustSetting('hue', Number(e.target.value))}
                        className="adjust-slider"
                      />
                    </div>

                    {/* Shadows */}
                    <div className="adjust-control-item">
                      <div className="adjust-label-row">
                        <label className="adjust-label">
                          <span className="adjust-icon">🌑</span>
                          Gölgeler
                        </label>
                        <span className="adjust-value">{adjustSettings.shadows}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustSettings.shadows}
                        onChange={(e) => updateAdjustSetting('shadows', Number(e.target.value))}
                        className="adjust-slider"
                      />
                    </div>

                    {/* Highlights */}
                    <div className="adjust-control-item">
                      <div className="adjust-label-row">
                        <label className="adjust-label">
                          <span className="adjust-icon">✨</span>
                          Işıklar
                        </label>
                        <span className="adjust-value">{adjustSettings.highlights}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustSettings.highlights}
                        onChange={(e) => updateAdjustSetting('highlights', Number(e.target.value))}
                        className="adjust-slider"
                      />
                    </div>

                    {/* Reset Button */}
                    <button onClick={resetAdjustSettings} className="adjust-reset-btn">
                      🔄 Tümünü Sıfırla
                    </button>
                  </div>
                </div>
              ) : activeTool === 'text' ? (
                <div className="text-tool-panel">
                  {/* Add Text Input */}
                  <div className="text-input-section">
                    <input
                      type="text"
                      placeholder="Metin yazın..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="text-input-field"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && textInput.trim()) {
                          handleAddText();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddText}
                      className="text-add-btn"
                      disabled={!textInput.trim()}
                    >
                      ➕ Ekle
                    </button>
                  </div>

                  {/* Text Settings */}
                  {selectedTextId && (
                    <div className="text-settings-section">
                      <h4 className="text-settings-title">Metin Ayarları</h4>

                      {/* Font Size */}
                      <div className="text-setting-item">
                        <label>Boyut</label>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          value={textSettings.fontSize}
                          onChange={(e) => {
                            const size = Number(e.target.value);
                            setTextSettings({ ...textSettings, fontSize: size });
                            updateTextElement(selectedTextId, { fontSize: size });
                          }}
                          className="text-slider"
                        />
                        <span>{textSettings.fontSize}px</span>
                      </div>


                      {/* Font Weight */}
                      <div className="text-setting-item">
                        <label>Kalınlık</label>
                        <div className="text-option-group">
                          <button
                            className={`text-option-btn ${textSettings.fontWeight === 'normal' ? 'active' : ''}`}
                            onClick={() => {
                              setTextSettings({ ...textSettings, fontWeight: 'normal' });
                              updateTextElement(selectedTextId, { fontWeight: 'normal' });
                            }}
                          >
                            Normal
                          </button>
                          <button
                            className={`text-option-btn ${textSettings.fontWeight === 'bold' ? 'active' : ''}`}
                            onClick={() => {
                              setTextSettings({ ...textSettings, fontWeight: 'bold' });
                              updateTextElement(selectedTextId, { fontWeight: 'bold' });
                            }}
                          >
                            Kalın
                          </button>
                        </div>
                      </div>

                      {/* Color */}
                      <div className="text-setting-item">
                        <label>Renk</label>
                        <div className="color-picker-section">
                          <input
                            type="color"
                            value={textSettings.color}
                            onChange={(e) => {
                              const color = e.target.value;
                              setTextSettings({ ...textSettings, color });
                              updateTextElement(selectedTextId, { color });
                            }}
                            className="color-picker"
                          />
                          <div className="color-presets">
                            {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map((color) => (
                              <button
                                key={color}
                                className="color-preset-btn"
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  setTextSettings({ ...textSettings, color });
                                  updateTextElement(selectedTextId, { color });
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Alignment */}
                      <div className="text-setting-item">
                        <label>Hizalama</label>
                        <div className="text-option-group">
                          <button
                            className={`text-option-btn ${textSettings.alignment === 'left' ? 'active' : ''}`}
                            onClick={() => {
                              setTextSettings({ ...textSettings, alignment: 'left' });
                              updateTextElement(selectedTextId, { alignment: 'left' });
                            }}
                          >
                            ← Sol
                          </button>
                          <button
                            className={`text-option-btn ${textSettings.alignment === 'center' ? 'active' : ''}`}
                            onClick={() => {
                              setTextSettings({ ...textSettings, alignment: 'center' });
                              updateTextElement(selectedTextId, { alignment: 'center' });
                            }}
                          >
                            ⦁ Orta
                          </button>
                          <button
                            className={`text-option-btn ${textSettings.alignment === 'right' ? 'active' : ''}`}
                            onClick={() => {
                              setTextSettings({ ...textSettings, alignment: 'right' });
                              updateTextElement(selectedTextId, { alignment: 'right' });
                            }}
                          >
                            Sağ →
                          </button>
                        </div>
                      </div>

                      {/* Shadow */}
                      <div className="text-setting-item">
                        <label>Gölge</label>
                        <button
                          className={`text-toggle-btn ${textSettings.hasShadow ? 'active' : ''}`}
                          onClick={() => {
                            const hasShadow = !textSettings.hasShadow;
                            setTextSettings({ ...textSettings, hasShadow });
                            updateTextElement(selectedTextId, { hasShadow });
                          }}
                        >
                          {textSettings.hasShadow ? '✓ Açık' : '✗ Kapalı'}
                        </button>
                      </div>

                      {/* Outline */}
                      <div className="text-setting-item">
                        <label>Dış Çizgi</label>
                        <div className="text-outline-controls">
                          <button
                            className={`text-toggle-btn ${textSettings.hasOutline ? 'active' : ''}`}
                            onClick={() => {
                              const hasOutline = !textSettings.hasOutline;
                              setTextSettings({ ...textSettings, hasOutline });
                              updateTextElement(selectedTextId, { hasOutline });
                            }}
                          >
                            {textSettings.hasOutline ? '✓ Açık' : '✗ Kapalı'}
                          </button>
                          {textSettings.hasOutline && (
                            <>
                              <input
                                type="color"
                                value={textSettings.outlineColor}
                                onChange={(e) => {
                                  const color = e.target.value;
                                  setTextSettings({ ...textSettings, outlineColor: color });
                                  updateTextElement(selectedTextId, { outlineColor: color });
                                }}
                                className="color-picker-small"
                              />
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={textSettings.outlineWidth}
                                onChange={(e) => {
                                  const width = Number(e.target.value);
                                  setTextSettings({ ...textSettings, outlineWidth: width });
                                  updateTextElement(selectedTextId, { outlineWidth: width });
                                }}
                                className="text-slider-small"
                              />
                              <span style={{ color: '#888', fontSize: '12px', minWidth: '30px' }}>
                                {textSettings.outlineWidth}px
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Text Transform */}
                      <div className="text-setting-item">
                        <label>Metin Dönüşümü</label>
                        <div className="text-option-group">
                          {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map((transform) => (
                            <button
                              key={transform}
                              className={`text-option-btn ${textSettings.textTransform === transform ? 'active' : ''}`}
                              onClick={() => {
                                setTextSettings({ ...textSettings, textTransform: transform });
                                updateTextElement(selectedTextId, { textTransform: transform });
                              }}
                            >
                              {transform === 'none' ? 'Normal' : transform === 'uppercase' ? 'BÜYÜK' : transform === 'lowercase' ? 'küçük' : 'Başlık'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Letter Spacing */}
                      <div className="text-setting-item">
                        <label>
                          Harf Aralığı
                          <span style={{ marginLeft: 'auto', color: '#888', fontSize: '12px' }}>
                            {textSettings.letterSpacing}px
                          </span>
                        </label>
                        <input
                          type="range"
                          min="-5"
                          max="20"
                          value={textSettings.letterSpacing}
                          onChange={(e) => {
                            const spacing = Number(e.target.value);
                            setTextSettings({ ...textSettings, letterSpacing: spacing });
                            updateTextElement(selectedTextId, { letterSpacing: spacing });
                          }}
                          className="text-slider"
                        />
                      </div>

                      {/* Line Height */}
                      <div className="text-setting-item">
                        <label>
                          Satır Yüksekliği
                          <span style={{ marginLeft: 'auto', color: '#888', fontSize: '12px' }}>
                            {textSettings.lineHeight.toFixed(1)}
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={textSettings.lineHeight}
                          onChange={(e) => {
                            const height = Number(e.target.value);
                            setTextSettings({ ...textSettings, lineHeight: height });
                            updateTextElement(selectedTextId, { lineHeight: height });
                          }}
                          className="text-slider"
                        />
                      </div>

                      {/* Rotation */}
                      <div className="text-setting-item">
                        <label>
                          Döndürme
                          <span style={{ marginLeft: 'auto', color: '#888', fontSize: '12px' }}>
                            {textSettings.rotation}°
                          </span>
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={textSettings.rotation}
                          onChange={(e) => {
                            const rotation = Number(e.target.value);
                            setTextSettings({ ...textSettings, rotation });
                            updateTextElement(selectedTextId, { rotation });
                          }}
                          className="text-slider"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="text-setting-item">
                        <label>
                          Şeffaflık
                          <span style={{ marginLeft: 'auto', color: '#888', fontSize: '12px' }}>
                            {textSettings.opacity}%
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={textSettings.opacity}
                          onChange={(e) => {
                            const opacity = Number(e.target.value);
                            setTextSettings({ ...textSettings, opacity });
                            updateTextElement(selectedTextId, { opacity });
                          }}
                          className="text-slider"
                        />
                      </div>

                      {/* Background */}
                      <div className="text-setting-item">
                        <label>Arka Plan</label>
                        <div className="text-outline-controls">
                          <button
                            className={`text-toggle-btn ${textSettings.hasBackground ? 'active' : ''}`}
                            onClick={() => {
                              const hasBackground = !textSettings.hasBackground;
                              setTextSettings({ ...textSettings, hasBackground });
                              updateTextElement(selectedTextId, { hasBackground });
                            }}
                          >
                            {textSettings.hasBackground ? '✓ Açık' : '✗ Kapalı'}
                          </button>
                          {textSettings.hasBackground && (
                            <input
                              type="color"
                              value={textSettings.backgroundColor}
                              onChange={(e) => {
                                const color = e.target.value;
                                setTextSettings({ ...textSettings, backgroundColor: color });
                                updateTextElement(selectedTextId, { backgroundColor: color });
                              }}
                              className="color-picker-small"
                            />
                          )}
                        </div>
                      </div>

                      {/* Blur */}
                      <div className="text-setting-item">
                        <label>
                          Bulanıklık
                          <span style={{ marginLeft: 'auto', color: '#888', fontSize: '12px' }}>
                            {textSettings.blur}px
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={textSettings.blur}
                          onChange={(e) => {
                            const blur = Number(e.target.value);
                            setTextSettings({ ...textSettings, blur });
                            updateTextElement(selectedTextId, { blur });
                          }}
                          className="text-slider"
                        />
                      </div>

                      {/* Gradient */}
                      <div className="text-setting-item">
                        <label>Gradient</label>
                        <div className="text-outline-controls">
                          <button
                            className={`text-toggle-btn ${textSettings.hasGradient ? 'active' : ''}`}
                            onClick={() => {
                              const hasGradient = !textSettings.hasGradient;
                              setTextSettings({ ...textSettings, hasGradient });
                              updateTextElement(selectedTextId, { hasGradient });
                            }}
                          >
                            {textSettings.hasGradient ? '✓ Açık' : '✗ Kapalı'}
                          </button>
                          {textSettings.hasGradient && (
                            <>
                              <input
                                type="color"
                                value={textSettings.gradientColors[0]}
                                onChange={(e) => {
                                  const colors = [e.target.value, textSettings.gradientColors[1]];
                                  setTextSettings({ ...textSettings, gradientColors: colors });
                                  updateTextElement(selectedTextId, { gradientColors: colors });
                                }}
                                className="color-picker-small"
                              />
                              <input
                                type="color"
                                value={textSettings.gradientColors[1]}
                                onChange={(e) => {
                                  const colors = [textSettings.gradientColors[0], e.target.value];
                                  setTextSettings({ ...textSettings, gradientColors: colors });
                                  updateTextElement(selectedTextId, { gradientColors: colors });
                                }}
                                className="color-picker-small"
                              />
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={textSettings.gradientDirection}
                                onChange={(e) => {
                                  const direction = Number(e.target.value);
                                  setTextSettings({ ...textSettings, gradientDirection: direction });
                                  updateTextElement(selectedTextId, { gradientDirection: direction });
                                }}
                                className="text-slider-small"
                              />
                              <span style={{ color: '#888', fontSize: '11px', minWidth: '40px' }}>
                                {textSettings.gradientDirection}°
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Font Family - Daha fazla font */}
                      <div className="text-setting-item">
                        <label>Font</label>
                        <select
                          value={textSettings.fontFamily}
                          onChange={(e) => {
                            const font = e.target.value;
                            setTextSettings({ ...textSettings, fontFamily: font });
                            updateTextElement(selectedTextId, { fontFamily: font });
                          }}
                          className="text-select"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Impact">Impact</option>
                          <option value="Comic Sans MS">Comic Sans MS</option>
                          <option value="'Courier New', monospace">Courier</option>
                          <option value="'Arial Black', sans-serif">Arial Black</option>
                          <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                          <option value="'Palatino Linotype', serif">Palatino</option>
                          <option value="'Lucida Console', monospace">Lucida Console</option>
                          <option value="'Brush Script MT', cursive">Brush Script</option>
                          <option value="'Garamond', serif">Garamond</option>
                        </select>
                      </div>

                      {/* Delete Text */}
                      <button
                        onClick={() => {
                          deleteTextElement(selectedTextId);
                          setSelectedTextId(null);
                        }}
                        className="text-delete-setting-btn"
                      >
                        🗑️ Metni Sil
                      </button>
                    </div>
                  )}

                  {/* Clear All */}
                  {textElements.length > 0 && (
                    <button
                      onClick={() => {
                        clearAllTexts();
                        setSelectedTextId(null);
                      }}
                      className="text-clear-all-btn"
                    >
                      🗑️ Tüm Metinleri Temizle
                    </button>
                  )}
                </div>
              ) : activeTool === 'sticker' ? (
                <div className="sticker-tool-panel">
                  {/* Sticker Categories */}
                  <div className="sticker-categories">
                    <div className="sticker-categories-scroll">
                      {stickerCategories.map((category) => (
                        <button
                          key={category.id}
                          className={`sticker-category-btn ${
                            selectedStickerCategory === category.id ? 'active' : ''
                          }`}
                          onClick={() => setSelectedStickerCategory(category.id)}
                        >
                          <span className="sticker-category-icon">{category.icon}</span>
                          <span className="sticker-category-name">{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stickers Grid */}
                  <div className="stickers-grid">
                    {getStickersByCategory(selectedStickerCategory).map((sticker) => (
                      <div key={sticker.id} className="sticker-item-wrapper">
                        <div className="sticker-item">
                          <span className="sticker-item-emoji">{sticker.emoji}</span>
                        </div>
                        <button
                          className={`sticker-add-btn ${pendingStickerId === sticker.id ? 'sticker-add-btn-active' : ''}`}
                          onClick={() => handleAddSticker(sticker.id)}
                          title={pendingStickerId === sticker.id ? 'Görsel üzerine tıkla' : sticker.name}
                        >
                          {pendingStickerId === sticker.id ? '✅ Tıkla' : '➕ Ekle'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Sticker Settings */}
                  {selectedStickerId && (
                    <div className="sticker-settings-section">
                      <h4 className="sticker-settings-title">Sticker Ayarları</h4>

                      {/* Size */}
                      <div className="sticker-setting-item">
                        <label>
                          Boyut
                          <span style={{ marginLeft: 'auto', color: '#888', fontSize: '12px' }}>
                            {stickerSettings.size}px
                          </span>
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="300"
                          value={stickerSettings.size}
                          onChange={(e) => {
                            const size = Number(e.target.value);
                            setStickerSettings({ ...stickerSettings, size });
                            updateStickerElement(selectedStickerId, { size });
                          }}
                          className="text-slider"
                        />
                      </div>

                      {/* Rotation */}
                      <div className="sticker-setting-item">
                        <label>
                          Döndürme
                          <span style={{ marginLeft: 'auto', color: '#888', fontSize: '12px' }}>
                            {stickerSettings.rotation}°
                          </span>
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={stickerSettings.rotation}
                          onChange={(e) => {
                            const rotation = Number(e.target.value);
                            setStickerSettings({ ...stickerSettings, rotation });
                            updateStickerElement(selectedStickerId, { rotation });
                          }}
                          className="text-slider"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="sticker-setting-item">
                        <label>
                          Şeffaflık
                          <span style={{ marginLeft: 'auto', color: '#888', fontSize: '12px' }}>
                            {stickerSettings.opacity}%
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stickerSettings.opacity}
                          onChange={(e) => {
                            const opacity = Number(e.target.value);
                            setStickerSettings({ ...stickerSettings, opacity });
                            updateStickerElement(selectedStickerId, { opacity });
                          }}
                          className="text-slider"
                        />
                      </div>

                      {/* Flip Controls */}
                      <div className="sticker-setting-item">
                        <label>Çevir</label>
                        <div className="text-option-group">
                          <button
                            className={`text-option-btn ${stickerSettings.flipHorizontal ? 'active' : ''}`}
                            onClick={() => {
                              const flipHorizontal = !stickerSettings.flipHorizontal;
                              setStickerSettings({ ...stickerSettings, flipHorizontal });
                              updateStickerElement(selectedStickerId, { flipHorizontal });
                            }}
                          >
                            ↔️ Yatay
                          </button>
                          <button
                            className={`text-option-btn ${stickerSettings.flipVertical ? 'active' : ''}`}
                            onClick={() => {
                              const flipVertical = !stickerSettings.flipVertical;
                              setStickerSettings({ ...stickerSettings, flipVertical });
                              updateStickerElement(selectedStickerId, { flipVertical });
                            }}
                          >
                            ↕️ Dikey
                          </button>
                        </div>
                      </div>

                      {/* Delete Sticker */}
                      <button
                        onClick={() => {
                          deleteStickerElement(selectedStickerId);
                          setSelectedStickerId(null);
                        }}
                        className="text-delete-setting-btn"
                      >
                        🗑️ Sticker'ı Sil
                      </button>
                    </div>
                  )}

                  {/* Clear All */}
                  {stickerElements.length > 0 && (
                    <button
                      onClick={() => {
                        clearAllStickers();
                        setSelectedStickerId(null);
                      }}
                      className="text-clear-all-btn"
                    >
                      🗑️ Tüm Sticker'ları Temizle
                    </button>
                  )}
                </div>
              ) : activeTool === 'ai' ? (
                <div className="ai-tool-panel">
                  <div className="ai-features-grid">
                    {/* AI Arka Plan Kaldırma */}
                    <button 
                      className="ai-feature-card ai-feature-card-active" 
                      onClick={() => setShowBgRemover(true)}
                    >
                      <div className="ai-feature-icon">✂️</div>
                      <h4 className="ai-feature-title">Arka Plan Kaldır</h4>
                      <p className="ai-feature-desc">Tek tıkla profesyonel arka plan kaldırma</p>
                    </button>

                    {/* Otomatik Renk Düzeltme */}
                    <button 
                      className="ai-feature-card ai-feature-card-active" 
                      onClick={() => setShowColorCorrection(true)}
                    >
                      <div className="ai-feature-icon">🎨</div>
                      <h4 className="ai-feature-title">Renk Düzeltme</h4>
                      <p className="ai-feature-desc">Otomatik white balance, exposure ve saturation düzeltme</p>
                    </button>

                    {/* Akıllı Netleştirme */}
                    <button 
                      className="ai-feature-card ai-feature-card-active" 
                      onClick={() => setShowSharpen(true)}
                    >
                      <div className="ai-feature-icon">✨</div>
                      <h4 className="ai-feature-title">Akıllı Netleştir</h4>
                      <p className="ai-feature-desc">Bulanık fotoğrafları 4K'ya upscale edip netleştir</p>
                    </button>

                    {/* Üretken Dolgu */}
                    <button className="ai-feature-card" onClick={() => alert('Üretken Dolgu özelliği yakında eklenecek!')}>
                      <div className="ai-feature-icon">🪄</div>
                      <h4 className="ai-feature-title">Üretken Dolgu</h4>
                      <p className="ai-feature-desc">AI ile eksik alanları doldur ve genişlet</p>
                      <span className="ai-badge">Yakında</span>
                    </button>

                    {/* Üretken Genişletme */}
                    <button className="ai-feature-card" onClick={() => alert('Üretken Genişletme özelliği yakında eklenecek!')}>
                      <div className="ai-feature-icon">📐</div>
                      <h4 className="ai-feature-title">Görüntü Genişlet</h4>
                      <p className="ai-feature-desc">Görüntüleri sorunsuz bir şekilde genişlet</p>
                      <span className="ai-badge">Yakında</span>
                    </button>

                    {/* Nesne Kaldırma */}
                    <button className="ai-feature-card" onClick={() => alert('AI Nesne Kaldırma özelliği yakında eklenecek!')}>
                      <div className="ai-feature-icon">🧹</div>
                      <h4 className="ai-feature-title">Nesne Kaldır</h4>
                      <p className="ai-feature-desc">İstenmeyen nesneleri AI ile kaldır</p>
                      <span className="ai-badge">Yakında</span>
                    </button>
                  </div>
                  
                  <div className="ai-info-box">
                    <div className="ai-info-icon">🤖</div>
                    <div className="ai-info-content">
                      <h4 className="ai-info-title">AI Özellikleri Yakında</h4>
                      <p className="ai-info-text">
                        Gelişmiş yapay zeka özellikleri çok yakında kullanıma sunulacak. 
                        Fotoğraflarınızı daha kolay ve profesyonel bir şekilde düzenleyin.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Background Remover Modal */}
        {showBgRemover && selectedImage && (
          <div className="bg-remover-modal-overlay" onClick={() => setShowBgRemover(false)}>
            <div className="bg-remover-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bg-remover-header">
                <h3 className="bg-remover-title">Arka Plan Kaldır</h3>
                <button 
                  className="bg-remover-close"
                  onClick={() => setShowBgRemover(false)}
                >
                  ✕
                </button>
              </div>

              <div className="bg-remover-content">
                {/* Description */}
                <div className="bg-remover-mode-description">
                  <div className="mode-info">
                    <span className="info-icon">🤖</span>
                    <p><strong>AI Destekli Arka Plan Kaldırma:</strong> Yapay zeka ile profesyonel seviyede arka plan kaldırma. Saç, ince kenarlar ve karmaşık arka planlarda mükemmel sonuçlar verir. Python backend mevcut ise AI modeli kullanılır, yoksa gelişmiş canvas algoritması devreye girer.</p>
                  </div>
                </div>

                {/* Preview Section */}
                {bgRemoverPreview && (
                  <div className="bg-remover-preview-section">
                    <h4 className="preview-title">Önizleme</h4>
                    <div className="preview-container">
                      <img src={bgRemoverPreview} alt="Preview" className="preview-image" />
                      <div className="preview-note">
                        <span>💡</span> Bu bir önizlemedir. Tam çözünürlükte daha kaliteli sonuç alacaksınız.
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-remover-actions">
                  <button
                    className="bg-remover-btn bg-remover-btn-preview"
                    onClick={async () => {
                      if (!selectedImage) return;
                      
                      setIsGeneratingPreview(true);
                      try {
                        // Önce Python API'yi dene (daha iyi sonuç)
                        try {
                          const preview = await previewBackgroundRemovalPython(selectedImage);
                          setBgRemoverPreview(preview);
                        } catch (pythonError) {
                          // Python yoksa geliştirilmiş canvas fallback kullan
                          console.log('Python API not available, using improved canvas algorithm');
                          const preview = await previewBackgroundRemoval(
                            selectedImage,
                            'auto',
                            undefined,
                            50
                          );
                          setBgRemoverPreview(preview);
                        }
                      } catch (error) {
                        console.error('Preview error:', error);
                        alert('Önizleme oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
                      } finally {
                        setIsGeneratingPreview(false);
                      }
                    }}
                    disabled={isGeneratingPreview || isRemovingBackground}
                  >
                    {isGeneratingPreview ? 'Önizleme Oluşturuluyor...' : '👁️ Önizleme Göster'}
                  </button>
                  <button
                    className="bg-remover-btn bg-remover-btn-primary"
                    onClick={async () => {
                      if (!selectedImage) return;
                      
                      setIsRemovingBackground(true);
                      try {
                        let result: string;
                        
                        // Önce Python API'yi dene (en iyi sonuç için)
                        try {
                          result = await removeBackgroundDirectPython(selectedImage);
                          console.log('✅ Python rembg başarılı!');
                        } catch (pythonError) {
                          // Python yoksa geliştirilmiş canvas algoritması kullan
                          console.log('⚠️ Python API yok, geliştirilmiş canvas algoritması kullanılıyor...');
                          result = await removeBackgroundAuto(selectedImage, 50);
                        }
                        
                        setSelectedImage(result);
                        setShowBgRemover(false);
                        setBgRemoverPreview(null);
                      } catch (error) {
                        console.error('Background removal error:', error);
                        alert('Arka plan kaldırma sırasında bir hata oluştu. Lütfen Python backend\'in çalıştığından emin olun veya tekrar deneyin.');
                      } finally {
                        setIsRemovingBackground(false);
                      }
                    }}
                    disabled={isRemovingBackground}
                  >
                    {isRemovingBackground ? '⏳ İşleniyor...' : '✓ Arka Planı Kaldır'}
                  </button>
                  <button
                    className="bg-remover-btn bg-remover-btn-secondary"
                    onClick={() => {
                      setShowBgRemover(false);
                      setBgRemoverPreview(null);
                    }}
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Color Correction Modal */}
        {showColorCorrection && selectedImage && (
          <div className="bg-remover-modal-overlay" onClick={() => setShowColorCorrection(false)}>
            <div className="bg-remover-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bg-remover-header">
                <h3 className="bg-remover-title">Renk Düzeltme</h3>
                <button 
                  className="bg-remover-close"
                  onClick={() => setShowColorCorrection(false)}
                >
                  ✕
                </button>
              </div>

              <div className="bg-remover-content">
                {/* Description */}
                <div className="bg-remover-mode-description">
                  <div className="mode-info">
                    <span className="info-icon">🎨</span>
                    <p><strong>Otomatik Renk Düzeltme:</strong> Görseli analiz ederek dengeli ve doğal görünümlü düzeltmeler yapar:</p>
                    <ul style={{ marginTop: '12px', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8', opacity: 0.9 }}>
                      <li>🤍 <strong>White Balance:</strong> Dengeli renk sıcaklığı düzeltme</li>
                      <li>☀️ <strong>Exposure:</strong> Akıllı pozlama ve gölge aydınlatma</li>
                      <li>🎨 <strong>Saturation:</strong> Doğal doygunluk artırma (cilt tonu korumalı)</li>
                      <li>📊 <strong>Contrast:</strong> Adaptive kontrast iyileştirme</li>
                    </ul>
                    <p style={{ marginTop: '12px', fontSize: '12px', opacity: 0.8 }}>
                      Tüm düzeltmeler yumuşak ve doğal görünümlü olacak şekilde otomatik uygulanır.
                    </p>
                  </div>
                </div>

                {/* Preview Section */}
                {colorCorrectionPreview && (
                  <div className="bg-remover-preview-section">
                    <h4 className="preview-title">Önizleme</h4>
                    <div className="preview-container">
                      <img src={colorCorrectionPreview} alt="Preview" className="preview-image" />
                      <div className="preview-note">
                        <span>💡</span> Bu bir önizlemedir. Tam çözünürlükte daha kaliteli sonuç alacaksınız.
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-remover-actions">
                  <button
                    className="bg-remover-btn bg-remover-btn-preview"
                    onClick={async () => {
                      if (!selectedImage) return;
                      
                      setIsGeneratingColorPreview(true);
                      try {
                        const preview = await previewColorCorrection(selectedImage);
                        setColorCorrectionPreview(preview);
                      } catch (error) {
                        console.error('Color correction preview error:', error);
                        alert('Önizleme oluşturulurken bir hata oluştu.');
                      } finally {
                        setIsGeneratingColorPreview(false);
                      }
                    }}
                    disabled={isGeneratingColorPreview || isApplyingColorCorrection}
                  >
                    {isGeneratingColorPreview ? 'Önizleme Oluşturuluyor...' : '👁️ Önizleme Göster'}
                  </button>
                  <button
                    className="bg-remover-btn bg-remover-btn-primary"
                    onClick={async () => {
                      if (!selectedImage) return;
                      
                      setIsApplyingColorCorrection(true);
                      try {
                        const result = await autoColorCorrection(selectedImage);
                        setSelectedImage(result);
                        setShowColorCorrection(false);
                        setColorCorrectionPreview(null);
                      } catch (error) {
                        console.error('Color correction error:', error);
                        alert('Renk düzeltme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
                      } finally {
                        setIsApplyingColorCorrection(false);
                      }
                    }}
                    disabled={isApplyingColorCorrection}
                  >
                    {isApplyingColorCorrection ? '⏳ İşleniyor...' : '✓ Renkleri Düzelt'}
                  </button>
                  <button
                    className="bg-remover-btn bg-remover-btn-secondary"
                    onClick={() => {
                      setShowColorCorrection(false);
                      setColorCorrectionPreview(null);
                    }}
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Smart Sharpen Modal */}
        {showSharpen && selectedImage && (
          <div className="bg-remover-modal-overlay" onClick={() => setShowSharpen(false)}>
            <div className="bg-remover-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bg-remover-header">
                <h3 className="bg-remover-title">Akıllı Netleştirme</h3>
                <button 
                  className="bg-remover-close"
                  onClick={() => setShowSharpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="bg-remover-content">
                {/* Description */}
                <div className="bg-remover-mode-description">
                  <div className="mode-info">
                    <span className="info-icon">✨</span>
                    <p><strong>Akıllı Netleştirme ve 4K Upscaling:</strong> Bulanık ve düşük çözünürlüklü fotoğrafları profesyonel seviyede netleştirir:</p>
                    <ul style={{ marginTop: '12px', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8', opacity: 0.9 }}>
                      <li>📈 <strong>4K Upscaling:</strong> Düşük çözünürlüklü görselleri 4K'ya (3840x2160) yükseltir</li>
                      <li>🔍 <strong>Unsharp Mask:</strong> 3x3 kernel ile profesyonel netleştirme</li>
                      <li>⚡ <strong>Aspect Ratio Koruma:</strong> Orijinal görsel oranını korur</li>
                      <li>🎯 <strong>Yüksek Kalite:</strong> Canvas smoothing ile pürüzsüz sonuçlar</li>
                    </ul>
                    <p style={{ marginTop: '12px', fontSize: '12px', opacity: 0.8 }}>
                      Görsel otomatik analiz edilir ve en uygun yöntemlerle netleştirilir.
                    </p>
                  </div>
                </div>

                {/* Preview Section */}
                {sharpenPreview && (
                  <div className="bg-remover-preview-section">
                    <h4 className="preview-title">Önizleme</h4>
                    <div className="preview-container">
                      <img src={sharpenPreview} alt="Preview" className="preview-image" />
                      <div className="preview-note">
                        <span>💡</span> Bu bir önizlemedir. Tam işlemede görsel 4K'ya upscale edilip netleştirilecektir.
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-remover-actions">
                  <button
                    className="bg-remover-btn bg-remover-btn-preview"
                    onClick={async () => {
                      if (!selectedImage) return;
                      
                      setIsGeneratingSharpenPreview(true);
                      try {
                        const preview = await previewSharpen(selectedImage);
                        setSharpenPreview(preview);
                      } catch (error) {
                        console.error('Sharpen preview error:', error);
                        alert('Önizleme oluşturulurken bir hata oluştu.');
                      } finally {
                        setIsGeneratingSharpenPreview(false);
                      }
                    }}
                    disabled={isGeneratingSharpenPreview || isApplyingSharpen}
                  >
                    {isGeneratingSharpenPreview ? 'Önizleme Oluşturuluyor...' : '👁️ Önizleme Göster'}
                  </button>
                  <button
                    className="bg-remover-btn bg-remover-btn-primary"
                    onClick={async () => {
                      if (!selectedImage) return;
                      
                      setIsApplyingSharpen(true);
                      try {
                        const result = await smartSharpen(selectedImage);
                        setSelectedImage(result);
                        setShowSharpen(false);
                        setSharpenPreview(null);
                      } catch (error: any) {
                        console.error('Sharpen error:', error);
                        const errorMessage = error?.message || 'Bilinmeyen bir hata oluştu';
                        alert(`Netleştirme sırasında bir hata oluştu: ${errorMessage}. Lütfen görselin boyutunu kontrol edip tekrar deneyin.`);
                      } finally {
                        setIsApplyingSharpen(false);
                      }
                    }}
                    disabled={isApplyingSharpen}
                  >
                    {isApplyingSharpen ? '⏳ İşleniyor (Bu işlem biraz zaman alabilir)...' : '✨ Netleştir ve 4K\'ya Yükselt'}
                  </button>
                  <button
                    className="bg-remover-btn bg-remover-btn-secondary"
                    onClick={() => {
                      setShowSharpen(false);
                      setSharpenPreview(null);
                    }}
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tool Bar */}
        <div className="tool-bar">
          <div className="tool-scroll">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolPress(tool)}
                className={`tool-item ${
                  activeTool === tool.id ? 'tool-item-active' : ''
                }`}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-label">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorScreen;
