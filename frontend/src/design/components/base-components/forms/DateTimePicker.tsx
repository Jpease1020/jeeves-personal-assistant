// Simple DateTimePicker placeholder
import React from 'react';

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date"
}) => {
  return (
    <input
      type="datetime-local"
      value={value?.toISOString().slice(0, 16) || ''}
      onChange={(e) => onChange?.(new Date(e.target.value))}
      placeholder={placeholder}
      style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
    />
  );
};