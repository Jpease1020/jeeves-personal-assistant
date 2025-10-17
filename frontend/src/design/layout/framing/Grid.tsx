'use client';

import React from 'react';
import styled from 'styled-components';
import { spacing, colors, borderRadius, shadows } from '../../system/tokens/tokens';
import { Container } from '../../layout/containers/Container';
import { type ResponsiveValue, type Breakpoint, type GridCols, type SpacingScale, type FlexboxMargin } from '../../system/shared-types';
import { H2 } from '../../components/base-components/text/Headings';
import { Text } from '../../components/base-components/text/Text';

// Helper function to resolve responsive values
const resolveResponsiveValue = <T,>(value: ResponsiveValue<T>, breakpoint: Breakpoint = 'xs'): T => {
  if (typeof value === 'object' && value !== null) {
    return (value as Partial<Record<Breakpoint, T>>)[breakpoint] ||
      (value as Partial<Record<Breakpoint, T>>).xs ||
      Object.values(value as Partial<Record<Breakpoint, T>>)[0] as T;
  }
  return value as T;
};

// Grid system components
interface GridProps {
  children: React.ReactNode;
  cols?: ResponsiveValue<GridCols> | GridCols;
  gap?: ResponsiveValue<SpacingScale>;
  responsive?: boolean;
  spacing?: ResponsiveValue<SpacingScale>;
  margin?: FlexboxMargin;  // Limited margin for flexbox positioning
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order?: number;
  as?: 'div' | 'section' | 'article';
}

const Grid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['cols', 'gap', 'responsive', 'spacing', 'margin', 'alignSelf', 'order'].includes(prop)
}) <{
  cols: ResponsiveValue<GridCols> | GridCols;
  gap: ResponsiveValue<SpacingScale>;
  responsive: boolean;
  spacing: ResponsiveValue<SpacingScale>;
  margin: FlexboxMargin;
  alignSelf: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order: number;
}>`
  display: grid;
  grid-template-columns: ${({ cols, responsive }) => {
    if (responsive) {
      return `repeat(auto-fit, 1fr)`;
    }
    const resolvedCols = resolveResponsiveValue(cols);
    return `repeat(${resolvedCols}, 1fr)`;
  }};
  gap: ${({ gap }) => {
    const resolvedGap = resolveResponsiveValue(gap);
    return resolvedGap === 'none' ? '0' : spacing[resolvedGap as keyof typeof spacing];
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
  
  /* Internal spacing for content */
  ${({ spacing: spacingProp }) => {
    const resolvedSpacing = resolveResponsiveValue(spacingProp);
    return resolvedSpacing === 'none' ? '' : `gap: ${spacing[resolvedSpacing as keyof typeof spacing]};`;
  }}
  
  /* Responsive breakpoints for better mobile experience */
  @media (max-width: 1024px) {
    grid-template-columns: ${({ responsive, cols }) => {
    if (responsive) {
      return `repeat(auto-fit, 1fr)`;
    }
    const resolvedCols = resolveResponsiveValue(cols, 'lg');
    return `repeat(${resolvedCols}, 1fr)`;
  }};
  }
  
  @media (max-width: 768px) {
    grid-template-columns: ${({ responsive, cols }) => {
    if (responsive) {
      return `repeat(auto-fit, 1fr)`;
    }
    const resolvedCols = resolveResponsiveValue(cols, 'md');
    return `repeat(${resolvedCols}, 1fr)`;
  }};
    gap: ${({ gap }) => {
    const resolvedGap = resolveResponsiveValue(gap, 'md');
    return resolvedGap === 'none' ? '0' : spacing[resolvedGap as keyof typeof spacing];
  }};
  }
  
  @media (max-width: 640px) {
    grid-template-columns: ${({ responsive, cols }) => {
    if (responsive) {
      return `repeat(auto-fit, 1fr)`;
    }
    const resolvedCols = resolveResponsiveValue(cols, 'sm');
    return `repeat(${resolvedCols}, 1fr)`;
  }};
    gap: ${({ gap }) => {
    const resolvedGap = resolveResponsiveValue(gap, 'sm');
    return resolvedGap === 'none' ? '0' : spacing[resolvedGap as keyof typeof spacing];
  }};
  }
`;

const GridComponent: React.FC<GridProps> = ({
  cols = 3,
  gap = 'md',
  responsive = false,
  spacing = 'none',
  margin = 'none',
  alignSelf = 'stretch',
  order = 0,
  as: Component = 'div',
  children
}) => {
  return (
    <Grid
      cols={cols}
      gap={gap}
      responsive={responsive}
      spacing={spacing}
      margin={margin}
      alignSelf={alignSelf}
      order={order}
      as={Component}
    >
      {children}
    </Grid>
  );
};

// GridSection component
interface GridSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'content' | 'default' | 'actions' | 'stats';
  cols?: GridCols;
  columns?: GridCols;
  gap?: SpacingScale;
  responsive?: boolean;
  padding?: SpacingScale;
  spacing?: SpacingScale;
  margin?: FlexboxMargin;  // Limited margin for flexbox positioning
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order?: number;
  as?: 'section' | 'div' | 'article';
}

