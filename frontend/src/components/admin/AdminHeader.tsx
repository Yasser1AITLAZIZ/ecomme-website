'use client';

import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export function AdminHeader() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 h-16 bg-black-100/95 backdrop-blur-sm border-b border-gold-600/10 flex items-center justify-between px-6 shadow-lg z-30 shrink-0">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 bg-black-50/50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30 focus:bg-black-50 transition-all duration-200 hover:border-gold-600/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2.5 text-gray-400 hover:text-white hover:bg-black-50 rounded-lg transition-all duration-200 group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gold-600/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate max-w-[150px]">{user?.email || ''}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600/30 to-gold-600/10 flex items-center justify-center border border-gold-600/30 shadow-md hover:shadow-gold-600/20 transition-shadow duration-200">
            <span className="text-gold-600 font-semibold text-sm">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
