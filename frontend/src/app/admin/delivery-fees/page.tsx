'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Calculator, Truck, AlertCircle } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { motion } from 'framer-motion';

interface DeliveryFeeTier {
  min_order: number;
  max_order: number | null;
  fee: number;
}

interface DeliveryFeeSettings {
  default_display_fee: number;
  default_fee_percentage: number;
  min_fee: number;
  max_fee: number;
  free_shipping_threshold: number;
  tiers: DeliveryFeeTier[];
}

export default function AdminDeliveryFeesPage() {
  const [settings, setSettings] = useState<DeliveryFeeSettings>({
    default_display_fee: 10.0,
    default_fee_percentage: 5.0,
    min_fee: 5.0,
    max_fee: 50.0,
    free_shipping_threshold: 500.0,
    tiers: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOrderTotal, setPreviewOrderTotal] = useState<number>(100);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDeliveryFeeSettings();
      // Ensure default_display_fee exists (for backward compatibility)
      setSettings({
        default_display_fee: data.default_display_fee ?? 10.0,
        default_fee_percentage: data.default_fee_percentage ?? 5.0,
        min_fee: data.min_fee ?? 5.0,
        max_fee: data.max_fee ?? 50.0,
        free_shipping_threshold: data.free_shipping_threshold ?? 500.0,
        tiers: (data.tiers || []).map((tier: any) => ({
          min_order: tier.min_order ?? 0,
          max_order: tier.max_order ?? null,
          fee: tier.fee ?? tier.min_fee ?? 10.0, // Support old format with min_fee
        })),
      });
    } catch (error: any) {
      console.error('Failed to load delivery fee settings:', error);
      // Use defaults if not configured
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await adminApi.updateDeliveryFeeSettings(settings);
      alert('Paramètres de frais de livraison enregistrés avec succès !');
    } catch (error: any) {
      setError(error.response?.data?.detail || error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addTier = () => {
    const newTier: DeliveryFeeTier = {
      min_order: 0,
      max_order: 100,
      fee: 10.0,
    };
    setSettings({
      ...settings,
      tiers: [...settings.tiers, newTier],
    });
  };

  const removeTier = (index: number) => {
    setSettings({
      ...settings,
      tiers: settings.tiers.filter((_, i) => i !== index),
    });
  };

  const updateTier = (index: number, field: keyof DeliveryFeeTier, value: number | null) => {
    const updatedTiers = [...settings.tiers];
    updatedTiers[index] = {
      ...updatedTiers[index],
      [field]: value,
    };
    setSettings({
      ...settings,
      tiers: updatedTiers,
    });
  };

  const calculatePreview = () => {
    const orderTotal = previewOrderTotal;
    const freeThreshold = settings.free_shipping_threshold;

      if (orderTotal >= freeThreshold) {
      setPreviewResult({
        fee: 0,
        is_free: true,
        reason: `Livraison gratuite (commande ≥ ${freeThreshold} MAD)`,
      });
      return;
    }

    // Find applicable tier
    let applicableTier = null;
    for (const tier of settings.tiers) {
      const minOrder = tier.min_order;
      const maxOrder = tier.max_order;

      if (maxOrder === null) {
        if (orderTotal >= minOrder) {
          applicableTier = tier;
          break;
        }
      } else {
        if (orderTotal >= minOrder && orderTotal < maxOrder) {
          applicableTier = tier;
          break;
        }
      }
    }

    if (applicableTier) {
      setPreviewResult({
        fee: applicableTier.fee.toFixed(2),
        is_free: false,
        reason: `Tranche: ${applicableTier.min_order}-${applicableTier.max_order ?? '∞'} MAD`,
      });
    } else {
      // Use default display fee
      setPreviewResult({
        fee: settings.default_display_fee.toFixed(2),
        is_free: false,
        reason: `Par défaut: ${settings.default_display_fee} MAD`,
      });
    }
  };

  useEffect(() => {
    if (previewOrderTotal > 0) {
      calculatePreview();
    }
  }, [previewOrderTotal, settings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Chargement des paramètres de frais de livraison...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Frais de Livraison</h1>
        <p className="text-gray-400">Configurez les frais de livraison en fonction de la taille de la commande</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold-600" />
              Paramètres Généraux
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frais d'Affichage par Défaut (MAD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.default_display_fee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      default_display_fee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-black-50 border border-gold-600/20 rounded-lg text-white focus:outline-none focus:border-gold-600/50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Montant affiché sur les pages publiques (ex: "À partir de X MAD")
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frais Minimum (MAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.min_fee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        min_fee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 bg-black-50 border border-gold-600/20 rounded-lg text-white focus:outline-none focus:border-gold-600/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frais Maximum (MAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.max_fee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        max_fee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 bg-black-50 border border-gold-600/20 rounded-lg text-white focus:outline-none focus:border-gold-600/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Seuil de Livraison Gratuite (MAD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.free_shipping_threshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      free_shipping_threshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-black-50 border border-gold-600/20 rounded-lg text-white focus:outline-none focus:border-gold-600/50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Les commandes au-dessus de ce montant bénéficient de la livraison gratuite
                </p>
              </div>
            </div>
          </div>

          {/* Tiered Configuration */}
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Tarification par Tranches</h2>
              <button
                onClick={addTier}
                className="flex items-center gap-2 px-4 py-2 bg-gold-600/20 hover:bg-gold-600/30 text-gold-600 rounded-lg border border-gold-600/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter une Tranche
              </button>
            </div>

            {settings.tiers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Aucune tranche configurée. Ajoutez une tranche pour définir des frais différents selon la taille de la commande.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.tiers.map((tier, index) => (
                  <div
                    key={index}
                    className="bg-black-50 rounded-lg p-4 border border-gold-600/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gold-600">Tranche {index + 1}</h3>
                      <button
                        onClick={() => removeTier(index)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Commande Min (MAD)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tier.min_order}
                          onChange={(e) =>
                            updateTier(index, 'min_order', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 bg-black-100 border border-gold-600/20 rounded-lg text-white text-sm focus:outline-none focus:border-gold-600/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Commande Max (MAD) <span className="text-gray-600">(laisser vide pour ∞)</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tier.max_order ?? ''}
                          onChange={(e) =>
                            updateTier(
                              index,
                              'max_order',
                              e.target.value === '' ? null : parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="∞"
                          className="w-full px-3 py-2 bg-black-100 border border-gold-600/20 rounded-lg text-white text-sm focus:outline-none focus:border-gold-600/50"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Frais Fixe (MAD)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tier.fee}
                          onChange={(e) =>
                            updateTier(index, 'fee', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 bg-black-100 border border-gold-600/20 rounded-lg text-white text-sm focus:outline-none focus:border-gold-600/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Les frais doivent diminuer progressivement (ex: 10 MAD, 8 MAD, 5 MAD)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gold-600 hover:bg-gold-700 text-white rounded-lg disabled:opacity-50 transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Enregistrement...' : 'Enregistrer les Paramètres'}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-gold-600" />
              Aperçu des Frais
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total de la Commande (MAD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={previewOrderTotal}
                  onChange={(e) => setPreviewOrderTotal(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-black-50 border border-gold-600/20 rounded-lg text-white focus:outline-none focus:border-gold-600/50"
                />
              </div>

              {previewResult && (
                <div className="bg-black-50 rounded-lg p-4 border border-gold-600/20">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Frais de Livraison:</span>
                      <span
                        className={`text-xl font-bold ${
                          previewResult.is_free ? 'text-green-400' : 'text-gold-600'
                        }`}
                      >
                        {previewResult.is_free ? 'GRATUIT' : `${previewResult.fee} MAD`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{previewResult.reason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

