'use client';

import { useI18n } from '@/lib/i18n/context';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { MapPin, Clock, Award, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  const { t, isRTL } = useI18n();

  return (
    <div className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.company.about.title} <span className="text-gold-600">{t.company.about.titleHighlight}</span>
          </h1>
          <p className="text-xl text-gray-400">{t.company.about.subtitle}</p>
        </div>
      </ScrollReveal>

      <div className="max-w-4xl mx-auto space-y-16">
        {/* Mission */}
        <ScrollReveal delay={0.1}>
          <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-gold-600" />
              <h2 className="text-2xl font-bold text-gold-600">{t.company.about.mission}</h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">{t.company.about.missionDesc}</p>
          </div>
        </ScrollReveal>

        {/* Vision */}
        <ScrollReveal delay={0.2}>
          <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-gold-600" />
              <h2 className="text-2xl font-bold text-gold-600">{t.company.about.vision}</h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">{t.company.about.visionDesc}</p>
          </div>
        </ScrollReveal>

        {/* Values */}
        <ScrollReveal delay={0.3}>
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">{t.company.about.values}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20 text-center">
                <Award className="w-12 h-12 text-gold-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{t.company.about.quality}</h3>
                <p className="text-gray-400">{t.company.about.qualityDesc}</p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20 text-center">
                <Users className="w-12 h-12 text-gold-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{t.company.about.service}</h3>
                <p className="text-gray-400">{t.company.about.serviceDesc}</p>
              </div>
              <div className="bg-black-50 rounded-lg p-6 border border-gold-600/20 text-center">
                <Zap className="w-12 h-12 text-gold-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{t.company.about.innovation}</h3>
                <p className="text-gray-400">{t.company.about.innovationDesc}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Location & Hours */}
        <ScrollReveal delay={0.4}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-gold-600" />
                <h2 className="text-2xl font-bold">{t.company.about.location}</h2>
              </div>
              <p className="text-gray-300 text-lg">{t.company.about.address}</p>
            </div>
            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-gold-600" />
                <h2 className="text-2xl font-bold">{t.company.about.hours}</h2>
              </div>
              <p className="text-gray-300 mb-2">{t.company.about.weekdays}</p>
              <p className="text-gray-300">{t.company.about.weekend}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

