// Shared types for the design system
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface BaseProps {
    className?: string;
    children?: React.ReactNode;
}

export interface StyleProps {
    color?: ColorVariant;
    size?: Size;
    variant?: 'solid' | 'outline' | 'ghost';
}
