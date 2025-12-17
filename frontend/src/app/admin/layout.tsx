'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';

// Cache user role check to avoid redundant API calls
let lastRoleCheck: { userId: string; role: string; timestamp: number } | null = null;
const ROLE_CHECK_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, login, token } = useAuthStore();
  const [checking, setChecking] = useState(true);

  // Memoize user role to prevent unnecessary checks
  const userRole = useMemo(() => user?.role, [user?.role]);
  const userId = useMemo(() => user?.id, [user?.id]);

  useEffect(() => {
    const checkAccess = async () => {
      // Check authentication
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/dashboard');
        return;
      }

      // Check if we have a cached role check that's still valid
      const now = Date.now();
      if (
        lastRoleCheck &&
        lastRoleCheck.userId === userId &&
        lastRoleCheck.role === 'admin' &&
        (now - lastRoleCheck.timestamp) < ROLE_CHECK_CACHE_TTL
      ) {
        // Use cached result
        if (userRole !== 'admin') {
          router.push('/');
          return;
        }
        setChecking(false);
        return;
      }

      // Only refresh user data if:
      // 1. We have a token but no user data
      // 2. User role is not admin (might have been updated)
      // 3. Cache is expired
      if (token && (!userRole || userRole !== 'admin')) {
        try {
          const updatedUser = await authApi.getCurrentUser(token);
          // Update cache
          if (updatedUser.id) {
            lastRoleCheck = {
              userId: updatedUser.id,
              role: updatedUser.role,
              timestamp: now,
            };
          }
          
          // Update store if role changed
          if (updatedUser.role !== userRole) {
            login(updatedUser, token);
          }
          
          // Check admin role
          if (updatedUser.role !== 'admin') {
            router.push('/');
            return;
          }
        } catch (err) {
          // If refresh fails, check current user role
          if (userRole !== 'admin') {
            router.push('/');
            return;
          }
        }
      } else if (userRole !== 'admin') {
        router.push('/');
        return;
      } else if (userId) {
        // Update cache with current user
        lastRoleCheck = {
          userId,
          role: userRole,
          timestamp: now,
        };
      }

      setChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, userRole, userId, router, login, token]);

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
      <div className="flex-1 flex flex-col ml-64 overflow-hidden relative">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6" style={{ scrollBehavior: 'smooth' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
