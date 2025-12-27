'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';

interface iPhoneModel {
  value: string;
  label: string;
  storageOptions: string[];
  colors: string[];
}

const iPhoneModels: iPhoneModel[] = [
  {
    value: 'iphone-15-pro-max',
    label: 'iPhone 15 Pro Max',
    storageOptions: ['256GB', '512GB', '1TB'],
    colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
  },
  {
    value: 'iphone-15-pro',
    label: 'iPhone 15 Pro',
    storageOptions: ['128GB', '256GB', '512GB', '1TB'],
    colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
  },
  {
    value: 'iphone-15-plus',
    label: 'iPhone 15 Plus',
    storageOptions: ['128GB', '256GB', '512GB'],
    colors: ['Black', 'Blue', 'Green', 'Yellow', 'Pink'],
  },
  {
    value: 'iphone-15',
    label: 'iPhone 15',
    storageOptions: ['128GB', '256GB', '512GB'],
    colors: ['Black', 'Blue', 'Green', 'Yellow', 'Pink'],
  },
  {
    value: 'iphone-14-pro-max',
    label: 'iPhone 14 Pro Max',
    storageOptions: ['128GB', '256GB', '512GB', '1TB'],
    colors: ['Deep Purple', 'Gold', 'Silver', 'Space Black'],
  },
  {
    value: 'iphone-14-pro',
    label: 'iPhone 14 Pro',
    storageOptions: ['128GB', '256GB', '512GB', '1TB'],
    colors: ['Deep Purple', 'Gold', 'Silver', 'Space Black'],
  },
  {
    value: 'iphone-14-plus',
    label: 'iPhone 14 Plus',
    storageOptions: ['128GB', '256GB', '512GB'],
    colors: ['Blue', 'Purple', 'Midnight', 'Starlight', 'Red'],
  },
  {
    value: 'iphone-14',
    label: 'iPhone 14',
    storageOptions: ['128GB', '256GB', '512GB'],
    colors: ['Blue', 'Purple', 'Midnight', 'Starlight', 'Red'],
  },
  {
    value: 'iphone-13-pro-max',
    label: 'iPhone 13 Pro Max',
    storageOptions: ['128GB', '256GB', '512GB', '1TB'],
    colors: ['Graphite', 'Gold', 'Silver', 'Sierra Blue', 'Alpine Green'],
  },
  {
    value: 'iphone-13-pro',
    label: 'iPhone 13 Pro',
    storageOptions: ['128GB', '256GB', '512GB', '1TB'],
    colors: ['Graphite', 'Gold', 'Silver', 'Sierra Blue', 'Alpine Green'],
  },
  {
    value: 'iphone-13-mini',
    label: 'iPhone 13 mini',
    storageOptions: ['128GB', '256GB', '512GB'],
    colors: ['Pink', 'Blue', 'Midnight', 'Starlight', 'Red', 'Green'],
  },
  {
    value: 'iphone-13',
    label: 'iPhone 13',
    storageOptions: ['128GB', '256GB', '512GB'],
    colors: ['Pink', 'Blue', 'Midnight', 'Starlight', 'Red', 'Green'],
  },
  {
    value: 'iphone-12-pro-max',
    label: 'iPhone 12 Pro Max',
    storageOptions: ['128GB', '256GB', '512GB'],
    colors: ['Graphite', 'Silver', 'Gold', 'Pacific Blue'],
  },
  {
    value: 'iphone-12-pro',
    label: 'iPhone 12 Pro',
    storageOptions: ['128GB', '256GB', '512GB'],
    colors: ['Graphite', 'Silver', 'Gold', 'Pacific Blue'],
  },
  {
    value: 'iphone-12-mini',
    label: 'iPhone 12 mini',
    storageOptions: ['64GB', '128GB', '256GB'],
    colors: ['Black', 'White', 'Red', 'Green', 'Blue', 'Purple'],
  },
  {
    value: 'iphone-12',
    label: 'iPhone 12',
    storageOptions: ['64GB', '128GB', '256GB'],
    colors: ['Black', 'White', 'Red', 'Green', 'Blue', 'Purple'],
  },
  {
    value: 'iphone-11-pro-max',
    label: 'iPhone 11 Pro Max',
    storageOptions: ['64GB', '256GB', '512GB'],
    colors: ['Space Gray', 'Silver', 'Gold', 'Midnight Green'],
  },
  {
    value: 'iphone-11-pro',
    label: 'iPhone 11 Pro',
    storageOptions: ['64GB', '256GB', '512GB'],
    colors: ['Space Gray', 'Silver', 'Gold', 'Midnight Green'],
  },
  {
    value: 'iphone-11',
    label: 'iPhone 11',
    storageOptions: ['64GB', '128GB', '256GB'],
    colors: ['Black', 'Green', 'Yellow', 'Purple', 'Red', 'White'],
  },
  {
    value: 'iphone-xs-max',
    label: 'iPhone XS Max',
    storageOptions: ['64GB', '256GB', '512GB'],
    colors: ['Space Gray', 'Silver', 'Gold'],
  },
  {
    value: 'iphone-xs',
    label: 'iPhone XS',
    storageOptions: ['64GB', '256GB', '512GB'],
    colors: ['Space Gray', 'Silver', 'Gold'],
  },
  {
    value: 'iphone-xr',
    label: 'iPhone XR',
    storageOptions: ['64GB', '128GB', '256GB'],
    colors: ['Black', 'White', 'Blue', 'Yellow', 'Coral', 'Red'],
  },
  {
    value: 'iphone-x',
    label: 'iPhone X',
    storageOptions: ['64GB', '256GB'],
    colors: ['Space Gray', 'Silver'],
  },
  {
    value: 'iphone-8-plus',
    label: 'iPhone 8 Plus',
    storageOptions: ['64GB', '256GB'],
    colors: ['Space Gray', 'Silver', 'Gold', 'Red'],
  },
  {
    value: 'iphone-8',
    label: 'iPhone 8',
    storageOptions: ['64GB', '256GB'],
    colors: ['Space Gray', 'Silver', 'Gold', 'Red'],
  },
  {
    value: 'iphone-se-3',
    label: 'iPhone SE (3rd Gen)',
    storageOptions: ['64GB', '128GB', '256GB'],
    colors: ['Midnight', 'Starlight', 'Red'],
  },
  {
    value: 'iphone-se-2',
    label: 'iPhone SE (2nd Gen)',
    storageOptions: ['64GB', '128GB', '256GB'],
    colors: ['Black', 'White', 'Red'],
  },
];

