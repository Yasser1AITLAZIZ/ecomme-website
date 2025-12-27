'use client';

import { motion } from 'framer-motion';
import { Star, CheckCircle, AlertCircle, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';

interface Condition {
  value: string;
  label: string;
  description: string;
  icon: typeof Star;
  color: string;
}

const conditions: Condition[] = [
  {
    value: 'excellent',
    label: 'Excellent',
    description: 'Like new, no scratches',
    icon: Star,
    color: 'text-green-500 border-green-500 bg-green-500/10',
  },
  {
    value: 'very_good',
    label: 'Very Good',
    description: 'Few micro-scratches, perfect screen',
    icon: CheckCircle,
    color: 'text-blue-500 border-blue-500 bg-blue-500/10',
  },
  {
    value: 'good',
    label: 'Good',
    description: 'Visible scratches but functional',
    icon: AlertCircle,
    color: 'text-yellow-500 border-yellow-500 bg-yellow-500/10',
  },
  {
    value: 'acceptable',
    label: 'Acceptable',
    description: 'Scratched screen, damaged case but works',
    icon: HelpCircle,
    color: 'text-orange-500 border-orange-500 bg-orange-500/10',
  },
  {
    value: 'damaged',
    label: 'Damaged',
    description: 'Cracked screen or functional issues',
    icon: XCircle,
    color: 'text-red-500 border-red-500 bg-red-500/10',
  },
];

interface ConditionSelectorProps {
  value: string;
  onChange: (condition: string) => void;
  error?: string;
}

export function ConditionSelector({ value, onChange, error }: ConditionSelectorProps) {
  const { t, isRTL } = useI18n();

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gold-600 mb-3">
        {(t as any).tradeIn?.form?.condition || 'Condition'}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {conditions.map((condition) => {
          const Icon = condition.icon;
          const isSelected = value === condition.value;

          return (
            <motion.button
              key={condition.value}
              type="button"
              onClick={() => onChange(condition.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'p-4 rounded-lg border-2 transition-all text-left',
                'flex flex-col gap-2',
                isSelected
                  ? condition.color + ' border-2'
                  : 'border-gold-600/20 hover:border-gold-600/40 bg-black-100',
                error && !isSelected && 'border-red-500/30'
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn('w-5 h-5', isSelected ? condition.color.split(' ')[0] : 'text-gray-400')} />
                <span className={cn('font-semibold', isSelected ? condition.color.split(' ')[0] : 'text-white')}>
                  {(t as any).tradeIn?.conditions?.[condition.value]?.label || condition.label}
                </span>
              </div>
              <p className={cn('text-xs', isSelected ? 'text-gray-300' : 'text-gray-400')}>
                {(t as any).tradeIn?.conditions?.[condition.value]?.description || condition.description}
              </p>
            </motion.button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

