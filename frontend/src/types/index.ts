export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: 'iphone' | 'android' | 'accessories';
  brand?: string;
  stock: number;
  specifications?: Record<string, string>;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: 'customer' | 'admin';
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code?: string;
  zipCode?: string; // Keep for backward compatibility
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  shippingAddress: Address;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

