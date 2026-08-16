'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import ZenNavigation from '@/components/layout/ZenNavigation';
import ZenBottomNav from '@/components/layout/ZenBottomNav';
import { PandaCompanionHost } from '@/components/panda/PandaCompanionHost';
import { PandaNotification } from '@/components/panda/PandaNotification';
import { syncRecommendationAttribution } from '@/lib/recommendationAttribution';

export default function ZenLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!user || !pathname) return;
    syncRecommendationAttribution(pathname);
  }, [user, pathname]);

  if (!user) {
    // Unauthenticated layout (landing page) - Use Top Navbar
    return (
      <div className="flex flex-col min-h-[100dvh]">
        <ZenNavigation />
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Authenticated layout - Use Sidebar on Desktop
  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] md:h-[100dvh] md:overflow-hidden">
      <ZenNavigation />
      <main className="flex-1 min-h-[calc(100dvh-4rem)] md:min-h-0 md:h-full md:overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 relative flex flex-col">
        {children}
      </main>
      <ZenBottomNav />
      <PandaCompanionHost />
      <PandaNotification />
    </div>
  );
}
