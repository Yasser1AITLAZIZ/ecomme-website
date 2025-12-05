import { create } from 'zustand';

interface UIStore {
  cartSidebarOpen: boolean;
  mobileMenuOpen: boolean;
  toggleCartSidebar: () => void;
  openCartSidebar: () => void;
  closeCartSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  cartSidebarOpen: false,
  mobileMenuOpen: false,
  toggleCartSidebar: () => set((state) => ({ cartSidebarOpen: !state.cartSidebarOpen })),
  openCartSidebar: () => set({ cartSidebarOpen: true }),
  closeCartSidebar: () => set({ cartSidebarOpen: false }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));

