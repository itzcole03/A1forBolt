import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

const breakpoints = {
  mobile: 767,
  tablet: 1023,
  desktop: 1439,
};

export const useWindowResize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= breakpoints.mobile,
    isTablet: window.innerWidth > breakpoints.mobile && window.innerWidth <= breakpoints.tablet,
    isDesktop: window.innerWidth > breakpoints.tablet && window.innerWidth <= breakpoints.desktop,
    isLargeDesktop: window.innerWidth > breakpoints.desktop,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({
        width,
        height,
        isMobile: width <= breakpoints.mobile,
        isTablet: width > breakpoints.mobile && width <= breakpoints.tablet,
        isDesktop: width > breakpoints.tablet && width <= breakpoints.desktop,
        isLargeDesktop: width > breakpoints.desktop,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Example usage:
// const { width, height, isMobile, isTablet, isDesktop, isLargeDesktop } = useWindowResize();
//
// return (
//   <div>
//     <p>Window width: {width}px</p>
//     <p>Window height: {height}px</p>
//     {isMobile && <p>Mobile view</p>}
//     {isTablet && <p>Tablet view</p>}
//     {isDesktop && <p>Desktop view</p>}
//     {isLargeDesktop && <p>Large desktop view</p>}
//   </div>
// );
