'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import InnerCompassComponent from '@/components/InnerCompass';
import { trackEngagement } from '@/lib/signals';
import { ZenPage, ZenContainer, ZenButton } from '@/components/zen';

const InnerCompass = () => {
  const router = useRouter();

  useEffect(() => {
    trackEngagement('inner_compass', 'opened');
    const start = Date.now();
    return () => {
      const duration = Math.round((Date.now() - start) / 1000);
      trackEngagement('inner_compass', 'completed', duration);
    };
  }, []);

  return (
    <ZenPage atmosphere="reflect" gradient className="min-h-[calc(100dvh-4rem)]">
      <ZenContainer maxWidth="xl" className="pt-6 pb-8">
        <ZenButton
          variant="glass"
          size="sm"
          className="mb-4"
          onClick={() => router.push('/')}
          aria-label="Return to dashboard"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Home
        </ZenButton>
        <div className="zen-serif">
          <InnerCompassComponent />
        </div>
      </ZenContainer>
    </ZenPage>
  );
};

export default InnerCompass;
