import { apiClient } from './client';
import type { Order, CartItem, Address } from '@/types';

// Mock orders storage
let mockOrders: Order[] = [];

export const ordersApi = {
  create: async (
    items: CartItem[],
    shippingAddress: Address,
    total: number
  ): Promise<Order> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newOrder: Order = {
      id: String(mockOrders.length + 1),
      userId: '1', // In real app, get from auth
      items,
      total,
      shippingAddress,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockOrders.push(newOrder);
    return newOrder;
  },

  getAll: async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders;
  },

  getById: async (id: string): Promise<Order | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.find(o => o.id === id) || null;
  },

  getByUserId: async (userId: string): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.filter(o => o.userId === userId);
  },
};

