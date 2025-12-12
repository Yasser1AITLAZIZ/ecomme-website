'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Package, Settings, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    {
      icon: User,
      label: t.account.overview || 'Overview',
      href: '/account',
      exact: true,
    },
    {
      icon: Package,
      label: t.account.myOrders,
      href: '/account/orders',
    },
    {
      icon: Settings,
      label: t.account.profile,
      href: '/account/profile',
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-obsidian-950">
      {/* Proper spacing to account for ticker bar (52px) + header (80px) = 132px */}
      <div className="pt-32 md:pt-36 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3">
              <div className="sticky top-32 space-y-2">
                <nav className="bg-black-100 rounded-lg border border-gold-600/10 p-4 space-y-2">
                  {navItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                          'text-gray-300 hover:text-gold-600 hover:bg-gold-600/10',
                          active && 'bg-gold-600/20 text-gold-600 border border-gold-600/30'
                        )}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                      'text-red-400 hover:text-red-500 hover:bg-red-500/10',
                      'border border-red-500/20'
                    )}
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{t.account.logout}</span>
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

