'use client';

import { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { countries, type Country, getCountryByCode, getCountryByDialCode } from '@/lib/data/countries';
import { parsePhoneNumber, type CountryCode } from 'libphonenumber-js';
import { useI18n } from '@/lib/i18n/context';

interface PhoneInputProps {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  defaultCountry?: string; // ISO country code like 'MA', 'US', etc.
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, className, id, value = '', onChange, placeholder, defaultCountry = 'MA' }, ref) => {
    const { t, language } = useI18n();
    const inputId = id || `phone-input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Get translated country name
    const getCountryName = useCallback((countryCode: string): string => {
      const translatedName = t.countries?.[countryCode as keyof typeof t.countries];
      if (translatedName && typeof translatedName === 'string') {
        return translatedName;
      }
      // Fallback to English name from countries data
      const country = getCountryByCode(countryCode);
      return country?.name || countryCode;
    }, [t]);
    // Initialize country and phone number from value
    const initializeFromValue = useCallback((val: string | undefined) => {
      if (!val || val.trim() === '') {
        return {
          country: getCountryByCode(defaultCountry) || countries[0],
          phone: '',
        };
      }

      try {
        const parsed = parsePhoneNumber(val);
        const country = getCountryByCode(parsed.country || '');
        if (country) {
          return {
            country,
            phone: parsed.nationalNumber,
          };
        }
      } catch {
        // If parsing fails, try to extract country code manually
        const dialCodeMatch = val.match(/^\+(\d{1,4})/);
        if (dialCodeMatch) {
          const dialCode = '+' + dialCodeMatch[1];
          const country = getCountryByDialCode(dialCode);
          if (country) {
            const phone = val.replace(dialCode, '').trim();
            return { country, phone };
          }
        }
      }

      // Fallback to default
      return {
        country: getCountryByCode(defaultCountry) || countries[0],
        phone: val.replace(/^\+?\d{1,4}\s?/, ''),
      };
    }, [defaultCountry]);

    const [selectedCountry, setSelectedCountry] = useState<Country>(() => 
      initializeFromValue(value).country
    );
    const [phoneNumber, setPhoneNumber] = useState(() => 
      initializeFromValue(value).phone
    );

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
          setSearchQuery('');
        }
      };

      if (isDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        // Focus search input when dropdown opens
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isDropdownOpen]);

    // Update phone number when value prop changes externally
    useEffect(() => {
      const { country, phone } = initializeFromValue(value);
      setSelectedCountry(country);
      setPhoneNumber(phone);
    }, [value, initializeFromValue]);

    const handleCountrySelect = useCallback((country: Country) => {
      setSelectedCountry(country);
      setIsDropdownOpen(false);
      setSearchQuery('');
      
      // Always update the value when country changes
      // If phone number exists, combine them; otherwise just set empty
      if (phoneNumber) {
        const fullNumber = country.dialCode + phoneNumber;
        onChange?.(fullNumber);
      } else {
        // Even if no phone number, we should update to reflect country change
        // This helps with form state management
        onChange?.('');
      }
    }, [phoneNumber, onChange]);

    const handlePhoneNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value.replace(/\D/g, ''); // Only digits
      
      // Check if the input starts with a country code (user might have pasted full number)
      if (inputValue.length > 4) {
        // Try to detect if it starts with a known country code
        for (const country of countries) {
          const dialCodeDigits = country.dialCode.replace('+', '');
          if (inputValue.startsWith(dialCodeDigits)) {
            // Extract country and phone number
            const phone = inputValue.slice(dialCodeDigits.length);
            setSelectedCountry(country);
            setPhoneNumber(phone);
            if (phone) {
              onChange?.(country.dialCode + phone);
            } else {
              onChange?.('');
            }
            return;
          }
        }
      }
      
      setPhoneNumber(inputValue);
      
      // Combine country code and phone number, only call onChange if there's a value
      if (inputValue) {
        const fullNumber = selectedCountry.dialCode + inputValue;
        onChange?.(fullNumber);
      } else {
        // If phone number is empty, still call onChange with empty string
        onChange?.('');
      }
    }, [selectedCountry, onChange]);

    // Filter countries based on search query (search in translated names too)
    const filteredCountries = useMemo(() => {
      if (!searchQuery) return countries;
      
      const query = searchQuery.toLowerCase();
      return countries.filter((country) => {
        const translatedName = getCountryName(country.code).toLowerCase();
        const englishName = country.name.toLowerCase();
        return (
          translatedName.includes(query) ||
          englishName.includes(query) ||
          country.dialCode.includes(searchQuery) ||
          country.code.toLowerCase().includes(query)
        );
      });
    }, [searchQuery, getCountryName]);

    // Get flag URL
    const getFlagUrl = (countryCode: string) => {
      return `https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`;
    };

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
            {/* Country Selector Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                'flex items-center gap-2 px-3 py-3 border-r border-gold-600/30',
                'hover:bg-black-50 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-gold-600 focus:ring-inset'
              )}
              aria-label="Select country"
            >
              <img
                src={getFlagUrl(selectedCountry.code)}
                alt={getCountryName(selectedCountry.code)}
                className="w-5 h-4 object-cover rounded-sm"
                onError={(e) => {
                  // Fallback if flag fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-white text-sm font-medium">
                {selectedCountry.dialCode}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform',
                  isDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Phone Number Input */}
            <input
              ref={ref}
              id={inputId}
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder={placeholder || 'Enter phone number'}
              className={cn(
                'flex-1 px-4 py-3 bg-transparent',
                'text-white placeholder:text-gray-500',
                'border-none outline-none',
                '[&::placeholder]:text-gray-500'
              )}
            />
          </div>

          {/* Country Dropdown */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-2 w-80 bg-black-100 border border-gold-600/30 rounded-lg shadow-xl max-h-96 overflow-hidden"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-gold-600/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'ar' ? 'ابحث عن دولة...' : language === 'fr' ? 'Rechercher un pays...' : 'Search country...'}
                    className="w-full pl-10 pr-4 py-2 bg-black-50 border border-gold-600/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-600"
                  />
                </div>
              </div>

              {/* Countries List */}
              <div className="overflow-y-auto max-h-80">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left',
                        'hover:bg-gold-600/10 transition-colors',
                        'focus:outline-none focus:bg-gold-600/10',
                        selectedCountry.code === country.code && 'bg-gold-600/20'
                      )}
                    >
                      <img
                        src={getFlagUrl(country.code)}
                        alt={getCountryName(country.code)}
                        className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="flex-1 text-white font-medium">
                        {getCountryName(country.code)}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {country.dialCode}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400">
                    {language === 'ar' ? 'لم يتم العثور على دول' : language === 'fr' ? 'Aucun pays trouvé' : 'No countries found'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
