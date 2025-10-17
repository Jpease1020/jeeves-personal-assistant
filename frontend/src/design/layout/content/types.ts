import {
  type Breakpoint,
  type FlexDirection,
  type FlexWrap,
  type AlignItems,
  type JustifyContent,
  type Spacing,
  type ResponsiveValue,
  type BaseLayoutProps,
  type BaseComponentProps,
  type HTMLElement,
  type GridGap,
  type ColSpan,
  type ResponsiveColSpan
} from '../../system/shared-types';

// Content Layout Types - Type definitions for content layout components

// Re-export shared types
export type {
  Breakpoint,
  FlexDirection,
  FlexWrap,
  AlignItems,
  JustifyContent,
  Spacing,
  ResponsiveValue,
  ColSpan,
  ResponsiveColSpan
};

// Base component props
export interface BaseContentProps extends BaseLayoutProps { }

// Stack component props
export interface StackProps extends BaseComponentProps {
  direction?: ResponsiveValue<'horizontal' | 'vertical'>;
  spacing?: ResponsiveValue<Spacing>;
  align?: ResponsiveValue<AlignItems>;
  justify?: ResponsiveValue<JustifyContent>;
  wrap?: ResponsiveValue<FlexWrap>;
  padding?: ResponsiveValue<Spacing>;
  margin?: ResponsiveValue<Spacing>;
  fullWidth?: boolean;
  as?: HTMLElement;
}

// Row component props
export interface RowProps extends BaseLayoutProps {
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
export interface ColProps extends BaseLayoutProps {
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

// Box component props
export interface BoxProps extends BaseContentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

