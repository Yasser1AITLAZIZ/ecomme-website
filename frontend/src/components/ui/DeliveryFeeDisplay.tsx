'use client';

import { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import { deliveryFeesApi } from '@/lib/api/deliveryFees';

interface DeliveryFeeDisplayProps {
  orderTotal?: number;
  className?: string;
  showIcon?: boolean;
}

export function DeliveryFeeDisplay({ 
  orderTotal, 
  className = '',
  showIcon = true 
}: DeliveryFeeDisplayProps) {
  const [defaultFee, setDefaultFee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDefaultFee = async () => {
      try {
        setLoading(true);
        const data = await deliveryFeesApi.getDefaultFee();
        setDefaultFee(data);
      } catch (error) {
        console.error('Failed to load default delivery fee:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDefaultFee();
  }, []);

  if (loading || !defaultFee) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {showIcon && <Truck className="w-4 h-4 text-gold-600" />}
      <span className="text-gray-400">
        À partir de <span className="text-gold-600 font-semibold">{defaultFee.default_display_fee?.toFixed(2) || '10.00'} MAD</span>
        <span className="text-gray-500"> • Délai max 48h</span>
        {defaultFee.free_shipping_threshold > 0 && (
          <span className="text-gold-600"> • Livraison gratuite à partir de {defaultFee.free_shipping_threshold} MAD</span>
        )}
      </span>
    </div>
  );
}

