'use client';

import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Stack } from '../../../layout/framing/Stack';
import { Container } from '../../../layout/containers/Container';
import { Text } from '../text/Text';
import { PositionedContainer } from '../../../layout/containers/PositionedContainer';
import { colors, spacing } from '../../../system/tokens/tokens';

// Animation keyframes
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const dotPulse = keyframes`
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
`;

// Single styled component for all animations
const AnimatedElement = styled.span.withConfig({
  shouldForwardProp: (prop) => !['variant', 'delay'].includes(prop)
}) <{
  variant: 'spinner' | 'pulse' | 'dot';
  delay?: number;
}>`
  color: ${colors.text.secondary};
  ${({ variant, delay }) => {
    switch (variant) {
      case 'spinner':
        return css`animation: ${spin} 1s linear infinite;`;
      case 'pulse':
        return css`animation: ${pulse} 2s ease-in-out infinite;`;
      case 'dot':
        return css`
          animation: ${dotPulse} 1.5s ease-in-out infinite;
          animation-delay: ${delay || 0}s;
        `;
      default:
        return css``;
    }
  }}
`;

// Container for dots animation
const DotsContainer = styled.div`
  display: flex;
  gap: ${spacing.xs};
`;

export interface LoadingSpinnerProps {
  variant?: 'spinner' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  centered?: boolean;
  'aria-label'?: string;
  id?: string;
  [key: string]: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'spinner',
  size = 'md',
  text,
  centered = false,
  'aria-label': ariaLabel = 'Loading...',
  id,
  ...rest
}) => {
  // const getSizeStyles = () => {
  //   switch (size) {
  //     case 'sm': return { fontSize: fontSize.sm, gap: spacing.xs };
  //     case 'md': return { fontSize: fontSize.md, gap: spacing.sm };
  //     case 'lg': return { fontSize: fontSize.lg, gap: spacing.md };
  //     case 'xl': return { fontSize: fontSize.xl, gap: spacing.lg };
  //     default: return { fontSize: fontSize.md, gap: spacing.sm };
  //   }
  // };

  // const sizeStyles = getSizeStyles();

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <DotsContainer>
            {[...Array(3)].map((_, i) => (
              <AnimatedElement key={i} variant="dot" delay={i * 0.2}>
                •
              </AnimatedElement>
            ))}
          </DotsContainer>
        );

      case 'pulse':
        return (
          <AnimatedElement variant="pulse">
            ●
          </AnimatedElement>
        );

      default:
        return (
          <AnimatedElement variant="spinner">
            ○
          </AnimatedElement>
        );
    }
  };

  const content = (
    <Stack
      direction="horizontal"
      spacing="sm"
      align="center"
      justify="center"
    >
      <Container>
        {renderSpinner()}
      </Container>

      {text && (
        <Container>
          <Text
            variant="body"
            size={size}
          >
            {text}
          </Text>
        </Container>
      )}
    </Stack>
  );

  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      {...rest}
    >
      <PositionedContainer
        display="flex"
        alignItems="center"
        justifyContent="center"
        position={centered ? 'absolute' : 'relative'}
        top={centered ? '50%' : undefined}
        left={centered ? '50%' : undefined}
      >
        {content}
      </PositionedContainer>
    </div>
  );
}; 