'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  Home, Sparkles, LayoutGrid, ImageIcon, Video, User, Music,
  ChevronDown, ChevronRight, Zap, Crown, Settings
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Sparkles, label: 'Agent', href: '/agent' },
  { icon: LayoutGrid, label: 'Board', href: '/board' },
  {
    icon: ImageIcon,
    label: 'Görsel',
    children: [
      { label: 'Metinden Görsel', href: '/image/text-to-image' },
      { label: 'Görsel Düzenleme', href: '/image/edit' },
      { label: 'Inpainting', href: '/image/inpainting' },
      { label: 'Karakter Değişimi', href: '/image/character-swap' },
      { label: 'Yüz Değişimi', href: '/image/face-swap' },
      { label: 'Büyütme (Upscale)', href: '/image/upscale' },
      { label: 'Sanal Deneme', href: '/image/virtual-tryon' },
      { label: 'Ürün Fotoğrafçılığı', href: '/image/product-photography' },
    ],
  },
  {
    icon: Video,
    label: 'Video',
    children: [
      { label: 'Görselden Video', href: '/video/image-to-video' },
      { label: 'Metinden Video', href: '/video/text-to-video' },
      { label: 'Omni Reference', href: '/video/omni-reference' },
      { label: 'Video Büyütme', href: '/video/upscale' },
      { label: 'Hareket Kontrolü', href: '/video/motion-control' },
    ],
  },
  {
    icon: User,
    label: 'Avatar',
    children: [
      { label: 'AI Avatar', href: '/avatar/ai-avatar' },
      { label: 'Ürün Avatarı', href: '/avatar/product-avatar' },
      { label: 'Dudak Senkronizasyonu', href: '/avatar/lip-sync' },
    ],
  },
  {
    icon: Music,
    label: 'Audio',
    children: [
      { label: 'Seslendirme (TTS)', href: '/audio/text-to-speech' },
      { label: 'Ses Klonlama', href: '/audio/voice-clone' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { credits, plan, sidebarCollapsed, toggleSidebar } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isItemActive = (item: NavItem) => {
    if (item.href && pathname === item.href) return true;
    if (item.children) return item.children.some(c => pathname.startsWith(c.href));
    return false;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-[#0A0A0A] border-r border-[#2A2A2A] z-50 flex flex-col transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#2A2A2A]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-white text-sm">ViralStudio</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item) => {
          const isActive = isItemActive(item);
          const isExpanded = expandedItems.includes(item.label);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.label} className="mb-0.5">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-[#1E1E1E] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#1E1E1E]'
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-[#1E1E1E] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#1E1E1E]'
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )}

              {/* Submenu */}
              {hasChildren && isExpanded && !sidebarCollapsed && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block px-3 py-1.5 rounded-md text-sm transition-colors',
                        pathname === child.href
                          ? 'text-purple-400 bg-[#1E1E1E]'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-[#1A1A1A]'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#2A2A2A] p-3 space-y-2">
        {/* Credit badge */}
        {!sidebarCollapsed ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">{credits}</span>
              <span className="text-xs text-gray-500 capitalize">{plan}</span>
            </div>
            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-medium">
              %45 OFF
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
        )}

        {/* Upgrade button */}
        {!sidebarCollapsed && (
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-black text-sm font-semibold hover:from-green-400 hover:to-emerald-400 transition-all green-glow"
          >
            <Crown className="w-4 h-4" />
            Try Unlimited
          </Link>
        )}

        {/* User profile */}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            HT
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">Hikmet T.</p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          )}
          {!sidebarCollapsed && (
            <Settings className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
          )}
        </div>
      </div>
    </aside>
  );
}
