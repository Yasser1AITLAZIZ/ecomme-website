'use client';

import { forwardRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

interface SimplePhoneInputProps {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const SimplePhoneInput = forwardRef<HTMLInputElement, SimplePhoneInputProps>(
  ({ label, error, className, id, value = '', onChange, placeholder }, ref) => {
    const inputId = id || `phone-input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const COUNTRY_CODE = '+212';
    
    // Extract phone number from value (remove +212 if present)
    const extractPhoneNumber = useCallback((val: string): string => {
      if (!val || val.trim() === '') return '';
      // Remove +212 prefix if present
      if (val.startsWith(COUNTRY_CODE)) {
        return val.slice(COUNTRY_CODE.length).trim();
      }
      // If it starts with 212, remove it
      if (val.startsWith('212')) {
        return val.slice(3).trim();
      }
      return val.trim();
    }, []);

    const [phoneNumber, setPhoneNumber] = useState(() => extractPhoneNumber(value));

    // Update phone number when value prop changes externally
    useEffect(() => {
      const extracted = extractPhoneNumber(value);
      setPhoneNumber(extracted);
    }, [value, extractPhoneNumber]);

    const handlePhoneNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow digits
      let inputValue = e.target.value.replace(/\D/g, '');
      
      // Limit to 10 digits (Moroccan phone numbers)
      if (inputValue.length > 10) {
        inputValue = inputValue.slice(0, 10);
      }
      
      setPhoneNumber(inputValue);
      
      // Always combine with country code for onChange
      if (inputValue) {
        onChange?.(COUNTRY_CODE + inputValue);
      } else {
        onChange?.('');
      }
    }, [onChange]);

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gold-600 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <div
            className={cn(
              'flex items-stretch bg-black-100 border rounded-lg',
              'focus-within:ring-2 focus-within:ring-gold-600 focus-within:border-transparent',
              'transition-all duration-200',
              error && 'border-red-500 focus-within:ring-red-500',
              !error && 'border-black-300'
            )}
          >
            {/* Fixed Country Code Prefix */}
            <div className="flex items-center px-3 py-3 border-r border-gold-600/30">
              <span className="text-gray-400 text-sm font-medium">
                {COUNTRY_CODE}
              </span>
            </div>

            {/* Phone Number Input */}
            <input
              ref={ref}
              id={inputId}
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder={placeholder || '6XX XXX XXX'}
              className={cn(
                'flex-1 px-4 py-3 bg-transparent',
                'text-white placeholder:text-gray-500',
                'border-none outline-none',
                '[&::placeholder]:text-gray-500'
              )}
            />
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

SimplePhoneInput.displayName = 'SimplePhoneInput';

