'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

export function Footer() {
  const { t, isRTL } = useI18n();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: t.footer.links.iphone, href: '/products?category=iphone' },
      { label: t.footer.links.android, href: '/products?category=android' },
      { label: t.footer.links.accessories, href: '/products?category=accessories' },
      { label: t.footer.links.allProducts, href: '/products' },
    ],
    company: [
      { label: t.footer.links.aboutUs, href: '/about' },
      { label: t.footer.links.contact, href: '/contact' },
      { label: t.footer.links.shipping, href: '/shipping' },
      { label: t.footer.links.returns, href: '/returns' },
      { label: (t.footer.links as any).tradeIn || 'Trade-In', href: '/trade-in' },
    ],
    account: [
      { label: t.footer.links.myAccount, href: '/account' },
      { label: t.footer.links.orderHistory, href: '/account/orders' },
    ],
  };

  return (
    <footer className="bg-black-50 border-t border-gold-600/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gold-500 to-gold-700 bg-clip-text text-transparent mb-4">
              Primo Store
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              {t.footer.brandDescription}
            </p>
            <p className="text-gray-500 text-xs mb-4">
              Primo Store by Primo Solutions SARL
            </p>
            <div className={cn('flex gap-4', isRTL && 'flex-row-reverse')}>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:primostore@primosolutions.ma"
                className="text-gray-400 hover:text-gold-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-gold-600 font-semibold mb-4">{t.footer.shop}</h4>
            <ul className={cn('space-y-2', isRTL && 'text-right')}>
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold-600 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-gold-600 font-semibold mb-4">{t.footer.company}</h4>
            <ul className={cn('space-y-2', isRTL && 'text-right')}>
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold-600 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-gold-600 font-semibold mb-4">{t.footer.account}</h4>
            <ul className={cn('space-y-2', isRTL && 'text-right')}>
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold-600 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gold-600/20 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Primo Store. {t.footer.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}

