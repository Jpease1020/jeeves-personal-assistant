'use client';

import React from 'react';
import styled from 'styled-components';
import { 
  FlexboxPositioningProps, 
  ResponsiveValue, 
  Breakpoint 
} from '../../system/shared-types';

// Utility function to resolve responsive values
function resolveResponsiveValue<T>(
  value: ResponsiveValue<T>,
  breakpoint: Breakpoint = 'md'
): T {
  if (typeof value === 'object' && value !== null) {
    // Type guard to ensure we have a responsive object
    const responsiveValue = value as Record<Breakpoint, T>;
    
    // Find the best matching breakpoint
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    // Look for exact match first
    if (responsiveValue[breakpoint] !== undefined) {
      return responsiveValue[breakpoint];
    }
    
    // Look for closest smaller breakpoint
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (responsiveValue[bp] !== undefined) {
        return responsiveValue[bp];
      }
    }
    
    // Fallback to xs if available
    if (responsiveValue.xs !== undefined) {
      return responsiveValue.xs;
    }
    // Fallback to first available value
    const firstValue = Object.values(responsiveValue)[0];
    if (firstValue !== undefined) {
      return firstValue;
    }
    
    // If we somehow get here, return the first value as fallback
    return Object.values(responsiveValue)[0] as T;
  }
  
  // If value is not an object, return it directly
  return value as T;
}

// Utility function to generate responsive CSS
function generateResponsiveCSS<T>(
  property: string,
  value: ResponsiveValue<T>,
  transformer?: (val: T) => string
): string {
  if (typeof value === 'object' && value !== null) {
    const cssRules: string[] = [];
    const responsiveValue = value as Record<Breakpoint, T>;
    
    Object.entries(responsiveValue).forEach(([breakpoint, val]) => {
      if (val !== undefined) {
        const transformedValue = transformer ? transformer(val) : String(val);
        if (breakpoint === 'xs') {
          cssRules.push(`${property}: ${transformedValue};`);
        } else {
          const breakpoints = {
            xs: '0px',
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
          };
          cssRules.push(`@media (min-width: ${breakpoints[breakpoint as Breakpoint]}) { ${property}: ${transformedValue}; }`);
        }
      }
    });
    
    return cssRules.join('\n');
  }
  
  const transformedValue = transformer ? transformer(value) : String(value);
  return `${property}: ${transformedValue};`;
}

