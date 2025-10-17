'use client';

import React from 'react';
import { Container } from '../../layout/containers/Container';
import { Stack } from '../../layout/framing/Stack';
import { Text } from './text/Text';

interface StatCardProps {
  children?: React.ReactNode;
  title: string;
  icon: string;
  statNumber: string;
  statChange: string;
  changeType: 'positive' | 'negative' | 'neutral';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * StatCard - A component for displaying statistics with title, icon, and change information
 * 
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Reviews"
 *   icon="📝"
 *   statNumber="150"
 *   statChange="+12% from last month"
 *   changeType="positive"
 * />
 * ```
 */
export const StatCard: React.FC<StatCardProps> = ({
  children,
  title,
  icon,
  statNumber,
  statChange,
  changeType,
  variant = 'elevated',
  padding = 'lg'
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      default:
        return 'muted';
    }
  };

  return (
    <Container
      variant={variant === 'elevated' ? 'elevated' : variant === 'outlined' ? 'card' : 'default'}
      padding={padding}
    >
      <Stack direction="vertical" spacing="sm">
        <Stack direction="horizontal" justify="space-between" align="center">
          <Text size="lg">{icon}</Text>
          <Text variant="muted" size="sm">{title}</Text>
        </Stack>

        <Stack direction="vertical" spacing="xs">
          <Text variant="lead" size="xl" weight="bold">
            {statNumber}
          </Text>
          <Text variant="body" size="sm" color={getChangeColor()}>
            {statChange}
          </Text>
        </Stack>

        {children}
      </Stack>
    </Container>
  );
}; 