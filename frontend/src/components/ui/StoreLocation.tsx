'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import { Button } from './Button';

export function StoreLocation() {
  const { t, isRTL } = useI18n();

  // Google Maps embed URL for Boulevard Azhar, Azhar, Casablanca
  // Using a search-based embed that works without API key
  const address = 'Boulevard Azhar, Quartier Azhar, Casablanca, Morocco';
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6U4UddhN1U&q=${encodeURIComponent(address)}`;
  
  // Fallback: Simple search-based embed (works without API key)
  const mapEmbedUrlFallback = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  // Direct Google Maps link for directions
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <section className="py-24 bg-obsidian-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.05)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-sm font-semibold mb-4"
            >
              <MapPin className="w-4 h-4" />
              <span>{t.home.location?.badge || 'Visit Our Store'}</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
                {t.home.location?.title || 'Find Us'}
              </span>
              <br />
              <span className="text-obsidian-50">
                {t.home.location?.titleHighlight || 'In Casablanca'}
              </span>
            </h2>
            
            <p className="text-xl text-obsidian-300 max-w-2xl mx-auto">
              {t.home.location?.subtitle || 'Visit our physical store and experience our premium products in person'}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Map */}
          <ScrollReveal direction="left" delay={0.2}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden border border-gold-500/20 shadow-2xl"
            >
              <div className="aspect-[4/3] w-full">
                <iframe
                  src={mapEmbedUrlFallback}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                  title="Primestore Location - Boulevard Azhar, Casablanca"
                />
              </div>
              
              {/* Overlay gradient for better integration */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-obsidian-900/20 to-transparent" />
            </motion.div>
          </ScrollReveal>

          {/* Store Information */}
          <ScrollReveal direction="right" delay={0.3}>
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-obsidian-800/50 backdrop-blur-sm border border-gold-500/20 rounded-xl p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-gold-500/10 rounded-lg">
                    <MapPin className="w-6 h-6 text-gold-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gold-500 mb-2">
                      {t.home.location?.addressTitle || 'Store Address'}
                    </h3>
                    <p className="text-obsidian-200 leading-relaxed">
                      {t.home.location?.address || 'Boulevard Azhar, Quartier Azhar'}
                      <br />
                      <span className="text-obsidian-400">
                        {t.home.location?.city || 'Casablanca, Morocco'}
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Store Hours */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-obsidian-800/50 backdrop-blur-sm border border-gold-500/20 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gold-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-gold-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gold-500 mb-3">
                      {t.home.location?.hoursTitle || 'Opening Hours'}
                    </h3>
                    <div className="space-y-2 text-obsidian-200">
                      <div className="flex justify-between">
                        <span>{t.home.location?.weekdays || 'Monday - Friday'}</span>
                        <span className="text-gold-500 font-semibold">
                          {t.home.location?.weekdaysHours || '9:00 AM - 8:00 PM'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.home.location?.saturday || 'Saturday'}</span>
                        <span className="text-gold-500 font-semibold">
                          {t.home.location?.saturdayHours || '9:00 AM - 7:00 PM'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.home.location?.sunday || 'Sunday'}</span>
                        <span className="text-gold-500 font-semibold">
                          {t.home.location?.sundayHours || '10:00 AM - 6:00 PM'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-obsidian-800/50 backdrop-blur-sm border border-gold-500/20 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gold-500/10 rounded-lg">
                    <Phone className="w-6 h-6 text-gold-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gold-500 mb-2">
                      {t.home.location?.contactTitle || 'Contact Us'}
                    </h3>
                    <p className="text-obsidian-200">
                      {t.home.location?.phone || 'Phone: +212 XXX XXX XXX'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Directions Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="primary" size="lg" className="w-full">
                    <Navigation className={isRTL ? 'w-5 h-5 mr-2' : 'w-5 h-5 ml-2'} />
                    {t.home.location?.getDirections || 'Get Directions'}
                  </Button>
                </a>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

