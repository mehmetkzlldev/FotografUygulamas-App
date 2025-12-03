import React, { useState, useRef, useEffect } from 'react';
import { StickerElement as StickerElementType } from '../store/useAppStore';
import { getStickerById } from '../utils/stickers';
import './StickerElement.css';

interface StickerElementProps {
  stickerElement: StickerElementType;
  onUpdate: (updates: Partial<StickerElementType>) => void;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
  containerWidth: number;
  containerHeight: number;
}

export const StickerElement: React.FC<StickerElementProps> = ({
  stickerElement,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  containerWidth,
  containerHeight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const stickerRef = useRef<HTMLDivElement>(null);
  const sticker = getStickerById(stickerElement.stickerId);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !stickerRef.current) return;

      const container = stickerRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const x = ((e.clientX - containerRect.left - dragOffset.x) / containerRect.width) * 100;
      const y = ((e.clientY - containerRect.top - dragOffset.y) / containerRect.height) * 100;

      onUpdate({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, onUpdate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Silme butonuna tıklama kontrolü
    if ((e.target as HTMLElement).closest('.sticker-delete-btn')) {
      return;
    }
    
    setIsDragging(true);
    const rect = stickerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - (rect.width / 2),
        y: e.clientY - rect.top - (rect.height / 2),
      });
    }
    onSelect();
    e.preventDefault();
    e.stopPropagation();
  };

  const getStickerStyle = (): React.CSSProperties => {
    const scaleX = stickerElement.flipHorizontal ? -1 : 1;
    const scaleY = stickerElement.flipVertical ? -1 : 1;
    const rotationTransform = stickerElement.rotation !== 0 ? `rotate(${stickerElement.rotation}deg)` : '';
    const flipTransform = `scaleX(${scaleX}) scaleY(${scaleY})`;
    const baseTransform = `translate(-50%, -50%) ${rotationTransform} ${flipTransform}`.trim();

    // Shadow filter
    let filter = '';
    if (stickerElement.blur > 0) {
      filter += `blur(${stickerElement.blur}px) `;
    }

    // Shadow style
    const shadowStyle = stickerElement.shadow
      ? `${stickerElement.shadowOffsetX}px ${stickerElement.shadowOffsetY}px ${stickerElement.shadowBlur}px ${stickerElement.shadowColor}`
      : 'none';

    const styles: React.CSSProperties = {
      position: 'absolute',
      left: `${stickerElement.x}%`,
      top: `${stickerElement.y}%`,
      transform: baseTransform || 'translate(-50%, -50%)',
      fontSize: `${stickerElement.size}px`,
      opacity: stickerElement.opacity / 100,
      filter: filter.trim() || 'none',
      textShadow: shadowStyle,
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      outline: isSelected ? '2px dashed #6366F1' : 'none',
      outlineOffset: '4px',
      padding: '4px',
      borderRadius: '4px',
      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      transformOrigin: 'center center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: stickerElement.zIndex || 1,
    };
    return styles;
  };

  if (!sticker) return null;

  return (
    <div
      ref={stickerRef}
      className={`sticker-element ${isSelected ? 'sticker-element-selected' : ''}`}
      style={getStickerStyle()}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <span className="sticker-emoji">{sticker.emoji}</span>
      {isSelected && (
        <button
          className="sticker-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

