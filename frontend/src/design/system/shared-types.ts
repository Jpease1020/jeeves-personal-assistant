// Design System Shared Types
import type { ReactNode } from 'react';

// Base component props
export interface BaseComponentProps {
    children?: ReactNode;
    className?: string;
    id?: string;
    'data-testid'?: string;
}

export interface BaseLayoutProps extends BaseComponentProps {
    margin?: FlexboxMargin;
    padding?: SpacingScale;
}

export interface BaseTextComponentProps extends BaseComponentProps {
    variant?: TextVariant;
    size?: TextSize;
    weight?: FontWeight;
    align?: TextAlign;
    color?: ColorVariant;
}

// Text types
export type TextVariant = 'body' | 'caption' | 'label' | 'heading' | 'lead' | 'small' | 'muted' | 'overline' | 'button';
export type TextSize = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
export type FontWeight = 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'muted' | 'default';
export type TextComponentChildren = ReactNode;

// Button types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Layout types
export type SpacingScale = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '32' | '40' | '48' | '56' | '64' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none' | 'auto';
export type FlexboxMargin = SpacingScale;
export type ResponsiveValue<T> = T | { [K in Breakpoint]?: T };
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Flexbox types
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

// Grid types
export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;
export type ResponsiveColSpan = ResponsiveValue<GridCols>;
export type GridGap = SpacingScale;
export type ColSpan = GridCols;

// Section types
export type SectionVariant = 'default' | 'primary' | 'secondary' | 'accent';
export type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';

// HTML element types
export type HTMLElement = 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';

// Interaction types
export type InteractionMode = 'mouse' | 'keyboard' | 'touch';

// Spacing types
export type Spacing = SpacingScale;

// Flexbox positioning
export interface FlexboxPositioningProps {
    direction?: FlexDirection;
    wrap?: FlexWrap;
    align?: AlignItems;
    justify?: JustifyContent;
    gap?: SpacingScale;
    alignSelf?: AlignItems;
    order?: number;
    flex?: string | number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: string | number;
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
    zIndex?: number;
}