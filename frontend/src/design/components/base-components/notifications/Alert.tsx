'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '../../../system/tokens/tokens';
import { Button } from '../Button';
import { Stack } from '../../../layout/framing/Stack';
import { Text } from '../text/Text';

// Single styled component for alert container
const AlertContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'padding', 'dismissible', 'isInteractive'].includes(prop)
})<{
  variant: 'success' | 'error' | 'warning' | 'info';
  size: 'sm' | 'md' | 'lg';
  padding: 'sm' | 'md' | 'lg' | 'xl';
  dismissible: boolean;
  isInteractive: boolean;
}>`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.sm};
  border-radius: ${borderRadius.lg};
  transition: ${transitions.default};
  position: relative;
  box-shadow: ${shadows.sm};
  cursor: ${({ isInteractive }) => (isInteractive ? 'pointer' : 'default')};
  padding-right: ${({ dismissible }) => (dismissible ? spacing.xl : 'inherit')};

  /* Size styles */
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return fontSize.sm;
      case 'md': return fontSize.md;
      case 'lg': return fontSize.lg;
      default: return fontSize.md;
    }
  }};

  /* Padding styles */
  padding: ${({ padding }) => {
    switch (padding) {
      case 'sm': return spacing.sm;
      case 'md': return spacing.md;
      case 'lg': return spacing.lg;
      case 'xl': return spacing.xl;
      default: return spacing.md;
    }
  }};

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'success':
        return `
          background-color: ${colors.success[50]};
          border: 1px solid ${colors.success[200]};
          color: ${colors.success[800]};
        `;
      case 'error':
        return `
          background-color: ${colors.danger[50]};
          border: 1px solid ${colors.danger[200]};
          color: ${colors.danger[800]};
        `;
      case 'warning':
        return `
          background-color: ${colors.warning[50]};
          border: 1px solid ${colors.warning[200]};
          color: ${colors.warning[800]};
        `;
      case 'info':
      default:
        return `
          background-color: ${colors.primary[50]};
          border: 1px solid ${colors.primary[200]};
          color: ${colors.primary[800]};
        `;
    }
  }}
`;

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  dismissible?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  as?: 'div' | 'section' | 'article';
  [key: string]: any;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  size = 'md',
  padding = 'md',
  title,
  dismissible = false,
  onClose,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  as: Component = 'div',
  ...rest
}) => {
  const isInteractive = Boolean(onClick);

  const getIcon = () => {
    switch (variant) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info':
      default: return 'ℹ️';
    }
  };

  const getRole = () => {
    switch (variant) {
      case 'error':
      case 'warning':
        return 'alert';
      default:
        return 'status';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isInteractive) {
        onClick?.();
      }
    }
  };

  return (
    <AlertContainer
      variant={variant}
      size={size}
      padding={padding}
      dismissible={dismissible}
      isInteractive={isInteractive}
      role={getRole()}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={isInteractive ? 0 : undefined}
      as={Component}
      {...rest}
    >
      <Stack direction="horizontal" align="center" justify="center" spacing="none">
        <Text variant="body" size={size}>
          {getIcon()}
        </Text>
      </Stack>
      
      <Stack direction="vertical" spacing="xs">
        {title && (
          <Text variant="body" size={size} weight="bold">
            {title}
          </Text>
        )}
        <Text as="span" variant="body" size={size}>
          {children}
        </Text>
      </Stack>
      
      {dismissible && onClose && (
        <Stack direction="horizontal" align="center" justify="center" spacing="none">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label="Close alert"
            type="button"
          >
            ×
          </Button>
        </Stack>
      )}
    </AlertContainer>
  );
};

Alert.displayName = 'Alert';

 