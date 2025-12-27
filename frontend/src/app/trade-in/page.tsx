'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, CheckCircle, Mail, Phone, Clock } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TradeInWizard } from '@/components/trade-in/TradeInWizard';
import { useI18n } from '@/lib/i18n/context';
import { tradeInApi, type TradeInFormData } from '@/lib/api/tradeIn';
import { useToast } from '@/components/ui/Toast';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import { AnimatedGradientText } from '@/components/ui/AnimatedGradientText';
import { cn } from '@/lib/utils/cn';

export default function TradeInPage() {
  const { t, isRTL } = useI18n();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (data: TradeInFormData) => {
    setIsSubmitting(true);

    try {
      await tradeInApi.submit(data);
      setIsSuccess(true);
      showToast({
        message: (t as any).tradeIn?.form?.success || 'Your trade-in request has been submitted successfully!',
        type: 'success',
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      showToast({
        message: errorMessage || (t as any).tradeIn?.form?.error || 'Failed to submit trade-in request. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <AnimatedGradientText>
                  {(t as any).tradeIn?.success?.title || 'Request Submitted!'}
                </AnimatedGradientText>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                {(t as any).tradeIn?.success?.message || 'Thank you for your trade-in request. We will review it and contact you soon.'}
              </p>
            </div>

            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20 space-y-4">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-gold-600 mt-1 flex-shrink-0" />
                <div className={cn('text-left', isRTL && 'text-right')}>
                  <p className="font-semibold mb-1">{(t as any).tradeIn?.success?.emailTitle || 'Email Confirmation'}</p>
                  <p className="text-gray-400">
                    {(t as any).tradeIn?.success?.emailMessage || 'A confirmation email has been sent to your email address.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-gold-600 mt-1 flex-shrink-0" />
                <div className={cn('text-left', isRTL && 'text-right')}>
                  <p className="font-semibold mb-1">{(t as any).tradeIn?.success?.reviewTitle || 'Review Process'}</p>
                  <p className="text-gray-400">
                    {(t as any).tradeIn?.success?.reviewMessage || 'We typically review requests within 24-48 hours. You will be contacted via email or phone.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <div className={cn('text-center mb-16', isRTL && 'text-right')}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-sm font-semibold mb-4"
          >
            <Smartphone className="w-4 h-4" />
            <span>{(t as any).tradeIn?.badge || 'iPhone Trade-In'}</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
            <AnimatedGradientText className="text-4xl md:text-5xl">
              {(t as any).tradeIn?.title || 'Trade In Your'}
            </AnimatedGradientText>
            <br />
            <span className="text-obsidian-50">
              {(t as any).tradeIn?.titleHighlight || 'iPhone'}
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {(t as any).tradeIn?.subtitle || 'Get the best value for your iPhone. Fill out the form below and we\'ll get back to you with an offer.'}
          </p>
        </div>
      </ScrollReveal>

      <div className="max-w-4xl mx-auto">
        <div className="bg-black-50 rounded-lg p-8 md:p-12 border border-gold-600/20">
          <TradeInWizard onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <ScrollReveal delay={0.1}>
            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20 text-center h-full flex flex-col items-center justify-start">
              <div className="w-16 h-16 bg-gold-600/10 rounded-full flex items-center justify-center mb-6 flex-shrink-0">
                <Smartphone className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">{(t as any).tradeIn?.info?.step1Title || 'Easy Process'}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {(t as any).tradeIn?.info?.step1Desc || 'Fill out our simple form with your iPhone details'}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20 text-center h-full flex flex-col items-center justify-start">
              <div className="w-16 h-16 bg-gold-600/10 rounded-full flex items-center justify-center mb-6 flex-shrink-0">
                <Mail className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">{(t as any).tradeIn?.info?.step2Title || 'Quick Review'}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {(t as any).tradeIn?.info?.step2Desc || 'We review your request and send you an offer'}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20 text-center h-full flex flex-col items-center justify-start">
              <div className="w-16 h-16 bg-gold-600/10 rounded-full flex items-center justify-center mb-6 flex-shrink-0">
                <Phone className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">{(t as any).tradeIn?.info?.step3Title || 'Get Paid'}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {(t as any).tradeIn?.info?.step3Desc || 'Accept the offer and receive payment'}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

