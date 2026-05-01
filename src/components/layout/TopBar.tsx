'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { Zap, Crown, Bell, PanelLeftClose, PanelLeft } from 'lucide-react';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  showExport?: boolean;
  onExport?: () => void;
}

export function TopBar({ title, subtitle, children, showExport, onExport }: TopBarProps) {
  const { credits, sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <header className="h-14 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-[#1E1E1E] text-gray-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
        {title && (
          <div>
            <h1 className="text-sm font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/pricing"
          className="hidden sm:flex items-center gap-1.5 text-xs bg-[#1E1E1E] border border-[#2A2A2A] rounded-full px-3 py-1.5 hover:border-purple-500/50 transition-colors"
        >
          <span className="text-gray-400">%67 OFF</span>
          <span className="text-white font-medium">Pricing</span>
        </Link>

        <div className="flex items-center gap-1.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-full px-3 py-1.5">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-sm font-medium text-white">{credits}</span>
          <span className="text-xs text-gray-500">Pro</span>
        </div>

        <button className="p-1.5 rounded-lg hover:bg-[#1E1E1E] text-gray-400 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {showExport && (
          <button
            onClick={onExport}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
          >
            Dışa Aktar
          </button>
        )}
      </div>
    </header>
  );
}
