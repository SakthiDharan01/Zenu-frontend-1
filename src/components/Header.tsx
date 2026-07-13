import { useMemo } from "react";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AuthUser } from "@/lib/authClient";

interface HeaderProps {
  user: AuthUser | null;
  streak?: number;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Header = ({ user, streak = 0, onSignIn, onSignOut }: HeaderProps) => {
  const displayName = useMemo(() => {
    if (!user) return "";
    return user.username ?? user.fullName ?? user.email ?? "Traveler";
  }, [user]);

  const avatarFallback = displayName.trim().charAt(0).toUpperCase() || "Z";
  const avatarUrl = useMemo(() => {
    if (!user?.email) return undefined;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email)}`;
  }, [user?.email]);

  return (
    <header className="sticky top-0 z-50 w-full glass-card rounded-2xl mb-8">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-zen-primary to-zen-accent">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-headline font-semibold bg-gradient-to-r from-zen-primary via-zen-accent to-zen-secondary bg-clip-text text-transparent">
            ZenU
          </span>
        </div>

        {/* Progress chip (center) */}
        {user && streak > 0 && (
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <Leaf className="w-4 h-4 text-zen-secondary" />
            <span className="text-sm font-medium">
              {streak} day streak
            </span>
          </div>
        )}

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {user ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onSignOut}
                  className="relative group"
                  aria-label={`Signed in as ${displayName}`}
                >
                  <div className="absolute inset-0 rounded-full border-2 border-zen-primary/40 animate-presence" />
                  <Avatar className="w-10 h-10 border-2 border-white/50 shadow-lg cursor-pointer transition-transform hover:scale-105">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-zen-primary to-zen-accent text-white font-semibold">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hi, {displayName}!</p>
                <p className="text-xs text-muted-foreground">Click to sign out</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onSignIn}
              className="rounded-full border-zen-primary/30 hover:bg-zen-primary/10 hover:border-zen-primary transition-all duration-300"
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
