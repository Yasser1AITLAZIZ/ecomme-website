'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { useI18n } from '@/lib/i18n/context';

export default function AdminPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, isAuthenticated, login, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        setLoading(true);
        
        // If not authenticated, redirect to login
        if (!isAuthenticated || !token) {
          router.push('/login?redirect=/admin/dashboard');
          return;
        }

        // Refresh user data to get latest role
        try {
          const updatedUser = await authApi.getCurrentUser(token);
          
          // Update user in store with latest data (including role)
          if (updatedUser.role !== user?.role) {
            login(updatedUser, token);
          }

          // Check if user is admin
          if (updatedUser.role !== 'admin') {
            setError('Access denied. Admin role required.');
            setTimeout(() => {
              router.push('/');
            }, 3000);
            return;
          }

          // Redirect to dashboard
          router.replace('/admin/dashboard');
        } catch (err: any) {
          console.error('Failed to refresh user data:', err);
          // If refresh fails, check current user role
          if (user?.role !== 'admin') {
            setError('Access denied. Please log out and log back in to refresh your permissions.');
            setTimeout(() => {
              router.push('/');
            }, 5000);
            return;
          }
          router.replace('/admin/dashboard');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkAndRedirect();
  }, [router, isAuthenticated, user, token, login]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black-900">
        <div className="text-center">
          <div className="text-gray-400 mb-4">Loading admin dashboard...</div>
          <div className="text-sm text-gray-500">Checking permissions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black-900">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4 text-lg font-semibold">{error}</div>
          <div className="text-gray-400 text-sm">
            {error.includes('log out') && (
              <div className="space-y-2">
                <p>Your account has been updated to admin, but your current session needs to be refreshed.</p>
                <p>Please log out and log back in to access the admin dashboard.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-black-900">
      <div className="text-gray-400">{t.common.redirectingToDashboard}</div>
    </div>
  );
}
