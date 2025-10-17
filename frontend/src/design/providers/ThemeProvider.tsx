'use client';

import React, { createContext, useContext } from 'react';
import { designTokens } from '../tokens/tokens';
import { variants } from '../tokens/variants';

// Theme context type
interface ThemeContextType {
  tokens: typeof designTokens;
  variants: typeof variants;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
  customTokens?: Partial<typeof designTokens>;
  customVariants?: Partial<typeof variants>;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  customTokens = {},
  customVariants = {},
}) => {
  const theme = {
    tokens: { ...designTokens, ...customTokens },
    variants: { ...variants, ...customVariants },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook to use design tokens
export const useTokens = () => {
  const { tokens } = useTheme();
  return tokens;
};

// Hook to use variants
export const useVariants = () => {
  const { variants } = useTheme();
  return variants;
};

// Hook to use specific token categories
export const useColors = () => {
  const { tokens } = useTheme();
  return tokens.colors;
};

export const useSpacing = () => {
  const { tokens } = useTheme();
  return tokens.spacing;
};

export const useTypography = () => {
  const { tokens } = useTheme();
  return {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize,
    fontWeight: tokens.fontWeight,
  };
};

export const useBreakpoints = () => {
  const { tokens } = useTheme();
  return tokens.breakpoints;
};

export const useShadows = () => {
  const { tokens } = useTheme();
  return tokens.shadows;
};

export const useTransitions = () => {
  const { tokens } = useTheme();
  return tokens.transitions;
}; 