const GridSectionContainer = styled.section.withConfig({
  shouldForwardProp: (prop) => !['variant', 'padding', 'spacing', 'margin', 'alignSelf', 'order'].includes(prop)
}) <{
  variant: 'content' | 'default' | 'actions' | 'stats';
  padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '32' | '40' | '48' | '56' | '64' | 'auto';
  spacing: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '32' | '40' | '48' | '56' | '64' | 'auto';
  margin: FlexboxMargin;
  alignSelf: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order: number;
}>`
  padding: ${({ padding }) => padding === 'none' ? '0' : spacing[padding as keyof typeof spacing]};
  align-self: ${({ alignSelf }) => alignSelf};
  order: ${({ order }) => order};
  
  /* Limited margin for flexbox positioning */
  ${({ margin }) => {
    if (margin === 'auto') {
      return `margin: auto;`;
    }
    return '';
  }}
  
  /* Internal spacing for content */
  ${({ spacing: spacingProp }) => {
    return spacingProp === 'none' ? '' : `gap: ${spacing[spacingProp as keyof typeof spacing]};`;
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'content':
        return `
          background-color: ${colors.background.secondary};
          border-radius: ${borderRadius.md};
          box-shadow: ${shadows.sm};
        `;
      case 'actions':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.lg};
        `;
      case 'stats':
        return `
          background-color: ${colors.primary[50]};
          border: 1px solid ${colors.primary[200]};
          border-radius: ${borderRadius.lg};
        `;
      default:
        return `
          background-color: transparent;
        `;
    }
  }}
`;

const GridSection: React.FC<GridSectionProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  cols = 3,
  columns,
  gap = 'md',
  responsive = false,
  padding = 'lg',
  spacing = 'none',
  margin = 'none',
  alignSelf = 'stretch',
  order = 0,
  as: Component = 'section'
}) => {
  return (
    <GridSectionContainer
      variant={variant}
      padding={padding}
      spacing={spacing}
      margin={margin}
      alignSelf={alignSelf}
      order={order}
      as={Component}
    >
      {(title || subtitle) && (
        <Container variant="default" padding="none" spacing="lg">
          {title && <H2 size="lg">{title}</H2>}
          {subtitle && <Text variant="muted" size="sm">{subtitle}</Text>}
        </Container>
      )}
      <GridComponent
        cols={columns || cols}
        gap={gap}
        responsive={responsive}
        spacing={spacing}
        margin={margin}
        alignSelf={alignSelf}
        order={order}
      >
        {children}
      </GridComponent>
    </GridSectionContainer>
  );
};

// GridItem component
interface GridItemProps {
  children: React.ReactNode;
  span?: GridCols;
  start?: GridCols; // Grid column start position (1-12)
  end?: GridCols;   // Grid column end position (1-13)
  margin?: FlexboxMargin;
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order?: number;
}

const GridItemContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['$span', '$start', '$end', 'margin', 'alignSelf', 'order'].includes(prop)
}) <{
  $span: number;
  $start?: number;
  $end?: number;
  margin: FlexboxMargin;
  alignSelf: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order: number;
}>`
  /* Grid positioning */
  ${({ $span, $start, $end }) => {
    if ($start && $end) {
      return `grid-column: ${$start} / ${$end};`;
    } else if ($start) {
      return `grid-column: ${$start} / span ${$span};`;
    } else {
      return `grid-column: span ${$span};`;
    }
  }}
  
  /* Flexbox properties for content */
  display: flex;
  flex-direction: column;
  align-self: ${({ alignSelf }) => alignSelf};
  order: ${({ order }) => order};

  /* Limited margin for flexbox positioning */
  ${({ margin }) => {
    if (margin === 'auto') {
      return `margin: auto;`;
    }
    return '';
  }}
`;

/**
 * GridItem Component - Enhanced grid item with positioning
 * 
 * Provides precise grid positioning with start/end columns,
 * replacing the need for margin-based offsets.
 * 
 * @example
 * ```tsx
 * <Grid cols={12} gap="md">
 *   <GridItem span={6} start={3}>Centered content (starts at column 3)</GridItem>
 *   <GridItem span={4} start={9}>Right-aligned content</GridItem>
 * </Grid>
 * 
 * // Or use start/end directly
 * <Grid cols={12}>
 *   <GridItem start={2} end={8}>Spans columns 2-7</GridItem>
 * </Grid>
 * ```
 */
const GridItem: React.FC<GridItemProps> = ({
  children,
  span = 1,
  start,
  end,
  margin = 'none',
  alignSelf = 'stretch',
  order = 0
}) => {
  return (
    <GridItemContainer
      $span={span}
      $start={start}
      $end={end}
      margin={margin}
      alignSelf={alignSelf}
      order={order}
    >
      {children}
    </GridItemContainer>
  );
};

export { GridComponent as Grid, GridSection, GridItem };
export type { GridItemProps }; 