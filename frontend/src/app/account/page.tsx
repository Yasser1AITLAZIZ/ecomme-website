'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Settings, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';

export default function AccountPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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
    <div className="space-y-8">
      {/* Welcome Section */}
      <ScrollReveal>
        <div className="bg-gradient-to-br from-black-100 to-black-50 rounded-xl border border-gold-600/20 p-8 md:p-10 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-600/30 to-gold-700/20 flex items-center justify-center border-2 border-gold-600/30 shadow-lg">
              <User className="w-10 h-10 text-gold-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                <span className="text-white">{t.account.welcome}</span>{' '}
                <span className="text-gold-600">{user.name}</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl mt-2">
                {t.account.subtitle}
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Quick Actions */}
      <ScrollReveal delay={0.1}>
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t.account.quickActions || 'Quick Actions'}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {menuItems.map((item, index) => (
              <ScrollReveal key={item.href} delay={0.1 + index * 0.1}>
                <Link href={item.href}>
                  <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 hover:border-gold-600/40 hover:shadow-xl hover:shadow-gold-600/10 transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gold-600/20 flex items-center justify-center group-hover:bg-gold-600/30 transition-colors">
                        <item.icon className="w-6 h-6 text-gold-600 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-gold-600 transition-colors">
                          {item.label}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Account Information */}
      <ScrollReveal delay={0.3}>
        <div className="bg-black-100 rounded-xl border border-gold-600/10 p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gold-600/20 flex items-center justify-center">
              <User className="w-5 h-5 text-gold-600" />
            </div>
            <h2 className="text-2xl font-bold text-gold-600">{t.account.accountInfo}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-lg bg-black-50 border border-gold-600/5">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 font-medium">{t.account.nameLabel}</span>
              </div>
              <span className="text-white font-semibold text-lg">{user.name}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-lg bg-black-50 border border-gold-600/5">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 font-medium">{t.account.emailLabel}</span>
              </div>
              <span className="text-white font-semibold text-lg">{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-lg bg-black-50 border border-gold-600/5">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 font-medium">{t.account.phoneLabel}</span>
                </div>
                <span className="text-white font-semibold text-lg">{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

