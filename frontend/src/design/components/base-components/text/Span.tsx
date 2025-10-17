'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, fontWeight, fontFamily, transitions } from '../../../system/tokens/tokens';
import { BaseTextComponentProps, TextComponentChildren } from '../../../system/shared-types';
import { useCMSData } from '../../../providers/CMSDataProvider';

// Styled span component
const StyledSpan = styled.span.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'color', 'weight', 'cmsId'].includes(prop)
})<{
  variant: 'default' | 'bold' | 'italic' | 'code' | 'mark' | 'link' | 'badge';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info' | 'inherit';
  weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}>`
  font-family: ${fontFamily.sans};
  transition: ${transitions.default};

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return '';
      case 'bold':
        return `font-weight: ${fontWeight.bold};`;
      case 'italic':
        return `font-style: italic;`;
      case 'code':
        return `
          font-family: 'Courier New', monospace;
          background-color: ${colors.gray[100]};
          padding: ${spacing.xs} ${spacing.sm};
          border-radius: ${spacing.xs};
          font-size: 0.875em;
        `;
      case 'mark':
        return `
          background-color: ${colors.warning[200]};
          padding: ${spacing.xs};
        `;
      case 'link':
        return `
          color: ${colors.primary[600]};
          text-decoration: underline;
          cursor: pointer;
          
          &:hover {
            color: ${colors.primary[800]};
          }
        `;
      case 'badge':
        return `
          display: inline-block;
          padding: ${spacing.xs} ${spacing.sm};
          font-size: ${fontSize.xs};
          font-weight: ${fontWeight.medium};
          border-radius: ${spacing.xl};
          background-color: ${colors.gray[100]};
        `;
      default:
        return '';
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `font-size: ${fontSize.xs};`;
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      case 'xl':
        return `font-size: ${fontSize.xl};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}

  /* Color styles */
  ${({ color }) => {
    switch (color) {
      case 'default':
        return `color: ${colors.text.primary};`;
      case 'primary':
        return `color: ${colors.primary[600]};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      case 'muted':
        return `color: ${colors.text.secondary};`;
      case 'success':
        return `color: ${colors.success[600]};`;
      case 'warning':
        return `color: ${colors.warning[600]};`;
      case 'error':
        return `color: ${colors.danger[600]};`;
      case 'info':
        return `color: ${colors.primary[600]};`;
      case 'inherit':
        return `color: inherit;`;
      default:
        return `color: ${colors.text.primary};`;
    }
  }}

  /* Weight styles */
  ${({ weight }) => {
    switch (weight) {
      case 'light':
        return `font-weight: ${fontWeight.light};`;
      case 'normal':
        return `font-weight: ${fontWeight.normal};`;
      case 'medium':
        return `font-weight: ${fontWeight.medium};`;
      case 'semibold':
        return `font-weight: ${fontWeight.semibold};`;
      case 'bold':
        return `font-weight: ${fontWeight.bold};`;
      default:
        return `font-weight: ${fontWeight.normal};`;
    }
  }}
`;

export interface SpanProps extends Omit<BaseTextComponentProps, 'cmsData' | 'cmsId'> {
  // Core props - now type-safe
  children: TextComponentChildren;
  
  // Appearance
  variant?: 'default' | 'bold' | 'italic' | 'code' | 'mark' | 'link' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  
  // Content editing
  cmsId?: string; // Optional for admin components
  
  // Rest props
  [key: string]: any;
}

export const Span: React.FC<SpanProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  color = 'default',
  weight = 'normal',
  cmsId,
  ...rest
}) => {
  // Get CMS data from provider
  const { cmsData } = useCMSData();
  
  // Don't add data-cms-id for decorative elements
  const shouldIgnoreCMS = cmsId === 'ignore';
  
  // If we have CMS data and cmsId, try to get the field value
  const displayContent = cmsData && cmsId && !shouldIgnoreCMS 
    ? ((cmsData as any)?.[cmsId] || children)
    : children;
  
  return (
    <StyledSpan
      variant={variant}
      size={size}
      color={color}
      weight={weight}
      {...(!shouldIgnoreCMS && cmsId ? { 'data-cms-id': cmsId } : {})}
      {...rest}
    >
      {displayContent}
    </StyledSpan>
  );
}; 