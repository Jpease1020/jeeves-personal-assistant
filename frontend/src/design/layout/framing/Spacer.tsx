'use client';

import React from 'react';
import styled from 'styled-components';
import { spacing } from '../../system/tokens/tokens';
import { FlexboxMargin } from '../../system/shared-types';

// Spacer component for flexbox-based spacing
interface SpacerProps {
  size?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; // Grid column spans
  direction?: 'horizontal' | 'vertical';
  margin?: FlexboxMargin;
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  grow?: boolean;
  shrink?: boolean;
  id?: string;
  'data-testid'?: string;
}

const StyledSpacer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'span', 'direction', 'margin', 'alignSelf', 'grow', 'shrink'].includes(prop)
})<{
  size: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  span?: number;
  direction: 'horizontal' | 'vertical';
  margin: FlexboxMargin;
  alignSelf: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  grow: boolean;
  shrink: boolean;
}>`
  /* Flexbox properties */
  display: flex;
  align-self: ${({ alignSelf }) => alignSelf};
  flex-grow: ${({ grow }) => grow ? '1' : '0'};
  flex-shrink: ${({ shrink }) => shrink ? '1' : '0'};

  /* Limited margin for flexbox positioning */
  ${({ margin }) => {
    if (margin === 'auto') {
      return `margin: auto;`;
    }
    return '';
  }}

  /* Grid span for column-based spacing */
  ${({ span }) => {
    if (span) {
      return `
        flex-basis: ${(span / 12) * 100}%;
        max-width: ${(span / 12) * 100}%;
      `;
    }
    return '';
  }}

  /* Size-based spacing */
  ${({ size, direction, span }) => {
    // If span is provided, don't use size-based spacing
    if (span) return '';
    
    const spacingValue = size === 'none' ? '0' : spacing[size as keyof typeof spacing];
    
    if (direction === 'horizontal') {
      return `
        width: ${spacingValue};
        min-width: ${spacingValue};
        height: 1px;
      `;
    } else {
      return `
        height: ${spacingValue};
        min-height: ${spacingValue};
        width: 1px;
      `;
    }
  }}

  /* Invisible content */
  pointer-events: none;
  user-select: none;
  
  /* Debug mode - uncomment to visualize spacers */
  /* background-color: rgba(255, 0, 0, 0.1); */
`;

/**
 * Spacer Component - Flexbox-based spacing element
 * 
 * Provides flexible spacing for flexbox layouts without using margin.
 * Can be used for both size-based spacing and grid column spacing.
 * 
 * @example
 * ```tsx
 * // Size-based spacing
 * <Row>
 *   <div>Left content</div>
 *   <Spacer size="md" direction="horizontal" />
 *   <div>Right content</div>
 * </Row>
 * 
 * // Column-based spacing (replaces offset)
 * <Row>
 *   <Spacer span={2} />
 *   <Col span={6}>Offset content</Col>
 *   <Col span={4}>Regular content</Col>
 * </Row>
 * 
 * // Growing spacer (pushes content apart)
 * <Row>
 *   <div>Left</div>
 *   <Spacer grow />
 *   <div>Right (pushed to end)</div>
 * </Row>
 * ```
 */
export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  span,
  direction = 'horizontal',
  margin = 'none',
  alignSelf = 'stretch',
  grow = false,
  shrink = false,
  id,
  'data-testid': testId,
  ...rest
}) => {
  return (
    <StyledSpacer
      size={size}
      span={span}
      direction={direction}
      margin={margin}
      alignSelf={alignSelf}
      grow={grow}
      shrink={shrink}
      id={id}
      data-testid={testId}
      {...rest}
    />
  );
};

export type { SpacerProps };
