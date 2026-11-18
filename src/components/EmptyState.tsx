import React from 'react';
import { Receipt, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'Belum Ada Transaksi',
  description = 'Mulai catat pemasukan toko, modal, atau jajan pribadi berdua.',
  actionText = 'Catat Transaksi',
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/70 border border-dashed border-app-line rounded-3xl text-center my-2">
      <div className="w-12 h-12 rounded-2xl bg-aksi/10 text-aksi flex items-center justify-center mb-3">
        <Receipt className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-app-text">{title}</h3>
      <p className="text-xs text-app-muted mt-1 max-w-[240px] leading-relaxed">
        {description}
      </p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-full bg-aksi text-white text-xs font-bold shadow-aksi flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
