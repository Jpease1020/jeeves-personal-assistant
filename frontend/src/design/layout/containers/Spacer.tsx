'use client';

import React from 'react';
import styled from 'styled-components';
import { spacing } from '../../system/tokens/tokens';

// Spacer component - simple spacing utility
export interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  axis?: 'horizontal' | 'vertical';
}

const StyledSpacer = styled.div<{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  axis: 'horizontal' | 'vertical';
}>`
  ${({ size, axis }) => {
    const space = spacing[size];
    return axis === 'horizontal' 
      ? `width: ${space}; height: 1px;`
      : `height: ${space}; width: 100%;`;
  }}
`;

export const Spacer: React.FC<SpacerProps> = ({ 
  size = 'md', 
  axis = 'vertical' 
}) => {
  return <StyledSpacer size={size} axis={axis} />;
}; 