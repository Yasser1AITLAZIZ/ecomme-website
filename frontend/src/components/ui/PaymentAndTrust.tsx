'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, Shield, ArrowRight, Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { AnimatedGradientText } from './AnimatedGradientText';
import { Button } from './Button';
import { MagneticButton } from './MagneticButton';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

export function PaymentAndTrust() {
  const { t, isRTL } = useI18n();
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paymentFacilities = t.home.paymentFacilities;
  const testimonials = [
    {
      id: '1',
      name: t.home.testimonials.testimonial1.name,
      role: t.home.testimonials.testimonial1.role,
      content: t.home.testimonials.testimonial1.content,
      rating: t.home.testimonials.testimonial1.rating,
    },
    {
      id: '2',
      name: t.home.testimonials.testimonial2.name,
      role: t.home.testimonials.testimonial2.role,
      content: t.home.testimonials.testimonial2.content,
      rating: t.home.testimonials.testimonial2.rating,
    },
    {
      id: '3',
      name: t.home.testimonials.testimonial3.name,
      role: t.home.testimonials.testimonial3.role,
      content: t.home.testimonials.testimonial3.content,
      rating: t.home.testimonials.testimonial3.rating,
    },
    {
      id: '4',
      name: t.home.testimonials.testimonial4.name,
      role: t.home.testimonials.testimonial4.role,
      content: t.home.testimonials.testimonial4.content,
      rating: t.home.testimonials.testimonial4.rating,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

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

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const goToTestimonial = (index: number) => {
    setDirection(index > currentTestimonialIndex ? 1 : -1);
    setCurrentTestimonialIndex(index);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(180deg,transparent_0%,rgba(212,175,55,0.05)_50%,transparent_100%)]" />

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        {/* Header */}
        <ScrollReveal>
          <div className={cn('text-center mb-16', isRTL && 'text-right')}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-sm font-semibold mb-6"
            >
              <CreditCard className="w-4 h-4" />
              <span>{paymentFacilities.subtitle}</span>
            </motion.div>

            <h2 className={cn('text-4xl md:text-5xl lg:text-6xl font-bold mb-6', isRTL && 'text-right')}>
              <span className="text-white">{paymentFacilities.title}</span>
              <br />
              <AnimatedGradientText className="text-4xl md:text-5xl lg:text-6xl">
                {paymentFacilities.titleHighlight}
              </AnimatedGradientText>
            </h2>
          </div>
        </ScrollReveal>

        {/* Split Layout: Payment on Left, Testimonials on Right */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Payment Facilities Section */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-8">
              {/* Questions */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={cn('text-lg md:text-xl text-gray-300 font-medium', isRTL && 'text-right')}
                >
                  <span className="text-gold-600">❓</span> {paymentFacilities.question1}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={cn('text-lg md:text-xl text-gold-600 font-semibold', isRTL && 'text-right')}
                >
                  <span className="text-gold-400">💡</span> {paymentFacilities.question2}
                </motion.div>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className={cn('text-base text-gray-400 leading-relaxed', isRTL && 'text-right')}
              >
                {paymentFacilities.description}
              </motion.p>

              {/* Benefits */}
              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                      className={cn(
                        'p-4 rounded-xl border border-gold-600/20 bg-gradient-to-br from-obsidian-900/50 to-obsidian-800/50',
                        'hover:border-gold-600/40 transition-all duration-300',
                        'flex items-start gap-4'
                      )}
                    >
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', benefit.bgColor)}>
                        <Icon className={cn('w-5 h-5', benefit.color)} />
                      </div>
                      <div className={cn('flex-1', isRTL && 'text-right')}>
                        <h3 className={cn('text-lg font-bold text-white mb-1', isRTL && 'text-right')}>
                          {benefit.title}
                        </h3>
                        <p className={cn('text-gray-400 text-sm', isRTL && 'text-right')}>
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="pt-4"
              >
                <MagneticButton>
                  <Link href="/products">
                    <Button variant="primary" size="lg" className="w-full">
                      {paymentFacilities.cta}
                      <ArrowRight className={cn('w-5 h-5', isRTL ? 'mr-2 rotate-180' : 'ml-2')} />
                    </Button>
                  </Link>
                </MagneticButton>
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Testimonials Section */}
          <ScrollReveal delay={0.4}>
            <div className="space-y-6">
              <div className={cn('mb-6', isRTL && 'text-right')}>
                <h3 className={cn('text-2xl md:text-3xl font-bold mb-2', isRTL && 'text-right')}>
                  {t.home.testimonials.title} <span className="text-gold-600">{t.home.testimonials.titleHighlight}</span>
                </h3>
                <p className={cn('text-gray-400', isRTL && 'text-right')}>
                  {t.home.testimonials.subtitle}
                </p>
              </div>

              <div className="relative h-80 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  {testimonials.map((testimonial, index) => {
                    if (index !== currentTestimonialIndex) return null;
                    
                    return (
                      <motion.div
                        key={testimonial.id}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        <GlassCard>
                          <div className="p-6 h-full flex flex-col">
                            <Quote className="w-10 h-10 text-gold-600/50 mb-4" />
                            <p className={cn('text-gray-300 text-base mb-6 italic flex-1', isRTL && 'text-right')}>
                              &ldquo;{testimonial.content}&rdquo;
                            </p>
                            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                              <div className={cn(isRTL && 'text-right')}>
                                <p className="text-white font-semibold">
                                  {testimonial.name}
                                </p>
                                <p className="text-gray-400 text-sm">{testimonial.role}</p>
                              </div>
                              <div className={cn('flex gap-1', isRTL && 'flex-row-reverse')}>
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                  >
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className={cn('flex items-center justify-center gap-4', isRTL && 'flex-row-reverse')}>
                <button
                  onClick={goToPrevious}
                  className="p-2 bg-gold-600/20 hover:bg-gold-600/30 rounded-full transition-colors"
                >
                  {isRTL ? (
                    <ChevronRight className="w-5 h-5 text-gold-600" />
                  ) : (
                    <ChevronLeft className="w-5 h-5 text-gold-600" />
                  )}
                </button>
                
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTestimonial(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        index === currentTestimonialIndex
                          ? 'bg-gold-600 w-8'
                          : 'bg-gray-600 hover:bg-gray-500'
                      )}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNext}
                  className="p-2 bg-gold-600/20 hover:bg-gold-600/30 rounded-full transition-colors"
                >
                  {isRTL ? (
                    <ChevronLeft className="w-5 h-5 text-gold-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gold-600" />
                  )}
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
