import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  delay?: number;
}

export const ModuleCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  className,
  delay = 0 
}: ModuleCardProps) => {
  return (
    <div
      className={cn(
        "stagger-item glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 cursor-pointer group",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-zen-primary/20 to-zen-accent/20 mb-4 group-hover:scale-105 transition-transform duration-300">
          <Icon className="w-7 h-7 text-zen-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 mb-4">
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* CTA */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full rounded-xl hover:bg-zen-primary/10 text-zen-primary font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Start
        </Button>
      </div>
    </div>
  );
};
