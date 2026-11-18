import React from 'react';

export default function AlokasiLoading() {
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

      {/* Profit box skeleton */}
      <div className="h-20 rounded-3xl bg-white border border-app-line p-4" />

      {/* 4 pos form skeleton */}
      <div className="h-72 rounded-3xl bg-white border border-app-line p-5" />

      {/* Target jajan skeleton */}
      <div className="h-28 rounded-3xl bg-white border border-app-line p-5" />
    </div>
  );
}
