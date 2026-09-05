import React from 'react';

export function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 animate-pulse">
        {items.map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-white/10 rounded"></div>
              <div className="h-7 w-7 bg-white/10 rounded-lg"></div>
            </div>
            <div className="h-7 w-12 bg-white/15 rounded"></div>
            <div className="h-3 w-20 bg-white/5 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-card p-4 animate-pulse space-y-3">
        <div className="h-4 w-40 bg-white/10 rounded mb-4"></div>
        {items.map((_, i) => (
          <div key={i} className="flex justify-between py-2.5 border-b border-white/5">
            <div className="h-4 w-32 bg-white/10 rounded"></div>
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="h-4 w-16 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {items.map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-white/10 rounded-lg"></div>
            <div className="h-5 w-16 bg-white/10 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-48 bg-white/10 rounded"></div>
            <div className="h-3 w-32 bg-white/5 rounded"></div>
          </div>
          <div className="pt-3 border-t border-white/5 flex justify-between">
            <div className="h-3 w-20 bg-white/5 rounded"></div>
            <div className="h-3 w-16 bg-white/5 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
