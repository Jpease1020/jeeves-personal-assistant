'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, transitions } from '../../system/tokens/tokens';
import { Container } from './Container';
import { type BaseLayoutProps, type SectionVariant, type SpacingScale, type MaxWidth, type FlexboxMargin } from '../../system/shared-types';

// Layout Section Props
interface LayoutSectionProps extends Omit<BaseLayoutProps, 'margin'> {
  variant?: SectionVariant;
  padding?: SpacingScale;
  spacing?: SpacingScale;
  margin?: FlexboxMargin;  // Limited margin for flexbox positioning
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  order?: number;
  container?: boolean;
  maxWidth?: MaxWidth;
  fullWidth?: boolean;
  as?: React.ElementType;
}

const StyledSection = styled.section.withConfig({
  shouldForwardProp: (prop) => !['variant', 'padding', 'spacing', 'margin', 'alignSelf', 'order'].includes(prop)
}) <{
  variant: 'default' | 'alternate' | 'brand' | 'muted' | 'hero' | 'cta';
  padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
      case '2xl':
        return `padding: ${spacing['2xl']};`;
      default:
        return `padding: ${spacing.lg};`;
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
      case 'alternate':
        return `
          background-color: ${colors.background.secondary};
        `;
      case 'brand':
        return `
          background-color: ${colors.primary[50]};
          color: ${colors.primary[900]};
        `;
      case 'muted':
        return `
          background-color: ${colors.gray[50]};
          color: ${colors.gray[700]};
        `;
      case 'hero':
        return `
          background-color: ${colors.primary[600]};
          color: ${colors.text.white};
        `;
      case 'cta':
        return `
          background-color: ${colors.success[600]};
          color: ${colors.text.white};
        `;
      default:
        return `
          background-color: transparent;
        `;
    }
  }}
`;

export const LayoutSection: React.FC<LayoutSectionProps> = ({
  variant = 'default',
  padding = 'lg',
  spacing = 'none',
  margin = 'none',
  alignSelf = 'stretch',
  order = 0,
  container = true,
  maxWidth = '2xl',
  fullWidth = false,
  as: Component = 'section',
  children,
  id,
  ...rest
}) => {
  if (container && !fullWidth) {
    return (
      <StyledSection
        variant={variant}
        padding={padding}
        spacing={spacing}
        margin={margin}
        alignSelf={alignSelf}
        order={order}
        as={Component}
        id={id}
        {...rest}
      >
        <Container maxWidth={maxWidth}>
          {children}
        </Container>
      </StyledSection>
    );
  }

  return (
    <StyledSection
      variant={variant}
      padding={padding}
      spacing={spacing}
      margin={margin}
      alignSelf={alignSelf}
      order={order}
      as={Component}
      id={id}
      {...rest}
    >
      {children}
    </StyledSection>
  );
}; 