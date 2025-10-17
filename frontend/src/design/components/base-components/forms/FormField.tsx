'use client';

import React from 'react';
import styled from 'styled-components';
import { Stack } from '../../../layout/framing/Stack';
import { colors, spacing, fontSize } from '../../../system/tokens/tokens';
import { Label } from './Label';

// Styled message component for errors and helper text
const StyledMessage = styled.div<{ $isError: boolean }>`
  color: ${({ $isError }) => $isError ? colors.danger[600] : colors.text.secondary};
  font-size: ${fontSize.sm};
  margin-top: ${spacing.xs};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

// FormField Component - Focused on layout and error handling
export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  htmlFor?: string;
  disabled?: boolean;
  [key: string]: any;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  helperText,
  required = false,
  size = 'md',
  htmlFor,
  disabled = false,
  ...rest
}) => {
  return (
    <Stack direction="vertical" spacing="xs" {...rest}>
      {label && (
        <Label
          htmlFor={htmlFor}
          size={size}
          required={required}
          disabled={disabled}
          variant={error ? 'error' : 'default'}
        >
          {label}
        </Label>
      )}
      
      {children}
      
      {error && (
        <StyledMessage $isError={true} role="alert">
          {error}
        </StyledMessage>
      )}
      
      {helperText && !error && (
        <StyledMessage $isError={false}>
          {helperText}
        </StyledMessage>
      )}
    </Stack>
  );
}; 