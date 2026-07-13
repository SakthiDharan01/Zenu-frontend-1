'use client';
import { useState } from "react";
import { cn } from "@/lib/utils";

type TertiaryEmotion = string;
type SecondaryEmotion = string;
type PrimaryEmotion = "angry" | "disgusted" | "sad" | "happy" | "surprised" | "fearful" | "bad";

interface EmotionData {
  [key: string]: {
    [secondary: string]: TertiaryEmotion[];
  };
}

const emotions: EmotionData = {
  angry: {
    "let down": ["betrayed", "resentful"],
    "humiliated": ["disrespected", "ridiculed"],
    "bitter": ["indignant", "violated"],
    "mad": ["furious", "jealous"],
    "aggressive": ["provoked", "hostile"],
    "frustrated": ["infuriated", "annoyed"],
    "distant": ["withdrawn", "numb"],
    "critical": ["skeptical", "dismissive"]
  },
  disgusted: {
    "disapproving": ["judgmental", "embarrassed"],
    "disappointed": ["appalled", "revolted"],
    "awful": ["nauseated", "detestable"],
    "repelled": ["horrified", "hesitant"]
  },
  sad: {
    "hurt": ["embarrassed", "disappointed"],
    "depressed": ["inferior", "empty"],
    "despair": ["powerless", "grief"],
    "vulnerable": ["fragile", "rejected"],
    "lonely": ["abandoned", "isolated"]
  },
  happy: {
    "optimistic": ["inspired", "hopeful"],
    "intimate": ["playful", "affectionate"],
    "peaceful": ["loving", "content"],
    "powerful": ["courageous", "creative"],
    "accepted": ["respected", "valued"],
    "proud": ["successful", "confident"],
    "interested": ["curious", "inquisitive"],
    "joyful": ["free", "excited"]
  },
  surprised: {
    "startled": ["shocked", "dismayed"],
    "confused": ["disillusioned", "perplexed"],
    "amazed": ["awe", "astonished"],
    "excited": ["eager", "energetic"]
  },
  fearful: {
    "scared": ["helpless", "frightened"],
    "anxious": ["overwhelmed", "worried"],
    "insecure": ["inadequate", "inferior"],
    "weak": ["worthless", "insignificant"],
    "rejected": ["excluded", "persecuted"],
    "threatened": ["nervous", "exposed"]
  },
  bad: {
    "bored": ["indifferent", "apathetic"],
    "busy": ["pressured", "rushed"],
    "stressed": ["overwhelmed", "out of control"],
    "tired": ["sleepy", "unfocused"]
  }
};

const emotionColors: Record<PrimaryEmotion, string> = {
  angry: "from-red-500/20 to-red-600/30",
  disgusted: "from-green-500/20 to-green-600/30",
  sad: "from-blue-500/20 to-blue-600/30",
  happy: "from-yellow-500/20 to-yellow-600/30",
  surprised: "from-purple-500/20 to-purple-600/30",
  fearful: "from-gray-500/20 to-gray-600/30",
  bad: "from-slate-500/20 to-slate-600/30"
};

const emotionBg: Record<PrimaryEmotion, string> = {
  angry: "bg-gradient-to-br from-red-500/5 to-red-600/10",
  disgusted: "bg-gradient-to-br from-green-500/5 to-green-600/10",
  sad: "bg-gradient-to-br from-blue-500/5 to-blue-600/10",
  happy: "bg-gradient-to-br from-yellow-500/5 to-yellow-600/10",
  surprised: "bg-gradient-to-br from-purple-500/5 to-purple-600/10",
  fearful: "bg-gradient-to-br from-gray-500/5 to-gray-600/10",
  bad: "bg-gradient-to-br from-slate-500/5 to-slate-600/10"
};

type ViewState = "primary" | "secondary" | "tertiary" | "complete";

