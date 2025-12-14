'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import type { SystemSetting } from '@/lib/api/admin';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (error: any) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    try {
      setSaving(true);
      await adminApi.updateSetting(key, value);
      await loadSettings();
    } catch (error: any) {
      alert('Failed to save setting: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage system settings</p>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{setting.key}</h3>
                {setting.description && (
                  <p className="text-sm text-gray-400 mt-1">{setting.description}</p>
                )}
              </div>
              <button
                onClick={() => handleSave(setting.key, setting.value)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
            <pre className="bg-black-50 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
              {JSON.stringify(setting.value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
