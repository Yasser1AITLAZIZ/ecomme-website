'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, login, token } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Check authentication
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/dashboard');
        return;
      }

      // Try to refresh user data to get latest role
      if (token) {
        try {
          const updatedUser = await authApi.getCurrentUser(token);
          // Update store if role changed
          if (updatedUser.role !== user?.role) {
            login(updatedUser, token);
          }
          
          // Check admin role
          if (updatedUser.role !== 'admin') {
            router.push('/');
            return;
          }
        } catch (err) {
          // If refresh fails, check current user role
          if (user?.role !== 'admin') {
            router.push('/');
            return;
          }
        }
      } else if (user?.role !== 'admin') {
        router.push('/');
        return;
      }

      setChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, user, router, login, token]);

  // Show loading while checking
  if (checking || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-black-900">
        <div className="text-gray-400">Checking permissions...</div>
      </div>
    );
  }

  // Show nothing if not admin (will redirect)
  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-black-900 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
