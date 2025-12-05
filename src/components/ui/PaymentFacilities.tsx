'use client';

import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { AnimatedGradientText } from './AnimatedGradientText';
import { Button } from './Button';
import { MagneticButton } from './MagneticButton';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

export function PaymentFacilities() {
  const { t, isRTL } = useI18n();

  // Safe access to translations with fallbacks
  const paymentFacilities = t.home.paymentFacilities || {
    benefit1: 'Easy Approval',
    benefit1Desc: 'Quick and simple application process',
    benefit2: 'Flexible Terms',
    benefit2Desc: 'Choose a plan that fits your budget',
    benefit3: 'No Hidden Fees',
    benefit3Desc: 'Transparent pricing, no surprises',
    title: 'Dream iPhone,',
    titleHighlight: 'Flexible Payment',
    subtitle: 'Your dream device is closer than you think',
    question1: 'Dreaming of the latest iPhone but worried about the price?',
    question2: 'What if you could own it today and pay comfortably over time?',
    description: 'At Primo Store, we understand that your dream iPhone shouldn\'t wait.',
    cta: 'Explore Payment Options',
    ctaSubtext: 'Start your journey to your dream iPhone today',
  };

  const benefits = [
    {
      icon: CheckCircle,
      title: paymentFacilities.benefit1,
      description: paymentFacilities.benefit1Desc,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      icon: CreditCard,
      title: paymentFacilities.benefit2,
      description: paymentFacilities.benefit2Desc,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      icon: Shield,
      title: paymentFacilities.benefit3,
      description: paymentFacilities.benefit3Desc,
      color: 'text-gold-600',
      bgColor: 'bg-gold-600/10',
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(180deg,transparent_0%,rgba(212,175,55,0.05)_50%,transparent_100%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-sm font-semibold mb-6"
              >
                <CreditCard className="w-4 h-4" />
                <span>{paymentFacilities.subtitle}</span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-white">{paymentFacilities.title}</span>
                <br />
                <AnimatedGradientText className="text-4xl md:text-5xl lg:text-6xl">
                  {paymentFacilities.titleHighlight}
                </AnimatedGradientText>
              </h2>
            </div>
          </ScrollReveal>

          {/* Questions Section - Marketing Hook */}
          <ScrollReveal delay={0.2}>
            <div className="mb-12 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={cn(
                  'text-xl md:text-2xl text-gray-300 font-medium',
                  isRTL && 'text-right'
                )}
              >
                <span className="text-gold-600">❓</span> {paymentFacilities.question1}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className={cn(
                  'text-xl md:text-2xl text-gold-600 font-semibold',
                  isRTL && 'text-right'
                )}
              >
                <span className="text-gold-400">💡</span> {paymentFacilities.question2}
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Description */}
          <ScrollReveal delay={0.4}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className={cn(
                'text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed',
                isRTL && 'text-right'
              )}
            >
              {paymentFacilities.description}
            </motion.p>
          </ScrollReveal>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <ScrollReveal key={index} delay={0.1 * index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                    className={cn(
                      'relative h-full min-h-[200px] p-6 rounded-xl border border-gold-600/20 bg-gradient-to-br from-obsidian-900/50 to-obsidian-800/50 backdrop-blur-sm',
                      'hover:border-gold-600/40 transition-all duration-300',
                      'hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]',
                      'flex flex-col'
                    )}
                  >
                    <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-4 flex-shrink-0', benefit.bgColor)}>
                      <Icon className={cn('w-6 h-6', benefit.color)} />
                    </div>
                    <h3 className={cn('text-xl font-bold text-white mb-2 flex-shrink-0', isRTL && 'text-right')}>
                      {benefit.title}
                    </h3>
                    <p className={cn('text-gray-400 text-sm flex-1', isRTL && 'text-right')}>
                      {benefit.description}
                    </p>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* CTA Section */}
          <ScrollReveal delay={0.8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-center"
            >
              <MagneticButton>
                <Link href="/products">
                  <Button variant="primary" size="lg" className="mb-4">
                    {paymentFacilities.cta}
                    <ArrowRight className={cn('w-5 h-5', isRTL ? 'mr-2 rotate-180' : 'ml-2')} />
                  </Button>
                </Link>
              </MagneticButton>
              <p className={cn('text-gray-500 text-sm', isRTL && 'text-right')}>
                {paymentFacilities.ctaSubtext}
              </p>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

