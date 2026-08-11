'use client';

import { useEffect, useState } from 'react';
import { getRecommendations } from '@/lib/signals';
import { useRouter } from 'next/navigation';

/*const MODULE_ROUTES: Record<string, string> = {
  breathing_box: '/breathing',
  breathing_478: '/breathing',
  breathing_cyclic: '/breathing',
  journal_gratitude: '/gratitude',
  arts_mandala: '/art',
  arts_scribble: '/scribble',
  meditation_jpmr: '/meditation',
  meditation_imagery: '/meditation',
  meditation_grounding: '/meditation',
  chatbot_seviyan: '/chat',
  bubble_simulation: '/burst',
  inner_compass: '/innercompass',
  healing_garden: '/healing-garden',
};*/

const MODULE_ROUTES: Record<string, string> = {
  breathing: '/breathing',
  mindfulness: '/meditation',
  diary: '/journal',
  journal_gratitude: '/gratitude',
  doodle_dreams: '/art',
  bubble_canvas: '/bubble',
  burst_it_out: '/burst',
  scribble_pad: '/scribble',
  chatbot_seviyan: '/chat',
  healing_garden: '/healing-garden',
  inner_compass: '/innercompass',
};

const STRESS_COLORS: Record<string, string> = {
  high: 'bg-rose-50 border-rose-200 text-rose-700',
  moderate: 'bg-amber-50 border-amber-200 text-amber-700',
  low: 'bg-green-50 border-green-200 text-green-700',
};

export default function AgenticRecommendations() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getRecommendations>>>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getRecommendations().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-purple-50 p-5 h-32 flex items-center justify-center">
        <p className="text-purple-400 text-sm">🐼 Panda is thinking...</p>
      </div>
    );
  }

  if (!data) return null;

  const stressColor = STRESS_COLORS[data.context.stress_level] || STRESS_COLORS.moderate;

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">🤖 Recommended for you right now</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${stressColor}`}>
          {data.context.stress_level} stress · {data.context.time_of_day}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {data.recommendations.map((rec, i) => (
          <button
            key={rec.module_id}
            onClick={() => router.push(MODULE_ROUTES[rec.module_id] || '/')}
            className="text-left p-3 rounded-xl border border-purple-100 bg-purple-50 hover:bg-purple-100 transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-purple-500">#{i + 1}</span>
              <span className="text-xs text-gray-400">{rec.duration_min} min</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
              {rec.name}
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {rec.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-white text-purple-500 border border-purple-200 px-1.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Personalised by ZenU&apos;s agentic AI · Updates daily
      </p>
    </div>
  );
}
