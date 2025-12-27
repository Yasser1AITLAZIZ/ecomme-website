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
  promoPrice?: number;
  promoStartDate?: string;
  promoEndDate?: string;
  isPromoActive?: boolean;
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
  state?: string; // Optional for backward compatibility
  zip_code?: string;
  zipCode?: string; // Keep for backward compatibility
  country: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  items: CartItem[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  discountAmount?: number;
  shippingAddress: Address;
  deliveryType?: 'pickup' | 'delivery';
  paymentMethod?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

