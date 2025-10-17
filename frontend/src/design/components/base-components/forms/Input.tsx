'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, transitions, shadows } from '../../../system/tokens/tokens';

// Styled Input component with flexbox
const StyledInput = styled.input.withConfig({
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
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'text')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  flex: ${({ fullWidth }) => (fullWidth ? '1' : 'none')};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
          height: 2rem;
          min-height: 2rem;
        `;
      case 'md':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          height: 2.5rem;
          min-height: 2.5rem;
        `;
      case 'lg':
        return `
          padding: ${spacing.lg} ${spacing.xl};
          font-size: ${fontSize.lg};
          height: 3rem;
          min-height: 3rem;
        `;
      default:
        return `
          padding: ${spacing.md} ${spacing.lg};
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

  /* Mobile-specific datetime-local styling */
  &[type="datetime-local"] {
    /* Keep native appearance but ensure it works on mobile */
    cursor: pointer;
    
    /* iOS Safari specific fixes */
    @media (max-width: 768px) {
      font-size: 16px; /* Prevent zoom on iOS */
      cursor: pointer;
      
      /* Ensure the input is tappable and shows picker */
      &:focus {
        cursor: pointer;
      }
      
      &::-webkit-datetime-edit {
        padding: 0;
        cursor: pointer;
      }
      
      &::-webkit-datetime-edit-fields-wrapper {
        padding: 0;
        cursor: pointer;
      }
      
      &::-webkit-datetime-edit-text {
        color: ${colors.text.primary};
        cursor: pointer;
      }
      
      &::-webkit-datetime-edit-month-field,
      &::-webkit-datetime-edit-day-field,
      &::-webkit-datetime-edit-year-field,
      &::-webkit-datetime-edit-hour-field,
      &::-webkit-datetime-edit-minute-field {
        color: ${colors.text.primary};
        cursor: pointer;
      }
      
      &::-webkit-inner-spin-button {
        opacity: 1;
        color: ${colors.primary[600]};
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
        margin: 0;
      }
      
      /* Calendar picker indicator - ensure it's visible */
      &::-webkit-calendar-picker-indicator {
        opacity: 1;
        cursor: pointer;
        
        /* Ensure proper sizing and visibility */
        width: auto;
        height: auto;
        padding: 4px;
        margin: 0;
        
        /* Make sure it's visible on all screen sizes */
        display: block;
        visibility: visible;
        
        /* Mobile-specific adjustments */
        @media (max-width: 640px) {
          padding: 2px;
        }
      }
    }
  }

  /* Responsive behavior */
  @media (max-width: 768px) {
    ${({ size }) => {
      if (size === 'lg') {
        return `
          padding: ${spacing.md} ${spacing.lg};
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
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
          height: 3rem;
          min-height: 3rem;
        `;
      }
      return '';
    }}
  }
`;

// Input Component
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'checkbox' | 'color' | 'datetime-local' | 'date';
  placeholder?: string;
  value?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  cmsKeyLabel?: string; // optional, if label is separate we still can map placeholder
  cmsKeyPlaceholder?: string;
  [key: string]: any;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  size = 'md',
  fullWidth = false,
  name,
  id,
  required = false,
  cmsKeyLabel,
  cmsKeyPlaceholder,
  ...rest
}) => {
  const ref = React.useRef<HTMLInputElement | null>(null);
  // Register placeholder if present (counts as editable copy)
  // useRegisterContent(Boolean(placeholder), { role: 'placeholder', value: placeholder, cmsPath: cmsKeyPlaceholder, element: ref.current });
  return (
    <StyledInput
      type={type}
      placeholder={placeholder}
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
      ref={ref}
      {...rest}
    />
  );
}; 