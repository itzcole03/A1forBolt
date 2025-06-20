/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        // Enhanced Brand Colors with consistent scale
        brand: {
          25: "#F2F7FF",
          50: "#E5F0FF",
          100: "#CCE1FF",
          200: "#99C2FF",
          300: "#66A3FF",
          400: "#3385FF",
          500: "#0066FF", // Primary brand color
          600: "#0052CC",
          700: "#003D99",
          800: "#002966",
          900: "#161950",
          950: "#0A0D2B",
        },
        // Success Colors (Green)
        success: {
          25: "#F0FDF4",
          50: "#DCFCE7",
          100: "#BBF7D0",
          200: "#86EFAC",
          300: "#4ADE80",
          400: "#22C55E",
          500: "#16A34A", // Success primary
          600: "#15803D",
          700: "#166534",
          800: "#14532D",
          900: "#052E16",
          950: "#041E0E",
        },
        // Error Colors (Red)
        error: {
          25: "#FFFBFA",
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444", // Error primary
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
          950: "#450A0A",
        },
        // Warning Colors (Amber/Yellow)
        warning: {
          25: "#FFFCF5",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B", // Warning primary
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          950: "#451A03",
        },
        // Neutral Grays (Enhanced)
        gray: {
          25: "#FCFCFD",
          50: "#F9FAFB",
          100: "#F2F4F7",
          200: "#E4E7EC",
          300: "#D0D5DD",
          400: "#98A2B3",
          500: "#667085",
          600: "#475467",
          700: "#344054",
          800: "#1D2939",
          900: "#101828",
          950: "#0C111D",
        },
        // Legacy primary mapping for backward compatibility
        primary: {
          50: "#E5F0FF",
          100: "#CCE1FF",
          200: "#99C2FF",
          300: "#66A3FF",
          400: "#3385FF",
          500: "#0066FF",
          600: "#0052CC",
          700: "#003D99",
          800: "#002966",
          900: "#161950",
        },
        // Surface colors for cards and panels
        surface: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        92: "23rem",
        96: "24rem",
        128: "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        medium:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        large:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        glass: "0 8px 32px rgba(31, 38, 135, 0.37)",
        brandShadow: "0 4px 14px 0 rgba(0, 102, 255, 0.39)",
        successShadow: "0 4px 14px 0 rgba(22, 163, 74, 0.39)",
        errorShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.39)",
        warningShadow: "0 4px 14px 0 rgba(245, 158, 11, 0.39)",
        "inner-soft": "inset 0 1px 3px 0 rgba(0, 0, 0, 0.08)",
        glow: "0 0 20px rgba(0, 102, 255, 0.3)",
        "glow-success": "0 0 20px rgba(22, 163, 74, 0.3)",
        "glow-error": "0 0 20px rgba(239, 68, 68, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 3s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "odds-flash": "oddsFlash 0.3s ease-out",
        "spin-slow": "spin 3s linear infinite",
        "bounce-soft": "bounceSoft 1s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(0, 102, 255, 0.4)" },
          "100%": { boxShadow: "0 0 40px rgba(0, 102, 255, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        oddsFlash: {
          "0%": { backgroundColor: "rgba(251, 191, 36, 0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
      screens: {
        xs: "475px",
        "3xl": "1920px",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      fontSize: {
        "2xs": "0.625rem",
        "3xs": "0.5rem",
      },
      lineHeight: {
        12: "3rem",
        14: "3.5rem",
        16: "4rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      minHeight: {
        12: "3rem",
        16: "4rem",
        20: "5rem",
      },
    },
  },
  plugins: [
    // Add any plugins here if needed
    function ({ addUtilities, addComponents, theme }) {
      addComponents({
        // Glass morphism utilities
        ".glass-morphism": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        },
        ".glass-morphism-dark": {
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        },
        // Scrollbar styles
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-thin": {
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: theme("colors.gray.100"),
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme("colors.gray.300"),
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: theme("colors.gray.400"),
          },
        },
        // Text gradients
        ".text-gradient-brand": {
          background: `linear-gradient(135deg, ${theme("colors.brand.500")}, ${theme("colors.brand.700")})`,
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".text-gradient-success": {
          background: `linear-gradient(135deg, ${theme("colors.success.500")}, ${theme("colors.success.700")})`,
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".text-gradient-error": {
          background: `linear-gradient(135deg, ${theme("colors.error.500")}, ${theme("colors.error.700")})`,
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
      });

      addUtilities({
        // Layout utilities
        ".flex-center": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        ".flex-between": {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
        ".flex-around": {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        },
        ".flex-evenly": {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-evenly",
        },
        // Grid utilities
        ".grid-center": {
          display: "grid",
          placeItems: "center",
        },
        // Safe area utilities for mobile
        ".safe-top": {
          paddingTop: "env(safe-area-inset-top)",
        },
        ".safe-bottom": {
          paddingBottom: "env(safe-area-inset-bottom)",
        },
        ".safe-left": {
          paddingLeft: "env(safe-area-inset-left)",
        },
        ".safe-right": {
          paddingRight: "env(safe-area-inset-right)",
        },
      });
    },
  ],
};
