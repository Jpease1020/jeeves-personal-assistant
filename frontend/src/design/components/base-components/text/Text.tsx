'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, fontSize, fontWeight, fontFamily, transitions } from '../../../system/tokens/tokens';
import { BaseComponentProps, TextVariant, TextSize, FontWeight, TextAlign, ColorVariant, SpacingScale } from '../../../system/shared-types';
import { useCMSData } from '../../../providers/CMSDataProvider';
import { useInteractionMode } from '../../../providers/InteractionModeProvider';

// Styled text component
const StyledText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'weight', 'align', 'color', 'isInteractive', 'cmsId'].includes(prop)
})<{
  variant: TextVariant;
  size: TextSize;
  weight: FontWeight;
  align: TextAlign;
  color: ColorVariant | 'inherit';
  isInteractive?: boolean;
}>`
  cursor: ${({ isInteractive }) => isInteractive ? 'pointer' : 'default'};
  margin: 0;
  font-family: ${fontFamily.sans};
  transition: ${transitions.default};

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'body':
        return `line-height: 1.6;`;
      case 'lead':
        return `line-height: 1.6; font-weight: ${fontWeight.medium};`;
      case 'small':
        return `line-height: 1.4;`;
      case 'muted':
        return `line-height: 1.5;`;
      case 'caption':
        return `line-height: 1.4; text-transform: none;`;
      case 'overline':
        return `line-height: 1.4; text-transform: uppercase; letter-spacing: 0.05em;`;
      default:
        return `line-height: 1.6;`;
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `font-size: ${fontSize.xs};`;
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      case 'xl':
        return `font-size: ${fontSize.xl};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}

  /* Weight styles */
  ${({ weight }) => {
    switch (weight) {
      case 'light':
        return `font-weight: ${fontWeight.light};`;
      case 'normal':
        return `font-weight: ${fontWeight.normal};`;
      case 'medium':
        return `font-weight: ${fontWeight.medium};`;
      case 'semibold':
        return `font-weight: ${fontWeight.semibold};`;
      case 'bold':
        return `font-weight: ${fontWeight.bold};`;
      default:
        return `font-weight: ${fontWeight.normal};`;
    }
  }}

  /* Align styles */
  ${({ align }) => {
    switch (align) {
      case 'left':
        return `text-align: left;`;
      case 'center':
        return `text-align: center;`;
      case 'right':
        return `text-align: right;`;
      case 'justify':
        return `text-align: justify;`;
      default:
        return `text-align: left;`;
    }
  }}

  /* Color styles */
  ${({ color }) => {
    switch (color) {
      case 'default':
        return `color: ${colors.text.primary};`;
      case 'primary':
        return `color: ${colors.primary[600]};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      case 'muted':
        return `color: ${colors.text.secondary};`;
      case 'success':
        return `color: ${colors.success[600]};`;
      case 'warning':
        return `color: ${colors.warning[600]};`;
      case 'error':
        return `color: ${colors.danger[600]};`;
      case 'info':
        return `color: ${colors.primary[600]};`;
      case 'inherit':
        return `color: inherit;`;
      default:
        return `color: ${colors.text.primary};`;
    }
  }}
`;

export interface TextProps extends BaseComponentProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: TextVariant;
  size?: TextSize;
  weight?: FontWeight;
  align?: TextAlign;
  color?: ColorVariant | 'inherit';
  
  // Layout
  marginTop?: SpacingScale;
  marginBottom?: SpacingScale;
  marginLeft?: SpacingScale;
  marginRight?: SpacingScale;
  
  // HTML attributes
  as?: 'p' | 'span' | 'div' | 'article' | 'blockquote' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  // Content editing
  contentEditable?: boolean;
  suppressContentEditableWarning?: boolean;
  cmsKey?: string;
  cmsId?: string; // Add cmsId property
  
  // Event handlers
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  
  // Styling
  style?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  size = 'md',
  weight = 'normal',
  align = 'left',
  color = 'default',
  as: Component = 'p',
  cmsId,
  ...rest
}) => {
  // Get CMS data from provider
  const { cmsData } = useCMSData();
  
  // Get mode from provider
  let mode: 'edit' | 'comment' | null = null;
  try {
    const context = useInteractionMode();
    mode = context.mode;
  } catch {
    // Provider not available, use null as default
    mode = null;
  }
  const ref = React.useRef<HTMLElement | null>(null);
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get cmsId from either cmsId prop or cmsId attribute
    const cmsIdentifier = cmsId || (e.currentTarget as HTMLElement).getAttribute('cmsId');
    
    if (mode === 'edit' && cmsIdentifier) {
      e.preventDefault();
      e.stopPropagation();
      
      // Dispatch custom event to open edit modal
      const event = new (window as any).CustomEvent('openInlineEditor', {
        detail: { cmsId: cmsIdentifier, element: e.currentTarget, x: e.clientX, y: e.clientY }
      });
      document.dispatchEvent(event);
    } else if (mode === 'comment' && cmsIdentifier) {
      e.preventDefault();
      e.stopPropagation();
      
      // Dispatch custom event to open comment modal
      const event = new (window as any).CustomEvent('openCommentModal', {
        detail: { cmsId: cmsIdentifier, element: e.currentTarget, x: e.clientX, y: e.clientY }
      });
      document.dispatchEvent(event);
    }
    
    rest.onClick?.(e);
  };
  
  // Don't add data-cms-id for decorative elements
  const shouldIgnoreCMS = cmsId === 'ignore';
  
  // If we have CMS data and cmsId, try to get the field value
  const displayContent = cmsData && cmsId && !shouldIgnoreCMS 
    ? ((cmsData as any)?.[cmsId] || children)
    : children;

  return (
    <StyledText
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      color={color}
      ref={ref as any}
      onClick={mode ? handleClick : rest.onClick}
      isInteractive={!!mode}
      {...(!shouldIgnoreCMS && cmsId ? { 'data-cms-id': cmsId } : {})}
      {...rest}
    >
      {displayContent}
    </StyledText>
  );
};

// Convenience wrapper for paragraphs
export const Paragraph: React.FC<TextProps> = (props) => (
  <Text as="p" {...props} />
); 