'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Container } from '../../../layout/containers/Container';
import { Span } from '../text/Span';
import { Text } from '../text/Text';
import { Button } from '../Button';
import { Stack } from '../../../layout/framing/Stack';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message, duration };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <Container variant="elevated" padding="md">
      <Stack direction="vertical" spacing="sm">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </Stack>
    </Container>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '';
    }
  };

  return (
    <Container variant="default" padding="sm">
      <Stack direction="horizontal" spacing="sm" align="center" justify="space-between">
        <Stack direction="horizontal" spacing="sm" align="center">
          <Span cmsId="toast-icon">{getIcon()}</Span>
          <Text size="sm">
            {toast.message}
          </Text>
        </Stack>
        
        <Button 
          onClick={() => onRemove(toast.id)}
          variant="ghost"
          size="sm"
        >
          <Span cmsId="ignore">×</Span>
        </Button>
      </Stack>
    </Container>
  );
};