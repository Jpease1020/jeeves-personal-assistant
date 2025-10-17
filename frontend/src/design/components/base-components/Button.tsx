'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, transitions, shadows, fontWeight } from '../../system/tokens/tokens';
import { LoadingSpinner } from './notifications/LoadingSpinner';
import { type ButtonVariant, type ButtonSize } from '../../system/shared-types';
import { type BaseTextComponentProps, type TextComponentChildren } from '../../system/shared-types';
import { useInteractionMode } from '../../providers/InteractionModeProvider';
import { useCMSData } from '../../providers/CMSDataProvider';

// Styled button component with enhanced modern styling
const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'shape', 'fullWidth', 'loading', 'icon', 'iconPosition', 'cmsId'].includes(prop)
}) <{
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'link';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape: 'default' | 'rounded' | 'pill' | 'square';
  fullWidth: boolean;
  loading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  font-weight: ${fontWeight.medium};
  outline: none;
  transition: all ${transitions.default};
  border: none;
  position: relative;
  overflow: hidden;
  opacity: ${({ loading }) => (loading ? 0.7 : 1)};
  cursor: ${({ loading }) => (loading ? 'not-allowed' : 'pointer')};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  text-decoration: none;
  font-family: inherit;
  letter-spacing: 0.025em;

  /* Enhanced size styles with better proportions */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `
          padding: ${spacing.xs} ${spacing.sm};
          font-size: ${fontSize.xs};
          min-height: 28px;
          gap: ${spacing.xs};
        `;
      case 'sm':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
          min-height: 36px;
          gap: ${spacing.xs};
        `;
      case 'md':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          min-height: 44px;
          gap: ${spacing.sm};
        `;
      case 'lg':
        return `
          padding: ${spacing.lg} ${spacing.xl};
          font-size: ${fontSize.lg};
          min-height: 52px;
          gap: ${spacing.md};
        `;
      case 'xl':
        return `
          padding: ${spacing.xl} ${spacing['2xl']};
          font-size: ${fontSize.xl};
          min-height: 60px;
          gap: ${spacing.lg};
        `;
      default:
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          min-height: 44px;
          gap: ${spacing.sm};
        `;
    }
  }}

  /* Enhanced variant styles with modern gradients and effects */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%);
          color: ${colors.text.white};
          box-shadow: ${shadows.md};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[800]} 100%);
            box-shadow: ${shadows.lg};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.md};
          }
        `;
      case 'secondary':
        return `
          background: linear-gradient(135deg, ${colors.secondary[600]} 0%, ${colors.secondary[700]} 100%);
          color: ${colors.text.white};
          box-shadow: ${shadows.md};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${colors.secondary[700]} 0%, ${colors.secondary[800]} 100%);
            box-shadow: ${shadows.lg};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.md};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${colors.primary[600]};
          border: 2px solid ${colors.primary[600]};
          box-shadow: ${shadows.sm};
          
          &:hover:not(:disabled) {
            background: ${colors.primary[600]};
            color: ${colors.text.white};
            box-shadow: ${shadows.md};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.sm};
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${colors.text.primary};
          box-shadow: none;
          
          &:hover:not(:disabled) {
            background: ${colors.background.tertiary};
            color: ${colors.text.primary};
            box-shadow: ${shadows.sm};
          }
          
          &:active:not(:disabled) {
            background: ${colors.background.secondary};
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, ${colors.danger[600]} 0%, ${colors.danger[700]} 100%);
          color: ${colors.text.white};
          box-shadow: ${shadows.md};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${colors.danger[700]} 0%, ${colors.danger[800]} 100%);
            box-shadow: ${shadows.lg};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.md};
          }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, ${colors.success[600]} 0%, ${colors.success[700]} 100%);
          color: ${colors.text.white};
          box-shadow: ${shadows.md};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${colors.success[700]} 0%, ${colors.success[800]} 100%);
            box-shadow: ${shadows.lg};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.md};
          }
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, ${colors.warning[600]} 0%, ${colors.warning[700]} 100%);
          color: ${colors.text.white};
          box-shadow: ${shadows.md};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${colors.warning[700]} 0%, ${colors.warning[800]} 100%);
            box-shadow: ${shadows.lg};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.md};
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%);
          color: ${colors.text.white};
          box-shadow: ${shadows.md};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[800]} 100%);
            box-shadow: ${shadows.lg};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.md};
          }
        `;
    }
  }}

  /* Enhanced shape styles */
  ${({ shape }) => {
    switch (shape) {
      case 'default':
        return `border-radius: ${borderRadius.default};`;
      case 'rounded':
        return `border-radius: ${borderRadius.lg};`;
      case 'pill':
        return `border-radius: ${borderRadius.pill};`;
      case 'square':
        return `border-radius: ${borderRadius.none};`;
      default:
        return `border-radius: ${borderRadius.default};`;
    }
  }}

  /* Enhanced focus styles */
  &:focus {
    outline: none;
    box-shadow: ${shadows.focus};
  }

  /* Enhanced disabled styles */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: ${shadows.sm} !important;
  }

  /* Loading state styles */
  ${({ loading }) => loading && `
    pointer-events: none;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.1);
      border-radius: inherit;
    }
  `}

  /* Ripple effect for modern feel */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
  }

  &:active::before {
    width: 300px;
    height: 300px;
  }
