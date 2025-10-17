'use client';

import React from 'react';
import styled from 'styled-components';
import { spacing, transitions } from '../../system/tokens/tokens';
import { type FlexboxMargin } from '../../system/shared-types';

// Define types locally for this component
interface StackProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical' | ResponsiveValue<'horizontal' | 'vertical'>;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' | ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'>;
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'>;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | ResponsiveValue<'nowrap' | 'wrap' | 'wrap-reverse'>;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | ResponsiveValue<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
  margin?: FlexboxMargin;  // Limited margin for flexbox positioning
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  order?: number;
  fullWidth?: boolean;
  as?: React.ElementType;
  id?: string;
  style?: React.CSSProperties;
}

type ResponsiveValue<T> = T | {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

const StyledStack = styled.div.withConfig({
  shouldForwardProp: (prop) => !['direction', 'spacing', 'align', 'justify', 'wrap', 'padding', 'margin', 'alignSelf', 'order', 'fullWidth'].includes(prop)
}) <{
  direction: any;
  spacing: any;
  align: any;
  justify: any;
  wrap: any;
  padding: any;
  margin: FlexboxMargin;
  alignSelf: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  order: number;
  fullWidth: boolean;
}>`
  display: flex;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  flex-direction: ${({ direction }) => {
    if (typeof direction === 'string') {
      return direction === 'horizontal' ? 'row' : 'column';
    }
    return direction?.xs === 'horizontal' ? 'row' : 'column';
  }};
  align-items: ${({ align }) => {
    if (typeof align === 'string') return align;
    return align?.xs || 'flex-start';
  }};
  justify-content: ${({ justify }) => {
    if (typeof justify === 'string') return justify;
    return justify?.xs || 'flex-start';
  }};
  flex-wrap: ${({ wrap }) => {
    if (typeof wrap === 'string') return wrap;
    return wrap?.xs || 'nowrap';
  }};
  align-self: ${({ alignSelf }) => alignSelf};
  order: ${({ order }) => order};
  
  /* Limited margin for flexbox positioning */
  ${({ margin }) => {
    if (margin === 'auto') {
      return `margin: auto;`;
    }
    return '';
  }}
  
  gap: ${({ spacing: spacingProp }) => {
    if (typeof spacingProp === 'string') {
      if (spacingProp === 'none') return '0';
      return spacingProp === 'xs' ? spacing.xs :
        spacingProp === 'sm' ? spacing.sm :
          spacingProp === 'md' ? spacing.md :
            spacingProp === 'lg' ? spacing.lg :
              spacingProp === 'xl' ? spacing.xl :
                spacingProp === '2xl' ? spacing['2xl'] : '0';
    }
    const space = spacingProp?.xs || 'md';
    return space === 'none' ? '0' : spacing[space as keyof typeof spacing];
  }};
  padding: ${({ padding }) => {
    if (typeof padding === 'string') {
      if (padding === 'none') return '0';
      return padding === 'xs' ? spacing.xs :
        padding === 'sm' ? spacing.sm :
          padding === 'md' ? spacing.md :
            padding === 'lg' ? spacing.lg :
              padding === 'xl' ? spacing.xl :
                padding === '2xl' ? spacing['2xl'] : '0';
    }
    const pad = padding?.xs || 'none';
    return pad === 'none' ? '0' : spacing[pad as keyof typeof spacing];
  }};
  transition: ${transitions.default};

  /* Enhanced Responsive breakpoints */
  ${({ direction, align, justify, wrap, spacing: spacingProp, padding }) => {
    const breakpoints = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    };

    return Object.entries(breakpoints).map(([breakpoint, width]) => {
      const responsiveStyles = [];

      if (direction && typeof direction === 'object' && direction[breakpoint as keyof typeof direction]) {
        const dir = direction[breakpoint as keyof typeof direction];
        responsiveStyles.push(`flex-direction: ${dir === 'horizontal' ? 'row' : 'column'};`);
      }

      if (align && typeof align === 'object' && align[breakpoint as keyof typeof align]) {
        responsiveStyles.push(`align-items: ${align[breakpoint as keyof typeof align]};`);
      }

      if (justify && typeof justify === 'object' && justify[breakpoint as keyof typeof justify]) {
        responsiveStyles.push(`justify-content: ${justify[breakpoint as keyof typeof justify]};`);
      }

      if (wrap && typeof wrap === 'object' && wrap[breakpoint as keyof typeof wrap]) {
        responsiveStyles.push(`flex-wrap: ${wrap[breakpoint as keyof typeof wrap]};`);
      }

      if (spacingProp && typeof spacingProp === 'object' && spacingProp[breakpoint]) {
        const space = spacingProp[breakpoint];
        const gapValue = space === 'none' ? '0' : spacing[space as keyof typeof spacing];
        responsiveStyles.push(`gap: ${gapValue};`);
      }

      if (padding && typeof padding === 'object' && padding[breakpoint]) {
        const pad = padding[breakpoint];
        const padValue = pad === 'none' ? '0' : spacing[pad as keyof typeof spacing];
        responsiveStyles.push(`padding: ${padValue};`);
      }

      return responsiveStyles.length > 0
        ? `@media (min-width: ${width}) { ${responsiveStyles.join(' ')} }`
        : '';
    }).join(' ');
  }}
`;

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'vertical',
  spacing = 'md',
  align = 'flex-start',
  justify = 'flex-start',
  wrap = 'nowrap',
  padding = 'none',
  margin = 'none',
  alignSelf = 'stretch',
  order = 0,
  fullWidth = false,
  as: Component = 'div',
  ...rest
}) => {
  return (
    <StyledStack
      direction={direction}
      spacing={spacing}
      align={align}
      justify={justify}
      wrap={wrap}
      padding={padding}
      margin={margin}
      alignSelf={alignSelf}
      order={order}
      fullWidth={fullWidth}
      as={Component}
      {...rest}
    >
      {children}
    </StyledStack>
  );
};

export type { StackProps }; 