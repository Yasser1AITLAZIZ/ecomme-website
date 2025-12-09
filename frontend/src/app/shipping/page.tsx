'use client';

import { useI18n } from '@/lib/i18n/context';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Truck, Package, Globe, HelpCircle } from 'lucide-react';

export default function ShippingPage() {
  const { t, isRTL } = useI18n();

  return (
    <div className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.company.shipping.title} <span className="text-gold-600">{t.company.shipping.titleHighlight}</span>
          </h1>
          <p className="text-xl text-gray-400">{t.company.shipping.subtitle}</p>
        </div>
      </ScrollReveal>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Shipping Methods */}
        <ScrollReveal delay={0.1}>
          <div>
            <h2 className="text-3xl font-bold mb-8">{t.company.shipping.methods}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <Truck className="w-12 h-12 text-gold-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{t.company.shipping.standard}</h3>
                <p className="text-gray-400 mb-2">{t.company.shipping.standardDesc}</p>
                <p className="text-gold-600 font-semibold">{t.company.shipping.standardPrice}</p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <Package className="w-12 h-12 text-gold-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{t.company.shipping.express}</h3>
                <p className="text-gray-400 mb-2">{t.company.shipping.expressDesc}</p>
                <p className="text-gold-600 font-semibold">{t.company.shipping.expressPrice}</p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <Globe className="w-12 h-12 text-gold-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{t.company.shipping.overnight}</h3>
                <p className="text-gray-400 mb-2">{t.company.shipping.overnightDesc}</p>
                <p className="text-gold-600 font-semibold">{t.company.shipping.overnightPrice}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Shipping Regions */}
        <ScrollReveal delay={0.2}>
          <div>
            <h2 className="text-3xl font-bold mb-8">{t.company.shipping.regions}</h2>
            <div className="space-y-4">
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-xl font-bold mb-2">{t.company.shipping.local}</h3>
                <p className="text-gray-400">{t.company.shipping.localDesc}</p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-xl font-bold mb-2">{t.company.shipping.national}</h3>
                <p className="text-gray-400">{t.company.shipping.nationalDesc}</p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-xl font-bold mb-2">{t.company.shipping.international}</h3>
                <p className="text-gray-400">{t.company.shipping.internationalDesc}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Tracking */}
        <ScrollReveal delay={0.3}>
          <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
            <h2 className="text-2xl font-bold mb-4">{t.company.shipping.tracking}</h2>
            <p className="text-gray-300">{t.company.shipping.trackingDesc}</p>
          </div>
        </ScrollReveal>

        {/* FAQ */}
        <ScrollReveal delay={0.4}>
          <div>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-gold-600" />
              {t.company.shipping.faq}
            </h2>
            <div className="space-y-4">
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2">{t.company.shipping.q1}</h3>
                <p className="text-gray-400">{t.company.shipping.a1}</p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2">{t.company.shipping.q2}</h3>
                <p className="text-gray-400">{t.company.shipping.a2}</p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2">{t.company.shipping.q3}</h3>
                <p className="text-gray-400">{t.company.shipping.a3}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

