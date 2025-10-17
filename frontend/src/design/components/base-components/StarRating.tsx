'use client';

import React from 'react';
import styled from 'styled-components';
import { Star } from 'lucide-react';
import { colors, fontSize, transitions } from '../../system/tokens/tokens';

// Styled star button with proper prop filtering
const StyledStarButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['size', 'filled', 'interactive'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  filled: boolean;
  interactive: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  outline: none;
  transition: ${transitions.default};
  cursor: ${({ interactive }) => (interactive ? 'pointer' : 'default')};
  color: ${({ filled }) => (filled ? colors.warning[400] : colors.gray[300])};
  
  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          width: 1rem;
          height: 1rem;
        `;
      case 'md':
        return `
          width: 1.5rem;
          height: 1.5rem;
        `;
      case 'lg':
        return `
          width: 2.5rem;
          height: 2.5rem;
        `;
      default:
        return `
          width: 1.25rem;
          height: 1.25rem;
        `;
    }
  }}

  /* Interactive states */
  ${({ interactive }) => interactive && `
    &:hover {
      transform: scale(1.1);
      color: ${colors.warning[500]};
    }
    
    &:focus {
      outline: 2px solid ${colors.primary[600]};
      outline-offset: 2px;
    }
    
    &:active {
      transform: scale(1.05);
    }
  `}

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Styled container for star rating
const StarRatingContainer = styled.div`
  display: inline-flex;
  align-items: center;
`;

// Styled rating value text
const RatingValue = styled.span<{ size: 'sm' | 'md' | 'lg' }>`
  color: ${colors.text.secondary};
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return fontSize.sm;
      case 'md': return fontSize.md;
      case 'lg': return fontSize.lg;
      default: return fontSize.md;
    }
  }};
`;

export interface StarRatingProps {
  // Core props
  rating: number;
  maxRating?: number;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'large';
  
  // Interactive
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  
  // Display
  showValue?: boolean;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Accessibility
  'aria-label'?: string;
  
  // Rest props
  [key: string]: any;
}

export const StarRating: React.FC<StarRatingProps> = ({
  // Core props
  rating,
  maxRating = 5,
  
  // Appearance
  size = 'md',
  variant = 'default',
  
  // Interactive
  interactive = false,
  onRatingChange,
  
  // Display
  showValue = false,
  spacing = 'sm',
  
  // Accessibility
  'aria-label': ariaLabel,
  
  // Rest props
  ...rest
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  const isInteractive = Boolean(onRatingChange);

  const handleStarClick = (starValue: number) => {
    if (onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (isInteractive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverRating(0);
    }
  };

  const currentRating = hoverRating || rating;

  return (
    <StarRatingContainer
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel || `Rating: ${rating} out of ${maxRating} stars`}
      role="group"
      {...rest}
    >
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= currentRating;
        
        return (
          <StyledStarButton
            key={starValue}
            size={size}
            filled={isFilled}
            interactive={isInteractive}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            disabled={!isInteractive}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            aria-pressed={isFilled}
            type="button"
          >
            <Star
              size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
              fill="currentColor"
            />
          </StyledStarButton>
        );
      })}
      {showValue && (
        <RatingValue size={size}>
          {rating}/{maxRating}
        </RatingValue>
      )}
    </StarRatingContainer>
  );
};

StarRating.displayName = 'StarRating';

 