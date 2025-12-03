/**
 * Animations global type definitions
 */

interface Window {
  Animations?: {
    fadeIn: (element: HTMLElement, duration?: number) => Promise<void>;
    fadeOut: (element: HTMLElement, duration?: number) => Promise<void>;
    slideIn: (element: HTMLElement, direction?: string, duration?: number) => Promise<void>;
    slideOut: (element: HTMLElement, direction?: string, duration?: number) => Promise<void>;
    scale: (element: HTMLElement, from?: number, to?: number, duration?: number) => Promise<void>;
    bounce: (element: HTMLElement, duration?: number) => Promise<void>;
    shake: (element: HTMLElement, duration?: number) => Promise<void>;
    pulse: (element: HTMLElement, duration?: number, iterations?: number) => Promise<void>;
    rotate: (element: HTMLElement, degrees?: number, duration?: number) => Promise<void>;
    createRipple: (element: HTMLElement, event: MouseEvent) => void;
    addHoverScale: (element: HTMLElement, scale?: number) => (() => void) | undefined;
    smoothScroll: (element: HTMLElement, target: number, duration?: number) => Promise<void>;
    animateProgress: (element: HTMLElement, target: number, duration?: number) => Promise<void>;
    stagger: (elements: HTMLElement[], animationFn: (el: HTMLElement) => Promise<void>, delay?: number) => Promise<void>;
    addAnimationClass: (element: HTMLElement, className: string, duration?: number) => void;
    createLoadingSpinner: (container: HTMLElement) => HTMLElement | null;
  };
}

