import React, { useRef, useEffect } from 'react';
import '../utils/animations.js'; // JavaScript animasyonları yükle
import './Button.css';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'premium';
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buttonRef.current || disabled || loading) return;
    
    // Hover scale efekti - JavaScript'ten (cleanup ile)
    if (window.Animations && window.Animations.addHoverScale) {
      const cleanup = window.Animations.addHoverScale(buttonRef.current, 1.05);
      return cleanup; // Cleanup fonksiyonunu döndür
    }
  }, [disabled, loading]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current && !disabled && !loading) {
      // Ripple efekti - JavaScript'ten
      if (window.Animations && window.Animations.createRipple) {
        window.Animations.createRipple(buttonRef.current, e.nativeEvent);
      }
    }
    onPress();
  };

  const baseClass = `btn btn-${variant}`;
  const classes = `${baseClass} ${className} ${disabled || loading ? 'btn-disabled' : ''} button-press`.trim();

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? (
        <span className="btn-loading">⏳</span>
      ) : (
        <span>{title}</span>
      )}
    </button>
  );
};
