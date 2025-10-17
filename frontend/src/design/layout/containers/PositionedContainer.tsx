'use client';

import React from 'react';
import styled from 'styled-components';
import { ResponsiveValue } from '../../system/shared-types';

// PositionedContainer component - for positioning needs
export interface PositionedContainerProps {
  children: React.ReactNode;
  position?: 'fixed' | 'absolute' | 'relative' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  display?: 'flex' | 'block' | 'inline' | 'inline-block';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  as?: 'div' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer';
  id?: string;
  gap?: string | ResponsiveValue<string>;
  backgroundColor?: string;
  boxShadow?: string;
  padding?: string;
  width?: string;
}

const StyledPositionedContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['position', 'top', 'right', 'bottom', 'left', 'zIndex', 'display', 'flexDirection', 'alignItems', 'justifyContent', 'gap', 'backgroundColor', 'boxShadow', 'padding', 'width'].includes(prop)
})<{
  position: 'fixed' | 'absolute' | 'relative' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  display: 'flex' | 'block' | 'inline' | 'inline-block';
  flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: string | ResponsiveValue<string>;
  backgroundColor?: string;
  boxShadow?: string;
  padding?: string;
  width?: string;
}>`
  position: ${({ position }) => position};
  ${({ top }) => top && `top: ${top};`}
  ${({ right }) => right && `right: ${right};`}
  ${({ bottom }) => bottom && `bottom: ${bottom};`}
  ${({ left }) => left && `left: ${left};`}
  ${({ zIndex }) => zIndex && `z-index: ${zIndex};`}
  display: ${({ display }) => display};
  ${({ display, flexDirection, alignItems, justifyContent }) => 
    display === 'flex' && `
      flex-direction: ${flexDirection};
      align-items: ${alignItems};
      justify-content: ${justifyContent};
    `
  }
  ${({ gap }) => {
    if (!gap) return '';
    if (typeof gap === 'string') return `gap: ${gap};`;
    
    // Handle responsive gap values
    const responsiveGap = gap as Record<string, string>;
    let css = '';
    
    if (responsiveGap.xs) css += `gap: ${responsiveGap.xs};`;
    if (responsiveGap.sm) css += `@media (min-width: 640px) { gap: ${responsiveGap.sm}; }`;
    if (responsiveGap.md) css += `@media (min-width: 768px) { gap: ${responsiveGap.md}; }`;
    if (responsiveGap.lg) css += `@media (min-width: 1024px) { gap: ${responsiveGap.lg}; }`;
    if (responsiveGap.xl) css += `@media (min-width: 1280px) { gap: ${responsiveGap.xl}; }`;
    if (responsiveGap['2xl']) css += `@media (min-width: 1536px) { gap: ${responsiveGap['2xl']}; }`;
    
    return css;
  }}
  
  ${({ backgroundColor }) => backgroundColor && `background-color: ${backgroundColor};`}
  ${({ boxShadow }) => boxShadow && `box-shadow: ${boxShadow};`}
  ${({ padding }) => padding && `padding: ${padding};`}
  ${({ width }) => width && `width: ${width};`}
`;

export const PositionedContainer: React.FC<PositionedContainerProps> = ({
  children,
  position = 'relative',
  top,
  right,
  bottom,
  left,
  zIndex,
  display = 'block',
  flexDirection = 'row',
  alignItems = 'stretch',
  justifyContent = 'flex-start',
  as: Component = 'div',
  id,
  gap,
  backgroundColor,
  boxShadow,
  padding,
  width,
  ...rest
}) => {
  return (
    <StyledPositionedContainer
      position={position}
      top={top}
      right={right}
      bottom={bottom}
      left={left}
      zIndex={zIndex}
      display={display}
      flexDirection={flexDirection}
      alignItems={alignItems}
      justifyContent={justifyContent}
      as={Component}
      id={id}
      gap={gap}
      backgroundColor={backgroundColor}
      boxShadow={boxShadow}
      padding={padding}
      width={width}
      {...rest}
    >
      {children}
    </StyledPositionedContainer>
  );
}; 