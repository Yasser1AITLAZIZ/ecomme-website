import { apiClient } from './client';
import type { Product } from '@/types';

// Mock data for development
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    description: 'The ultimate iPhone with titanium design and A17 Pro chip',
    price: 1199,
    originalPrice: 1299,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop&q=80',
    ],
    category: 'iphone',
    brand: 'Apple',
    stock: 50,
    featured: true,
    specifications: {
      'Display': '6.7-inch Super Retina XDR',
      'Chip': 'A17 Pro',
      'Camera': '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
      'Storage': '256GB',
      'Color': 'Natural Titanium',
    },
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    description: 'Pro performance in a compact titanium design',
    price: 999,
    originalPrice: 1099,
    images: [
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&q=80',
    ],
    category: 'iphone',
    brand: 'Apple',
    stock: 75,
    featured: true,
    specifications: {
      'Display': '6.1-inch Super Retina XDR',
      'Chip': 'A17 Pro',
      'Camera': '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
      'Storage': '128GB',
      'Color': 'Blue Titanium',
    },
  },
  {
    id: '3',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android flagship with S Pen',
    price: 1199,
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=800&fit=crop&q=80'],
    category: 'android',
    brand: 'Samsung',
    stock: 40,
    featured: true,
    specifications: {
      'Display': '6.8-inch Dynamic AMOLED 2X',
      'Chip': 'Snapdragon 8 Gen 3',
      'Camera': '200MP Main, 50MP Periscope, 12MP Ultra Wide',
      'Storage': '256GB',
      'Color': 'Titanium Black',
    },
  },
  {
    id: '4',
    name: 'AirPods Pro (2nd Gen)',
    description: 'Active Noise Cancellation with Spatial Audio',
    price: 249,
    images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop&q=80'],
    category: 'accessories',
    brand: 'Apple',
    stock: 100,
    specifications: {
      'Battery': 'Up to 6 hours listening time',
      'Noise Cancellation': 'Active Noise Cancellation',
      'Connectivity': 'Bluetooth 5.3',
      'Case': 'MagSafe Charging Case',
    },
  },
  {
    id: '5',
    name: 'MagSafe Charger',
    description: 'Fast wireless charging for iPhone',
    price: 39,
    images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop&q=80'],
    category: 'accessories',
    brand: 'Apple',
    stock: 200,
  },
  {
    id: '6',
    name: 'iPhone Case - Leather',
    description: 'Premium leather case with MagSafe',
    price: 59,
    images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop&q=80'],
    category: 'accessories',
    brand: 'Apple',
    stock: 150,
  },
];

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducts;
  },

  getById: async (id: string): Promise<Product | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.find(p => p.id === id) || null;
  },

  getByCategory: async (category: Product['category']): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.filter(p => p.category === category);
  },

  getFeatured: async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.filter(p => p.featured);
  },

  search: async (query: string): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return mockProducts.filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
  },
};

