// Advanced Theme System for Premium Betting Platform
export const premiumTheme = {
  colors: {
    // Premium Brand Colors
    brand: {
      25: "#F2F7FF",
      50: "#E5F0FF",
      100: "#CCE1FF",
      200: "#99C2FF",
      300: "#66A3FF",
      400: "#3385FF",
      500: "#0066FF", // Primary brand
      600: "#0052CC",
      700: "#003D99",
      800: "#002966",
      900: "#161950",
      950: "#0A0D2B",
    },
    // Sophisticated Grays
    gray: {
      25: "#FEFEFF",
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
      950: "#0B0E14",
    },
    // Success/Win Colors
    success: {
      25: "#F0FDF4",
      50: "#DCFCE7",
      100: "#BBF7D0",
      200: "#86EFAC",
      300: "#4ADE80",
      400: "#22C55E",
      500: "#16A34A",
      600: "#15803D",
      700: "#166534",
      800: "#14532D",
      900: "#052E16",
    },
    // Error/Loss Colors
    error: {
      25: "#FFFBFA",
      50: "#FEF2F2",
      100: "#FEE2E2",
      200: "#FECACA",
      300: "#FCA5A5",
      400: "#F87171",
      500: "#EF4444",
      600: "#DC2626",
      700: "#B91C1C",
      800: "#991B1B",
      900: "#7F1D1D",
    },
    // Warning/Neutral Colors
    warning: {
      25: "#FFFCF5",
      50: "#FFFBEB",
      100: "#FEF3C7",
      200: "#FDE68A",
      300: "#FCD34D",
      400: "#FBBF24",
      500: "#F59E0B",
      600: "#D97706",
      700: "#B45309",
      800: "#92400E",
      900: "#78350F",
    },
    // Premium Gradients
    gradients: {
      primary: "linear-gradient(135deg, #0066FF 0%, #003D99 100%)",
      success: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
      error: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
      warning: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      dark: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
      premium:
        "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 25%, #6D28D9 50%, #5B21B6 75%, #4C1D95 100%)",
      neon: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 50%, #0066FF 100%)",
      sunset:
        "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 25%, #FF6B35 50%, #F7931E 75%, #FFD93D 100%)",
    },
  },

  // Advanced Shadows
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",

    // Premium Colored Shadows
    brandShadow: "0 10px 25px -5px rgba(0, 102, 255, 0.25)",
    successShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.25)",
    errorShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.25)",

    // Glassmorphism Effects
    glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    glassInset: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",

    // Neumorphism
    neuLight: "20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff",
    neuDark: "20px 20px 60px #1a1a1a, -20px -20px 60px #2e2e2e",
  },

  // Typography System
  typography: {
    fonts: {
      primary:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace',
      display: '"Clash Display", "Inter", sans-serif',
    },
    sizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
      "7xl": "4.5rem", // 72px
      "8xl": "6rem", // 96px
      "9xl": "8rem", // 128px
    },
    weights: {
      thin: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
  },

  // Spacing System
  spacing: {
    px: "1px",
    0: "0",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    11: "2.75rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
  },

  // Border Radius
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    "4xl": "2rem",
    full: "9999px",
  },

  // Animation & Transitions
  animations: {
    durations: {
      fast: "150ms",
      normal: "250ms",
      slow: "400ms",
      slower: "600ms",
    },
    easings: {
      linear: "linear",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
  },

  // Breakpoints
  breakpoints: {
    xs: "475px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// Theme utility functions
export const getThemeColor = (colorPath: string) => {
  const keys = colorPath.split(".");
  let result = premiumTheme.colors as any;

  for (const key of keys) {
    result = result[key];
    if (!result) return null;
  }

  return result;
};

export const createCSSVariables = () => {
  const cssVars: Record<string, string> = {};

  // Brand colors
  Object.entries(premiumTheme.colors.brand).forEach(([key, value]) => {
    cssVars[`--color-brand-${key}`] = value;
  });

  // Gray colors
  Object.entries(premiumTheme.colors.gray).forEach(([key, value]) => {
    cssVars[`--color-gray-${key}`] = value;
  });

  // Success colors
  Object.entries(premiumTheme.colors.success).forEach(([key, value]) => {
    cssVars[`--color-success-${key}`] = value;
  });

  // Error colors
  Object.entries(premiumTheme.colors.error).forEach(([key, value]) => {
    cssVars[`--color-error-${key}`] = value;
  });

  // Warning colors
  Object.entries(premiumTheme.colors.warning).forEach(([key, value]) => {
    cssVars[`--color-warning-${key}`] = value;
  });

  return cssVars;
};

export type PremiumTheme = typeof premiumTheme;