export default function InnerCompass() {
  const [viewState, setViewState] = useState<ViewState>("primary");
  const [selectedPrimary, setSelectedPrimary] = useState<PrimaryEmotion | null>(null);
  const [selectedSecondary, setSelectedSecondary] = useState<SecondaryEmotion | null>(null);
  const [selectedTertiary, setSelectedTertiary] = useState<TertiaryEmotion | null>(null);

  const handlePrimaryClick = (emotion: PrimaryEmotion) => {
    setSelectedPrimary(emotion);
    setSelectedSecondary(null);
    setSelectedTertiary(null);
    setViewState("secondary");
  };

  const handleSecondaryClick = (emotion: SecondaryEmotion) => {
    setSelectedSecondary(emotion);
    setSelectedTertiary(null);
    setViewState("tertiary");
  };

  const handleTertiaryClick = (emotion: TertiaryEmotion) => {
    setSelectedTertiary(emotion);
    setViewState("complete");
  };

  const handleReset = () => {
    setViewState("primary");
    setSelectedPrimary(null);
    setSelectedSecondary(null);
    setSelectedTertiary(null);
  };

  const renderPrimaryEmotions = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl px-4">
      {Object.keys(emotions).map((emotion) => (
        <button
          key={emotion}
          onClick={() => handlePrimaryClick(emotion as PrimaryEmotion)}
          className={cn(
            "relative aspect-square rounded-full",
            "bg-gradient-to-br",
            emotionColors[emotion as PrimaryEmotion],
            "backdrop-blur-sm border border-border/20",
            "transition-all duration-500 ease-out",
            "hover:scale-110 hover:shadow-lg",
            "flex items-center justify-center",
            "group"
          )}
        >
          <span className="text-foreground/80 font-medium text-base sm:text-lg capitalize group-hover:text-foreground transition-colors">
            {emotion}
          </span>
        </button>
      ))}
    </div>
  );

  const renderSecondaryEmotions = () => {
    if (!selectedPrimary) return null;
    const secondaries = Object.keys(emotions[selectedPrimary]);

    return (
      <div className="w-full max-w-4xl px-4 space-y-6">
        <button
          onClick={handleReset}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm mb-4"
        >
          ← back
        </button>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {secondaries.map((secondary) => (
            <button
              key={secondary}
              onClick={() => handleSecondaryClick(secondary)}
              className={cn(
                "relative px-6 py-8 sm:py-12 rounded-2xl",
                "bg-gradient-to-br",
                emotionColors[selectedPrimary],
                "backdrop-blur-sm border border-border/20",
                "transition-all duration-500 ease-out",
                "hover:scale-105 hover:shadow-lg",
                "flex items-center justify-center",
                "group"
              )}
            >
              <span className="text-foreground/80 font-medium text-sm sm:text-base capitalize group-hover:text-foreground transition-colors text-center">
                {secondary}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderTertiaryEmotions = () => {
    if (!selectedPrimary || !selectedSecondary) return null;
    const tertiaries = emotions[selectedPrimary][selectedSecondary];

    return (
      <div className="w-full max-w-4xl px-4 space-y-6">
        <button
          onClick={() => setViewState("secondary")}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm mb-4"
        >
          ← back
        </button>
        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
          {tertiaries.map((tertiary) => (
            <button
              key={tertiary}
              onClick={() => handleTertiaryClick(tertiary)}
              className={cn(
                "relative px-8 py-6 sm:px-12 sm:py-10 rounded-2xl",
                "bg-gradient-to-br",
                emotionColors[selectedPrimary],
                "backdrop-blur-sm border border-border/20",
                "transition-all duration-500 ease-out",
                "hover:scale-105 hover:shadow-lg",
                "flex items-center justify-center",
                "group min-w-[140px] sm:min-w-[180px]"
              )}
            >
              <span className="text-foreground/80 font-medium text-base sm:text-lg capitalize group-hover:text-foreground transition-colors">
                {tertiary}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderComplete = () => {
    if (!selectedTertiary || !selectedPrimary) return null;

    return (
      <div className={cn(
        "w-full h-full flex flex-col items-center justify-center px-4",
        "transition-all duration-1000 ease-out animate-breathe",
        emotionBg[selectedPrimary]
      )}>
        <div className="max-w-2xl text-center space-y-8 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-foreground/90 capitalize tracking-wide">
            {selectedTertiary}
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto px-4">
            You noticed it — that&apos;s enough. Every emotion has something to say and you listened.
          </p>

          <button
            onClick={handleReset}
            className="mt-12 px-8 py-3 rounded-full bg-background/30 backdrop-blur-sm border border-border/30 text-foreground/70 hover:text-foreground hover:bg-background/40 transition-all duration-300 text-sm"
          >
            Return to compass
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient breathing background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5",
        viewState === "complete" ? "animate-breathe opacity-50" : "animate-breathe"
      )} />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen py-12">
        {/* Title */}
        {viewState !== "complete" && (
          <div className="text-center mb-12 sm:mb-16 space-y-2 px-4 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground/90 tracking-wide">
              Inner Compass
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base font-light">
              What&apos;s here right now?
            </p>
          </div>
        )}

        {/* Emotion Views */}
        <div className="flex-1 flex items-center justify-center w-full">
          {viewState === "primary" && renderPrimaryEmotions()}
          {viewState === "secondary" && renderSecondaryEmotions()}
          {viewState === "tertiary" && renderTertiaryEmotions()}
          {viewState === "complete" && renderComplete()}
        </div>
      </div>
    </div>
  );
}
