/**
 * Animation Utilities
 * JavaScript ile animasyon ve geçiş fonksiyonları
 */

/**
 * Fade in animasyonu
 * @param element - Animasyon uygulanacak element
 * @param duration - Süre (ms)
 * @returns Promise
 */
export function fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
  return new Promise((resolve) => {
    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease-in-out`;

    requestAnimationFrame(() => {
      element.style.opacity = '1';
      setTimeout(() => resolve(), duration);
    });
  });
}

/**
 * Fade out animasyonu
 * @param element - Animasyon uygulanacak element
 * @param duration - Süre (ms)
 * @returns Promise
 */
export function fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';

    setTimeout(() => {
      element.style.display = 'none';
      resolve();
    }, duration);
  });
}

/**
 * Slide in animasyonu
 * @param element - Animasyon uygulanacak element
 * @param direction - Yön ('left', 'right', 'top', 'bottom')
 * @param duration - Süre (ms)
 * @returns Promise
 */
export function slideIn(
  element: HTMLElement,
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left',
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const transforms: Record<string, string> = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)',
    };

    element.style.transform = transforms[direction];
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

/**
 * Slide out animasyonu
 * @param element - Animasyon uygulanacak element
 * @param direction - Yön
 * @param duration - Süre (ms)
 * @returns Promise
 */
export function slideOut(
  element: HTMLElement,
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left',
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const transforms: Record<string, string> = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)',
    };

    element.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`;
    element.style.transform = transforms[direction];
    element.style.opacity = '0';

    setTimeout(() => {
      element.style.display = 'none';
      resolve();
    }, duration);
  });
}

/**
 * Scale animasyonu
 * @param element - Animasyon uygulanacak element
 * @param from - Başlangıç scale (0-1)
 * @param to - Bitiş scale (0-1)
 * @param duration - Süre (ms)
 * @returns Promise
 */
export function scale(
  element: HTMLElement,
  from: number = 0,
  to: number = 1,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
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

/**
 * Bounce animasyonu
 * @param element - Animasyon uygulanacak element
 * @param duration - Süre (ms)
 * @returns Promise
 */
export function bounce(element: HTMLElement, duration: number = 600): Promise<void> {
  return new Promise((resolve) => {
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

/**
 * Shake animasyonu
 * @param element - Animasyon uygulanacak element
 * @param duration - Süre (ms)
 * @returns Promise
 */
export function shake(element: HTMLElement, duration: number = 500): Promise<void> {
  return new Promise((resolve) => {
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

/**
 * Pulse animasyonu
 * @param element - Animasyon uygulanacak element
 * @param duration - Süre (ms)
 * @param iterations - Tekrar sayısı
 * @returns Promise
 */
export function pulse(
  element: HTMLElement,
  duration: number = 1000,
  iterations: number = 3
): Promise<void> {
  return new Promise((resolve) => {
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

/**
 * Rotate animasyonu
 * @param element - Animasyon uygulanacak element
 * @param degrees - Döndürme açısı
 * @param duration - Süre (ms)
 * @returns Promise
 */
export function rotate(
  element: HTMLElement,
  degrees: number = 360,
  duration: number = 500
): Promise<void> {
  return new Promise((resolve) => {
    element.style.transition = `transform ${duration}ms ease-out`;
    element.style.transform = `rotate(${degrees}deg)`;

    setTimeout(() => {
      element.style.transform = '';
      resolve();
    }, duration);
  });
}

/**
 * Smooth scroll
 * @param element - Scroll edilecek element
 * @param target - Hedef pozisyon
 * @param duration - Süre (ms)
 * @returns Promise
 */
export function smoothScroll(
  element: HTMLElement,
  target: number,
  duration: number = 500
): Promise<void> {
  return new Promise((resolve) => {
    const start = element.scrollTop;
    const distance = target - start;
    let startTime: number | null = null;

    function animation(currentTime: number) {
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

/**
 * Stagger animasyonu - Birden fazla elementi sırayla animasyonla
 * @param elements - Element array'i
 * @param animationFn - Uygulanacak animasyon fonksiyonu
 * @param delay - Her element arası gecikme (ms)
 * @returns Promise
 */
export async function stagger(
  elements: HTMLElement[],
  animationFn: (el: HTMLElement) => Promise<void>,
  delay: number = 50
): Promise<void> {
  for (let i = 0; i < elements.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, delay * i));
    await animationFn(elements[i]);
  }
}

/**
 * Loading spinner animasyonu oluştur
 * @param container - Container elementi
 * @returns Spinner elementi
 */
export function createLoadingSpinner(container: HTMLElement): HTMLElement {
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  spinner.innerHTML = `
    <div class="spinner-ring"></div>
    <div class="spinner-ring"></div>
    <div class="spinner-ring"></div>
    <div class="spinner-ring"></div>
  `;
  container.appendChild(spinner);
  return spinner;
}

/**
 * Progress bar animasyonu
 * @param element - Progress bar elementi
 * @param target - Hedef yüzde (0-100)
 * @param duration - Süre (ms)
 * @returns Promise
 */
export function animateProgress(
  element: HTMLElement,
  target: number,
  duration: number = 1000
): Promise<void> {
  return new Promise((resolve) => {
    const start = parseFloat(element.style.width) || 0;
    const distance = target - start;
    let startTime: number | null = null;

    function animation(currentTime: number) {
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

/**
 * Hover efekti - Scale up on hover
 * @param element - Element
 * @param scale - Scale değeri (default: 1.05)
 */
export function addHoverScale(element: HTMLElement, scale: number = 1.05): void {
  element.style.transition = 'transform 0.2s ease-out';
  
  element.addEventListener('mouseenter', () => {
    element.style.transform = `scale(${scale})`;
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = 'scale(1)';
  });
}

/**
 * Ripple efekti (Material Design style)
 * @param element - Tıklanan element
 * @param event - Mouse event
 */
export function createRipple(element: HTMLElement, event: MouseEvent): void {
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.className = 'ripple-effect';

  element.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

/**
 * Parallax scroll efekti
 * @param element - Element
 * @param speed - Hız faktörü (0-1)
 */
export function addParallax(element: HTMLElement, speed: number = 0.5): void {
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + scrolled;
    const windowHeight = window.innerHeight;

    if (scrolled + windowHeight > elementTop && scrolled < elementTop + rect.height) {
      const yPos = -(scrolled - elementTop) * speed;
      element.style.transform = `translateY(${yPos}px)`;
    }
  };

  window.addEventListener('scroll', handleScroll);
  
  // Cleanup için return
  return () => window.removeEventListener('scroll', handleScroll);
}

/**
 * Intersection Observer ile görünürlük animasyonu
 * @param elements - Elementler
 * @param animationFn - Animasyon fonksiyonu
 * @param threshold - Görünürlük threshold'u (0-1)
 */
export function observeVisibility(
  elements: HTMLElement[],
  animationFn: (el: HTMLElement) => Promise<void>,
  threshold: number = 0.1
): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animationFn(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold }
  );

  elements.forEach((el) => observer.observe(el));
}

