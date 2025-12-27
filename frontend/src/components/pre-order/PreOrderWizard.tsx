'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Smartphone } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { DeviceSelector } from './DeviceSelector';
import { optionalPhoneSchema } from '@/lib/validations/phone';
import { cn } from '@/lib/utils/cn';

const preOrderSchema = z.object({
  // Step 1: Device Info
  device_type: z.enum(['iphone', 'android']),
  device_model: z.string().min(1, 'Device model is required'),
  storage_capacity: z.string().min(1, 'Storage capacity is required'),
  color: z.string().optional(),
  
  // Step 2: Contact Info
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: optionalPhoneSchema,
  
  // Step 3: Additional Info
  notes: z.string().optional(),
});

type PreOrderFormData = z.infer<typeof preOrderSchema>;

interface PreOrderWizardProps {
  onSubmit: (data: PreOrderFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const colorOptions = ['Black', 'White', 'Blue', 'Green', 'Red', 'Purple', 'Gold', 'Silver'];

export function PreOrderWizard({ onSubmit, isSubmitting = false }: PreOrderWizardProps) {
  const { t, isRTL } = useI18n();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<PreOrderFormData>({
    resolver: zodResolver(preOrderSchema),
    mode: 'onChange',
  });

  const deviceModel = watch('device_model');
  const deviceType = deviceModel?.startsWith('iphone') ? 'iphone' : 'android';

  const nextStep = async () => {
    let fieldsToValidate: (keyof PreOrderFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['device_model', 'storage_capacity'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['name', 'email'];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onFormSubmit = async (data: PreOrderFormData) => {
    await onSubmit({ ...data, device_type: deviceType });
  };

  const steps = [
    {
      number: 1,
      title: 'Device Selection',
      description: 'Select your device model and specifications',
    },
    {
      number: 2,
      title: 'Contact Information',
      description: 'Enter your contact details',
    },
    {
      number: 3,
      title: 'Additional Information',
      description: 'Add any additional notes (optional)',
    },
  ];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1" style={{ minWidth: 0 }}>
              <div className="flex flex-col items-center flex-1 w-full">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0',
                    currentStep > step.number
                      ? 'bg-gold-600 text-black'
                      : currentStep === step.number
                      ? 'bg-gold-600 text-black ring-4 ring-gold-600/30'
                      : 'bg-black-100 text-gray-400 border-2 border-gray-600'
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="text-base">{step.number}</span>
                  )}
                </div>
                <p className={cn('mt-3 text-xs text-center px-1 break-words', currentStep >= step.number ? 'text-white' : 'text-gray-400')}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-3 mt-6 transition-all',
                    currentStep > step.number ? 'bg-gold-600' : 'bg-gray-700'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {/* Step 1: Device Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">{steps[0].title}</h2>
                <p className="text-gray-400">{steps[0].description}</p>
              </div>

              <Controller
                name="device_model"
                control={control}
                render={({ field }) => (
                  <DeviceSelector
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.device_model?.message}
                  />
                )}
              />

              <Controller
                name="storage_capacity"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="Storage Capacity"
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={storageOptions.map((opt) => ({ value: opt, label: opt }))}
                    placeholder="Select storage capacity"
                    error={errors.storage_capacity?.message}
                  />
                )}
              />

              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="Color (Optional)"
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={colorOptions.map((opt) => ({ value: opt, label: opt }))}
                    placeholder="Select color"
                    error={errors.color?.message}
                  />
                )}
              />
            </motion.div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">{steps[1].title}</h2>
                <p className="text-gray-400">{steps[1].description}</p>
              </div>

              <Input
                label="Full Name"
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email Address"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    label="Phone Number (Optional)"
                    error={errors.phone?.message}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </motion.div>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">{steps[2].title}</h2>
                <p className="text-gray-400">{steps[2].description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gold-600 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={4}
                  className={cn(
                    'w-full px-4 py-2 bg-black-100 border rounded-lg',
                    'text-white placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-gold-600 focus:border-transparent',
                    'transition-all duration-200 resize-none',
                    errors.notes ? 'border-red-500 focus:ring-red-500' : 'border-black-300'
                  )}
                  placeholder="Any additional information about your pre-order..."
                  {...register('notes')}
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-500">{errors.notes.message}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className={cn('flex items-center justify-between mt-8 pt-6 border-t border-gold-600/20', isRTL && 'flex-row-reverse')}>
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ArrowLeft className={isRTL ? 'w-5 h-5 ml-2 rotate-180' : 'w-5 h-5 mr-2'} />
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button type="button" variant="primary" onClick={nextStep} disabled={isSubmitting}>
            Next
            <ArrowRight className={isRTL ? 'w-5 h-5 mr-2 rotate-180' : 'w-5 h-5 ml-2'} />
          </Button>
        ) : (
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
            Submit Pre-Order
            <Smartphone className={isRTL ? 'w-5 h-5 mr-2' : 'w-5 h-5 ml-2'} />
          </Button>
        )}
      </div>
    </form>
  );
}

