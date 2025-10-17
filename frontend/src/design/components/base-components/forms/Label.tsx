'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, fontWeight, transitions } from '../../../system/tokens/tokens';

// Styled label component with flexbox and proper prop filtering
const StyledLabel = styled.label.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'weight', 'required', 'disabled', 'cmsId'].includes(prop)
}) <{
  variant: 'default' | 'primary' | 'secondary' | 'muted' | 'error';
  size: 'xs' | 'sm' | 'md' | 'lg';
  weight: 'normal' | 'medium' | 'semibold' | 'bold';
  required: boolean;
  disabled: boolean;
}>`
  display: flex;
  align-items: center;
  font-family: inherit;
  line-height: 1.4;
  transition: ${transitions.default};
  cursor: pointer;
  min-width: 0; /* Allow flexbox shrinking */

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `
          font-size: ${fontSize.xs};
          margin-bottom: ${spacing.xs};
        `;
      case 'sm':
        return `
          font-size: ${fontSize.sm};
          margin-bottom: ${spacing.sm};
        `;
      case 'md':
        return `
          font-size: ${fontSize.md};
          margin-bottom: ${spacing.md};
        `;
      case 'lg':
        return `
          font-size: ${fontSize.lg};
          margin-bottom: ${spacing.lg};
        `;
      default:
        return `
          font-size: ${fontSize.md};
          margin-bottom: ${spacing.md};
        `;
    }
  }}

  /* Weight styles */
  ${({ weight }) => {
    switch (weight) {
      case 'normal':
        return `font-weight: ${fontWeight.normal};`;
      case 'medium':
        return `font-weight: ${fontWeight.medium};`;
      case 'semibold':
        return `font-weight: ${fontWeight.semibold};`;
      case 'bold':
        return `font-weight: ${fontWeight.bold};`;
      default:
        return `font-weight: ${fontWeight.medium};`;
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
      case 'error':
        return `color: ${colors.danger[600]};`;
      default:
        return `color: ${colors.text.primary};`;
    }
  }}

  /* Required indicator */
  ${({ required }) => required && `
    &::after {
      content: ' *';
      color: ${colors.danger[600]};
      font-weight: ${fontWeight.bold};
    }
  `}

  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Focus state for accessibility */
  &:focus-within {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* Responsive behavior */
  @media (max-width: 768px) {
    ${({ size }) => {
    if (size === 'lg') {
      return `
          font-size: ${fontSize.md};
          margin-bottom: ${spacing.md};
        `;
    }
    return '';
  }}
  }

  @media (max-width: 640px) {
    ${({ size }) => {
    if (size === 'md' || size === 'lg') {
      return `
          font-size: ${fontSize.sm};
          margin-bottom: ${spacing.sm};
        `;
    }
    return '';
  }}
  }
`;

export interface LabelProps {
  // Core props
  children: React.ReactNode;

  // Appearance
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';

  // Form attributes
  htmlFor?: string;
  required?: boolean;
  disabled?: boolean;

  // HTML attributes
  id?: string;
  cmsKey?: string;

  // Rest props
  [key: string]: any;
}

export const Label: React.FC<LabelProps> = ({
  // Core props
  children,

  // Appearance
  variant = 'default',
  size = 'md',
  weight = 'medium',

  // Form attributes
  htmlFor,
  required = false,
  disabled = false,

  // HTML attributes
  id,
  cmsKey,

  // Rest props
  ...rest
}) => {
  const ref = React.useRef<any>(null);
  // const label = typeof children === 'string' ? children : undefined;
  return (
    <StyledLabel
      htmlFor={htmlFor}
      id={id}
      ref={ref}
      variant={variant}
      size={size}
      weight={weight}
      required={required}
      disabled={disabled}
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </StyledLabel>
  );
};
