/**
 * React Hook for Animations
 * React component'lerinde animasyon kullanımı için hook
 */

import { useEffect, useRef, useState } from 'react';
import { fadeIn, fadeOut, slideIn, slideOut, scale, bounce } from '../utils/animations';

/**
 * Fade in/out hook
 */
export function useFade(initialVisible: boolean = false) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const elementRef = useRef<HTMLElement>(null);

  const show = async () => {
    if (elementRef.current) {
      await fadeIn(elementRef.current);
      setIsVisible(true);
    }
  };

  const hide = async () => {
    if (elementRef.current) {
      await fadeOut(elementRef.current);
      setIsVisible(false);
    }
  };

  const toggle = async () => {
    if (isVisible) {
      await hide();
    } else {
      await show();
    }
  };

  return { isVisible, show, hide, toggle, elementRef };
}

/**
 * Slide in/out hook
 */
export function useSlide(direction: 'left' | 'right' | 'top' | 'bottom' = 'left') {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const show = async () => {
    if (elementRef.current) {
      await slideIn(elementRef.current, direction);
      setIsVisible(true);
    }
  };

  const hide = async () => {
    if (elementRef.current) {
      await slideOut(elementRef.current, direction);
      setIsVisible(false);
    }
  };

  const toggle = async () => {
    if (isVisible) {
      await hide();
    } else {
      await show();
    }
  };

  return { isVisible, show, hide, toggle, elementRef };
}

/**
 * Scale animation hook
 */
export function useScale() {
  const elementRef = useRef<HTMLElement>(null);

  const scaleUp = async () => {
    if (elementRef.current) {
      await scale(elementRef.current, 0, 1);
    }
  };

  const scaleDown = async () => {
    if (elementRef.current) {
      await scale(elementRef.current, 1, 0);
    }
  };

  return { scaleUp, scaleDown, elementRef };
}

/**
 * Bounce animation hook
 */
export function useBounce() {
  const elementRef = useRef<HTMLElement>(null);

  const trigger = async () => {
    if (elementRef.current) {
      await bounce(elementRef.current);
    }
  };

  return { trigger, elementRef };
}

/**
 * Mount animation hook - Component mount olduğunda otomatik animasyon
 */
export function useMountAnimation(
  animationType: 'fade' | 'slide' | 'scale' | 'bounce' = 'fade',
  delay: number = 0
) {
  const elementRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (elementRef.current && !hasAnimated) {
      const timer = setTimeout(async () => {
        switch (animationType) {
          case 'fade':
            await fadeIn(elementRef.current!);
            break;
          case 'slide':
            await slideIn(elementRef.current!, 'left');
            break;
          case 'scale':
            await scale(elementRef.current!, 0, 1);
            break;
          case 'bounce':
            await bounce(elementRef.current!);
            break;
        }
        setHasAnimated(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [animationType, delay, hasAnimated]);

  return elementRef;
}

/**
 * Hover animation hook
 */
export function useHover(scale: number = 1.05) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      const element = elementRef.current;
      element.style.transition = 'transform 0.2s ease-out';

      const handleMouseEnter = () => {
        element.style.transform = `scale(${scale})`;
      };

      const handleMouseLeave = () => {
        element.style.transform = 'scale(1)';
      };

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [scale]);

  return elementRef;
}

