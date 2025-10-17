import {
  type Breakpoint,
  type FlexDirection,
  type FlexWrap,
  type AlignItems,
  type JustifyContent,
  type Spacing,
  type ResponsiveValue,
  type BaseLayoutProps
} from '../../system/shared-types';

// Grid System Types - Comprehensive type definitions for CSS Grid and Flexbox system

// Re-export shared types
export type {
  Breakpoint,
  FlexDirection,
  FlexWrap,
  AlignItems,
  JustifyContent,
  Spacing,
  ResponsiveValue
};

// Column span types (1-12 grid system)
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Responsive column spans
export type ResponsiveColSpan = {
  xs?: ColSpan;
  sm?: ColSpan;
  md?: ColSpan;
  lg?: ColSpan;
  xl?: ColSpan;
  '2xl'?: ColSpan;
};

// Container max width types
export type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

// Grid gap types
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Base component props
export interface BaseGridProps extends BaseLayoutProps { }

// Row component props
export interface RowProps extends BaseGridProps {
  direction?: FlexDirection;
  wrap?: FlexWrap;
  align?: AlignItems;
  justify?: JustifyContent;
  gap?: GridGap;
  padding?: Spacing;
  margin?: Spacing;
  fullWidth?: boolean;
  responsive?: boolean;
}

// Column component props
export interface ColProps extends BaseGridProps {
  span?: ColSpan | ResponsiveColSpan;
  offset?: ColSpan | ResponsiveColSpan;
  align?: AlignItems;
  justify?: JustifyContent;
  padding?: Spacing;
  margin?: Spacing;
  order?: number;
  grow?: boolean;
  shrink?: boolean;
}

// Container component props
export interface ContainerProps extends BaseGridProps {
  maxWidth?: MaxWidth;
  padding?: Spacing;
  margin?: Spacing;
  center?: boolean;
  fluid?: boolean;
}



// Grid component props
export interface GridProps extends BaseGridProps {
  cols?: ColSpan;
  gap?: GridGap;
  padding?: Spacing;
  margin?: Spacing;
  responsive?: boolean;
  align?: AlignItems;
  justify?: JustifyContent;
}



// Theme integration types
export interface GridTheme {
  breakpoints: Record<Breakpoint, string>;
  spacing: Record<Spacing, string>;
  maxWidths: Record<MaxWidth, string>;
} 