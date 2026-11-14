import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that whenever the user navigates to a new page/route,
 * the window and any scrollable container automatically resets to the top (0, 0),
 * starting from the hero section rather than preserving previous scroll depth.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1. Immediate scroll reset on window and document root
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 2. Reset any scrollable layout or main containers (excluding sidebars & navigation menus)
    const scrollContainers = document.querySelectorAll<HTMLElement>(
      'main, #root, [style*="overflow"], .overflow-y-auto, .overflow-auto'
    );
    scrollContainers.forEach(container => {
      // Do not reset scroll on sidebars or navigation panels
      if (
        container.closest('aside') ||
        container.closest('nav') ||
        container.closest('[data-sidebar]') ||
        container.getAttribute('data-sidebar') !== null ||
        container.tagName === 'ASIDE' ||
        container.tagName === 'NAV'
      ) {
        return;
      }
      container.scrollTop = 0;
    });

    // 3. Fallback on next animation frame in case elements render asynchronously
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, search]);

  return null;
};

