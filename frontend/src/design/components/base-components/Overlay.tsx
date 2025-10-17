'use client';

import React, { useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { colors, spacing, shadows, zIndex } from '../../system/tokens/tokens';
// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;   
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Combined styled component with all overlay variants
const StyledOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen', 'position', 'backdrop', 'overlayZIndex', 'variant', 'closeOnBackdropClick'].includes(prop)
}) <{
  isOpen: boolean;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backdrop: boolean;
  overlayZIndex: number;
  variant: 'modal' | 'dropdown' | 'tooltip';
  closeOnBackdropClick: boolean;
}>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: ${({ position }) => {
    switch (position) {
      case 'top': return 'flex-start';
      case 'bottom': return 'flex-end';
      case 'center': return 'center';
      default: return 'center';
    }
  }};
  justify-content: ${({ position }) => {
    switch (position) {
      case 'left': return 'flex-start';
      case 'right': return 'flex-end';
      case 'center': return 'center';
      default: return 'center';
    }
  }};
  z-index: ${({ overlayZIndex }) => overlayZIndex};
  padding: ${spacing.xl};
  backdrop-filter: ${({ backdrop }) => (backdrop ? 'blur(4px)' : 'none')};
  animation: ${({ isOpen }) => (isOpen ? css`${fadeIn} 0.2s ease-out` : 'none')};

  /* Backdrop styles */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${colors.background.overlay};
    cursor: ${({ closeOnBackdropClick }) => (closeOnBackdropClick ? 'pointer' : 'default')};
    transition: background-color 0.2s ease-out;
  }

  /* Content styles */
  & > * {
    position: relative;
    background-color: ${colors.background.primary};
    border-radius: ${({ variant }) => (variant === 'modal' ? '8px' : '4px')};
    box-shadow: ${shadows.xl};
    max-height: ${({ variant }) => (variant === 'modal' ? `calc(100vh - ${spacing.xl} * 2)` : 'auto')};
    overflow: hidden;
    animation: ${css`${slideIn} 0.2s ease-out`};
    outline: none;
  }
`;

export interface OverlayProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  variant?: 'modal' | 'dropdown' | 'tooltip';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backdrop?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  zIndex?: number;
  [key: string]: any;
}

export const Overlay: React.FC<OverlayProps> = ({
  children,
  isOpen,
  onClose,
  variant = 'modal',
  position = 'center',
  backdrop = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  zIndex: customZIndex,
  ...rest
}) => {
  const overlayZIndex = customZIndex || zIndex.modal;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick && onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <StyledOverlay
      isOpen={isOpen}
      position={position}
      backdrop={backdrop}
      overlayZIndex={Number(overlayZIndex)}
      variant={variant}
      closeOnBackdropClick={closeOnBackdropClick}
      role={variant === 'modal' ? 'dialog' : 'presentation'}
      aria-modal={variant === 'modal'}
      onClick={handleBackdropClick}
      {...rest}
    >
      {children}
    </StyledOverlay>
  );
}; 