'use client';

import { motion } from 'framer-motion';
import { CreditCard, Headphones, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

interface Priority {
  icon: typeof CreditCard;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  delay: number;
}

export function OurPriorities() {
  const { t, isRTL } = useI18n();

  // Using simple, common language
  const priorities: Priority[] = [
    {
      icon: CreditCard,
      title: 'Payment Flexibility',
      description: 'Pay in installments that fit your budget. Easy and flexible payment plans for everyone.',
      color: 'text-gold-600',
      bgColor: 'bg-gold-600/20',
      delay: 0.1,
    },
    {
      icon: Headphones,
      title: 'After-Sales Service',
      description: 'We help you after your purchase. Support and assistance whenever you need it.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      delay: 0.2,
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Only the best products. Quality checked and tested before you buy.',
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      delay: 0.3,
    },
    {
      icon: ShieldCheck,
      title: 'Warranty Included',
      description: 'Your purchase is protected. Full warranty coverage on all products.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
      delay: 0.4,
    },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-obsidian-900 via-obsidian-950 to-obsidian-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.12)_0%,transparent_70%)]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Animated Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>What We Promise</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-white">Our</span>{' '}
              <span className="text-gold-600">Priorities</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Your satisfaction is our main goal. We focus on what matters most to you.
            </p>
          </div>
        </ScrollReveal>

        {/* Priorities Grid - 3D Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {priorities.map((priority, index) => {
            const Icon = priority.icon;
            return (
              <ScrollReveal key={index} delay={priority.delay}>
                <motion.div
                  initial={{ opacity: 0, y: 50, rotateX: -10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: priority.delay,
                    type: 'spring',
                    stiffness: 100,
                  }}
                  whileHover={{
                    y: -12,
                    rotateY: 5,
                    transition: { duration: 0.3 },
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                  }}
                  className="relative group h-full"
                >
                  {/* 3D Card */}
                  <div
                    className={cn(
                      'relative h-full min-h-[280px] p-8 rounded-2xl border border-gold-600/20',
                      'bg-gradient-to-br from-obsidian-900/90 to-obsidian-800/90',
                      'backdrop-blur-sm overflow-hidden flex flex-col',
                      'hover:border-gold-600/40 transition-all duration-300',
                      'hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]'
                    )}
                  >
                    {/* Animated Background Glow */}
                    <motion.div
                      className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity', priority.bgColor)}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0, 0.3, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.2,
                      }}
                    />

                    {/* Icon with 3D Effect */}
                    <motion.div
                      className={cn(
                        'relative z-10 w-16 h-16 rounded-xl flex items-center justify-center mb-6',
                        priority.bgColor,
                        'border border-gold-600/20'
                      )}
                      whileHover={{
                        rotateY: 360,
                        scale: 1.1,
                      }}
                      transition={{
                        duration: 0.6,
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <Icon className={cn('w-8 h-8', priority.color)} />
                      
                      {/* Icon Glow */}
                      <motion.div
                        className={cn('absolute inset-0 rounded-xl blur-md', priority.bgColor)}
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10 flex-1 flex flex-col">
                      <h3 className={cn('text-xl font-bold text-white mb-3', isRTL && 'text-right')}>
                        {priority.title}
                      </h3>
                      <p className={cn('text-gray-400 text-sm leading-relaxed flex-1', isRTL && 'text-right')}>
                        {priority.description}
                      </p>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-gold-600/20 rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 border-b border-l border-gold-600/20 rounded-bl-2xl" />

                    {/* Floating Particles */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={`particle-${i}`}
                        className={cn('absolute rounded-full', priority.bgColor)}
                        style={{
                          width: `${4 + i * 2}px`,
                          height: `${4 + i * 2}px`,
                          left: `${20 + i * 25}%`,
                          top: `${30 + i * 20}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0, 0.6, 0],
                          scale: [0.5, 1.2, 0.5],
                        }}
                        transition={{
                          duration: 2 + i,
                          repeat: Infinity,
                          delay: i * 0.5,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom CTA Message */}
        <ScrollReveal delay={0.6}>
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-block px-8 py-4 bg-gradient-to-r from-gold-600/20 to-gold-500/20 border border-gold-600/30 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(212, 175, 55, 0.2)',
                  '0 0 40px rgba(212, 175, 55, 0.4)',
                  '0 0 20px rgba(212, 175, 55, 0.2)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <p className="text-gold-600 font-semibold text-lg">
                {t.home.priorities?.bottomMessage || 'Your satisfaction is our priority... everywhere in Morocco because we deliver everywhere in Morocco.'}
              </p>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}

