'use client';

import { forwardRef, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Search, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  [key: string]: any; // Allow additional properties
}

interface SearchableSelectProps {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  disabled?: boolean;
  getOptionLabel?: (option: SelectOption) => string;
  getOptionValue?: (option: SelectOption) => string;
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  onSearchChange?: (query: string) => void;
  filterOptions?: (options: SelectOption[], query: string) => SelectOption[];
}

export const SearchableSelect = forwardRef<HTMLInputElement, SearchableSelectProps>(
  (
    {
      label,
      error,
      className,
      id,
      value = '',
      onChange,
      options = [],
      placeholder = 'Select an option...',
      searchPlaceholder = 'Search...',
      emptyMessage = 'No options found',
      isLoading = false,
      disabled = false,
      getOptionLabel = (option) => option.label,
      getOptionValue = (option) => option.value,
      renderOption,
      onSearchChange,
      filterOptions,
    },
    ref
  ) => {
    const inputId = id || `searchable-select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

    // Get selected option
    const selectedOption = useMemo(() => {
      return options.find((opt) => getOptionValue(opt) === value);
    }, [options, value, getOptionValue]);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      if (filterOptions) {
        return filterOptions(options, searchQuery);
      }
      
      if (!searchQuery.trim()) return options;
      
      const query = searchQuery.toLowerCase();
      return options.filter((option) => {
        const label = getOptionLabel(option).toLowerCase();
        return label.includes(query);
      });
    }, [options, searchQuery, getOptionLabel, filterOptions]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
          setFocusedIndex(-1);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        // Focus search input when dropdown opens
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setFocusedIndex((prev) => {
              const next = prev < filteredOptions.length - 1 ? prev + 1 : prev;
              // Scroll into view
              optionsRef.current[next]?.scrollIntoView({ block: 'nearest' });
              return next;
            });
            break;
          case 'ArrowUp':
            e.preventDefault();
            setFocusedIndex((prev) => {
              const next = prev > 0 ? prev - 1 : 0;
              optionsRef.current[next]?.scrollIntoView({ block: 'nearest' });
              return next;
            });
            break;
          case 'Enter':
            e.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
              handleSelect(filteredOptions[focusedIndex]);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setIsOpen(false);
            setSearchQuery('');
            setFocusedIndex(-1);
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredOptions, focusedIndex]);

    const handleSelect = useCallback(
      (option: SelectOption) => {
        const optionValue = getOptionValue(option);
        onChange?.(optionValue);
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      },
      [onChange, getOptionValue]
    );

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setFocusedIndex(-1);
        onSearchChange?.(query);
      },
      [onSearchChange]
    );

    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery('');
        setFocusedIndex(-1);
      }
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
        <div className="relative" ref={dropdownRef}>
          {/* Select Button */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 bg-black-100 border rounded-lg',
              'text-white placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-gold-600 focus:border-transparent',
              'transition-all duration-200',
              'flex items-center justify-between',
              'hover:border-gold-600/50',
              error && 'border-red-500 focus:ring-red-500',
              !error && 'border-black-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label={label || 'Select option'}
          >
            <span className={cn(
              'truncate',
              !selectedOption && 'text-gray-500'
            )}>
              {selectedOption ? getOptionLabel(selectedOption) : placeholder}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 mt-2 w-full bg-black-100 border border-gold-600/30 rounded-lg shadow-xl max-h-96 overflow-hidden"
                role="listbox"
              >
                {/* Search Input */}
                <div className="p-3 border-b border-gold-600/20">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder={searchPlaceholder}
                      className="w-full pl-10 pr-4 py-2 bg-black-50 border border-gold-600/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Options List */}
                <div className="overflow-y-auto max-h-80">
                  {isLoading ? (
                    <div className="px-4 py-8 text-center text-gray-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => {
                      const optionValue = getOptionValue(option);
                      const isSelected = optionValue === value;
                      const isFocused = index === focusedIndex;

                      return (
                        <button
                          key={optionValue}
                          ref={(el) => {
                            optionsRef.current[index] = el;
                          }}
                          type="button"
                          onClick={() => handleSelect(option)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-left',
                            'hover:bg-gold-600/10 transition-colors',
                            'focus:outline-none focus:bg-gold-600/10',
                            isSelected && 'bg-gold-600/20',
                            isFocused && 'bg-gold-600/10'
                          )}
                          role="option"
                          aria-selected={isSelected}
                        >
                          {renderOption ? (
                            renderOption(option, isSelected)
                          ) : (
                            <>
                              <span className="flex-1 text-white font-medium">
                                {getOptionLabel(option)}
                              </span>
                              {isSelected && (
                                <Check className="w-4 h-4 text-gold-600 flex-shrink-0" />
                              )}
                            </>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-400">
                      {emptyMessage}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

SearchableSelect.displayName = 'SearchableSelect';

