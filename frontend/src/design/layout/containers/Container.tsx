'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows, transitions } from '../../system/tokens/tokens';
import { FlexboxMargin } from '../../system/shared-types';

// Core Container component - foundational layout component
type ResponsiveValue<T> = T | {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

export interface ContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'card' | 'section' | 'main' | 'content' | 'navigation' | 'tooltip' | 'elevated' | 'feature' | 'hero';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
  margin?: FlexboxMargin;  // Limited margin for flexbox positioning
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order?: number;
  as?: 'div' | 'main' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer';
  id?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  role?: string;
}

const StyledContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'maxWidth', 'padding', 'spacing', 'margin', 'alignSelf', 'order'].includes(prop)
})<{
  variant: 'default' | 'card' | 'section' | 'main' | 'content' | 'navigation' | 'tooltip' | 'elevated' | 'feature' | 'hero';
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  padding: any;
  spacing: any;
  margin: FlexboxMargin;
  alignSelf: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order: number;
}>`
  transition: ${transitions.default};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: ${({ alignSelf }) => alignSelf};
  order: ${({ order }) => order};

  /* Limited margin for flexbox positioning */
  ${({ margin }) => {
    if (margin === 'auto') {
      return `margin: auto;`;
    }
    return '';
  }}

  /* Max width styles */
  ${({ maxWidth }) => {
    switch (maxWidth) {
      case 'sm':
        return `max-width: 24rem;`;
      case 'md':
        return `max-width: 28rem;`;
      case 'lg':
        return `max-width: 32rem;`;
      case 'xl':
        return `max-width: 36rem;`;
      case '2xl':
        return `max-width: 42rem;`;
      case '3xl':
        return `max-width: 48rem;`;
      case '4xl':
        return `max-width: 56rem;`;
      case '5xl':
        return `max-width: 64rem;`;
      case '6xl':
        return `max-width: 72rem;`;
      case '7xl':
        return `max-width: 80rem;`;
      case 'full':
        return `max-width: 100%;`;
      default:
        return `max-width: 36rem;`;
    }
  }}

  /* Padding styles (responsive) */
  ${({ padding }) => {
    const getPad = (p: string) => p === 'none' ? '0' : spacing[p as keyof typeof spacing];
    if (typeof padding === 'string') {
      return `padding: ${getPad(padding)};`;
    }
    const padXs = padding?.xs ?? 'none';
    let css = `padding: ${getPad(padXs)};`;
    const map: Record<string, string> = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' };
    (['sm','md','lg','xl','2xl'] as const).forEach(bp => {
      const val = padding?.[bp as keyof typeof padding];
      if (val) css += `@media (min-width: ${map[bp]}) { padding: ${getPad(val as string)}; }`;
    });
    return css;
  }}

  /* Internal spacing for content (responsive) */
  ${({ spacing: spacingProp }) => {
    const getGap = (g: string) => g === 'none' ? '0' : spacing[g as keyof typeof spacing];
    if (typeof spacingProp === 'string' || spacingProp === undefined) {
      const base = (spacingProp ?? 'none') as string;
      return `gap: ${getGap(base)};`;
    }
    const gapXs = spacingProp?.xs ?? 'none';
    let css = `gap: ${getGap(gapXs)};`;
    const map: Record<string, string> = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' };
    (['sm','md','lg','xl','2xl'] as const).forEach(bp => {
      const val = spacingProp?.[bp as keyof typeof spacingProp];
      if (val) css += `@media (min-width: ${map[bp]}) { gap: ${getGap(val as string)}; }`;
    });
    return css;
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `
          background-color: transparent;
          border: none;
          box-shadow: none;
        `;
      case 'card':
        return `
          background-color: ${colors.background.secondary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.lg};
          box-shadow: ${shadows.sm};
        `;
      case 'section':
        return `
          background-color: ${colors.background.primary};
          border: none;
          box-shadow: none;
        `;
      case 'main':
        return `
          background-color: ${colors.background.primary};
          border: none;
          box-shadow: none;
          min-height: 100vh;
        `;
      case 'content':
        return `
          background-color: ${colors.background.secondary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.md};
          box-shadow: ${shadows.md};
        `;
      case 'navigation':
        return `
          position: sticky;
          top: 0;
          z-index: 1000;
          background-color: ${colors.background.primary};
          border-bottom: 1px solid ${colors.border.default};
          box-shadow: ${shadows.sm};
        `;
      case 'tooltip':
        return `
          background-color: ${colors.background.secondary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.sm};
          box-shadow: ${shadows.lg};
        `;
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.lg};
          box-shadow: ${shadows.xl};
        `;
      case 'feature':
        return `
          background-color: ${colors.background.secondary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.lg};
          box-shadow: ${shadows.lg};
        `;
      case 'hero':
        return `
          background-color: ${colors.primary[100]};
          border: none;
          box-shadow: none;
        `;
      default:
        return `
          background-color: transparent;
          border: none;
          box-shadow: none;
        `;
    }
  }}
`;

export const Container: React.FC<ContainerProps> = ({ 
  children,
  variant = 'default',
  maxWidth = 'full', 
  padding = 'md', 
  spacing = 'none',
  margin = 'none',
  alignSelf = 'stretch',
  order = 0,
  as: Component = 'div',
  id,
  ...rest
}) => {
  return (
    <StyledContainer
      variant={variant}
      maxWidth={maxWidth}
      padding={padding}
      spacing={spacing}
      margin={margin}
      alignSelf={alignSelf}
      order={order}
      as={Component}
      id={id}

      {...rest}
    >
      {children}
    </StyledContainer>
  );
}; 