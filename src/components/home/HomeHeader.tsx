'use client';

import { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { authClient } from '@/lib/authClient';
import { cn } from '@/lib/utils';

/**
 * Desktop content-area utilities only (notification + avatar).
 * Mobile chrome lives in ZenNavigation (hamburger + logo + bell).
 */
export function HomeHeader({ className }: { className?: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = useMemo(() => {
    const name =
      user?.username ?? user?.fullName ?? user?.email?.split('@')[0] ?? '?';
    return name.charAt(0).toUpperCase();
  }, [user]);

  return (
    <header
      className={cn(
        'hidden md:flex items-center justify-end gap-2 mb-4',
        className,
      )}
    >
      <div className="relative">
        <button
          type="button"
          aria-label="Notifications"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => {
            setOpen((v) => !v);
            setMenuOpen(false);
          }}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-zen-full',
            'text-zen-fg-muted hover:text-zen-fg hover:bg-zen-bg-subtle',
            'transition-colors duration-zen-fast ease-zen-out',
            'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
            'active:scale-[0.97]',
          )}
        >
          <Bell className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
        </button>
        {open ? (
          <div
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-12 z-30 w-64 rounded-zen-xl border border-zen-border-soft bg-zen-surface p-4 shadow-zen-elevated"
          >
            <p className="zen-body-sm text-zen-fg-muted text-center py-2">
              You&apos;re all caught up.
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Account menu"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => {
            setMenuOpen((v) => !v);
            setOpen(false);
          }}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-full',
            'bg-zen-secondary-soft text-zen-secondary text-sm font-semibold',
            'ring-1 ring-zen-border-soft',
            'transition-transform duration-zen-fast ease-zen-out active:scale-[0.97]',
            'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
          )}
        >
          {initial}
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-12 z-30 w-44 rounded-zen-xl border border-zen-border-soft bg-zen-surface py-1 shadow-zen-elevated"
          >
            <button
              type="button"
              role="menuitem"
              className="w-full px-4 py-2.5 text-left zen-body-sm text-zen-fg-muted hover:bg-zen-bg-subtle hover:text-zen-fg"
              onClick={async () => {
                setMenuOpen(false);
                try {
                  await authClient.signOut();
                } catch (err) {
                  console.error('Sign out failed', err);
                }
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
