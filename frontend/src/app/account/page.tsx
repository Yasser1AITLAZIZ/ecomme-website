'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n/context';

export default function AccountPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const menuItems = [
    {
      icon: Package,
      label: t.account.myOrders,
      href: '/account/orders',
      description: t.account.myOrdersDesc,
    },
    {
      icon: Settings,
      label: t.account.profile,
      href: '/account/profile',
      description: t.account.profileDesc,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {t.account.welcome} <span className="text-gold-600">{user.name}</span>
          </h1>
          <p className="text-gray-400">{t.account.subtitle}</p>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <ScrollReveal key={item.href} delay={index * 0.1}>
            <Link href={item.href}>
              <div className="bg-black-100 rounded-lg border border-gold-600/10 p-6 hover:border-gold-600/30 transition-all cursor-pointer group">
                <item.icon className="w-8 h-8 text-gold-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">{item.label}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            </Link>
          </ScrollReveal>
        ))}

        <ScrollReveal delay={0.3}>
          <button
            onClick={handleLogout}
            className="bg-black-100 rounded-lg border border-red-500/20 p-6 hover:border-red-500/50 transition-all text-left w-full"
          >
            <LogOut className="w-8 h-8 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-red-500">{t.account.logout}</h3>
            <p className="text-gray-400 text-sm">{t.account.logoutDesc}</p>
          </button>
        </ScrollReveal>
      </div>

      {/* Account Info */}
      <ScrollReveal delay={0.4}>
        <div className="mt-12 bg-black-100 rounded-lg border border-gold-600/10 p-6">
          <h2 className="text-2xl font-bold text-gold-600 mb-4">{t.account.accountInfo}</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">{t.account.nameLabel}</span>
              <span className="text-white">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t.account.emailLabel}</span>
              <span className="text-white">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex justify-between">
                <span className="text-gray-400">{t.account.phoneLabel}</span>
                <span className="text-white">{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

