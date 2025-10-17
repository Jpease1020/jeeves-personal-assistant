'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, transitions, shadows } from '../../../system/tokens/tokens';

// Styled Select component with flexbox
const StyledSelect = styled.select.withConfig({
  shouldForwardProp: (prop) => !['size', 'fullWidth', 'error', 'disabled', 'cmsId'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
  error: boolean;
  disabled: boolean;
}>`
  display: flex;
  align-items: center;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  min-width: 0; /* Allow flexbox shrinking */
  border: 1px solid ${({ error }) => (error ? colors.border.error : colors.border.default)};
  border-radius: ${borderRadius.default};
  background-color: ${({ disabled }) => (disabled ? colors.background.disabled : colors.background.primary)};
  color: ${({ disabled }) => (disabled ? colors.text.disabled : colors.text.primary)};
  outline: none;
  transition: ${transitions.default};
  box-sizing: border-box;
  font-family: inherit;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  flex: ${({ fullWidth }) => (fullWidth ? '1' : 'none')};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.xs} ${spacing.sm};
          font-size: ${fontSize.sm};
          height: 3rem;
          min-height: 3rem;
        `;
      case 'md':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.md};
          height: 3rem;
          min-height: 3rem;
        `;
      case 'lg':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.lg};
          height: 3rem;
          min-height: 3rem;
        `;
      default:
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.md};
          height: 3rem;
          min-height: 3rem;
        `;
    }
  }}

  /* Focus styles */
  &:focus {
    border-color: ${colors.primary[600]};
    box-shadow: ${shadows.focus};
  }

  /* Error styles */
  ${({ error }) => error && `
    border-color: ${colors.border.error};
    box-shadow: ${shadows.error};
  `}

  /* Responsive behavior */
  @media (max-width: 768px) {
    ${({ size }) => {
      if (size === 'lg') {
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.md};
          height: 3rem;
          min-height: 3rem;
        `;
      }
      return '';
    }}
  }

  @media (max-width: 640px) {
    ${({ size }) => {
      if (size === 'md' || size === 'lg') {
        return `
          padding: ${spacing.xs} ${spacing.sm};
          font-size: ${fontSize.sm};
          height: 3rem;
          min-height: 3rem;
        `;
      }
      return '';
    }}
  }
`;

// Select Component
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  [key: string]: any;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  error = false,
  size = 'md',
  fullWidth = false,
  name,
  id,
  required = false,
  ...rest
}) => {
  return (
    <StyledSelect
      value={value}
      onChange={onChange}
      disabled={disabled}
      name={name}
      id={id}
      required={required}
      size={size}
      fullWidth={fullWidth}
      error={error}
      aria-invalid={error}
      {...rest}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </StyledSelect>
  );
}; 