interface iPhoneModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  error?: string;
}

export function iPhoneModelSelector({ value, onChange, error }: iPhoneModelSelectorProps) {
  const { t, isRTL } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = iPhoneModels.find((m) => m.value === value);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gold-600 mb-2">
        {(t as any).tradeIn?.form?.iphoneModel || 'iPhone Model'}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-4 py-3 bg-black-100 border rounded-lg',
            'text-white flex items-center justify-between',
            'focus:outline-none focus:ring-2 focus:ring-gold-600 focus:border-transparent',
            'transition-all duration-200',
            error ? 'border-red-500 focus:ring-red-500' : 'border-black-300',
            isOpen && 'border-gold-600'
          )}
        >
          <span className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gold-600" />
            <span>{selectedModel?.label || (t as any).tradeIn?.form?.selectModel || 'Select iPhone Model'}</span>
          </span>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 w-full mt-2 bg-black-100 border border-gold-600/30 rounded-lg shadow-xl max-h-96 overflow-y-auto"
            >
              {iPhoneModels.map((model) => (
                <button
                  key={model.value}
                  type="button"
                  onClick={() => {
                    onChange(model.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-black-200 transition-colors',
                    'flex items-center gap-3',
                    value === model.value && 'bg-gold-600/10 border-l-4 border-gold-600'
                  )}
                >
                  <Smartphone className="w-4 h-4 text-gold-600 flex-shrink-0" />
                  <span className="text-white">{model.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function getModelStorageOptions(model: string): string[] {
  const selectedModel = iPhoneModels.find((m) => m.value === model);
  return selectedModel?.storageOptions || [];
}

export function getModelColors(model: string): string[] {
  const selectedModel = iPhoneModels.find((m) => m.value === model);
  return selectedModel?.colors || [];
}