`;

// Button Component - Enhanced with better props and functionality
export interface ButtonProps extends Omit<BaseTextComponentProps, 'cmsId' | 'cmsData' | 'variant'> {
  children?: TextComponentChildren; // Make optional since we can use text prop
  text?: string; // New: direct text prop for button content
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (_e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  shape?: 'default' | 'rounded' | 'pill' | 'square';
  as?: 'button' | 'a' | 'div';
  href?: string;
  target?: string;
  rel?: string;
  disableInteractionOverride?: boolean;
  cmsId?: string; // Make optional for Button
}

export const Button: React.FC<ButtonProps> = ({
  children,
  text,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  shape = 'default',
  as: Component = 'button',
  id,
  href,
  target,
  rel,
  cmsId,
  disableInteractionOverride,
  ...rest
}) => {
  // Get CMS data from provider
  const { cmsData } = useCMSData();

  // Get mode from provider
  let mode: 'edit' | 'comment' | null = null;
  try {
    const context = useInteractionMode();
    mode = context.mode as any;
  } catch {
    // Provider not available, use null as default
    mode = null;
  }

  // Determine the component to render
  const renderComponent = href ? 'a' : Component;
  const ref = React.useRef<any>(null);

  // Don't add data-cms-id for decorative elements
  const shouldIgnoreCMS = cmsId === 'ignore';

  // Determine button content - use CMS field if available
  const buttonContent = cmsData && cmsId && !shouldIgnoreCMS && text
    ? ((cmsData as any)?.[cmsId] || text)
    : (text || children);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If we're in edit/comment mode and this button doesn't have the override
    if (mode && !disableInteractionOverride) {
      e.preventDefault();
      e.stopPropagation();

      // If we have a cmsId, dispatch the appropriate edit event
      if (cmsId) {
        if (mode === 'edit') {
          const event = new (window as any).CustomEvent('openInlineEditor', {
            detail: { cmsId, element: e.currentTarget, x: e.clientX, y: e.clientY }
          });
          document.dispatchEvent(event);
        } else if (mode === 'comment') {
          const event = new (window as any).CustomEvent('openCommentModal', {
            detail: { cmsId, element: e.currentTarget, x: e.clientX, y: e.clientY }
          });
          document.dispatchEvent(event);
        }
      }
      return;
    }

    onClick?.(e);
  };

  return (
    <StyledButton
      as={renderComponent}
      variant={variant}
      size={size}
      shape={shape}
      fullWidth={fullWidth}
      loading={loading}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-busy={loading}
      id={id}
      href={href}
      target={target}
      rel={rel}
      ref={ref}
      {...(!shouldIgnoreCMS && cmsId ? { 'data-cms-id': cmsId } : {})}
      {...rest}
    >
      {loading && <LoadingSpinner size="sm" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {buttonContent}
      {!loading && icon && iconPosition === 'right' && icon}
    </StyledButton>
  );
};