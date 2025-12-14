'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useI18n } from '@/lib/i18n/context';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useToast } from '@/components/ui/Toast';
import { optionalPhoneSchema } from '@/lib/validations/phone';
import { cn } from '@/lib/utils/cn';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { contactApi } from '@/lib/api/contact';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: optionalPhoneSchema,
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { t, isRTL } = useI18n();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      await contactApi.submit({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
      });
      showToast({
        message: t.company.contact.form.success,
        type: 'success',
      });
      reset();
    } catch (error: any) {
      showToast({
        message: error.response?.data?.detail || 'Failed to submit contact form. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label={t.company.contact.form.name}
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label={t.company.contact.form.email}
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <PhoneInput
                label={t.company.contact.form.phone}
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label={t.company.contact.form.subject}
                error={errors.subject?.message}
                {...register('subject')}
              />
              <div>
                <label className="block text-sm font-medium text-gold-600 mb-2">
                  {t.company.contact.form.message}
                </label>
                <textarea
                  rows={5}
                  className={cn(
                    'w-full px-4 py-2 bg-black-100 border rounded-lg',
                    'text-white placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-gold-600 focus:border-transparent',
                    'transition-all duration-200 resize-none',
                    errors.message ? 'border-red-500 focus:ring-red-500' : 'border-black-300'
                  )}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                )}
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

