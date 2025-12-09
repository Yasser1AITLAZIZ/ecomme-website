'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const { t, isRTL } = useI18n();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      showToast({
        message: t.company.contact.form.success,
        type: 'success',
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.company.contact.title} <span className="text-gold-600">{t.company.contact.titleHighlight}</span>
          </h1>
          <p className="text-xl text-gray-400">{t.company.contact.subtitle}</p>
        </div>
      </ScrollReveal>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <ScrollReveal delay={0.1}>
          <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
            <h2 className="text-2xl font-bold mb-6">{t.company.contact.form.send}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.company.contact.form.name}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-gold-600/30 rounded-lg text-white focus:outline-none focus:border-gold-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.company.contact.form.email}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-gold-600/30 rounded-lg text-white focus:outline-none focus:border-gold-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.company.contact.form.phone}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-gold-600/30 rounded-lg text-white focus:outline-none focus:border-gold-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.company.contact.form.subject}</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-gold-600/30 rounded-lg text-white focus:outline-none focus:border-gold-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.company.contact.form.message}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 bg-black border border-gold-600/30 rounded-lg text-white focus:outline-none focus:border-gold-600 resize-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? t.company.contact.form.sending : t.company.contact.form.send}
                <Send className={isRTL ? 'w-5 h-5 mr-2 rotate-180' : 'w-5 h-5 ml-2'} />
              </Button>
            </form>
          </div>
        </ScrollReveal>

        {/* Contact Information */}
        <ScrollReveal delay={0.2}>
          <div className="space-y-6">
            <div className="bg-black-50 rounded-lg p-8 border border-gold-600/20">
              <h2 className="text-2xl font-bold mb-6">{t.company.contact.info.title}</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-gold-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">{t.company.contact.info.address}</p>
                    <p className="text-gray-400">{t.company.contact.info.addressValue}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-gold-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">{t.company.contact.info.phone}</p>
                    <p className="text-gray-400">+212 XXX XXX XXX</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-gold-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">{t.company.contact.info.email}</p>
                    <p className="text-gray-400">contact@primostore.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-gold-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">{t.company.contact.info.hours}</p>
                    <p className="text-gray-400">Monday - Friday: 9:00 AM - 8:00 PM</p>
                    <p className="text-gray-400">Saturday - Sunday: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

