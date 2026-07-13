import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart } from "lucide-react";

export const Footer = () => {
  const [showAcknowledgement, setShowAcknowledgement] = useState(false);

  return (
    <>
      <footer className="mt-16 mb-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <button
            onClick={() => setShowAcknowledgement(true)}
            className="hover:text-zen-primary transition-colors underline-offset-4 hover:underline"
          >
            About
          </button>
          <span className="text-border">•</span>
          <a href="#" className="hover:text-zen-primary transition-colors underline-offset-4 hover:underline">
            Terms
          </a>
          <span className="text-border">•</span>
          <a href="#" className="hover:text-zen-primary transition-colors underline-offset-4 hover:underline">
            Privacy
          </a>
          <span className="text-border">•</span>
          <button
            onClick={() => setShowAcknowledgement(true)}
            className="hover:text-zen-primary transition-colors underline-offset-4 hover:underline"
          >
            Acknowledgement
          </button>
        </div>
        
        <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-2">
          Made with <Heart className="w-3 h-3 text-zen-accent fill-zen-accent" /> for your wellbeing
        </p>
      </footer>

      {/* Acknowledgement Modal */}
      <Dialog open={showAcknowledgement} onOpenChange={setShowAcknowledgement}>
        <DialogContent className="sm:max-w-lg rounded-3xl glass-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">
              Important Information
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <DialogDescription className="text-base leading-relaxed text-foreground/80">
              ZenU is designed as a supportive wellness tool to help you manage everyday stress and build healthy habits. Our activities are based on evidence-based practices for stress reduction and mindfulness.
            </DialogDescription>

            <div className="bg-zen-peach/10 border border-zen-peach/30 rounded-2xl p-4">
              <p className="text-sm leading-relaxed text-foreground/80">
                <strong className="text-foreground">Please note:</strong> ZenU is not a substitute for professional mental health care. If you&apos;re experiencing persistent or severe stress, anxiety, depression, or other mental health concerns, please seek support from a licensed mental health professional.
              </p>
            </div>

            <DialogDescription className="text-sm leading-relaxed text-foreground/70">
              <strong className="text-foreground">Crisis Support:</strong> If you&apos;re in crisis or having thoughts of self-harm, please contact:
              <ul className="mt-2 ml-4 space-y-1">
                <li>• National Suicide Prevention Lifeline: 988</li>
                <li>• Crisis Text Line: Text HOME to 741741</li>
                <li>• Emergency Services: 911</li>
              </ul>
            </DialogDescription>

            <DialogDescription className="text-sm leading-relaxed text-foreground/70">
              Your wellbeing matters. ZenU is here to support your journey, alongside professional care when needed.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
