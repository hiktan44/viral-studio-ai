'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main
        className={cn(
          'flex-1 min-h-screen transition-all duration-200',
          sidebarCollapsed ? 'ml-16' : 'ml-56'
        )}
      >
        {children}
      </main>
    </div>
  );
}
