'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, transitions } from '../../system/tokens/tokens';
import { type FlexboxMargin } from '../../system/shared-types';

// Define BoxProps interface locally for this component
interface BoxProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: FlexboxMargin;  // Limited margin for flexbox positioning
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order?: number;
  as?: 'div' | 'main' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer';
  id?: string;
  onClick?: () => void;
}

const StyledBox = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'padding', 'rounded', 'spacing', 'margin', 'alignSelf', 'order'].includes(prop)
}) <{
  variant: 'default' | 'elevated' | 'outlined' | 'filled';
  padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  spacing: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin: FlexboxMargin;
  alignSelf: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order: number;
}>`
  transition: ${transitions.default};
  display: flex;
  flex-direction: column;
  align-self: ${({ alignSelf }) => alignSelf};
  order: ${({ order }) => order};

  /* Limited margin for flexbox positioning */
  ${({ margin }) => {
    if (margin === 'auto') {
      return `margin: auto;`;
    }
    return '';
  }}

  /* Padding styles */
  ${({ padding }) => {
    switch (padding) {
      case 'none':
        return `padding: 0;`;
      case 'xs':
        return `padding: ${spacing.xs};`;
      case 'sm':
        return `padding: ${spacing.sm};`;
      case 'md':
        return `padding: ${spacing.md};`;
      case 'lg':
        return `padding: ${spacing.lg};`;
      case 'xl':
        return `padding: ${spacing.xl};`;
      default:
        return `padding: ${spacing.md};`;
    }
  }}

  /* Border radius styles */
  ${({ rounded }) => {
    switch (rounded) {
      case 'none':
        return `border-radius: 0;`;
      case 'sm':
        return `border-radius: ${borderRadius.sm};`;
      case 'md':
        return `border-radius: ${borderRadius.default};`;
      case 'lg':
        return `border-radius: ${borderRadius.lg};`;
      case 'xl':
        return `border-radius: ${borderRadius.xl};`;
      case 'full':
        return `border-radius: 50%;`;
      default:
        return `border-radius: ${borderRadius.default};`;
    }
  }}

  /* Internal spacing for content */
  ${({ spacing: spacingProp }) => {
    switch (spacingProp) {
      case 'none':
        return `gap: 0;`;
      case 'xs':
        return `gap: ${spacing.xs};`;
      case 'sm':
        return `gap: ${spacing.sm};`;
      case 'md':
        return `gap: ${spacing.md};`;
      case 'lg':
        return `gap: ${spacing.lg};`;
      case 'xl':
        return `gap: ${spacing.xl};`;
      case '2xl':
        return `gap: ${spacing['2xl']};`;
      default:
        return `gap: 0;`;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all ${transitions.default};
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
          }
        `;
      case 'outlined':
        return `
          background-color: transparent;
          border: 1px solid ${colors.border.default};
        `;
      case 'filled':
        return `
          background-color: ${colors.background.secondary};
        `;
      default:
        return `
          background-color: transparent;
        `;
    }
  }}
`;

export const Box: React.FC<BoxProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  rounded = 'md',
  spacing = 'none',
  margin = 'none',
  alignSelf = 'stretch',
  order = 0,
  as: Component = 'div',
  onClick,
  ...rest

}) => {
  return (
    <StyledBox
      variant={variant}
      padding={padding}
      rounded={rounded}
      spacing={spacing}
      margin={margin}
      alignSelf={alignSelf}
      order={order}
      as={Component}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledBox>
  );
};

export type { BoxProps }; 