'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  BarChart3,
  Settings,
  FileText,
  Shield,
  LogOut,
  MessageSquare,
  Truck,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: MessageSquare, label: 'Leads', href: '/admin/leads' },
  { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Truck, label: 'Delivery Fees', href: '/admin/delivery-fees' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
  { icon: FileText, label: 'Audit Logs', href: '/admin/audit' },
  { icon: Shield, label: 'Security', href: '/admin/security' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-black-100/95 backdrop-blur-sm border-r border-gold-600/10 h-screen fixed left-0 top-0 flex flex-col z-20 shadow-xl">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gold-600/10 bg-gradient-to-r from-black-100 to-black-50/50">
        <h1 className="text-2xl font-bold text-gold-600 tracking-tight">Admin Panel</h1>
        <p className="text-sm text-gray-400 mt-1.5">E-commerce Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-600/20 to-gold-600/10 text-gold-600 border border-gold-600/30 shadow-md shadow-gold-600/10'
                      : 'text-gray-400 hover:text-white hover:bg-black-50/50 hover:border-gold-600/10 border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-600 animate-pulse"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gold-600/10 bg-black-50/30">
        <div className="mb-3 px-4 py-3 rounded-lg bg-black-50/50 border border-gold-600/10 hover:border-gold-600/20 transition-colors duration-200">
          <p className="text-xs text-gray-500 mb-1">Logged in as</p>
          <p className="text-white font-semibold text-sm truncate">{user?.name || 'Admin'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
