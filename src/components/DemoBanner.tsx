'use client';

import React, { useTransition } from 'react';
import { resetDemoAction } from '@/actions/demo';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function DemoBanner() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  // Sembunyikan banner di halaman login / masuk
  if (pathname === '/masuk') return null;

  const handleReset = () => {
    if (!confirm('Kembalikan semua transaksi ke data contoh awal (6 bulan data realistis)?')) {
      return;
    }
    startTransition(async () => {
      await resetDemoAction();
      router.refresh();
    });
  };

  return (
    <div className="w-full bg-[#1B4332] text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold border-b border-emerald-900/40 select-none">
      <div className="flex items-center gap-1.5 truncate pr-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="font-bold text-emerald-200">Mode Demo:</span>
        <span className="text-white/80 truncate">Bebas uji coba tambah/edit/hapus</span>
      </div>

      <button
        type="button"
        onClick={handleReset}
        disabled={isPending}
        className="px-2 py-0.8 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[10px] font-bold flex items-center gap-1 transition-all touch-press shrink-0 cursor-pointer"
        title="Reset data ke kondisi contoh awal"
      >
        <RotateCcw className={`w-2.5 h-2.5 ${isPending ? 'animate-spin' : ''}`} />
        <span>{isPending ? 'Mereset...' : 'Reset Data'}</span>
      </button>
    </div>
  );
}
