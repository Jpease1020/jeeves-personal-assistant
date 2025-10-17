'use client';

import React, { forwardRef } from 'react';
import { fontSize } from '../../system/tokens/tokens';
import { Button } from './Button';
import { H2 } from './text/Headings'; 
import { Overlay } from './Overlay';
import { Container } from '../../layout/containers/Container';
import { Stack } from '../../layout/framing/Stack';
import { Box } from '../../layout/content/Box';

export interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'centered' | 'fullscreen';
  onClose: () => void;
  headerVariant?: 'default' | 'minimal' | 'prominent';
  titleSize?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  bodyPadding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  footerVariant?: 'default' | 'centered' | 'split';
  'aria-label'?: string;
  'aria-describedby'?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  [key: string]: any;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(({
  children,
  isOpen,
  title,
  size = 'md',
  variant = 'default',
  onClose,
  headerVariant = 'default',
  titleSize = 'md',
  showCloseButton = true,
  bodyPadding = 'lg',
  footer,
  footerVariant = 'default',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ...rest
}, ref) => {
  // Map title size to font size
  const titleSizeMap: Record<'sm' | 'md' | 'lg', string> = {
    sm: fontSize.md,
    md: fontSize.lg,
    lg: fontSize.xl
  };

  return (
    <Overlay
      ref={ref}
      isOpen={isOpen}
      onClose={onClose}
      variant="modal"
      position="center"
      closeOnBackdropClick={closeOnBackdropClick}
      closeOnEscape={closeOnEscape}
      aria-label={ariaLabel || title}
      aria-describedby={ariaDescribedBy}
      {...rest}
    >
      <Box
        variant="elevated"
        padding="none"
      >
        <Stack direction="vertical" spacing="none">
          {/* Header */}
          <Container
            variant={headerVariant === 'prominent' ? 'elevated' : 'default'}
            padding={headerVariant === 'minimal' ? 'md' : headerVariant === 'prominent' ? 'xl' : 'lg'}
          >
            <Stack direction="horizontal" justify="space-between" align="center">
              <H2 size={titleSize}>
                {title}
              </H2>
              {showCloseButton && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  aria-label="Close modal"
                >
                  ×
                </Button>
              )}
            </Stack>
          </Container>
          
          {/* Body */}
          <Container
            padding={bodyPadding}
          >
            {children}
          </Container>
          
          {/* Footer */}
          {footer && (
            <Container
              variant="elevated"
              padding="lg"
            >
              <Stack
                direction="horizontal"
                justify={footerVariant === 'centered' ? 'center' : footerVariant === 'split' ? 'space-between' : 'flex-end'}
                align="center"
                spacing="sm"
              >
                {footer}
              </Stack>
            </Container>
          )}
        </Stack>
      </Box>
    </Overlay>
  );
});

Modal.displayName = 'Modal'; 