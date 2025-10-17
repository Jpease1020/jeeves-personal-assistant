'use client';

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Input } from './Input';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

// Styled components
const AutocompleteContainer = styled.div<{ $fullWidth: boolean }>`
  position: relative;
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
`;

const PredictionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
`;

const PredictionItem = styled.div<{ $isLast: boolean }>`
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: ${({ $isLast }) => $isLast ? 'none' : '1px solid var(--border-light)'};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--background-secondary);
  }
`;

const PredictionMainText = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const PredictionSecondaryText = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
`;

const LoadingIndicator = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 0.75rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  z-index: 1000;
`;

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  'data-testid'?: string;
  [key: string]: unknown;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  size = 'md',
  fullWidth = false,
  name,
  id,
  required = false,
  'data-testid': dataTestId,
  ...rest
}) => {
  const places = useMapsLibrary('places');
  const mapsLoaded = !!places;
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const predictionsRef = useRef<HTMLDivElement>(null);

  // Fetch predictions from Google Places API
  const fetchPredictions = async (input: string) => {
    if (!input.trim() || input.length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/places-autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
        setShowPredictions(data.predictions?.length > 0);
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (_error) {
      // Silently handle errors to avoid console pollution
      setPredictions([]);
      setShowPredictions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPredictions(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Handle prediction selection
  const handlePredictionSelect = (prediction: Prediction) => {
    onChange(prediction.description);
    setShowPredictions(false);
    setPredictions([]);
    inputRef.current?.focus();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowPredictions(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (predictions.length > 0) {
      setShowPredictions(true);
    }
  };

  // Handle click outside to close predictions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        predictionsRef.current &&
        !predictionsRef.current.contains(event.target as Element) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Element)
      ) {
        setShowPredictions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowPredictions(false);
    }
  };

  if (!mapsLoaded) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        size={size}
        fullWidth={fullWidth}
        name={name}
        id={id}
        required={required}
        data-testid={dataTestId}
        {...rest}
      />
    );
  }

  return (
    <AutocompleteContainer $fullWidth={fullWidth}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        size={size}
        fullWidth={fullWidth}
        name={name}
        id={id}
        required={required}
        data-testid={dataTestId}
        {...rest}
      />
      
      {showPredictions && predictions.length > 0 && (
        <PredictionsDropdown ref={predictionsRef}>
          {predictions.map((prediction, index) => (
            <PredictionItem
              key={prediction.place_id}
              $isLast={index === predictions.length - 1}
              onClick={() => handlePredictionSelect(prediction)}
            >
              <PredictionMainText>
                {prediction.structured_formatting.main_text}
              </PredictionMainText>
              <PredictionSecondaryText>
                {prediction.structured_formatting.secondary_text}
              </PredictionSecondaryText>
            </PredictionItem>
          ))}
        </PredictionsDropdown>
      )}
      
      {isLoading && (
        <LoadingIndicator>
          Loading...
        </LoadingIndicator>
      )}
    </AutocompleteContainer>
  );
};
