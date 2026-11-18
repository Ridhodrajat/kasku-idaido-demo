import React from 'react';
import { StatusKuota } from '@/lib/hitung';
import { CheckCircle2, AlertTriangle, Flame } from 'lucide-react';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: StatusKuota;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (status === 'aman') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F8EE] text-status-aman border border-status-aman/20',
          className
        )}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Aman</span>
      </span>
    );
  }

  if (status === 'menipis') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-status-menipis border border-status-menipis/20',
          className
        )}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Menipis</span>
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-status-over border border-status-over/20',
        className
      )}
    >
      <Flame className="w-3.5 h-3.5" />
      <span>Overbudget</span>
    </span>
  );
}
