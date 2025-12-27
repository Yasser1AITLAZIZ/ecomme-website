'use client';

import { forwardRef, useState, useEffect, useMemo, useCallback } from 'react';
import { SearchableSelect, SelectOption } from './SearchableSelect';
import { Input } from './Input';
import { useI18n } from '@/lib/i18n/context';
import {
  getAllCountries,
  getStatesByCountry,
  getCitiesByState,
  getCitiesByStateWithName,
  getCitiesByCountry,
  filterCountries,
  filterStates,
  filterCities,
  type Country,
} from '@/lib/data/locations';
import { IState, ICity } from 'country-state-city';
import { cn } from '@/lib/utils/cn';

// Country Select Component
interface CountrySelectProps {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: string;
  disabled?: boolean;
}

export const CountrySelect = forwardRef<HTMLInputElement, CountrySelectProps>(
  ({ label, error, className, id, value = '', onChange, defaultCountry = 'MA', disabled = false }, ref) => {
    const { t, language } = useI18n();
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const loadCountries = async () => {
        setIsLoading(true);
        try {
          const allCountries = getAllCountries();
          setCountries(allCountries);
        } catch (error) {
          console.error('Error loading countries:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadCountries();
    }, []);

    const getCountryName = useCallback(
      (countryCode: string): string => {
        const translatedName = t.countries?.[countryCode as keyof typeof t.countries];
        if (translatedName && typeof translatedName === 'string') {
          return translatedName;
        }
        const country = countries.find((c) => c.code === countryCode);
        return country?.name || countryCode;
      },
      [t, countries]
    );

    const options: SelectOption[] = useMemo(() => {
      return countries.map((country) => ({
        value: country.code,
        label: getCountryName(country.code),
        country,
      }));
    }, [countries, getCountryName]);

    const getFlagUrl = (countryCode: string) => {
      return `https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`;
    };

    const renderOption = (option: SelectOption, isSelected: boolean) => {
      const country = option.country as Country;
      return (
        <div className="flex items-center gap-3 w-full">
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
        </div>
      );
    };

    const filterOptions = useCallback(
      (options: SelectOption[], query: string) => {
        const filtered = filterCountries(
          countries,
          query
        ).map((country) => ({
          value: country.code,
          label: getCountryName(country.code),
          country,
        }));
        return filtered;
      },
      [countries, getCountryName]
    );

    const searchPlaceholder = t.checkout.searchCountry || 'Search country...';
    const emptyMessage = t.checkout.noCountriesFound || 'No countries found';

    return (
      <SearchableSelect
        ref={ref}
        label={label}
        error={error}
        className={className}
        id={id}
        value={value || defaultCountry}
        onChange={onChange}
        options={options}
        placeholder={searchPlaceholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        disabled={disabled}
        renderOption={renderOption}
        filterOptions={filterOptions}
      />
    );
  }
);

CountrySelect.displayName = 'CountrySelect';

// Province/State Select Component
interface ProvinceSelectProps {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  countryCode?: string;
  disabled?: boolean;
}

export const ProvinceSelect = forwardRef<HTMLInputElement, ProvinceSelectProps>(
  ({ label, error, className, id, value = '', onChange, countryCode, disabled }, ref) => {
    const { t } = useI18n();
    const [states, setStates] = useState<IState[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const loadStates = async () => {
        if (!countryCode) {
          setStates([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        try {
          const loadedStates = await getStatesByCountry(countryCode);
          setStates(loadedStates);
        } catch (error) {
          console.error('Error loading states:', error);
          setStates([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadStates();
    }, [countryCode]);

    const options: SelectOption[] = useMemo(() => {
      return states.map((state) => ({
        value: state.isoCode,
        label: state.name,
        state,
      }));
    }, [states]);

    const filterOptions = useCallback(
      (options: SelectOption[], query: string) => {
        const filtered = filterStates(states, query).map((state) => ({
          value: state.isoCode,
          label: state.name,
          state,
        }));
        return filtered;
      },
      [states]
    );

    const searchPlaceholder = t.checkout.searchProvince || 'Search province...';
    const emptyMessage = t.checkout.noProvincesFound || 'No provinces found';
    const placeholder = !countryCode
      ? t.checkout.selectCountryFirst || 'Select a country first'
      : searchPlaceholder;

    return (
      <SearchableSelect
        ref={ref}
        label={label}
        error={error}
        className={className}
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        disabled={disabled || !countryCode}
        filterOptions={filterOptions}
      />
    );
  }
);

ProvinceSelect.displayName = 'ProvinceSelect';

// City Select Component
interface CitySelectProps {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  countryCode?: string;
  stateCode?: string;
  stateName?: string; // Optional: province name for better custom city lookup
  disabled?: boolean;
  allowFreeText?: boolean; // Enable free text input when no cities available
}

export const CitySelect = forwardRef<HTMLInputElement, CitySelectProps>(
  (
    { label, error, className, id, value = '', onChange, countryCode, stateCode, stateName, disabled, allowFreeText = true },
    ref
  ) => {
    const { t } = useI18n();
    const [cities, setCities] = useState<ICity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [states, setStates] = useState<IState[]>([]); // To get state name if not provided

    // Load states to get state name if needed
    useEffect(() => {
      const loadStates = async () => {
        if (countryCode && !stateName && stateCode) {
          try {
            const loadedStates = await getStatesByCountry(countryCode);
            setStates(loadedStates);
          } catch (error) {
            console.error('Error loading states:', error);
          }
        }
      };
      loadStates();
    }, [countryCode, stateCode, stateName]);

    // Get state name from loaded states if not provided
    const resolvedStateName = useMemo(() => {
      if (stateName) return stateName;
      if (stateCode && states.length > 0) {
        const state = states.find(s => s.isoCode === stateCode);
        return state?.name;
      }
      return undefined;
    }, [stateName, stateCode, states]);

    useEffect(() => {
      const loadCities = async () => {
        if (!countryCode) {
          setCities([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        try {
          let loadedCities: ICity[] = [];
          // For Morocco, always load all cities regardless of stateCode
          if (countryCode === 'MA') {
            loadedCities = await getCitiesByCountry(countryCode);
          } else if (stateCode) {
            // Use enhanced function that includes custom cities for other countries
            loadedCities = await getCitiesByStateWithName(countryCode, stateCode, resolvedStateName);
          } else {
            // Load all cities by country (fallback)
            loadedCities = await getCitiesByCountry(countryCode);
          }
          setCities(loadedCities);
        } catch (error) {
          console.error('Error loading cities:', error);
          setCities([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadCities();
    }, [countryCode, stateCode, resolvedStateName]);

    const options: SelectOption[] = useMemo(() => {
      return cities.map((city) => ({
        value: city.name,
        label: city.name,
        city,
      }));
    }, [cities]);

    const filterOptions = useCallback(
      (options: SelectOption[], query: string) => {
        const filtered = filterCities(cities, query).map((city) => ({
          value: city.name,
          label: city.name,
          city,
        }));
        return filtered;
      },
      [cities]
    );

    // Determine if we should use free text input
    const shouldUseFreeText = useMemo(() => {
      if (!allowFreeText) return false;
      if (!countryCode) return false;
      if (stateCode && !isLoading && cities.length === 0) {
        // No cities available after loading, use free text
        return true;
      }
      return false;
    }, [allowFreeText, countryCode, stateCode, isLoading, cities.length]);

    const searchPlaceholder = t.checkout.searchCity || 'Search city...';
    const emptyMessage = t.checkout.noCitiesFound || 'No cities found';
    const placeholder = !countryCode
      ? t.checkout.selectCountryFirst || 'Select a country first'
      : countryCode === 'MA'
      ? searchPlaceholder
      : !stateCode && countryCode
      ? t.checkout.selectProvinceFirst || 'Select a province first'
      : shouldUseFreeText
      ? t.checkout.enterCityManually || 'Enter your city'
      : searchPlaceholder;

    // If no cities available and free text is allowed, use Input component
    if (shouldUseFreeText) {
      return (
        <div className={cn('w-full', className)}>
          <Input
            ref={ref}
            label={label}
            error={error}
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || !countryCode}
            className={className}
          />
          <p className="mt-2 text-sm text-gold-600/80 flex items-center gap-2">
            <span>ℹ️</span>
            <span>{t.checkout.noCitiesFoundEnterManually || 'Aucune ville trouvée pour cette province. Veuillez saisir votre ville manuellement.'}</span>
          </p>
        </div>
      );
    }

    // Otherwise, use SearchableSelect as before
    return (
      <SearchableSelect
        ref={ref}
        label={label}
        error={error}
        className={className}
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        disabled={disabled || !countryCode}
        filterOptions={filterOptions}
      />
    );
  }
);

CitySelect.displayName = 'CitySelect';

