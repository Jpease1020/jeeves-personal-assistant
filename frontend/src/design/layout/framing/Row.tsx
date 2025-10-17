'use client';

import React from 'react';
import styled from 'styled-components';
import { spacing, breakpoints } from '../../system/tokens/tokens';
import { FlexboxMargin } from '../../system/shared-types';

// Define types locally for this component
interface RowProps {
  children: React.ReactNode;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: FlexboxMargin;  // Limited margin for flexbox positioning
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  order?: number;
  fullWidth?: boolean;
  responsive?: boolean;
  id?: string;
  as?: React.ElementType;
  'data-testid'?: string;
}

// Styled Row component with flexbox properties
const StyledRow = styled.div.withConfig({
  shouldForwardProp: (prop) => !['direction', 'wrap', 'align', 'justify', 'gap', 'padding', 'margin', 'alignSelf', 'order', 'fullWidth', 'responsive'].includes(prop)
})<{
  direction: RowProps['direction'];
  wrap: RowProps['wrap'];
  align: RowProps['align'];
  justify: RowProps['justify'];
  gap: RowProps['gap'];
  padding: RowProps['padding'];
  margin: FlexboxMargin;
  alignSelf: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  order: number;
  fullWidth: boolean;
  responsive: boolean;
}>`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  flex-wrap: ${({ wrap }) => wrap};
  align-items: ${({ align }) => align};
  justify-content: ${({ justify }) => justify};
  align-self: ${({ alignSelf }) => alignSelf};
  order: ${({ order }) => order};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  
  /* Limited margin for flexbox positioning */
  ${({ margin }) => {
    if (margin === 'auto') {
      return `margin: auto;`;
    }
    return '';
  }}
  
  /* Gap spacing */
  gap: ${({ gap }) => gap === 'none' ? '0' : spacing[gap as keyof typeof spacing]};
  
  /* Padding */
  padding: ${({ padding }) => padding === 'none' ? '0' : spacing[padding as keyof typeof spacing]};
  
  /* Responsive behavior */
  ${({ responsive }) => responsive && `
    @media (max-width: ${breakpoints.sm}) {
      flex-direction: column;
    }
  `}
`;

/**
 * Row Component - Flexbox row container
 * 
 * Provides a flexible row layout with responsive behavior and comprehensive
 * flexbox controls for alignment, spacing, and direction. Spacing between rows
 * is handled by parent containers using gap prop.
 * 
 * @example
 * ```tsx
 * <Row gap="md" align="center" justify="space-between">
 *   <Col span={6}>Left content</Col>
 *   <Col span={6}>Right content</Col>
 * </Row>
 * ```
 */
export const Row: React.FC<RowProps> = ({
  children,
  direction = 'row',
  wrap = 'nowrap',
  align = 'stretch',
  justify = 'flex-start',
  gap = 'none',
  padding = 'none',
  margin = 'none',
  alignSelf = 'stretch',
  order = 0,
  fullWidth = false,
  responsive = false,
  id,
  as: Component = 'div',
  'data-testid': testId,
  ...rest
}) => {
  return (
    <StyledRow
      direction={direction}
      wrap={wrap}
      align={align}
      justify={justify}
      gap={gap}
      padding={padding}
      margin={margin}
      alignSelf={alignSelf}
      order={order}
      fullWidth={fullWidth}
      responsive={responsive}
      id={id}
      as={Component}
      data-testid={testId}
      {...rest}
    >
      {children}
    </StyledRow>
  );
};

export type { RowProps }; 