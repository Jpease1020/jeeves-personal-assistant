'use client';

import React from 'react';
import styled from 'styled-components';
import { spacing, colors, borderRadius, shadows } from '../../../system/tokens/tokens';

interface RadioButtonProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated';
}

const RadioButtonContainer = styled.div<{
  $size: 'sm' | 'md' | 'lg';
  $variant: 'default' | 'outlined' | 'elevated';
  $disabled: boolean;
  $checked: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${({ $size }) => spacing[$size === 'lg' ? 'md' : $size === 'md' ? 'sm' : 'xs']};
  padding: ${({ $size }) => spacing[$size === 'lg' ? 'md' : $size === 'md' ? 'sm' : 'xs']};
  border-radius: ${borderRadius.md};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  ${({ $variant, $disabled }) => {
    if ($disabled) {
      return `
        opacity: 0.6;
        background-color: ${colors.background.disabled};
      `;
    }
    
    switch ($variant) {
      case 'outlined':
        return `
          border: 2px solid ${colors.border.default};
          background-color: ${colors.background.primary};
          &:hover {
            border-color: ${colors.primary[500]};
            background-color: ${colors.primary[50]};
          }
        `;
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          box-shadow: ${shadows.sm};
          border: 1px solid ${colors.border.default};
          &:hover {
            box-shadow: ${shadows.md};
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background-color: transparent;
          &:hover {
            background-color: ${colors.background.secondary};
          }
        `;
    }
  }}
  
  ${({ $checked, $variant, $disabled }) => {
    if ($disabled) return '';
    
    if ($checked) {
      switch ($variant) {
        case 'outlined':
          return `
            border-color: ${colors.primary[600]};
            background-color: ${colors.primary[100]};
          `;
        case 'elevated':
          return `
            border-color: ${colors.primary[600]};
            background-color: ${colors.primary[100]};
            box-shadow: ${shadows.lg};
          `;
        default:
          return `
            background-color: ${colors.primary[100]};
            border: 1px solid ${colors.primary[200]};
          `;
      }
    }
  }}
`;

const RadioInput = styled.input`
  appearance: none;
  width: ${spacing.lg};
  height: ${spacing.lg};
  border: 2px solid ${colors.gray[400]};
  border-radius: 50%;
  margin: 0;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${colors.background.primary};
  
  &:checked {
    border-color: ${colors.primary[600]};
    background-color: ${colors.primary[600]};
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${spacing.sm};
      height: ${spacing.sm};
      background-color: white;
      border-radius: 50%;
    }
  }
  
  &:hover:not(:disabled) {
    border-color: ${colors.primary[500]};
    background-color: ${colors.primary[50]};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${colors.primary[200]};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    border-color: ${colors.gray[300]};
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const Label = styled.label<{ $size: 'sm' | 'md' | 'lg'; $disabled: boolean }>`
  display: block;
  font-weight: 600;
  color: ${({ $disabled }) => $disabled ? colors.text.disabled : colors.text.primary};
  font-size: ${({ $size }) => $size === 'lg' ? '1.125rem' : $size === 'md' ? '1rem' : '0.875rem'};
  margin: 0;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
`;

const Description = styled.p<{ $size: 'sm' | 'md' | 'lg'; $disabled: boolean }>`
  margin: 0;
  color: ${({ $disabled }) => $disabled ? colors.text.disabled : colors.text.secondary};
  font-size: ${({ $size }) => $size === 'lg' ? '0.875rem' : $size === 'md' ? '0.8125rem' : '0.75rem'};
  line-height: 1.4;
`;

const RadioButton: React.FC<RadioButtonProps> = ({
  id,
  name,
  value,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  variant = 'default'
}) => {
  const handleChange = () => {
    if (!disabled) {
      onChange(value);
    }
  };

  return (
    <RadioButtonContainer
      $size={size}
      $variant={variant}
      $disabled={disabled}
      $checked={checked}
      onClick={handleChange}
    >
      <RadioInput
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <ContentContainer>
        <Label htmlFor={id} $size={size} $disabled={disabled}>
          {label}
        </Label>
        {description && (
          <Description $size={size} $disabled={disabled}>
            {description}
          </Description>
        )}
      </ContentContainer>
    </RadioButtonContainer>
  );
};

export default RadioButton;
