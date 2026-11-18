import React from 'react';

export default function PengaturanLoading() {
  return (
    <div className="flex-1 flex flex-col px-4 pt-4 pb-6 gap-4 animate-shimmer">
      {/* Header skeleton */}
      <div className="py-1">
        <div className="w-24 h-3 bg-app-line/80 rounded-full mb-1.5" />
        <div className="w-40 h-6 bg-app-line rounded-xl" />
      </div>

      {/* Card 1 skeleton */}
      <div className="h-32 rounded-3xl bg-white border border-app-line p-5" />

      {/* Card 2 skeleton */}
      <div className="h-44 rounded-3xl bg-white border border-app-line p-5" />

      {/* Card 3 skeleton */}
      <div className="h-28 rounded-3xl bg-white border border-app-line p-5" />
    </div>
  );
}
