'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { VoiceSearch } from '@/components/ui/VoiceSearch';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

export function Header() {
  const pathname = usePathname();
  const { t, isRTL } = useI18n();
  const itemCount = useCartStore((state) => state.getItemCount());
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { cartSidebarOpen, mobileMenuOpen, toggleCartSidebar, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/products', label: t.nav.products },
    { href: '/products?category=iphone', label: t.nav.iphone },
    { href: '/products?category=android', label: t.nav.android },
    { href: '/products?category=accessories', label: t.nav.accessories },
  ];
  
  return (
    <header 
      className={cn(
        "sticky z-50 bg-black border-b border-gold-600/20 backdrop-blur-sm",
        "top-[52px]"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className={cn('flex items-center', isRTL ? 'gap-2' : 'space-x-2')}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-gold-500 to-gold-700 bg-clip-text text-transparent">
                Primo Store
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className={cn('hidden md:flex items-center', isRTL ? 'gap-8' : 'space-x-8')}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  pathname === link.href
                    ? 'text-gold-600'
                    : 'text-gray-300 hover:text-gold-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
            <LanguageSwitcher />
            {/* Voice Search - Hidden on mobile for now */}
            <div className="hidden lg:block">
              <VoiceSearch onSearch={(query) => {
                // Navigate to products with search query
                window.location.href = `/products?search=${encodeURIComponent(query)}`;
              }} />
            </div>
            {isAuthenticated ? (
              <Link
                href="/account"
                className="hidden md:flex items-center gap-2 text-gray-300 hover:text-gold-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">{user?.name}</span>
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    {t.nav.signUp}
                  </Button>
                </Link>
              </div>
            )}

            {/* Cart Button */}
            <motion.button
              onClick={toggleCartSidebar}
              className="relative p-2 text-gray-300 hover:text-gold-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gold-600 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-300 hover:text-gold-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gold-600/20"
          >
            <div className={cn('flex flex-col', isRTL ? 'gap-4' : 'space-y-4')}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    'text-base font-medium transition-colors duration-200',
                    pathname === link.href
                      ? 'text-gold-600'
                      : 'text-gray-300 hover:text-gold-600'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className={cn('flex flex-col pt-4 border-t border-gold-600/20', isRTL ? 'gap-2' : 'space-y-2')}>
                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button variant="ghost" size="sm" className="w-full">
                      {t.nav.login}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu}>
                    <Button variant="primary" size="sm" className="w-full">
                      {t.nav.signUp}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
}

