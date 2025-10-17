'use client';

import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { Overlay } from './Overlay';
import { Button } from './Button';
import { Text } from './text/Text';
import { Container } from '../../layout/containers/Container';
import { Stack } from '../../layout/framing/Stack';
import { Box } from '../../layout/content/Box';
import { colors, spacing, shadows, fontSize } from '../../system/tokens/tokens';

export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  position?: 'left' | 'right';
  width?: number | string; // e.g., 560 or '50vw'
  maxWidth?: string; // e.g., '50vw'
  bodyPadding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  headerVariant?: 'default' | 'minimal' | 'prominent';
  headerMargin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  stickyHeader?: boolean;
  actions?: React.ReactNode; // header right-side actions
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  zIndex?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  cmsData: any;
}

interface DrawerPanelProps {
  $position: 'left' | 'right';
  $width: string;
  $maxWidth?: string;
}

const DrawerPanel = styled(Box)<DrawerPanelProps>`
  height: 100vh;
  max-height: 100vh;
  width: ${({ $width }) => $width};
  max-width: ${({ $maxWidth }) => $maxWidth || '100vw'};
  overflow-y: auto;
  background: ${colors.background.primary};
  box-shadow: ${shadows.xl};
  border-left: ${({ $position }) => ($position === 'right' ? `1px solid ${colors.border.light}` : 'none')};
  border-right: ${({ $position }) => ($position === 'left' ? `1px solid ${colors.border.light}` : 'none')};

  @media (max-width: 768px) {
    width: 100vw;
    max-width: 100vw;
  }
`;

interface HeaderContainerProps {
  $sticky: boolean;
  $variant: 'default' | 'minimal' | 'prominent';
  $margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const HeaderContainer = styled(Container)<HeaderContainerProps>`
  background: ${colors.background.secondary};
  border-bottom: 1px solid ${colors.border.light};
  ${({ $sticky }) => $sticky && css`
    position: sticky;
    top: 0;
    z-index: 1;
  `}
  padding: ${({ $variant }) =>
    $variant === 'minimal' ? spacing.md : $variant === 'prominent' ? spacing.xl : spacing.lg};
  ${({ $margin }) => $margin === 'none' ? 'margin: 0;' : `
    display: flex;
    justify-content: center;
  `};
  width: 100%;
`;

const TitleText = styled(Text)`
  font-size: ${fontSize.lg};
`;

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(({ 
  isOpen,
  onClose,
  title,
  position = 'right',
  width = 560,
  maxWidth,
  bodyPadding = 'md',
  headerVariant = 'default',
  headerMargin = 'md',
  stickyHeader = true,
  actions,
  footer,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  zIndex,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  children,
  cmsData,
  ...rest
}, ref) => {
  const resolvedWidth = typeof width === 'number' ? `${Math.max(0, width)}px` : width;

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      variant="modal"
      position={position === 'left' ? 'left' : 'right'}
      closeOnBackdropClick={closeOnBackdropClick}
      closeOnEscape={closeOnEscape}
      zIndex={zIndex}
      aria-label={ariaLabel || (typeof title === 'string' ? title : 'Drawer panel')}
      aria-describedby={ariaDescribedBy}
    >
      <DrawerPanel
        ref={ref as any}
        as="section"
        role="region"
        aria-label={ariaLabel || (typeof title === 'string' ? title : 'Drawer content')}
        variant="elevated"
        padding="none"
        data-admin-control="true"
        $position={position}
        $width={resolvedWidth}
        $maxWidth={maxWidth}
        {...rest}
      >
        <Stack spacing="none">
          {(title || showCloseButton || actions) && (
            <HeaderContainer $sticky={stickyHeader} $variant={headerVariant} $margin={headerMargin}>
              <Stack direction="horizontal" align="center" justify="space-between">
                <Stack spacing="xs">
                  {title && (
                    <TitleText size="lg" weight="semibold" color="primary">
                      {title}
                    </TitleText>
                  )}
                </Stack>
                <Stack direction="horizontal" spacing="sm" align="center">
                  {actions}
                  {showCloseButton && (
                    <Button variant="ghost" size="sm" aria-label="Close drawer" onClick={onClose} cmsId="ignore" text={cmsData?.['close-drawer-button'] || 'Close'}/>
                  )}
                </Stack>
              </Stack>
            </HeaderContainer>
          )}

          <Container padding={bodyPadding}>
            {children}
          </Container>

          {footer && (
            <Container padding="lg" variant="elevated">
              {footer}
            </Container>
          )}
        </Stack>
      </DrawerPanel>
    </Overlay>
  );
});

Drawer.displayName = 'Drawer';

export default Drawer;


