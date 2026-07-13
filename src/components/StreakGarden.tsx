import { Sprout, Leaf, TreeDeciduous } from "lucide-react";
import type { StreakData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StreakGardenProps {
  streakData: StreakData;
  onWater: () => void;
}

export const StreakGarden = ({ streakData, onWater }: StreakGardenProps) => {
  const { currentStreak, plantStage } = streakData;

  const getPlantIcon = (stage: string, index: number) => {
    const isActive = 
      (stage === 'seedling' && index === 0) ||
      (stage === 'sapling' && index <= 1) ||
      (stage === 'tree' && index <= 2);

    const icons = [
      { Icon: Sprout, color: 'text-zen-secondary/40' },
      { Icon: Leaf, color: 'text-zen-secondary/40' },
      { Icon: TreeDeciduous, color: 'text-zen-secondary/40' }
    ];

    const { Icon, color } = icons[index];
    
    return (
      <Icon 
        className={cn(
          "w-8 h-8 transition-all duration-500",
          isActive ? "text-zen-secondary scale-100" : color + " scale-90"
        )} 
      />
    );
  };

  return (
    <div 
      className="stagger-item glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      style={{ animationDelay: '660ms' }}
      onClick={onWater}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Healing Garden
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentStreak} day{currentStreak !== 1 ? 's' : ''} of growth
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zen-secondary/10">
          {[0, 1, 2].map((index) => (
            <div key={index} className="transition-transform group-hover:scale-110">
              {getPlantIcon(plantStage, index)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zen-muted">
          Keep your streak alive
        </p>
        <button
          className="px-4 py-2 rounded-xl bg-zen-secondary/20 hover:bg-zen-secondary/30 text-zen-secondary text-sm font-medium transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onWater();
          }}
        >
          Water 💧
        </button>
      </div>
    </div>
  );
};
