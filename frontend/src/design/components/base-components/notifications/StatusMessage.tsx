'use client';

import React from 'react';
import { Alert } from './Alert';
import { Button } from '../Button';
import { Stack } from '../../../layout/framing/Stack';
import { Text } from '../text/Text';



export interface StatusMessageProps {
  // Core props
  children?: React.ReactNode;
  
  // Content
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon?: React.ReactNode;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  
  // Behavior
  onDismiss?: () => void;
  dismissible?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  // Core props
  children,
  
  // Content
  type,
  message,
  icon,
  
  // Appearance
  size = 'md',
  
  // Behavior
  onDismiss,
  dismissible = false,
  
  // Accessibility
  'aria-label': ariaLabel,
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '';
    }
  };

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    return `${type} message: ${message}`;
  };

  const alertVariant = type === 'success' ? 'success' : 
                      type === 'error' ? 'error' : 
                      type === 'warning' ? 'warning' : 'info';

  return (
    <Alert
      id={id}
      variant={alertVariant}
      role="alert"
      aria-live="polite"
      aria-label={getAriaLabel()}
      {...rest}
    >
      <Stack direction="horizontal" align="center" justify="space-between" spacing="md">
        <Stack direction="horizontal" align="center" spacing="md">
          <Stack 
            direction="vertical" 
            align="center" 
            justify="center"
            spacing="none"
          >
            {icon || getDefaultIcon()}
          </Stack>
          
          <Text as="span" variant="body" size={size}>
            {message}
          </Text>
        </Stack>
        
        {(onDismiss || dismissible) && (
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            aria-label="Dismiss message"
          >
            ×
          </Button>
        )}
      </Stack>
      
      {children}
    </Alert>
  );
}; 