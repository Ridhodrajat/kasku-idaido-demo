import React from 'react';

export default function RiwayatLoading() {
  return (
    <div className="flex-1 flex flex-col px-4 pt-4 pb-6 gap-4 animate-shimmer">
      {/* Header skeleton */}
      <div className="flex items-center justify-between py-1">
        <div className="flex flex-col gap-1.5">
          <div className="w-24 h-3 bg-app-line/80 rounded-full" />
          <div className="w-36 h-6 bg-app-line rounded-xl" />
        </div>
        <div className="w-32 h-8 bg-app-line rounded-full" />
      </div>

      {/* Search Bar skeleton */}
      <div className="h-11 rounded-2xl bg-app-line/50" />

      {/* Filter chips skeleton */}
      <div className="flex gap-2">
        <div className="w-16 h-8 rounded-full bg-app-line" />
        <div className="w-24 h-8 rounded-full bg-app-line/60" />
        <div className="w-20 h-8 rounded-full bg-app-line/60" />
      </div>

      {/* Transaction list items skeleton */}
      <div className="flex flex-col gap-2.5 mt-2">
        <div className="w-20 h-3 bg-app-line/70 rounded-full my-1" />
        <div className="h-16 rounded-2xl bg-white border border-app-line/50" />
        <div className="h-16 rounded-2xl bg-white border border-app-line/50" />
        <div className="h-16 rounded-2xl bg-white border border-app-line/50" />
      </div>
    </div>
  );
}
