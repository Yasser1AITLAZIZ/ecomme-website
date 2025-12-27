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
import { iPhoneModelSelector as ModelSelector, getModelStorageOptions, getModelColors } from './iPhoneModelSelector';
import { ConditionSelector } from './ConditionSelector';
import { PhotoUploader } from './PhotoUploader';
import { optionalPhoneSchema } from '@/lib/validations/phone';
import { cn } from '@/lib/utils/cn';

const tradeInSchema = z.object({
  // Step 1: iPhone Info
  iphone_model: z.string().min(1, 'iPhone model is required'),
  storage_capacity: z.string().min(1, 'Storage capacity is required'),
  color: z.string().optional(),
  
  // Step 2: Condition
  condition: z.string().min(1, 'Condition is required'),
  
  // Step 3: Photos and Details
  photos_urls: z.array(z.string()).default([]),
  imei: z.string().optional(),
  notes: z.string().optional(),
  
  // Step 4: Contact Info
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: optionalPhoneSchema,
});

type TradeInFormData = z.infer<typeof tradeInSchema>;

interface TradeInWizardProps {
  onSubmit: (data: TradeInFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function TradeInWizard({ onSubmit, isSubmitting = false }: TradeInWizardProps) {
  const { t, isRTL } = useI18n();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<TradeInFormData>({
    resolver: zodResolver(tradeInSchema),
    defaultValues: {
      photos_urls: [],
    },
    mode: 'onChange',
  });

  const iphoneModel = watch('iphone_model');
  const storageOptions = iphoneModel ? getModelStorageOptions(iphoneModel) : [];
  const colorOptions = iphoneModel ? getModelColors(iphoneModel) : [];

  const nextStep = async () => {
    let fieldsToValidate: (keyof TradeInFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['iphone_model', 'storage_capacity'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['condition'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['photos_urls'];
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

  const onFormSubmit = async (data: TradeInFormData) => {
    await onSubmit(data);
  };

  const steps = [
    {
      number: 1,
      title: (t as any).tradeIn?.steps?.step1Title || 'iPhone Information',
      description: (t as any).tradeIn?.steps?.step1Desc || 'Select your iPhone model and specifications',
    },
    {
      number: 2,
      title: (t as any).tradeIn?.steps?.step2Title || 'Condition',
      description: (t as any).tradeIn?.steps?.step2Desc || 'Describe the condition of your iPhone',
    },
    {
      number: 3,
      title: (t as any).tradeIn?.steps?.step3Title || 'Photos & Details',
      description: (t as any).tradeIn?.steps?.step3Desc || 'Upload photos and add additional details',
    },
    {
      number: 4,
      title: (t as any).tradeIn?.steps?.step4Title || 'Contact Information',
      description: (t as any).tradeIn?.steps?.step4Desc || 'Enter your contact details',
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
          {/* Step 1: iPhone Information */}
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
                name="iphone_model"
                control={control}
                render={({ field }) => (
                  <ModelSelector
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.iphone_model?.message}
                  />
                )}
              />

              {storageOptions.length > 0 && (
                <Controller
                  name="storage_capacity"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label={(t as any).tradeIn?.form?.storage || 'Storage Capacity'}
                      value={field.value || ''}
                      onChange={field.onChange}
                      options={storageOptions.map((opt) => ({ value: opt, label: opt }))}
                      placeholder={(t as any).tradeIn?.form?.selectStorage || 'Select storage capacity'}
                      error={errors.storage_capacity?.message}
                    />
                  )}
                />
              )}

              {colorOptions.length > 0 && (
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label={(t as any).tradeIn?.form?.color || 'Color (Optional)'}
                      value={field.value || ''}
                      onChange={field.onChange}
                      options={colorOptions.map((opt) => ({ value: opt, label: opt }))}
                      placeholder={(t as any).tradeIn?.form?.selectColor || 'Select color'}
                      error={errors.color?.message}
                    />
                  )}
                />
              )}
            </motion.div>
          )}

          {/* Step 2: Condition */}
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

              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <ConditionSelector
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.condition?.message}
                  />
                )}
              />
            </motion.div>
          )}

          {/* Step 3: Photos and Details */}
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

              <Controller
                name="photos_urls"
                control={control}
                render={({ field }) => (
                  <PhotoUploader
                    photos={field.value || []}
                    onPhotosChange={field.onChange}
                    maxPhotos={5}
                    error={errors.photos_urls?.message}
                  />
                )}
              />

              <Input
                label={(t as any).tradeIn?.form?.imei || 'IMEI (Optional)'}
                placeholder={(t as any).tradeIn?.form?.imeiPlaceholder || 'Enter IMEI number if available'}
                error={errors.imei?.message}
                {...register('imei')}
              />

              <div>
                <label className="block text-sm font-medium text-gold-600 mb-2">
                  {(t as any).tradeIn?.form?.notes || 'Additional Notes (Optional)'}
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
                  placeholder={(t as any).tradeIn?.form?.notesPlaceholder || 'Any additional information about your iPhone...'}
                  {...register('notes')}
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-500">{errors.notes.message}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">{steps[3].title}</h2>
                <p className="text-gray-400">{steps[3].description}</p>
              </div>

              <Input
                label={(t as any).tradeIn?.form?.name || 'Full Name'}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label={(t as any).tradeIn?.form?.email || 'Email Address'}
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    label={(t as any).tradeIn?.form?.phone || 'Phone Number (Optional)'}
                    error={errors.phone?.message}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
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
          {(t as any).tradeIn?.buttons?.previous || 'Previous'}
        </Button>

        {currentStep < totalSteps ? (
          <Button type="button" variant="primary" onClick={nextStep} disabled={isSubmitting}>
            {(t as any).tradeIn?.buttons?.next || 'Next'}
            <ArrowRight className={isRTL ? 'w-5 h-5 mr-2 rotate-180' : 'w-5 h-5 ml-2'} />
          </Button>
        ) : (
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
            {(t as any).tradeIn?.buttons?.submit || 'Submit Request'}
            <Smartphone className={isRTL ? 'w-5 h-5 mr-2' : 'w-5 h-5 ml-2'} />
          </Button>
        )}
      </div>
    </form>
  );
}

