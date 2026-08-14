'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  BookOpen,
  Bot,
  ChevronDown,
  Flame,
  Heart,
  LogOut,
  Palette,
  PenTool,
  Sparkles,
  Wind,
  Zap,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { authClient } from '@/lib/authClient';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { isZenFocusRoute } from '@/lib/zenFocus';

const NAV_GROUPS = [
  {
    label: 'Wellness',
    items: [
      { href: '/assessment',   label: 'Stress Check',  icon: Activity, description: 'Track your stress levels' },
      { href: '/breathing',    label: 'Breathe',        icon: Wind,     description: 'Breathing exercises' },
      { href: '/meditation',   label: 'Meditate',       icon: Sparkles, description: 'Guided meditation sessions' },
    ],
  },
  {
    label: 'Create',
    items: [
      { href: '/journal',   label: 'Journal',     icon: BookOpen, description: 'Your private journal' },
      { href: '/gratitude', label: 'Gratitude',   icon: Heart,    description: 'Daily gratitude practice' },
      { href: '/art',       label: 'Art',         icon: Palette,  description: 'Mindful mandala creation' },
      { href: '/scribble',  label: 'Scribble',    icon: PenTool,  description: 'Free-form expressive drawing' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { href: '/bubbles',      label: 'Bubbles',      icon: Zap,     description: 'Calming bubble experience' },
      { href: '/burst',        label: 'Burst',        icon: Flame,   description: 'Release stress with bursts' },
      { href: '/innercompass', label: 'Inner Compass', icon: Compass, description: 'Guided self-reflection' },
    ],
  },
] as const;

function AccordionGroup({
  group,
  isOpen,
  onToggle,
  isCollapsed,
}: {
  group: typeof NAV_GROUPS[number];
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const isGroupActive = group.items.some(i => pathname?.startsWith(i.href));

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="h-px w-8 bg-zen-border-soft mb-2" />
        {group.items.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-zen-md transition-colors',
                isActive ? 'text-zen-primary bg-zen-primary-soft' : 'text-zen-fg-muted hover:bg-zen-bg-subtle hover:text-zen-fg'
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-[0.9rem] font-medium rounded-zen-md transition-colors',
          isGroupActive ? 'text-zen-fg font-semibold' : 'text-zen-fg-muted hover:bg-zen-bg-subtle hover:text-zen-fg'
        )}
      >
        <span>{group.label}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1 pl-3 py-1">
              {group.items.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-zen-md transition-colors text-sm',
                      isActive ? 'text-zen-primary bg-zen-primary-soft font-medium' : 'text-zen-fg-muted hover:text-zen-fg hover:bg-zen-bg-subtle'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ZenNavigation() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  // Expanded by default
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Track open accordions. Expand all by default
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Wellness': true,
    'Create': true,
    'Explore': true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSignOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error('Sign out failed', err);
    }
  }, []);

  const displayName = useMemo(() => {
    if (!user) return 'You';
    return user.username ?? user.fullName ?? user.email?.split('@')[0] ?? 'Traveler';
  }, [user]);

  if (isZenFocusRoute(pathname)) return null;

  if (!user) {
    return (
      <nav 
        className="sticky top-0 z-50 h-16 w-full" 
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        aria-label="Main navigation"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group" aria-label="ZenU home">
            <div className="relative h-8 w-8">
              <Image src="/icons/icon-192.jpeg" alt="ZenU Logo" fill className="rounded-full object-cover shadow-zen-subtle" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zen-primary to-zen-secondary opacity-0 blur-md group-hover:opacity-40 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zen-primary to-zen-secondary bg-clip-text text-transparent">
              ZenU
            </span>
          </Link>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/signin"
              className="px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 text-sm font-semibold bg-zen-primary text-white rounded-zen-full hover:bg-zen-primary-hover transition-colors shadow-zen-subtle"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Mobile Top Navbar (Fallback when sidebar is hidden on small screens) */}
      <nav 
        className="md:hidden sticky top-0 z-50 h-16 w-full flex items-center justify-between px-4 shrink-0"
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icons/icon-192.jpeg" alt="ZenU Logo" width={32} height={32} className="rounded-full shadow-zen-subtle" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zen-primary to-zen-secondary bg-clip-text text-transparent">
            ZenU
          </span>
        </Link>
        <button
          onClick={handleSignOut}
          className="text-white/70 hover:text-red-400 p-2 transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </nav>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        className="hidden md:flex flex-col h-full z-40 transition-all duration-300 shrink-0 overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between p-4 h-16 shrink-0 border-b border-white/10">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex items-center gap-3 shrink-0"
              >
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                  <div className="relative h-10 w-10 shrink-0">
                    <Image src="/icons/icon-192.jpeg" alt="ZenU Logo" fill className="rounded-full object-cover shadow-zen-subtle" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zen-primary to-zen-secondary opacity-0 blur-md group-hover:opacity-40 transition-opacity duration-300" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zen-primary to-zen-secondary bg-clip-text text-transparent">
                    ZenU
                  </span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-zen-md text-white/70 hover:bg-white/10 hover:text-white transition-colors mx-auto"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 custom-scrollbar">
          {user ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className={cn(
                  'flex items-center gap-3 rounded-zen-md transition-colors',
                  isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2',
                  pathname === '/' ? 'text-white bg-white/10 font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
                title="Home"
              >
                <Heart className={cn('shrink-0', isCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                {!isCollapsed && <span>Home</span>}
              </Link>

              <Link
                href="/chat"
                className={cn(
                  'flex items-center gap-3 rounded-zen-md transition-colors mb-4',
                  isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2',
                  pathname?.startsWith('/chat') ? 'text-white bg-white/10 font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
                title="Seviyan"
              >
                <Bot className={cn('shrink-0', isCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                {!isCollapsed && <span>Seviyan</span>}
              </Link>

              {NAV_GROUPS.map((group) => (
                <AccordionGroup
                  key={group.label}
                  group={group}
                  isOpen={openGroups[group.label]}
                  onToggle={() => toggleGroup(group.label)}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 px-2">
              {!isCollapsed && <p className="text-sm text-white/50 mb-2">Welcome to ZenU</p>}
              <Link href="/signin" className={cn('flex justify-center px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-zen-md', isCollapsed && 'px-0')}>
                {isCollapsed ? <LogOut className="h-5 w-5 rotate-180" /> : 'Sign in'}
              </Link>
              {!isCollapsed && (
                <Link href="/signup" className="px-4 py-2 text-sm text-center font-semibold bg-zen-primary text-white rounded-zen-md hover:bg-zen-primary-hover shadow-zen-subtle">
                  Get started
                </Link>
              )}
            </div>
          )}
        </div>

        {user && (
          <div className="shrink-0 p-3 border-t border-white/10 overflow-hidden">
            {isCollapsed ? (
              <div className="flex flex-col gap-2 items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zen-primary to-zen-secondary flex items-center justify-center text-white text-sm font-semibold shadow-zen-subtle shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="p-2 rounded-full text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 p-2 rounded-zen-xl bg-white/5 border border-transparent hover:border-white/10 transition-colors w-full">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zen-primary to-zen-secondary flex items-center justify-center text-white text-sm font-semibold shadow-zen-subtle shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-white truncate">{displayName}</span>
                    <span className="text-xs text-white/50 truncate">Student</span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="p-2 shrink-0 rounded-full text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </motion.aside>
    </>
  );
}
