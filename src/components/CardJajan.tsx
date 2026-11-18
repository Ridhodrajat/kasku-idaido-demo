import React from 'react';
import { rupiah } from '@/lib/format';
import { StatusKuota } from '@/lib/hitung';
import { StatusBadge } from './StatusBadge';
import { Coffee, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface CardJajanProps {
  kuotaJajan: number;
  jajanTerpakai: number;
  sisaKuota: number;
  status: StatusKuota;
  className?: string;
}

export function CardJajan({
  kuotaJajan,
  jajanTerpakai,
  sisaKuota,
  status,
  className,
}: CardJajanProps) {
  // Hitung persentase terpakai
  const percentUsed =
    kuotaJajan > 0 ? Math.min(100, Math.round((jajanTerpakai / kuotaJajan) * 100)) : 100;

  return (
    <div
      className={clsx(
        'rounded-3xl p-5 bg-gradient-to-br from-[#606C38] to-[#475528] text-white shadow-card relative overflow-hidden',
        className
      )}
    >
      {/* Background accent */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Coffee className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold tracking-wide uppercase text-white/90">
            Jajan Berdua
          </span>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Sisa Kuota Jajan */}
      <div className="relative z-10 my-2">
        <p className="text-[11px] font-medium text-white/80">Sisa Kuota Jajan Bulan Ini</p>
        <p className="text-3xl font-extrabold tracking-tight tabular-nums mt-0.5">
          {rupiah(sisaKuota)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 my-3">
        <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500',
              status === 'aman'
                ? 'bg-white'
                : status === 'menipis'
                ? 'bg-amber-300'
                : 'bg-red-300'
            )}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Breakdown Kuota vs Terpakai */}
      <div className="flex items-center justify-between text-xs relative z-10 pt-1">
        <div>
          <p className="text-[10px] text-white/70">Terpakai</p>
          <p className="font-bold tabular-nums text-white">{rupiah(jajanTerpakai)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/70">Total Kuota</p>
          <p className="font-bold tabular-nums text-white">{rupiah(kuotaJajan)}</p>
        </div>
      </div>
    </div>
  );
}