// Styled component with flexbox-positioning hybrid system
const StyledFlexboxContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => ![
    'alignSelf', 'order', 'flex', 'flexGrow', 'flexShrink', 'flexBasis',
    'position', 'top', 'right', 'bottom', 'left', 'zIndex',
    'direction', 'wrap', 'align', 'justify'
  ].includes(prop)
})<FlexboxPositioningProps>`
  display: flex;
  
  /* Flexbox positioning (primary) */
  align-self: ${({ alignSelf }) => {
    if (typeof alignSelf === 'object') {
      return generateResponsiveCSS('align-self', alignSelf);
    }
    return alignSelf || 'stretch';
  }};
  
  order: ${({ order }) => {
    if (typeof order === 'object') {
      return generateResponsiveCSS('order', order);
    }
    return order || 0;
  }};
  
  flex: ${({ flex }) => {
    if (typeof flex === 'object') {
      return generateResponsiveCSS('flex', flex);
    }
    return flex || 'none';
  }};
  
  flex-grow: ${({ flexGrow }) => {
    if (typeof flexGrow === 'object') {
      return generateResponsiveCSS('flex-grow', flexGrow);
    }
    return flexGrow !== undefined ? flexGrow : 'none';
  }};
  
  flex-shrink: ${({ flexShrink }) => {
    if (typeof flexShrink === 'object') {
      return generateResponsiveCSS('flex-shrink', flexShrink);
    }
    return flexShrink !== undefined ? flexShrink : 'none';
  }};
  
  flex-basis: ${({ flexBasis }) => {
    if (typeof flexBasis === 'object') {
      return generateResponsiveCSS('flex-basis', flexBasis);
    }
    return flexBasis || 'auto';
  }};
  
  /* Flexbox layout properties */
  flex-direction: ${({ direction }) => {
    if (typeof direction === 'object') {
      return generateResponsiveCSS('flex-direction', direction);
    }
    return direction || 'column';
  }};
  
  flex-wrap: ${({ wrap }) => {
    if (typeof wrap === 'object') {
      return generateResponsiveCSS('flex-wrap', wrap);
    }
    return wrap || 'nowrap';
  }};
  
  align-items: ${({ align }) => {
    if (typeof align === 'object') {
      return generateResponsiveCSS('align-items', align);
    }
    return align || 'stretch';
  }};
  
  justify-content: ${({ justify }) => {
    if (typeof justify === 'object') {
      return generateResponsiveCSS('justify-content', justify);
    }
    return justify || 'flex-start';
  }};
  
  /* Limited positioning for edge cases (modals, dropdowns, etc.) */
  ${({ position, top, right, bottom, left, zIndex }) => {
    if (position) {
      const resolvedPosition = typeof position === 'object' ? resolveResponsiveValue(position) : position;
      
      let css = `position: ${resolvedPosition};`;
      
      if (top) {
        const resolvedTop = typeof top === 'object' ? resolveResponsiveValue(top) : top;
        css += `\n  top: ${resolvedTop};`;
      }
      
      if (right) {
        const resolvedRight = typeof right === 'object' ? resolveResponsiveValue(right) : right;
        css += `\n  right: ${resolvedRight};`;
      }
      
      if (bottom) {
        const resolvedBottom = typeof bottom === 'object' ? resolveResponsiveValue(bottom) : bottom;
        css += `\n  bottom: ${resolvedBottom};`;
      }
      
      if (left) {
        const resolvedLeft = typeof left === 'object' ? resolveResponsiveValue(left) : left;
        css += `\n  left: ${resolvedLeft};`;
      }
      
      if (zIndex) {
        const resolvedZIndex = typeof zIndex === 'object' ? resolveResponsiveValue(zIndex) : zIndex;
        css += `\n  z-index: ${resolvedZIndex};`;
      }
      
      return css;
    }
    return '';
  }}
  
  /* Responsive behavior */
  @media (max-width: 768px) {
    ${({ direction, align, justify }) => {
      const responsiveStyles: string[] = [];
      
      if (direction && typeof direction === 'object' && direction.sm) {
        responsiveStyles.push(`flex-direction: ${direction.sm};`);
      }
      
      if (align && typeof align === 'object' && align.sm) {
        responsiveStyles.push(`align-items: ${align.sm};`);
      }
      
      if (justify && typeof justify === 'object' && justify.sm) {
        responsiveStyles.push(`justify-content: ${justify.sm};`);
      }
      
      return responsiveStyles.join('\n  ');
    }}
  }
  
  @media (max-width: 640px) {
    ${({ direction, align, justify }) => {
      const responsiveStyles: string[] = [];
      
      if (direction && typeof direction === 'object' && direction.xs) {
        responsiveStyles.push(`flex-direction: ${direction.xs};`);
      }
      
      if (align && typeof align === 'object' && align.xs) {
        responsiveStyles.push(`align-items: ${align.xs};`);
      }
      
      if (justify && typeof justify === 'object' && justify.xs) {
        responsiveStyles.push(`justify-content: ${justify.xs};`);
      }
      
      return responsiveStyles.join('\n  ');
    }}
  }
`;

export interface FlexboxContainerProps extends FlexboxPositioningProps {
  children: React.ReactNode;
  as?: React.ElementType;
  id?: string;
  'data-testid'?: string;
  onClick?: () => void;
}

/**
 * FlexboxContainer Component
 * 
 * A hybrid container that prioritizes flexbox positioning while maintaining
 * limited positioning capabilities for edge cases like modals and dropdowns.
 * 
 * @example
 * ```tsx
 * // Flexbox-first positioning
 * <FlexboxContainer direction="row" align="center" gap="md">
 *   <div>Content 1</div>
 *   <div>Content 2</div>
 * </FlexboxContainer>
 * 
 * // With limited positioning for dropdowns
 * <FlexboxContainer 
 *   position="absolute" 
 *   top="100%" 
 *   right="0"
 *   direction="column"
 * >
 *   <div>Dropdown content</div>
 * </FlexboxContainer>
 * ```
 */
export const FlexboxContainer: React.FC<FlexboxContainerProps> = ({
  children,
  as: Component = 'div',
  id,
  'data-testid': testId,
  onClick,
  ...flexboxProps
}) => {
  return (
    <StyledFlexboxContainer
      as={Component}
      id={id}
      data-testid={testId}
      onClick={onClick}
      {...flexboxProps}
    >
      {children}
    </StyledFlexboxContainer>
  );
};
