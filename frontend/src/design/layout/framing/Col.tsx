'use client';

import React from 'react';
import styled from 'styled-components';
import { spacing, breakpoints } from '../../system/tokens/tokens';
import { FlexboxMargin } from '../../system/shared-types';

// Define types locally for this component
type ColSpan = number;
type ResponsiveColSpan = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
};

interface ColProps {
  children: React.ReactNode;
  span?: ColSpan | ResponsiveColSpan;
  /** 
   * @deprecated Use Spacer component or Grid with start/end props instead.
   * Offset uses margin-left which conflicts with flexbox spacing.
   * 
   * @example
   * // ❌ Old way (conflicts with flexbox)
   * <Col span={6} offset={2}>Content</Col>
   * 
   * // ✅ New way (flexbox-first)
   * <Row>
   *   <Spacer span={2} />
   *   <Col span={6}>Content</Col>
   * </Row>
   * 
   * // ✅ Or use Grid for complex layouts
   * <Grid cols={12}>
   *   <GridItem span={6} start={3}>Content</GridItem>
   * </Grid>
   */
  offset?: ColSpan | ResponsiveColSpan;
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: FlexboxMargin;  // Limited margin for flexbox positioning
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  order?: number;
  grow?: boolean;
  shrink?: boolean;
  id?: string;
  as?: React.ElementType;
  'data-testid'?: string;
}

// Helper function to generate responsive flex basis
const generateFlexBasis = (span: ColSpan | ResponsiveColSpan): string => {
  if (typeof span === 'number') {
    return `${(span / 12) * 100}%`;
  }
  
  // Responsive spans - start with xs, then override for larger breakpoints
  const responsiveBasis = [];
  
  if (span.xs) {
    responsiveBasis.push(`${(span.xs / 12) * 100}%`);
  }
  
  if (span.sm) {
    responsiveBasis.push(`
      @media (min-width: ${breakpoints.sm}) {
        flex-basis: ${(span.sm / 12) * 100}%;
        max-width: ${(span.sm / 12) * 100}%;
      }
    `);
  }
  
  if (span.md) {
    responsiveBasis.push(`
      @media (min-width: ${breakpoints.md}) {
        flex-basis: ${(span.md / 12) * 100}%;
        max-width: ${(span.md / 12) * 100}%;
      }
    `);
  }
  
  if (span.lg) {
    responsiveBasis.push(`
      @media (min-width: ${breakpoints.lg}) {
        flex-basis: ${(span.lg / 12) * 100}%;
        max-width: ${(span.lg / 12) * 100}%;
      }
    `);
  }
  
  if (span.xl) {
    responsiveBasis.push(`
      @media (min-width: ${breakpoints.xl}) {
        flex-basis: ${(span.xl / 12) * 100}%;
        max-width: ${(span.xl / 12) * 100}%;
      }
    `);
  }
  
  if (span['2xl']) {
    responsiveBasis.push(`
      @media (min-width: ${breakpoints['2xl']}) {
        flex-basis: ${(span['2xl'] / 12) * 100}%;
        max-width: ${(span['2xl'] / 12) * 100}%;
      }
    `);
  }
  
  return responsiveBasis.join('\n');
};

