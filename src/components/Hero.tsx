import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Wind, Sparkles } from "lucide-react";
import type { AuthUser } from "@/lib/authClient";

interface HeroProps {
  user: AuthUser | null;
  onStartBreathing: () => void;
  onExploreTools: () => void;
}

export const Hero = ({ user, onStartBreathing, onExploreTools }: HeroProps) => {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(4);

  useEffect(() => {
    const breathingCycle = () => {
      // Inhale: 4s
      setBreathPhase('inhale');
      setBreathCount(4);
      let count = 4;
      
      const inhaleTimer = setInterval(() => {
        count--;
        setBreathCount(count);
        if (count === 0) clearInterval(inhaleTimer);
      }, 1000);

      // Hold: 1s (after 4s)
      setTimeout(() => {
        setBreathPhase('hold');
        setBreathCount(1);
      }, 4000);

      // Exhale: 5s (after 5s total)
      setTimeout(() => {
        setBreathPhase('exhale');
        setBreathCount(5);
        count = 5;
        
        const exhaleTimer = setInterval(() => {
          count--;
          setBreathCount(count);
          if (count === 0) clearInterval(exhaleTimer);
        }, 1000);
      }, 5000);
    };

    breathingCycle();
    const interval = setInterval(breathingCycle, 10000); // Full cycle every 10s
    
    return () => clearInterval(interval);
  }, []);

  const displayName = useMemo(() => {
    if (!user) return null;
    return user.username ?? user.fullName ?? user.email?.split("@")[0] ?? null;
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const phaseText = {
    inhale: "Breathe in",
    hold: "Hold",
    exhale: "Breathe out"
  };

  return (
    <section className="relative overflow-hidden rounded-3xl glass-card p-8 md:p-12 mb-12">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-20 animate-gradient rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--zen-primary)) 0%, hsl(var(--zen-secondary)) 50%, hsl(var(--zen-accent)) 100%)'
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Greeting */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-zen-primary via-zen-accent to-zen-secondary bg-clip-text text-transparent">
          {getGreeting()}{displayName ? `, ${displayName}` : ''}
        </h1>

        {/* Breathing circle */}
        <div className="relative flex items-center justify-center my-12 h-48">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-zen-primary to-zen-accent opacity-30 animate-breathe" />
          </div>
          <div className="relative z-10 text-center">
            <Wind className="w-12 h-12 text-zen-primary mx-auto mb-3" />
            <p className="text-lg font-medium text-foreground">
              {phaseText[breathPhase]}
            </p>
            <p className="text-3xl font-bold text-zen-primary tabular-nums">
              {breathCount}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground mb-3 max-w-xl mx-auto">
          Take a moment to find your calm with a quick breathing session
        </p>

        {/* Mood chip */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zen-peach/20 border border-zen-peach/30 mb-8">
          <span className="text-2xl">😊</span>
          <span className="text-sm font-medium">How do you feel today?</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={onStartBreathing}
            className="rounded-full bg-gradient-to-r from-zen-primary to-zen-accent hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl px-8 text-base font-semibold"
          >
            <Wind className="w-5 h-5 mr-2" />
            Start 3-min breathing
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={onExploreTools}
            className="rounded-full border-zen-accent/30 hover:bg-zen-accent/10 hover:border-zen-accent transition-all duration-300 px-8 text-base"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Explore quick tools
          </Button>
        </div>
      </div>
    </section>
  );
};
