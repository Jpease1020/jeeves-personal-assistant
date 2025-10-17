'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, fontSize, fontWeight, fontFamily, transitions } from '../../../system/tokens/tokens';
import { useInteractionMode } from '../../../providers/InteractionModeProvider';

const StyledHeading = styled.h1.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'weight', 'align', 'cmsId'].includes(prop)
})<{
  variant: 'default' | 'primary' | 'secondary' | 'muted' | 'accent';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align: 'left' | 'center' | 'right';
}>`
  margin: 0;
  line-height: 1.2;
  font-family: ${fontFamily.sans};
  transition: ${transitions.default};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `font-size: ${fontSize.xs};`;
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      case 'xl':
        return `font-size: ${fontSize.xl};`;
      case '2xl':
        return `font-size: ${fontSize['2xl']};`;
      case '3xl':
        return `font-size: ${fontSize['3xl']};`;
      case '4xl':
        return `font-size: ${fontSize['4xl']};`;
      case '5xl':
        return `font-size: ${fontSize['5xl']};`;
      case '6xl':
        return `font-size: ${fontSize['6xl']};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}

  /* Weight styles */
  ${({ weight }) => {
    switch (weight) {
      case 'light':
        return `font-weight: ${fontWeight.light};`;
      case 'normal':
        return `font-weight: ${fontWeight.normal};`;
      case 'medium':
        return `font-weight: ${fontWeight.medium};`;
      case 'semibold':
        return `font-weight: ${fontWeight.semibold};`;
      case 'bold':
        return `font-weight: ${fontWeight.bold};`;
      case 'extrabold':
        return `font-weight: 800;`; // Note: fontWeight doesn't have extrabold, using hardcoded value
      default:
        return `font-weight: ${fontWeight.normal};`;
    }
  }}

  /* Align styles */
  ${({ align }) => {
    switch (align) {
      case 'left':
        return `text-align: left;`;
      case 'center':
        return `text-align: center;`;
      case 'right':
        return `text-align: right;`;
      default:
        return `text-align: left;`;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `color: ${colors.text.primary};`;
      case 'primary':
        return `color: ${colors.primary[600]};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      case 'muted':
        return `color: ${colors.text.secondary};`;
      case 'accent':
        return `color: ${colors.primary[600]};`;
      default:
        return `color: ${colors.text.primary};`;
    }
  }}

  /* Cursor styles based on data attribute */
  &[data-cursor="pointer"] {
    cursor: pointer;
  }
`;

export interface HeadingProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
  
  // HTML attributes
  id?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
  cmsKey?: string; // optional explicit cms path
  
  // Rest props
  [key: string]: any;
}

// Base Heading component (internal use only)
const Heading: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  weight = 'normal',
  align = 'left',
  id, 
  as: Component = 'h1',
  cmsId,
  ...rest
}) => {

  // Get mode from provider
  let mode: 'edit' | 'comment' | null = null;
  try {
    const context = useInteractionMode();
    mode = context.mode;
  } catch {
    // Provider not available, use null as default
    mode = null;
  }
  
  const ref = React.useRef<HTMLElement | null>(null);
  
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    // Get cmsId from either cmsId prop or cmsId attribute
    const cmsIdentifier = cmsId || (e.currentTarget as HTMLElement).getAttribute('cmsId');
    
    if (mode === 'edit' && cmsIdentifier) {
      e.preventDefault();
      e.stopPropagation();
      
      // Dispatch custom event to open edit modal
      const event = new (window as any).CustomEvent('openInlineEditor', {
        detail: { cmsId: cmsIdentifier, element: e.currentTarget, x: e.clientX, y: e.clientY }
      });
      document.dispatchEvent(event);
    } else if (mode === 'comment' && cmsIdentifier) {
      e.preventDefault();
      e.stopPropagation();
      
      // Dispatch custom event to open comment modal
      const event = new (window as any).CustomEvent('openCommentModal', {
        detail: { cmsId: cmsIdentifier, element: e.currentTarget, x: e.clientX, y: e.clientY }
      });
      document.dispatchEvent(event);
    }
  };
  
  return (
    <StyledHeading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      ref={ref as any}
      onClick={mode ? handleClick : undefined}
      data-cursor={mode ? 'pointer' : 'default'}
      {...rest}
    >
      {children}
    </StyledHeading>
  );
};

// H1 Component - editable by default
export const H1: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '5xl',
  weight = 'bold',
  align = 'left',
  id, 
  as: Component = 'h1',
  mode,
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      
      {...rest}
    >
      {children}
    </Heading>
  );
};

export const H2: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '4xl',
  weight = 'bold',
  align = 'left',
  id, 
  as: Component = 'h2',
  mode,
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      
      {...rest}
    >
      {children}
    </Heading>
  );
};

export const H3: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '2xl',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h3',
  mode,
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      
      {...rest}
    >
      {children}
    </Heading>
  );
};

export const H4: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'xl',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h4',
  mode,
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      
      {...rest}
    >
      {children}
    </Heading>
  );
};

export const H5: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'lg',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h5',
  mode,
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      
      {...rest}
    >
      {children}
    </Heading>
  );
};

export const H6: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h6',
  mode,
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      
      {...rest}
    >
      {children}
    </Heading>
  );
}; 