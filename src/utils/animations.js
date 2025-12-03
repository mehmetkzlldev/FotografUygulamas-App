/**
 * Animation Utilities - JavaScript
 * Tüm animasyon fonksiyonları
 */

// Fade in animasyonu
export function fadeIn(element, duration = 300) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease-in-out`;

    requestAnimationFrame(() => {
      element.style.opacity = '1';
      setTimeout(() => resolve(), duration);
    });
  });
}

// Fade out animasyonu
export function fadeOut(element, duration = 300) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';

    setTimeout(() => {
      element.style.display = 'none';
      resolve();
    }, duration);
  });
}

// Slide in animasyonu
export function slideIn(element, direction = 'left', duration = 300) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)',
    };

    element.style.transform = transforms[direction] || transforms.left;
    element.style.opacity = '0';
    element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
    element.style.display = 'block';

    requestAnimationFrame(() => {
      element.style.transform = 'translate(0, 0)';
      element.style.opacity = '1';
      setTimeout(() => resolve(), duration);
    });
  });
}

// Slide out animasyonu
export function slideOut(element, direction = 'left', duration = 300) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)',
    };

    element.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`;
    element.style.transform = transforms[direction] || transforms.left;
    element.style.opacity = '0';

    setTimeout(() => {
      element.style.display = 'none';
      resolve();
    }, duration);
  });
}

// Scale animasyonu
export function scale(element, from = 0, to = 1, duration = 300) {
  return scaleAnimation(element, from, to, duration);
}

function scaleAnimation(element, from = 0, to = 1, duration = 300) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    element.style.transform = `scale(${from})`;
    element.style.opacity = from === 0 ? '0' : '1';
    element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
    element.style.display = 'block';

    requestAnimationFrame(() => {
      element.style.transform = `scale(${to})`;
      element.style.opacity = to === 0 ? '0' : '1';
      setTimeout(() => resolve(), duration);
    });
  });
}

// Bounce animasyonu
export function bounce(element, duration = 600) {
  return bounceAnimation(element, duration);
}

function bounceAnimation(element, duration = 600) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    const keyframes = [
      { transform: 'scale(0.3)', opacity: 0 },
      { transform: 'scale(1.05)', opacity: 1 },
      { transform: 'scale(0.9)', opacity: 1 },
      { transform: 'scale(1)', opacity: 1 },
    ];

    const animation = element.animate(keyframes, {
      duration,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    });

    animation.onfinish = () => resolve();
  });
}

// Shake animasyonu
export function shakeAnimation(element, duration = 500) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    const keyframes = [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(0)' },
    ];

    const animation = element.animate(keyframes, {
      duration,
      easing: 'ease-in-out',
    });

    animation.onfinish = () => resolve();
  });
}

// Pulse animasyonu
export function pulseAnimation(element, duration = 1000, iterations = 3) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    const keyframes = [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.1)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 },
    ];

    const animation = element.animate(keyframes, {
      duration,
      iterations,
      easing: 'ease-in-out',
    });

    animation.onfinish = () => resolve();
  });
}

// Rotate animasyonu
export function rotateAnimation(element, degrees = 360, duration = 500) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    element.style.transition = `transform ${duration}ms ease-out`;
    element.style.transform = `rotate(${degrees}deg)`;

    setTimeout(() => {
      element.style.transform = '';
      resolve();
    }, duration);
  });
}

// Ripple efekti oluştur
export function createRipple(element, event) {
  if (!element || !event) return;
  
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
    z-index: 9999;
  `;

  // Ripple animation CSS ekle (eğer yoksa)
  if (!document.getElementById('ripple-animation-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-animation-style';
    style.textContent = `
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Element'in position'ını kontrol et
  const originalPosition = window.getComputedStyle(element).position;
  if (originalPosition === 'static') {
    element.style.position = 'relative';
  }

  element.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Hover scale efekti ekle - Cleanup için event listener'ları döndürür
export function addHoverScale(element, scale = 1.05) {
  if (!element) return () => {}; // Boş cleanup fonksiyonu
  
  element.style.transition = 'transform 0.2s ease-out';
  
  const handleMouseEnter = () => {
    element.style.transform = `scale(${scale})`;
  };

  const handleMouseLeave = () => {
    element.style.transform = 'scale(1)';
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  // Cleanup fonksiyonu döndür
  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    element.style.transform = '';
    element.style.transition = '';
  };
}

// Smooth scroll
export function smoothScrollTo(element, target, duration = 500) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    const start = element.scrollTop;
    const distance = target - start;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function (ease-in-out)
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      element.scrollTop = start + distance * ease;

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animation);
  });
}

// Progress bar animasyonu
export function animateProgress(element, target, duration = 1000) {
  return new Promise((resolve) => {
    if (!element) return resolve();
    
    const start = parseFloat(element.style.width) || 0;
    const distance = target - start;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + distance * ease;

      element.style.width = `${current}%`;

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animation);
  });
}

// Stagger animasyonu - Birden fazla elementi sırayla animasyonla
export async function staggerAnimation(elements, animationFn, delay = 50) {
  for (let i = 0; i < elements.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, delay * i));
    if (elements[i] && animationFn) {
      await animationFn(elements[i]);
    }
  }
}

// Element'e animasyon class'ı ekle/kaldır
export function addAnimationClass(element, className, duration = 300) {
  if (!element) return;
  
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}

// Loading spinner oluştur
export function createLoadingSpinner(container) {
  if (!container) return null;
  
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  spinner.innerHTML = `
    <div class="spinner-ring"></div>
    <div class="spinner-ring"></div>
    <div class="spinner-ring"></div>
    <div class="spinner-ring"></div>
  `;
  
  // Spinner CSS ekle (eğer yoksa)
  if (!document.getElementById('spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = `
      .loading-spinner {
        display: inline-block;
        position: relative;
        width: 40px;
        height: 40px;
      }
      .spinner-ring {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 32px;
        height: 32px;
        margin: 4px;
        border: 3px solid #fff;
        border-radius: 50%;
        animation: spinner-rotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: #fff transparent transparent transparent;
      }
      .spinner-ring:nth-child(1) { animation-delay: -0.45s; }
      .spinner-ring:nth-child(2) { animation-delay: -0.3s; }
      .spinner-ring:nth-child(3) { animation-delay: -0.15s; }
      @keyframes spinner-rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  container.appendChild(spinner);
  return spinner;
}

// Global animasyon helper'ları (browser'da kullanım için)
if (typeof window !== 'undefined') {
  window.Animations = {
    fadeIn,
    fadeOut,
    slideIn,
    slideOut,
    scale,
    bounce,
    shake: shakeAnimation,
    pulse: pulseAnimation,
    rotate: rotateAnimation,
    createRipple,
    addHoverScale,
    smoothScroll: smoothScrollTo,
    animateProgress,
    stagger: staggerAnimation,
    addAnimationClass,
    createLoadingSpinner,
  };
}

