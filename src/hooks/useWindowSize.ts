import { useState, useEffect, useCallback } from 'react';



interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface UseWindowSizeOptions {
  debounceMs?: number;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;

  return (...args: Parameters<T>) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

export function useWindowSize({
  debounceMs = 250,
  mobileBreakpoint = 640,
  tabletBreakpoint = 1024
}: UseWindowSizeOptions = {}): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setWindowSize({
      width,
      height,
      isMobile: width < mobileBreakpoint,
      isTablet: width >= mobileBreakpoint && width < tabletBreakpoint,
      isDesktop: width >= tabletBreakpoint
    });
  }, [mobileBreakpoint, tabletBreakpoint]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial call
    handleResize();

    // Set up debounced event listener
    const debouncedHandleResize = debounce(handleResize, debounceMs);
    window.addEventListener('resize', debouncedHandleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [debounceMs, handleResize]);

  return windowSize;
}

// Breakpoint constants
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
  DESKTOP: 1280,
  WIDE: 1536
} as const;

// Media query hooks
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Predefined media query hooks
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE - 1}px)`);
}

export function useIsTablet() {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS.MOBILE}px) and (max-width: ${BREAKPOINTS.TABLET - 1}px)`
  );
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.TABLET}px)`);
}

// Example usage:
/*
function ResponsiveComponent() {
  const { width, height, isMobile, isTablet, isDesktop } = useWindowSize();
  // or use individual hooks
  const isMobileView = useIsMobile();
  const isTabletView = useIsTablet();
  const isDesktopView = useIsDesktop();

  return (
    <div>
      <p>Window size: {width} x {height}</p>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
*/ 