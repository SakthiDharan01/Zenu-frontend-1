import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { PSSData } from "@/lib/types";

interface PSSCheckProps {
  pssData: PSSData;
}

export const PSSCheck = ({ pssData }: PSSCheckProps) => {
  const router = useRouter();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [remindLater, setRemindLater] = useState(false);

  const handleTakePSS = () => {
    if (pssData.last3WeeksHigh) {
      setShowWarningModal(true);
    } else {
      router.push('/assessment');
    }
  };

  const handleFindSupport = () => {
    // In a real app, this would link to a resources page or external support finder
    window.open('https://findtreatment.samhsa.gov/', '_blank');
    setShowWarningModal(false);
  };

  const handleContinue = () => {
    if (remindLater) console.log('Reminder set for later');
    setShowWarningModal(false);
    router.push('/assessment');
  };

  return (
    <>
      <div 
        className="stagger-item glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
        style={{ animationDelay: '720ms' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zen-accent/20">
              <ClipboardList className="w-6 h-6 text-zen-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Stress Check-In
              </h3>
              <p className="text-sm text-muted-foreground">
                Quick PSS assessment
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Monitor your stress levels with a brief, validated questionnaire. Takes less than 2 minutes.
        </p>

        <Button
          onClick={handleTakePSS}
          className="w-full rounded-xl bg-zen-accent/10 hover:bg-zen-accent/20 text-zen-accent border border-zen-accent/20 hover:border-zen-accent/40 transition-all font-medium"
          variant="outline"
        >
          Take PSS
        </Button>
      </div>

      {/* Warning Modal */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="sm:max-w-lg rounded-3xl glass-card border-zen-accent/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">
              We&apos;re here for you
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed pt-4 text-foreground/80">
              Your recent scores show elevated stress levels for 3+ weeks. While ZenU can support your wellness journey, we recommend speaking with a licensed mental health professional or trusted support person.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-zen-secondary/10 border border-zen-secondary/30 rounded-2xl p-4 my-4">
            <p className="text-sm text-foreground/70 leading-relaxed">
              <strong className="text-foreground">Remember:</strong> Seeking professional help is a sign of strength, not weakness. A therapist can provide personalized support for managing persistent stress.
            </p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="remind-later"
              checked={remindLater}
              onChange={(e) => setRemindLater(e.target.checked)}
              className="rounded border-zen-accent/30 text-zen-accent focus:ring-zen-accent"
            />
            <label htmlFor="remind-later" className="text-sm text-muted-foreground cursor-pointer">
              Remind me later
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleFindSupport}
              className="flex-1 rounded-xl bg-gradient-to-r from-zen-primary to-zen-accent hover:opacity-90 text-white font-medium"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Find local support
            </Button>
            <Button
              onClick={handleContinue}
              variant="outline"
              className="flex-1 rounded-xl border-zen-muted/30 hover:bg-muted"
            >
              Save & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
