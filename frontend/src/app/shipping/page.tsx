'use client';

import { useI18n } from '@/lib/i18n/context';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Truck, HelpCircle } from 'lucide-react';
import { deliveryFeesApi } from '@/lib/api/deliveryFees';
import { useEffect, useState } from 'react';

export default function ShippingPage() {
  const { t, isRTL } = useI18n();
  const [defaultFee, setDefaultFee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDefaultFee = async () => {
      try {
        setLoading(true);
        const data = await deliveryFeesApi.getDefaultFee();
        setDefaultFee(data);
      } catch (error) {
        console.error('Failed to load default delivery fee:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDefaultFee();
  }, []);

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
        {/* Delivery Information Card */}
        {!loading && defaultFee && (
          <ScrollReveal delay={0.05}>
            <div className="bg-gradient-to-r from-gold-600/10 to-gold-600/5 rounded-lg p-8 border border-gold-600/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gold-600/20 rounded-lg">
                  <Truck className="w-8 h-8 text-gold-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 text-white">{t.company.shipping.moroccoDelivery}</h2>
                  <p className="text-gray-400 mb-4">
                    {t.company.shipping.moroccoDeliveryDesc}
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black-50/50 rounded-lg p-4 border border-gold-600/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">{t.company.shipping.deliveryFee}</h3>
                  <p className="text-2xl font-bold text-gold-600 mb-1">
                    {t.company.shipping.startingFrom} {defaultFee.default_display_fee?.toFixed(2) || '10.00'} MAD
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.company.shipping.feesDecrease}
                  </p>
                  {defaultFee.free_shipping_threshold > 0 && (
                    <p className="text-green-400 text-sm font-semibold mt-2">
                      🎉 {t.company.shipping.freeShippingThreshold} {defaultFee.free_shipping_threshold} MAD
                    </p>
                  )}
                </div>
                
                <div className="bg-black-50/50 rounded-lg p-4 border border-gold-600/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">{t.company.shipping.deliveryTime}</h3>
                  <p className="text-2xl font-bold text-gold-600 mb-1">{t.company.shipping.max48h}</p>
                  <p className="text-xs text-gray-500">
                    {t.company.shipping.fastDelivery}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Coverage Area */}
        <ScrollReveal delay={0.1}>
          <div>
            <h2 className="text-3xl font-bold mb-6">{t.company.shipping.coverageArea}</h2>
            <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gold-600/20 rounded-lg">
                  <span className="text-2xl">🇲🇦</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">{t.company.shipping.allMorocco}</h3>
                  <p className="text-gray-400 mb-4">
                    {t.company.shipping.allMoroccoDesc}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="text-sm text-gray-300">
                      <span className="text-gold-600">✓</span> {t.company.shipping.largeCities}
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="text-gold-600">✓</span> {t.company.shipping.mediumCities}
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="text-gold-600">✓</span> {t.company.shipping.smallCities}
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="text-gold-600">✓</span> {t.company.shipping.ruralAreas}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Tracking */}
        <ScrollReveal delay={0.2}>
          <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>📦</span>
              {t.company.shipping.trackingTitle}
            </h2>
            <p className="text-gray-300 mb-4">
              {t.company.shipping.trackingDesc}
            </p>
            <div className="flex items-center gap-2 text-gold-600">
              <span>✓</span>
              <span className="text-sm">{t.company.shipping.emailSmsNotification}</span>
            </div>
          </div>
        </ScrollReveal>

        {/* FAQ */}
        <ScrollReveal delay={0.3}>
          <div>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-gold-600" />
              {t.company.shipping.faqTitle}
            </h2>
            <div className="space-y-4">
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2 text-white">
                  {t.company.shipping.q1Title}
                </h3>
                <p className="text-gray-400">
                  {t.company.shipping.q1Answer}
                </p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2 text-white">
                  {t.company.shipping.q2Title}
                </h3>
                <p className="text-gray-400">
                  {t.company.shipping.q2Answer}
                </p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2 text-white">
                  {t.company.shipping.q3Title}
                </h3>
                <p className="text-gray-400">
                  {t.company.shipping.q3Answer} {defaultFee?.default_display_fee?.toFixed(2) || '10.00'} MAD 
                  {t.company.shipping.q3AnswerCont}
                  {defaultFee?.free_shipping_threshold > 0 && (
                    <> {t.company.shipping.q3AnswerFree} {defaultFee.free_shipping_threshold} {t.company.shipping.q3AnswerFreeCont}</>
                  )}
                </p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2 text-white">
                  {t.company.shipping.q4Title}
                </h3>
                <p className="text-gray-400">
                  {t.company.shipping.q4Answer}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

