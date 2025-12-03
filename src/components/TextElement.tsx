import React, { useState, useRef, useEffect } from 'react';
import { TextElement as TextElementType } from '../store/useAppStore';
import './TextElement.css';

interface TextElementProps {
  textElement: TextElementType;
  onUpdate: (updates: Partial<TextElementType>) => void;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
  containerWidth: number;
  containerHeight: number;
}

export const TextElement: React.FC<TextElementProps> = ({
  textElement,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  containerWidth,
  containerHeight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && textRef.current) {
      textRef.current.focus();
    }
  }, [isSelected]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.detail === 2) return; // Double click için drag engelle
    setIsDragging(true);
    const rect = textRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - (rect.width / 2),
        y: e.clientY - rect.top - (rect.height / 2),
      });
    }
    onSelect();
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !textRef.current) return;

      const container = textRef.current.parentElement;
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

  const getTextStyle = (): React.CSSProperties => {
    const rotationTransform = textElement.rotation !== 0 ? `rotate(${textElement.rotation}deg)` : '';
    const baseTransform = `translate(-50%, -50%) ${rotationTransform}`.trim();
    
    // Gradient için background ve color ayarla
    let textColor = textElement.color;
    let backgroundGradient = undefined;
    
    if (textElement.hasGradient && textElement.gradientColors.length >= 2) {
      const gradient = `linear-gradient(${textElement.gradientDirection}deg, ${textElement.gradientColors.join(', ')})`;
      backgroundGradient = gradient;
      textColor = 'transparent';
    }
    
    const styles: React.CSSProperties = {
      position: 'absolute',
      left: `${textElement.x}%`,
      top: `${textElement.y}%`,
      transform: baseTransform || 'translate(-50%, -50%)',
      fontSize: `${textElement.fontSize}px`,
      fontFamily: textElement.fontFamily,
      color: textColor,
      fontWeight: textElement.fontWeight,
      textAlign: textElement.alignment,
      textTransform: textElement.textTransform,
      letterSpacing: `${textElement.letterSpacing}px`,
      lineHeight: textElement.lineHeight,
      opacity: textElement.opacity / 100,
      background: backgroundGradient,
      WebkitBackgroundClip: textElement.hasGradient ? 'text' : undefined,
      backgroundClip: textElement.hasGradient ? 'text' : undefined,
      WebkitTextFillColor: textElement.hasGradient ? 'transparent' : undefined,
      textShadow: textElement.hasShadow
        ? `2px 2px 4px rgba(0, 0, 0, 0.8)`
        : undefined,
      WebkitTextStroke: textElement.hasOutline
        ? `${textElement.outlineWidth}px ${textElement.outlineColor}`
        : undefined,
      filter: textElement.blur > 0 ? `blur(${textElement.blur}px)` : undefined,
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      outline: isSelected ? '2px dashed #6366F1' : 'none',
      outlineOffset: '4px',
      padding: textElement.hasBackground ? '4px 8px' : '4px 8px',
      borderRadius: '4px',
      backgroundColor: isSelected 
        ? 'rgba(99, 102, 241, 0.1)' 
        : textElement.hasBackground && !textElement.hasGradient
          ? textElement.backgroundColor 
          : 'transparent',
      maxWidth: '90%',
      wordWrap: 'break-word',
      transformOrigin: 'center center',
    };
    return styles;
  };

  return (
    <div
      ref={textRef}
      className={`text-element ${isSelected ? 'text-element-selected' : ''}`}
      style={getTextStyle()}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (e.detail === 1) {
          setTimeout(() => {
            if (!isDragging) {
              onSelect();
            }
          }, 100);
        }
      }}
      contentEditable={isSelected}
      suppressContentEditableWarning
      onBlur={(e) => {
        const newText = e.currentTarget.textContent || '';
        if (newText !== textElement.text) {
          onUpdate({ text: newText });
        }
      }}
    >
      {textElement.text}
      {isSelected && (
        <button
          className="text-delete-btn"
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

