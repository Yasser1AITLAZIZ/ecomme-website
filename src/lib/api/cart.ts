import { apiClient } from './client';
import type { CartItem } from '@/types';

export const cartApi = {
  sync: async (items: CartItem[]): Promise<CartItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real app, this would sync cart with backend
    return items;
  },

  clear: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In real app, this would clear cart on backend
  },
};

