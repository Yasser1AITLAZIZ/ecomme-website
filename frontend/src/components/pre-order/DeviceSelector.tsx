'use client';

import { useState } from 'react';
import { Smartphone, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Device {
  id: string;
  name: string;
  type: 'iphone' | 'android';
  category: string;
}

const devices: Device[] = [
  // iPhone
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-16-pro', name: 'iPhone 16 Pro', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-16-plus', name: 'iPhone 16 Plus', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-16', name: 'iPhone 16', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-15-plus', name: 'iPhone 15 Plus', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-15', name: 'iPhone 15', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-14-plus', name: 'iPhone 14 Plus', type: 'iphone', category: 'iPhone' },
  { id: 'iphone-14', name: 'iPhone 14', type: 'iphone', category: 'iPhone' },
  // Android
  { id: 'samsung-s24-ultra', name: 'Samsung Galaxy S24 Ultra', type: 'android', category: 'Android' },
  { id: 'samsung-s24-plus', name: 'Samsung Galaxy S24+', type: 'android', category: 'Android' },
  { id: 'samsung-s24', name: 'Samsung Galaxy S24', type: 'android', category: 'Android' },
  { id: 'samsung-s23-ultra', name: 'Samsung Galaxy S23 Ultra', type: 'android', category: 'Android' },
  { id: 'samsung-s23-plus', name: 'Samsung Galaxy S23+', type: 'android', category: 'Android' },
  { id: 'samsung-s23', name: 'Samsung Galaxy S23', type: 'android', category: 'Android' },
  { id: 'google-pixel-8-pro', name: 'Google Pixel 8 Pro', type: 'android', category: 'Android' },
  { id: 'google-pixel-8', name: 'Google Pixel 8', type: 'android', category: 'Android' },
  { id: 'oneplus-12', name: 'OnePlus 12', type: 'android', category: 'Android' },
  { id: 'oneplus-11', name: 'OnePlus 11', type: 'android', category: 'Android' },
];

interface DeviceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DeviceSelector({ value, onChange, error }: DeviceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'iPhone', 'Android'];
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || device.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedDevice = devices.find(d => d.id === value);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gold-600 mb-2">
          Device Type
        </label>
        <div className="flex gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedCategory === category
                  ? 'bg-gold-600 text-black'
                  : 'bg-black-100 text-gray-400 hover:bg-black-50 border border-black-300'
              )}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search devices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-black-100 border border-black-300 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-600 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredDevices.map(device => (
          <button
            key={device.id}
            type="button"
            onClick={() => onChange(device.id)}
            className={cn(
              'p-4 rounded-lg border-2 transition-all text-left',
              'hover:border-gold-600/50 hover:bg-black-50',
              value === device.id
                ? 'border-gold-600 bg-gold-600/10'
                : 'border-black-300 bg-black-100'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  device.type === 'iphone' ? 'bg-blue-500/20' : 'bg-green-500/20'
                )}>
                  <Smartphone className={cn(
                    'w-5 h-5',
                    device.type === 'iphone' ? 'text-blue-500' : 'text-green-500'
                  )} />
                </div>
                <div>
                  <p className="font-semibold text-white">{device.name}</p>
                  <p className="text-xs text-gray-400">{device.category}</p>
                </div>
              </div>
              {value === device.id && (
                <Check className="w-5 h-5 text-gold-600" />
              )}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

