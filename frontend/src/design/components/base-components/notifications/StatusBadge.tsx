import * as React from 'react';
import { Badge } from '../Badge';
import { Text } from '../text/Text';

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in-progress' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'subtle';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  // variant = 'default'
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
      case 'warning':
        return 'warning';
      case 'confirmed':
      case 'in-progress':
        return 'info';
      case 'completed':
      case 'success':
        return 'success';
      case 'cancelled':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge
      variant={getStatusVariant(status)}
      size={size}
    >
      <Text size={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}>
        {getStatusText(status)}
      </Text>
    </Badge>
  );
};

StatusBadge.displayName = 'StatusBadge';

export { StatusBadge }; 