'use client';

import { motion } from 'framer-motion';
import { Users, ShoppingBag, Star, Award } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { GlassCard } from './GlassCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';

export function StatsSection() {
  const { t } = useI18n();

  const stats = [
    {
      icon: Users,
      value: 50000,
      suffix: '+',
      label: t.home.stats.happyCustomers,
      color: 'text-blue-400',
    },
    {
      icon: ShoppingBag,
      value: 100000,
      suffix: '+',
      label: t.home.stats.productsSold,
      color: 'text-gold-600',
    },
    {
      icon: Star,
      value: 4.9,
      suffix: '/5',
      label: t.home.stats.averageRating,
      color: 'text-yellow-400',
      decimals: 1,
    },
    {
      icon: Award,
      value: 15,
      suffix: '+',
      label: t.home.stats.yearsExperience,
      color: 'text-purple-400',
    },
  ];

  return (
    <section className="py-24 bg-obsidian-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.05)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.home.stats.title} <span className="text-gold-600">{t.home.stats.titleHighlight}</span>
            </h2>
            <p className="text-gray-400 text-lg">
              {t.home.stats.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const bgColorClass = {
              'text-blue-400': 'bg-blue-600/20',
              'text-gold-600': 'bg-gold-600/20',
              'text-yellow-400': 'bg-yellow-600/20',
              'text-purple-400': 'bg-purple-600/20',
            }[stat.color] || 'bg-gold-600/20';
            
            return (
              <ScrollReveal key={stat.label} delay={index * 0.1}>
                <GlassCard>
                  <div className="p-6 text-center">
                    <motion.div
                      className={`inline-flex p-4 rounded-full ${bgColorClass} mb-4`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </motion.div>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-white">
                        <AnimatedCounter
                          value={stat.value}
                          suffix={stat.suffix}
                          decimals={stat.decimals || 0}
                        />
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  </div>
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

