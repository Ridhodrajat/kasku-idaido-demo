import React from 'react';

export default function Loading() {
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

      {/* Card Toko skeleton */}
      <div className="h-44 rounded-3xl bg-toko/20 rounded-3xl p-5 flex flex-col justify-between" />

      {/* Card Jajan skeleton */}
      <div className="h-40 rounded-3xl bg-jajan/20 rounded-3xl p-5 flex flex-col justify-between" />

      {/* Card Diagram Finansial skeleton */}
      <div className="h-52 rounded-3xl bg-app-line/50 p-5" />

      {/* Mini allocation bar skeleton */}
      <div className="h-24 rounded-2xl bg-app-line/60 p-4" />

      {/* Recent transactions skeleton */}
      <div className="flex flex-col gap-2.5 mt-2">
        <div className="w-32 h-4 bg-app-line rounded-lg" />
        <div className="h-16 rounded-2xl bg-app-line/40" />
        <div className="h-16 rounded-2xl bg-app-line/40" />
      </div>
    </div>
  );
}
