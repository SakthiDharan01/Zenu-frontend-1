'use client';

import { ReactNode } from 'react';
import { ModuleTheme } from '@/lib/moduleThemes';
import LiveBackground from './LiveBackground';

interface Props {
  theme: ModuleTheme;
  children: ReactNode;
}

export default function ModulePage({ theme, children }: Props) {
  return (
    <div
      className="relative min-h-screen"
      style={{
        background: theme.gradient,
        color: theme.textPrimary
      }}
    >
      <LiveBackground theme={theme} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
