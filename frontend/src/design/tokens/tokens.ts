// Design System Tokens - Centralized Design Variables
// This file contains all design tokens used throughout the application

// Color Palette - Updated to use CSS variables
export const colors = {
  // Primary Colors
  primary: {
    50: 'var(--primary-color-50, #eff6ff)',
    100: 'var(--primary-color-100, #dbeafe)',
    200: 'var(--primary-color-200, #bfdbfe)',
    300: 'var(--primary-color-300, #93c5fd)',
    400: 'var(--primary-color-400, #60a5fa)',
    500: 'var(--primary-color-500, #3b82f6)',
    600: 'var(--primary-color)', // Main primary color
    700: 'var(--primary-color-700, #1d4ed8)',
    800: 'var(--primary-color-800, #1e40af)',
    900: 'var(--primary-color-900, #1e3a8a)',
  },
  
  // Secondary Colors
  secondary: {
    50: 'var(--secondary-color-50, #f8fafc)',
    100: 'var(--secondary-color-100, #f1f5f9)',
    200: 'var(--secondary-color-200, #e2e8f0)',
    300: 'var(--secondary-color-300, #cbd5e1)',
    400: 'var(--secondary-color-400, #94a3b8)',
    500: 'var(--secondary-color-500, #64748b)',
    600: 'var(--secondary-color, #4b5563)', // Main secondary color
    700: 'var(--secondary-color-700, #334155)',
    800: 'var(--secondary-color-800, #1e293b)',
    900: 'var(--secondary-color-900, #0f172a)',
  },
  
  // Semantic Colors
  success: {
    50: 'var(--success-color-50, #f0fdf4)',
    100: 'var(--success-color-100, #dcfce7)',
    200: 'var(--success-color-200, #bbf7d0)',
    300: 'var(--success-color-300, #86efac)',
    400: 'var(--success-color-400, #4ade80)',
    500: 'var(--success-color-500, #22c55e)',
    600: 'var(--success-color, #16a34a)', // Main success color
    700: 'var(--success-color-700, #15803d)',
    800: 'var(--success-color-800, #166534)',
    900: 'var(--success-color-900, #14532d)',
  },
  
  warning: {
    50: 'var(--warning-color-50, #fffbeb)',
    100: 'var(--warning-color-100, #fef3c7)',
    200: 'var(--warning-color-200, #fde68a)',
    300: 'var(--warning-color-300, #fcd34d)',
    400: 'var(--warning-color-400, #fbbf24)',
    500: 'var(--warning-color-500, #f59e0b)',
    600: 'var(--warning-color, #ca8a04)', // Main warning color
    700: 'var(--warning-color-700, #a16207)',
    800: 'var(--warning-color-800, #854d0e)',
    900: 'var(--warning-color-900, #713f12)',
  },
  
  danger: {
    50: 'var(--danger-color-50, #fef2f2)',
    100: 'var(--danger-color-100, #fee2e2)',
    200: 'var(--danger-color-200, #fecaca)',
    300: 'var(--danger-color-300, #fca5a5)',
    400: 'var(--danger-color-400, #f87171)',
    500: 'var(--danger-color-500, #ef4444)',
    600: 'var(--danger-color, #dc2626)', // Main danger color
    700: 'var(--danger-color-700, #b91c1c)',
    800: 'var(--danger-color-800, #991b1b)',
    900: 'var(--danger-color-900, #7f1d1d)',
  },
  
  // Neutral Colors
  gray: {
    50: 'var(--gray-50, #f9fafb)',
    100: 'var(--gray-100, #f3f4f6)',
    200: 'var(--gray-200, #e5e7eb)',
    300: 'var(--gray-300, #d1d5db)',
    400: 'var(--gray-400, #9ca3af)',
    500: 'var(--gray-500, #6b7280)',
    600: 'var(--gray-600, #4b5563)',
    700: 'var(--gray-700, #374151)',
    800: 'var(--gray-800, #1f2937)',
    900: 'var(--gray-900, #111827)',
  },
  
  // Text Colors - Enhanced for better contrast
  text: {
    primary: 'var(--text-primary, #1f2937)', // Darker for better contrast
    secondary: 'var(--text-secondary, #4b5563)', // Darker for better contrast
    disabled: 'var(--text-light, #9ca3af)',
    white: 'var(--text-white, #ffffff)',
    inverse: 'var(--text-inverse, #ffffff)',
    muted: 'var(--text-muted, #6b7280)',
    emphasis: 'var(--text-emphasis, #1f2937)', // For important text
  },
  
  // Border Colors
  border: {
    light: 'var(--border-light, #e5e7eb)',
    default: 'var(--border-default, #d1d5db)',
    dark: 'var(--border-dark, #9ca3af)',
    focus: 'var(--border-focus, #2563eb)',
    error: 'var(--border-error, #dc2626)',
  },
  
  // Background Colors
  background: {
    primary: 'var(--background-primary, #ffffff)',
    secondary: 'var(--background-secondary, #f9fafb)',
    tertiary: 'var(--background-tertiary, #f3f4f6)',
    disabled: 'var(--background-disabled, #f9fafb)',
    overlay: 'var(--background-overlay, rgba(0, 0, 0, 0.5))',
  },
} as const;

// Spacing Scale
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
} as const;

// Site-Wide Margin System
export const margins = {
  // Section margins
  section: {
    top: '2rem',     // 32px
    bottom: '2rem',  // 32px
    between: '3rem', // 48px
  },
  
  // Component margins
  component: {
    top: '1rem',     // 16px
    bottom: '1rem',  // 16px
    between: '1.5rem', // 24px
  },
  
  // Box margins
  card: {
    top: '0.5rem',   // 8px
    bottom: '0.5rem', // 8px
    between: '1rem', // 16px
  },
  
  // Form margins
  form: {
    field: '0.75rem', // 12px
    section: '1.5rem', // 24px
    group: '1rem',    // 16px
  },
  
  // Navigation margins
  navigation: {
    item: '0.5rem',  // 8px
    group: '1rem',   // 16px
  },
} as const;

// Typography Scale
export const fontFamily = {
  sans: 'var(--font-family, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  md: '1rem',       // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
} as const;

// Font Weights
export const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  default: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  pill: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  focus: '0 0 0 3px rgba(37, 99, 235, 0.1)',
  error: '0 0 0 3px rgba(220, 38, 38, 0.1)',
} as const;

// Transitions
export const transitions = {
  fast: '0.15s ease-in-out',
  default: '0.2s ease-in-out',
  slow: '0.3s ease-in-out',
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Export all tokens as a single object for easy importing
export const designTokens = {
  colors,
  spacing,
  margins,
  fontFamily,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
} as const;

// Type exports for TypeScript
export type ColorToken = typeof colors;
export type SpacingToken = typeof spacing;
export type MarginToken = typeof margins;
export type FontFamilyToken = typeof fontFamily;
export type FontSizeToken = typeof fontSize;
export type FontWeightToken = typeof fontWeight;
export type BorderRadiusToken = typeof borderRadius;
export type ShadowToken = typeof shadows;
export type TransitionToken = typeof transitions;
export type ZIndexToken = typeof zIndex;
export type BreakpointToken = typeof breakpoints;
export type DesignTokens = typeof designTokens; 