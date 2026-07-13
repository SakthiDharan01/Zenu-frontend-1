import type { ComponentType } from "react";
import { Wind, Circle } from "lucide-react";
import type { BreathingPattern } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface BreathingSelectorProps {
  firstName?: string;
  patterns: BreathingPattern[];
  loading?: boolean;
  onSelectPattern: (pattern: BreathingPattern) => void;
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  box: Circle,
  '4-7-8': Wind,
  '478': Wind
};

const getDisplayIcon = (pattern: BreathingPattern) => {
  if (pattern.id in iconMap) {
    return iconMap[pattern.id]!;
  }

  if (pattern.name.toLowerCase().includes('box')) {
    return Circle;
  }

  return Wind;
};

export const BreathingSelector = ({ firstName, patterns, loading = false, onSelectPattern }: BreathingSelectorProps) => {
  const renderCard = (pattern: BreathingPattern, index: number) => {
    const Icon = getDisplayIcon(pattern);
    return (
      <button
        key={pattern.id}
        type="button"
        className="text-left bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{ transitionDelay: `${index * 60}ms` }}
        onClick={() => onSelectPattern(pattern)}
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-50">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-xs font-medium text-blue-600">
              {pattern.steps.join(' • ')}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">{pattern.name}</h2>
            <p className="text-base text-gray-600">{pattern.description ?? 'A calm, guided rhythm to steady your breath.'}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            ~{pattern.defaultMinutes} min session
          </div>
          <div className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
            {pattern.difficulty ?? 'All levels'}
          </div>
        </div>
      </button>
    );
  };

  const placeholderCards = Array.from({ length: 4 }).map((_, index) => (
    <div key={`loader-${index}`} className="bg-white/80 border border-gray-200 rounded-xl p-6">
      <Skeleton className="h-6 w-24 mb-4" />
      <Skeleton className="h-8 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold mb-2 text-gray-900">Breathing</h1>
          <p className="text-gray-500 mb-4">Choose a practice — 2 min to 15+ min</p>
          <p className="text-sm text-blue-600">Quick session for {firstName || 'you'}</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">{placeholderCards}</div>
        ) : patterns.length ? (
          <div className="grid md:grid-cols-2 gap-6">
            {patterns.map((pattern, index) => renderCard(pattern, index))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-blue-200 rounded-2xl p-8 text-center text-blue-600">
            No breathing practices are available yet. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
};
