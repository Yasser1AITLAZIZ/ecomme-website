'use client';

import { useI18n } from '@/lib/i18n/context';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { RefreshCw, CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';

export default function ReturnsPage() {
  const { t, isRTL } = useI18n();

  return (
    <div className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.company.returns.title} <span className="text-gold-600">{t.company.returns.titleHighlight}</span>
          </h1>
          <p className="text-xl text-gray-400">{t.company.returns.subtitle}</p>
        </div>
      </ScrollReveal>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Return Policy */}
        <ScrollReveal delay={0.1}>
          <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-gold-600" />
              {t.company.returns.policy}
            </h2>
            <p className="text-gray-300 text-lg">{t.company.returns.policyDesc}</p>
          </div>
        </ScrollReveal>

        {/* Return Conditions */}
        <ScrollReveal delay={0.2}>
          <div>
            <h2 className="text-3xl font-bold mb-6">{t.company.returns.conditions}</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="bg-black-50 rounded-lg p-4 border border-gold-600/20 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-gold-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">{t.company.returns[`condition${num}` as keyof typeof t.company.returns]}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Return Process */}
        <ScrollReveal delay={0.3}>
          <div>
            <h2 className="text-3xl font-bold mb-6">{t.company.returns.process}</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="bg-black-50 rounded-lg p-6 border border-gold-600/20">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gold-600 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {num}
                    </div>
                    <p className="text-gray-300 text-lg">{t.company.returns[`step${num}` as keyof typeof t.company.returns]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Exchanges */}
        <ScrollReveal delay={0.4}>
          <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
            <h2 className="text-2xl font-bold mb-4">{t.company.returns.exchanges}</h2>
            <p className="text-gray-300">{t.company.returns.exchangeDesc}</p>
          </div>
        </ScrollReveal>

        {/* Refunds */}
        <ScrollReveal delay={0.5}>
          <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
            <h2 className="text-2xl font-bold mb-4">{t.company.returns.refunds}</h2>
            <p className="text-gray-300">{t.company.returns.refundDesc}</p>
          </div>
        </ScrollReveal>

        {/* Non-Returnable Items */}
        <ScrollReveal delay={0.6}>
          <div>
            <h2 className="text-3xl font-bold mb-6">{t.company.returns.exceptions}</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((num) => (
                <div key={num} className="bg-black-50 rounded-lg p-4 border border-red-600/20 flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">{t.company.returns[`exception${num}` as keyof typeof t.company.returns]}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Contact CTA */}
        <ScrollReveal delay={0.7}>
          <div className="bg-gradient-to-r from-gold-600/10 to-gold-700/10 rounded-lg p-8 border border-gold-600/30 text-center">
            <h2 className="text-2xl font-bold mb-4">{t.company.returns.contact}</h2>
            <p className="text-gray-300 mb-6">{t.company.returns.contactDesc}</p>
            <Link href="/contact">
              <Button variant="primary" size="lg">
                {t.company.contact.title} {t.company.contact.titleHighlight}
                <Mail className={isRTL ? 'w-5 h-5 mr-2 rotate-180' : 'w-5 h-5 ml-2'} />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

