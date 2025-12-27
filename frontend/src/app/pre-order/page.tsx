'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, CheckCircle, Mail, Phone, Clock } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { PreOrderWizard } from '@/components/pre-order/PreOrderWizard';
import { useI18n } from '@/lib/i18n/context';
import { preOrderApi, type PreOrderFormData } from '@/lib/api/preOrder';
import { useToast } from '@/components/ui/Toast';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import { AnimatedGradientText } from '@/components/ui/AnimatedGradientText';
import { cn } from '@/lib/utils/cn';

export default function PreOrderPage() {
  const { t, isRTL } = useI18n();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (data: PreOrderFormData) => {
    setIsSubmitting(true);

    try {
      await preOrderApi.submit(data);
      setIsSuccess(true);
      showToast({
        message: 'Your pre-order request has been submitted successfully!',
        type: 'success',
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      showToast({
        message: errorMessage || 'Failed to submit pre-order request. Please try again.',
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
                  Pre-Order Submitted!
                </AnimatedGradientText>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Thank you for your pre-order request. We will contact you when the device becomes available.
              </p>
            </div>

            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20 space-y-4">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-gold-600 mt-1 flex-shrink-0" />
                <div className={cn('text-left', isRTL && 'text-right')}>
                  <p className="font-semibold mb-1">Email Confirmation</p>
                  <p className="text-gray-400">
                    A confirmation email has been sent to your email address.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-gold-600 mt-1 flex-shrink-0" />
                <div className={cn('text-left', isRTL && 'text-right')}>
                  <p className="font-semibold mb-1">Availability</p>
                  <p className="text-gray-400">
                    We will notify you as soon as the device becomes available for pre-order.
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
            <span>Pre-Order</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
            <AnimatedGradientText className="text-4xl md:text-5xl">
              Pre-Order Your
            </AnimatedGradientText>
            <br />
            <span className="text-obsidian-50">
              Dream Device
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Be among the first to get the latest iPhone or Android devices. Fill out the form below and we'll notify you when it's available.
          </p>
        </div>
      </ScrollReveal>

      <div className="max-w-4xl mx-auto">
        <div className="bg-black-50 rounded-lg p-8 md:p-12 border border-gold-600/20">
          <PreOrderWizard onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <ScrollReveal delay={0.1}>
            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20 text-center h-full flex flex-col items-center justify-start">
              <div className="w-16 h-16 bg-gold-600/10 rounded-full flex items-center justify-center mb-6 flex-shrink-0">
                <Smartphone className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">Easy Pre-Order</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Fill out our simple form with your device preferences
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20 text-center h-full flex flex-col items-center justify-start">
              <div className="w-16 h-16 bg-gold-600/10 rounded-full flex items-center justify-center mb-6 flex-shrink-0">
                <Mail className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">Get Notified</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We'll notify you as soon as the device becomes available
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20 text-center h-full flex flex-col items-center justify-start">
              <div className="w-16 h-16 bg-gold-600/10 rounded-full flex items-center justify-center mb-6 flex-shrink-0">
                <Phone className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">Secure Your Device</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Complete your purchase when notified and secure your device
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

