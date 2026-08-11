'use client';
import { useEffect } from "react";
import InnerCompassComponent from "@/components/InnerCompass";
import { trackEngagement } from '@/lib/signals';

const InnerCompass = () => {
  useEffect(() => {
    trackEngagement('inner_compass', 'opened');
    const start = Date.now();
    return () => {
      const duration = Math.round((Date.now() - start) / 1000);
      trackEngagement('inner_compass', 'completed', duration);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Back button */}
      <button
        onClick={() => window.location.href = "/"}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-foreground/70 hover:text-foreground hover:bg-background/90 transition-all duration-300 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Home</span>
      </button>

      {/* Inner Compass Component */}
      <InnerCompassComponent />
    </div>
  );
};

export default InnerCompass;