// Helper function to generate responsive offsets
const generateOffset = (offset: ColSpan | ResponsiveColSpan): string => {
  if (typeof offset === 'number') {
    return `margin-left: ${(offset / 12) * 100}%;`;
  }
  
  const responsiveOffset = [];
  
  if (offset.xs) {
    responsiveOffset.push(`margin-left: ${(offset.xs / 12) * 100}%;`);
  }
  
  if (offset.sm) {
    responsiveOffset.push(`
      @media (min-width: ${breakpoints.sm}) {
        margin-left: ${(offset.sm / 12) * 100}%;
      }
    `);
  }
  
  if (offset.md) {
    responsiveOffset.push(`
      @media (min-width: ${breakpoints.md}) {
        margin-left: ${(offset.md / 12) * 100}%;
      }
    `);
  }
  
  if (offset.lg) {
    responsiveOffset.push(`
      @media (min-width: ${breakpoints.lg}) {
        margin-left: ${(offset.lg / 12) * 100}%;
      }
    `);
  }
  
  if (offset.xl) {
    responsiveOffset.push(`
      @media (min-width: ${breakpoints.xl}) {
        margin-left: ${(offset.xl / 12) * 100}%;
      }
    `);
  }
  
  if (offset['2xl']) {
    responsiveOffset.push(`
      @media (min-width: ${breakpoints['2xl']}) {
        margin-left: ${(offset['2xl'] / 12) * 100}%;
      }
    `);
  }
  
  return responsiveOffset.join('\n');
};

// Styled Column component
const StyledCol = styled.div.withConfig({
  shouldForwardProp: (prop) => !['span', 'offset', 'align', 'justify', 'padding', 'margin', 'alignSelf', 'order', 'grow', 'shrink'].includes(prop)
})<{
  span?: ColSpan | ResponsiveColSpan;
  offset?: ColSpan | ResponsiveColSpan;
  align: ColProps['align'];
  justify: ColProps['justify'];
  padding: ColProps['padding'];
  margin: FlexboxMargin;
  alignSelf: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  order: number;
  grow: boolean;
  shrink: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: ${({ align }) => align};
  justify-content: ${({ justify }) => justify};
  align-self: ${({ alignSelf }) => alignSelf};
  order: ${({ order }) => order};
  flex-grow: ${({ grow }) => grow ? '1' : '0'};
  flex-shrink: ${({ shrink }) => shrink ? '1' : '0'};
  
  /* Limited margin for flexbox positioning */
  ${({ margin }) => {
    if (margin === 'auto') {
      return `margin: auto;`;
    }
    return '';
  }}
  
  /* Column span */
  ${({ span }) => span && generateFlexBasis(span)}
  
  /* Column offset */
  ${({ offset }) => offset && generateOffset(offset)}
  
  /* Padding */
  padding: ${({ padding }) => padding === 'none' ? '0' : spacing[padding as keyof typeof spacing]};
`;

/**
 * Column Component - Flexible column with responsive spans
 * 
 * Provides a flexible column layout with responsive spans, offsets,
 * and comprehensive flexbox controls. Spacing between columns is handled
 * by parent Row/Stack components using gap prop.
 * 
 * @example
 * ```tsx
 * <Row gap="md">
 *   <Col span={6} offset={1}>Content</Col>
 *   <Col span={5}>Content</Col>
 * </Row>
 * 
 * // Responsive spans
 * <Col span={{ xs: 12, md: 6, lg: 4 }}>Responsive content</Col>
 * ```
 */
export const Col: React.FC<ColProps> = ({
  children,
  span,
  offset,
  align = 'stretch',
  justify = 'flex-start',
  padding = 'none',
  margin = 'none',
  alignSelf = 'stretch',
  order = 0,
  grow = false,
  shrink = true,
  id,
  as: Component = 'div',
  'data-testid': testId,
  ...rest
}) => {
  // Deprecation warning for offset prop
  if (offset && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(
      '⚠️  Col offset prop is deprecated and conflicts with flexbox spacing.\n' +
      '   Use Spacer component or Grid with start/end props instead.\n' +
      '   See: https://docs.example.com/migration/flexbox-spacing'
    );
  }

  return (
    <StyledCol
      span={span}
      offset={offset}
      align={align}
      justify={justify}
      padding={padding}
      margin={margin}
      alignSelf={alignSelf}
      order={order}
      grow={grow}
      shrink={shrink}
      id={id}
      as={Component}
      data-testid={testId}
      {...rest}
    >
      {children}
    </StyledCol>
  );
};

export type { ColProps }; 