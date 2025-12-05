import { apiClient } from './client';
import type { AuthResponse, User } from '@/types';

// Mock users for development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    phone: '+1234567890',
  },
];

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock authentication - in real app, this would call the backend
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'demo123') {
      throw new Error('Invalid email or password');
    }

    return {
      user,
      token: 'mock-jwt-token-' + user.id,
    };
  },

  register: async (email: string, password: string, name: string, phone?: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      email,
      name,
      phone,
    };

    mockUsers.push(newUser);

    return {
      user: newUser,
      token: 'mock-jwt-token-' + newUser.id,
    };
  },

  getCurrentUser: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In real app, this would validate the token and return user data
    return mockUsers[0];
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // In real app, this would invalidate the token on the backend
  },
};

