'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, transitions, shadows } from '../../../system/tokens/tokens';

// Styled wrapper to match your Input component styling
const DatePickerWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['fullWidth', 'error', 'size'].includes(prop)
})<{ fullWidth: boolean; error: boolean; size: 'sm' | 'md' | 'lg' }>`
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  
  .react-datepicker-wrapper {
    width: 100%;
  }
 
  .react-datepicker__input-container {
    width: 100%;
    
    input {
      width: 100%;
    //   border: 1px solid ${({ error }) => (error ? colors.border.error : colors.border.default)};
      border-radius: ${borderRadius.default};
      background-color: ${colors.background.primary};
      color: ${colors.text.primary};
      outline: none;
      transition: ${transitions.default};
      box-sizing: border-box;
      font-family: inherit;
      cursor: pointer;
      
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
      
      /* Mobile responsive */
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
    }
  }
  
  /* Custom DatePicker popup styling */
  .react-datepicker {
    border: 1px solid ${colors.border.default};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.lg};
    font-family: inherit;
    background-color: ${colors.background.primary};
    
    /* Mobile responsive adjustments */
    @media (max-width: 768px) {
      width: 100% !important;
      max-width: 320px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      
      .react-datepicker__month-container {
        width: 100% !important;
        float: none !important;
      }
      
      .react-datepicker__time-container {
        width: 100% !important;
        border-left: none !important;
                                                 // border-top: 1px solid ${colors.border.default};
        float: none !important;
      }
    }
    
    .react-datepicker__header {
      background-color: ${colors.primary[600]};
      border-bottom: 1px solid ${colors.border.default};
      border-radius: ${borderRadius.lg} ${borderRadius.lg} 0 0;
      
      .react-datepicker__current-month {
        color: ${colors.text.white};
        font-weight: 600;
      }
      
      .react-datepicker__day-name {
        color: ${colors.text.white};
        font-weight: 500;
      }
    }
    
    .react-datepicker__day {
      color: ${colors.text.primary};
      
      &:hover {
        background-color: ${colors.primary[100]};
        color: ${colors.primary[700]};
      }
      
      &.react-datepicker__day--selected {
        background-color: ${colors.primary[600]};
        color: ${colors.text.white};
      }
      
      &.react-datepicker__day--today {
        background-color: ${colors.primary[100]};
        color: ${colors.primary[700]};
        font-weight: 600;
      }
      
      &.react-datepicker__day--disabled {
        color: ${colors.text.disabled};
        cursor: not-allowed;
      }
      
      /* Mobile responsive day sizing */
      @media (max-width: 768px) {
        width: 2rem !important;
        height: 2rem !important;
        line-height: 2rem !important;
        margin: 0.125rem !important;
        font-size: 0.875rem;
      }
    }
    
    .react-datepicker__time-container {
    //   border-left: 1px solid ${colors.border.default};
      
      .react-datepicker__time__header {
        color: ${colors.text.white};
      }

      .react-datepicker__header--time {
        background-color: ${colors.primary[600]};
        color: ${colors.text.white};
      }

      .react-datepicker__time {
        // border-bottom-right-radius: ${borderRadius.lg};
      }
      .react-datepicker__time-list {
        .react-datepicker__time-list-item {
          color: ${colors.text.primary};
          
          &:hover {
            background-color: ${colors.primary[100]};
            color: ${colors.primary[700]};
          }
          
          &.react-datepicker__time-list-item--selected {
            background-color: ${colors.primary[600]};
            color: ${colors.text.white};
          }
          
          /* Mobile responsive time list items */
          @media (max-width: 768px) {
            padding: 0.5rem 0.75rem !important;
            font-size: 0.875rem;
            line-height: 1.25rem;
          }
        }
      }
    }
    
    .react-datepicker__navigation {
      .react-datepicker__navigation-icon::before {
        border-color: ${colors.text.white};
      }
      
      &:hover .react-datepicker__navigation-icon::before {
        border-color: ${colors.text.white};
      }
    }
  }
`;

export interface DateTimePickerProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string; // ISO string format
  onChange?: (dateTime: string) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  required?: boolean;
  cmsId?: string;
  [key: string]: any;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  id,
  label,
  placeholder = "mm/dd/yyyy, --:-- --",
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  error = false,
  size = 'md',
  fullWidth = false,
  required = false,
  cmsId,
  ...rest
}) => {
  // Convert ISO string to Date object
  const selectedDate = value ? new Date(value) : null;
  
  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date && onChange) {
      // Convert to ISO string format (YYYY-MM-DDTHH:mm)
      // This ensures consistent format across all components
      const isoString = date.toISOString().slice(0, 16);
      onChange(isoString);
    }
  };
  
  return (
    <DatePickerWrapper 
      fullWidth={fullWidth} 
      error={error} 
      size={size}
      data-testid={cmsId}
    >
      {label && (
        <label 
          htmlFor={id}
          style={{
            display: 'block',
            marginBottom: spacing.sm,
            fontSize: fontSize.sm,
            fontWeight: 500,
            color: colors.text.primary,
          }}
        >
          {label}
          {required && <span style={{ color: colors.border.error }}> *</span>}
        </label>
      )}
      
      <DatePicker
        id={id}
        selected={selectedDate}
        onChange={handleDateChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="MM/dd/yyyy h:mm aa"
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        required={required}
        inline={isMobile}
        customInput={
          <input
            readOnly
            style={{ cursor: 'pointer' }}
            {...rest}
          />
        }
        popperClassName="react-datepicker-popper"
      />
    </DatePickerWrapper>
  );
};
