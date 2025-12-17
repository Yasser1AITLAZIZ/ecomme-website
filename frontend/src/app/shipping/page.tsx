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
                  <h2 className="text-2xl font-bold mb-2 text-white">Livraison au Maroc</h2>
                  <p className="text-gray-400 mb-4">
                    Nous livrons partout au Maroc avec un service rapide et fiable
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black-50/50 rounded-lg p-4 border border-gold-600/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Frais de Livraison</h3>
                  <p className="text-2xl font-bold text-gold-600 mb-1">
                    À partir de {defaultFee.default_display_fee?.toFixed(2) || '10.00'} MAD
                  </p>
                  <p className="text-xs text-gray-500">
                    Les frais diminuent progressivement avec le montant de votre commande
                  </p>
                  {defaultFee.free_shipping_threshold > 0 && (
                    <p className="text-green-400 text-sm font-semibold mt-2">
                      🎉 Livraison gratuite à partir de {defaultFee.free_shipping_threshold} MAD
                    </p>
                  )}
                </div>
                
                <div className="bg-black-50/50 rounded-lg p-4 border border-gold-600/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Délai de Livraison</h3>
                  <p className="text-2xl font-bold text-gold-600 mb-1">Maximum 48h</p>
                  <p className="text-xs text-gray-500">
                    Livraison rapide dans toutes les villes du Maroc
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Coverage Area */}
        <ScrollReveal delay={0.1}>
          <div>
            <h2 className="text-3xl font-bold mb-6">Zone de Couverture</h2>
            <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gold-600/20 rounded-lg">
                  <span className="text-2xl">🇲🇦</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">Tout le Maroc</h3>
                  <p className="text-gray-400 mb-4">
                    Nous livrons dans toutes les villes et régions du Maroc. Que vous soyez à Casablanca, 
                    Rabat, Marrakech, Tanger, Fès, Agadir ou dans n'importe quelle autre ville, 
                    nous vous livrons votre commande rapidement et en toute sécurité.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="text-sm text-gray-300">
                      <span className="text-gold-600">✓</span> Grandes villes
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="text-gold-600">✓</span> Villes moyennes
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="text-gold-600">✓</span> Petites villes
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="text-gold-600">✓</span> Zones rurales
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
              Suivi de Commande
            </h2>
            <p className="text-gray-300 mb-4">
              Une fois votre commande expédiée, vous recevrez un numéro de suivi par email et SMS 
              qui vous permettra de suivre votre colis en temps réel jusqu'à sa livraison.
            </p>
            <div className="flex items-center gap-2 text-gold-600">
              <span>✓</span>
              <span className="text-sm">Notification par email et SMS</span>
            </div>
          </div>
        </ScrollReveal>

        {/* FAQ */}
        <ScrollReveal delay={0.3}>
          <div>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-gold-600" />
              Questions Fréquentes
            </h2>
            <div className="space-y-4">
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2 text-white">
                  Dans quelles villes livrez-vous ?
                </h3>
                <p className="text-gray-400">
                  Nous livrons partout au Maroc, dans toutes les villes et régions. 
                  Que vous soyez dans une grande ville ou une zone rurale, nous vous livrons votre commande.
                </p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2 text-white">
                  Combien de temps prend la livraison ?
                </h3>
                <p className="text-gray-400">
                  Le délai de livraison est de maximum 48 heures après la confirmation de votre commande. 
                  Pour les grandes villes, la livraison peut être encore plus rapide.
                </p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2 text-white">
                  Comment sont calculés les frais de livraison ?
                </h3>
                <p className="text-gray-400">
                  Les frais de livraison commencent à partir de {defaultFee?.default_display_fee?.toFixed(2) || '10.00'} MAD 
                  et diminuent progressivement avec le montant de votre commande. 
                  {defaultFee?.free_shipping_threshold > 0 && (
                    <> Les commandes de plus de {defaultFee.free_shipping_threshold} MAD bénéficient de la livraison gratuite.</>
                  )}
                </p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                <h3 className="text-lg font-bold mb-2 text-white">
                  Livrez-vous à l'étranger ?
                </h3>
                <p className="text-gray-400">
                  Actuellement, nous livrons uniquement au Maroc. Nous travaillons sur l'extension 
                  de notre service de livraison à l'international dans le futur.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

