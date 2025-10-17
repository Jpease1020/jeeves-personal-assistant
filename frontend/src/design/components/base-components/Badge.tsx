'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '../../system/tokens/tokens';

// Styled badge component with enhanced prop filtering
const StyledBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'rounded', 'interactive', 'removable'].includes(prop)
})<{
  variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  size: 'sm' | 'md' | 'lg';
  rounded: 'sm' | 'md' | 'lg' | 'full';
  interactive: boolean;
  removable: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  white-space: nowrap;
  transition: ${transitions.default};
  cursor: ${({ interactive, removable }) => (interactive || removable) ? 'pointer' : 'default'};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.xs} ${spacing.sm};
          font-size: ${fontSize.xs};
          line-height: 1;
          gap: ${spacing.xs};
        `;
      case 'md':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
          line-height: 1.25;
          gap: ${spacing.sm};
        `;
      case 'lg':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          line-height: 1.5;
          gap: ${spacing.sm};
        `;
      default:
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
          line-height: 1.25;
          gap: ${spacing.sm};
        `;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `
          background-color: ${colors.gray[100]};
          color: ${colors.gray[700]};
          border: 1px solid ${colors.gray[200]};
        `;
      case 'success':
        return `
          background-color: ${colors.success[50]};
          color: ${colors.success[700]};
          border: 1px solid ${colors.success[200]};
        `;
      case 'warning':
        return `
          background-color: ${colors.warning[50]};
          color: ${colors.warning[700]};
          border: 1px solid ${colors.warning[200]};
        `;
      case 'error':
        return `
          background-color: ${colors.danger[50]};
          color: ${colors.danger[700]};
          border: 1px solid ${colors.danger[200]};
        `;
      case 'info':
        return `
          background-color: ${colors.primary[50]};
          color: ${colors.primary[700]};
          border: 1px solid ${colors.primary[200]};
        `;
      case 'pending':
        return `
          background-color: ${colors.warning[50]};
          color: ${colors.warning[700]};
          border: 1px solid ${colors.warning[200]};
        `;
      case 'confirmed':
        return `
          background-color: ${colors.success[50]};
          color: ${colors.success[700]};
          border: 1px solid ${colors.success[200]};
        `;
      case 'completed':
        return `
          background-color: ${colors.success[50]};
          color: ${colors.success[700]};
          border: 1px solid ${colors.success[200]};
        `;
      case 'cancelled':
        return `
          background-color: ${colors.danger[50]};
          color: ${colors.danger[700]};
          border: 1px solid ${colors.danger[200]};
        `;
      default:
        return `
          background-color: ${colors.gray[100]};
          color: ${colors.gray[700]};
          border: 1px solid ${colors.gray[200]};
        `;
    }
  }}

  /* Rounded styles */
  ${({ rounded }) => {
    switch (rounded) {
      case 'sm':
        return `border-radius: ${borderRadius.sm};`;
      case 'md':
        return `border-radius: ${borderRadius.default};`;
      case 'lg':
        return `border-radius: ${borderRadius.md};`;
      case 'full':
        return `border-radius: ${borderRadius.pill};`;
      default:
        return `border-radius: ${borderRadius.default};`;
    }
  }}

  /* Interactive states */
  ${({ interactive, removable }) => (interactive || removable) && `
    &:hover {
      opacity: 0.8;
      transform: translateY(-1px);
      box-shadow: ${shadows.sm};
    }
    
    &:active {
      transform: translateY(0);
    }
  `}

  /* Focus styles for accessibility */
  &:focus {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
  }

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Styled remove button
const RemoveButton = styled.button<{ size: 'sm' | 'md' | 'lg' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: ${transitions.default};
  border-radius: ${borderRadius.pill};
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          width: 0.875rem;
          height: 0.875rem;
          font-size: 0.625rem;
        `;
      case 'md':
        return `
          width: 1rem;
          height: 1rem;
          font-size: 0.75rem;
        `;
      case 'lg':
        return `
          width: 1.125rem;
          height: 1.125rem;
          font-size: 0.875rem;
        `;
      default:
        return `
          width: 1rem;
          height: 1rem;
          font-size: 0.75rem;
        `;
    }
  }}

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
  }
`;

export interface BadgeProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  
  // Interactive
  interactive?: boolean;
  onClick?: () => void;
  
  // Removable
  removable?: boolean;
  onRemove?: () => void;
  
  // Accessibility
  'aria-label'?: string;
  
  // Polymorphic support
  as?: 'span' | 'div' | 'button';
  
  // Rest props
  [key: string]: any;
}

export const Badge: React.FC<BadgeProps> = ({
  // Core props
  children,
  
  // Appearance
  variant = 'default',
  size = 'md',
  rounded = 'md',
  
  // Interactive
  interactive = false,
  onClick,
  
  // Removable
  removable = false,
  onRemove,
  
  // Accessibility
  'aria-label': ariaLabel,
  
  // Polymorphic support
  as: Component = 'span',
  
  // Rest props
  ...rest
}) => {
  const isInteractive = Boolean(onClick);
  const isRemovable = Boolean(onRemove);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isInteractive) {
        onClick?.();
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (isRemovable) {
        onRemove?.();
      }
    }
  };

  return (
    <StyledBadge
      as={Component}
      variant={variant}
      size={size}
      rounded={rounded}
      interactive={isInteractive}
      removable={isRemovable}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      role={Component === 'button' || isInteractive ? 'button' : undefined}
      tabIndex={Component === 'button' || isInteractive ? 0 : undefined}
      {...rest}
    >
      {children}
      {isRemovable && (
        <RemoveButton
          size={size}
          onClick={handleRemove}
          aria-label="Remove badge"
          type="button"
        >
          ×
        </RemoveButton>
      )}
    </StyledBadge>
  );
}; 