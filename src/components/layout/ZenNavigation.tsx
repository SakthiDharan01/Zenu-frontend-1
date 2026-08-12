"use client";

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
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
  User,
  Wind,
  Zap,
  Compass
} from 'lucide-react';
import { authClient } from '@/lib/authClient';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { isZenFocusRoute } from '@/lib/zenFocus';

/* ─────────────────────────────────────────────────────────────
   Navigation data
   ───────────────────────────────────────────────────────────── */
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

const springMenu = { type: 'spring' as const, stiffness: 320, damping: 28 };

/* ─────────────────────────────────────────────────────────────
   Dropdown sub-menu
   ───────────────────────────────────────────────────────────── */
function NavDropdown({
  group,
  isOpen,
  onOpen,
  onClose,
}: {
  group: typeof NAV_GROUPS[number];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isGroupActive = group.items.some(i => pathname?.startsWith(i.href));

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        className={cn(
          'flex items-center gap-1 px-3 py-2 min-h-11 text-[0.9rem] font-medium rounded-zen-md',
          'transition-colors duration-100',
          isGroupActive
            ? 'text-zen-primary bg-zen-primary-soft'
            : 'text-zen-fg-muted hover:text-zen-fg hover:bg-zen-bg-subtle',
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? onClose() : onOpen())}
      >
        {group.label}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={springMenu}
            className="absolute top-full left-0 mt-2 w-56 glass-floating rounded-zen-xl overflow-hidden"
            role="menu"
          >
            <div className="p-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={onClose}
                    className={cn(
                      'flex items-start gap-3 w-full px-3 py-2.5 rounded-zen-md',
                      'transition-colors duration-100',
                      active
                        ? 'bg-zen-primary-soft text-zen-primary'
                        : 'text-zen-fg hover:bg-zen-bg-subtle',
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 p-1.5 rounded-zen-sm mt-0.5',
                        active ? 'bg-zen-primary text-white' : 'bg-zen-bg-muted text-zen-fg-muted',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium leading-tight">{item.label}</div>
                      <div className="text-xs text-zen-fg-subtle mt-0.5">{item.description}</div>
                    </div>
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

/* ─────────────────────────────────────────────────────────────
   Avatar dropdown
   ───────────────────────────────────────────────────────────── */
function AvatarDropdown({
  displayName,
  onSignOut,
  loading,
}: {
  displayName: string;
  onSignOut: () => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 pl-1 pr-3 py-1 min-h-11 rounded-full',
          'transition-colors duration-100',
          open ? 'bg-zen-bg-subtle' : 'hover:bg-zen-bg-subtle',
        )}
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zen-primary to-zen-secondary flex items-center justify-center text-white text-sm font-semibold shadow-zen-subtle">
          {initial}
        </div>
        <span className="text-sm font-medium text-zen-fg hidden xl:block max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-zen-fg-muted transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={springMenu}
            className="absolute top-full right-0 mt-2 w-48 glass-floating rounded-zen-xl overflow-hidden z-50"
            role="menu"
            onMouseLeave={() => setOpen(false)}
          >
            <div className="p-3 border-b border-white/60">
              <div className="text-xs text-zen-fg-subtle font-medium uppercase tracking-wider mb-0.5">Signed in as</div>
              <div className="text-sm font-semibold text-zen-fg truncate">{displayName}</div>
            </div>
            <div className="p-1.5">
              <button
                onClick={() => { onSignOut(); setOpen(false); }}
                disabled={loading}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-zen-md text-zen-danger hover:bg-zen-danger-soft transition-colors duration-100 text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ZenNavigation — main export
   ───────────────────────────────────────────────────────────── */
export default function ZenNavigation() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

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

  return (
    <nav
      className="sticky top-0 z-50 h-16 glass border-b border-white/50"
      aria-label="Main navigation"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group" aria-label="ZenU home">
          <div className="relative h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zen-primary to-zen-secondary flex items-center justify-center shadow-zen-subtle">
              <Heart className="h-4 w-4 text-white fill-white" />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zen-primary to-zen-secondary opacity-0 blur-md group-hover:opacity-40 transition-opacity duration-300" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zen-primary to-zen-secondary bg-clip-text text-transparent">
            ZenU
          </span>
        </Link>

        {/* Desktop nav — authenticated only */}
        {user && (
          <div className="hidden md:flex items-center gap-1 flex-1">
            {/* Home */}
            <Link
              href="/"
              className={cn(
                'px-3 py-2 text-[0.9rem] font-medium rounded-zen-md transition-colors duration-100',
                pathname === '/'
                  ? 'text-zen-primary bg-zen-primary-soft'
                  : 'text-zen-fg-muted hover:text-zen-fg hover:bg-zen-bg-subtle',
              )}
            >
              Home
            </Link>

            {/* Group dropdowns */}
            {NAV_GROUPS.map((group) => (
              <NavDropdown
                key={group.label}
                group={group}
                isOpen={openGroup === group.label}
                onOpen={() => setOpenGroup(group.label)}
                onClose={() => setOpenGroup(null)}
              />
            ))}

            {/* Seviyan — top level */}
            <Link
              href="/chat"
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-[0.9rem] font-medium rounded-zen-md transition-colors duration-100',
                pathname?.startsWith('/chat')
                  ? 'text-zen-primary bg-zen-primary-soft'
                  : 'text-zen-fg-muted hover:text-zen-fg hover:bg-zen-bg-subtle',
              )}
            >
              <Bot className="h-4 w-4" />
              Seviyan
            </Link>
          </div>
        )}

        {/* Right slot */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <AvatarDropdown
              displayName={displayName}
              onSignOut={handleSignOut}
              loading={loading}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="px-3 py-1.5 text-sm font-medium text-zen-fg-muted hover:text-zen-fg transition-colors"
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
          )}
        </div>
      </div>
    </nav>
  );
}
