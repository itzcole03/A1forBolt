import { useState, useEffect } from 'react';

type MediaQuery = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isDarkMode: boolean;
  isReducedMotion: boolean;
};

const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px) and (max-width: 1439px)',
  largeDesktop: '(min-width: 1440px)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  darkMode: '(prefers-color-scheme: dark)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
};

export const useMediaQuery = (): MediaQuery => {
  const [mediaQuery, setMediaQuery] = useState<MediaQuery>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    isPortrait: false,
    isLandscape: false,
    isDarkMode: false,
    isReducedMotion: false,
  });

  useEffect(() => {
    const mediaQueryLists = {
      mobile: window.matchMedia(breakpoints.mobile),
      tablet: window.matchMedia(breakpoints.tablet),
      desktop: window.matchMedia(breakpoints.desktop),
      largeDesktop: window.matchMedia(breakpoints.largeDesktop),
      portrait: window.matchMedia(breakpoints.portrait),
      landscape: window.matchMedia(breakpoints.landscape),
      darkMode: window.matchMedia(breakpoints.darkMode),
      reducedMotion: window.matchMedia(breakpoints.reducedMotion),
    };

    const updateMediaQuery = () => {
      setMediaQuery({
        isMobile: mediaQueryLists.mobile.matches,
        isTablet: mediaQueryLists.tablet.matches,
        isDesktop: mediaQueryLists.desktop.matches,
        isLargeDesktop: mediaQueryLists.largeDesktop.matches,
        isPortrait: mediaQueryLists.portrait.matches,
        isLandscape: mediaQueryLists.landscape.matches,
        isDarkMode: mediaQueryLists.darkMode.matches,
        isReducedMotion: mediaQueryLists.reducedMotion.matches,
      });
    };

    // Initial check
    updateMediaQuery();

    // Add event listeners
    Object.values(mediaQueryLists).forEach(mediaQueryList => {
      mediaQueryList.addEventListener('change', updateMediaQuery);
    });

    // Cleanup
    return () => {
      Object.values(mediaQueryLists).forEach(mediaQueryList => {
        mediaQueryList.removeEventListener('change', updateMediaQuery);
      });
    };
  }, []);

  return mediaQuery;
};
