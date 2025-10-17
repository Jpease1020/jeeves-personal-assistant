'use client';

import React from 'react';
import { Button } from './Button';
import { Stack } from '../../layout/framing/Stack';

export interface ActionButton {
  id: string;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface ActionButtonGroupProps {
  buttons: ActionButton[];
  direction?: 'horizontal' | 'vertical';
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  align?: 'flex-start' | 'center' | 'flex-end';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  wrap?: 'wrap' | 'nowrap';
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  buttons,
  direction = 'horizontal',
  spacing = 'sm',
  align = 'center',
  justify = 'flex-start',
  wrap = 'wrap'
}) => {
  return (
    <Stack
      direction={direction}
      spacing={spacing}
      align={align}
      justify={justify}
      wrap={wrap}
    >
      {buttons.map((button) => (
        <Button
          key={button.id}
          variant={button.variant || 'outline'}
          size={button.size || 'md'}
          onClick={button.onClick}
          disabled={button.disabled}
          href={button.href}
          icon={button.icon}
          cmsId="ignore"
        >
          {button.label}
        </Button>
      ))}
    </Stack>
  );
}; 