'use client';

import { forwardRef, type ComponentProps } from 'react';
import PhoneInputWithCountry, { type Value as PhoneValue } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils/cn';

type PhoneInputProps = ComponentProps<typeof PhoneInputWithCountry>;

interface CustomPhoneInputProps extends Omit<PhoneInputProps, 'className'> {
  label?: string;
  error?: string;
  className?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, CustomPhoneInputProps>(
  ({ label, error, className, id, value, onChange, ...props }, ref) => {
    const inputId = id || `phone-input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gold-600 mb-2"
          >
            {label}
          </label>
        )}
        <div className={cn(
          'relative flex items-stretch',
          'bg-black-100 border rounded-lg',
          'focus-within:ring-2 focus-within:ring-gold-600 focus-within:border-transparent',
          'transition-all duration-200',
          error && 'border-red-500 focus-within:ring-red-500',
          !error && 'border-black-300'
        )}>
          <PhoneInputWithCountry
            {...props}
            id={inputId}
            value={value as PhoneValue}
            onChange={onChange}
            flags={flags}
            flagUrl="https://purecatamphetamine.github.io/country-flag-icons/3x2/{XX}.svg"
            className="phone-input-wrapper"
            numberInputProps={{
              className: cn(
                'flex-1 px-4 py-3 bg-transparent',
                'text-white placeholder:text-gray-500',
                'border-none outline-none',
                '[&::placeholder]:text-gray-500'
              ),
              ref: ref,
            }}
            countrySelectProps={{
              className: cn(
                'bg-transparent border-none outline-none',
                'px-2 py-3',
                'text-white'
              ),
            }}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        <style jsx global>{`
          .phone-input-wrapper {
            display: flex;
            align-items: stretch;
            width: 100%;
          }
          
          .phone-input-wrapper .PhoneInputInput {
            flex: 1;
            background: transparent !important;
            border: none !important;
            outline: none !important;
            color: white !important;
            padding: 0.75rem 1rem !important;
          }
          
          .phone-input-wrapper .PhoneInputInput::placeholder {
            color: rgb(107 114 128) !important;
          }
          
          .phone-input-wrapper .PhoneInputCountry {
            display: flex;
            align-items: center;
            padding: 0 8px;
            border-right: 1px solid rgba(212, 175, 55, 0.3);
            position: relative;
          }
          
          .phone-input-wrapper .PhoneInputCountryIcon {
            width: 20px;
            height: 15px;
            border-radius: 2px;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
            display: block !important;
          }
          
          .phone-input-wrapper .PhoneInputCountryIcon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .phone-input-wrapper .PhoneInputCountryIcon--border {
            border: none;
          }
          
          /* Dropdown styles */
          .phone-input-wrapper .PhoneInputCountrySelect {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 60px;
            opacity: 0;
            cursor: pointer;
            z-index: 1;
          }
          
          /* Ensure flags are visible in dropdown */
          .PhoneInputCountryOption {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }
          
          .PhoneInputCountryOption .PhoneInputCountryIcon {
            display: inline-block !important;
            flex-shrink: 0 !important;
            width: 20px !important;
            height: 15px !important;
          }
          
          /* Dropdown menu container */
          .PhoneInputCountrySelectDropdown {
            background: rgb(17, 24, 39) !important;
            border: 1px solid rgba(212, 175, 55, 0.3) !important;
            border-radius: 0.5rem !important;
            max-height: 300px !important;
            overflow-y: auto !important;
          }
          
          .PhoneInputCountrySelectDropdown .PhoneInputCountryOption {
            padding: 8px 12px !important;
            color: white !important;
            cursor: pointer !important;
          }
          
          .PhoneInputCountrySelectDropdown .PhoneInputCountryOption:hover {
            background: rgba(212, 175, 55, 0.1) !important;
          }
          
          .phone-input-wrapper .PhoneInputCountrySelectArrow {
            display: none;
          }
        `}</style>
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
