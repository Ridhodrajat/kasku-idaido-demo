import React from 'react';
import { Transaction } from '@/types/database';
import { rupiah } from '@/lib/format';
import { formatTanggalPendek } from '@/lib/date';
import { formatTypeDisplay, isExpenseType, getTransactionNature } from '@/lib/constants';
import { ArrowDownLeft, ArrowUpRight, Coffee, Tag } from 'lucide-react';
import clsx from 'clsx';

interface TransactionItemProps {
  tx: Transaction;
  onEdit?: (tx: Transaction) => void;
}

export function TransactionItem({ tx, onEdit }: TransactionItemProps) {
  const nature = getTransactionNature(tx.type);
  const isPemasukan = nature === 'pemasukan';
  const isPengeluaran = nature === 'pengeluaran';
  const isJajan = nature === 'jajan';
  const isExpense = nature !== 'pemasukan';

  return (
    <div
      onClick={() => onEdit?.(tx)}
      className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-app-line hover:border-aksi/30 transition-all duration-100 touch-press-subtle active:scale-[0.97] active:bg-app-line/30 cursor-pointer shadow-xs select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon */}
        <div
          className={clsx(
            'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0',
            isPemasukan && 'bg-toko-soft text-toko',
            isPengeluaran && 'bg-amber-50 text-amber-600',
            isJajan && 'bg-jajan-soft text-jajan',
            !isPemasukan && !isPengeluaran && !isJajan && 'bg-purple-50 text-aksi'
          )}
        >
          {isPemasukan && <ArrowDownLeft className="w-5 h-5" />}
          {isPengeluaran && <ArrowUpRight className="w-5 h-5" />}
          {isJajan && <Coffee className="w-5 h-5" />}
          {!isPemasukan && !isPengeluaran && !isJajan && <Tag className="w-5 h-5" />}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <p className="text-sm font-bold text-app-text truncate">{tx.category}</p>
          <div className="flex items-center gap-2 text-xs text-app-muted">
            <span>{formatTanggalPendek(tx.date)}</span>
            {tx.notes && (
              <>
                <span>•</span>
                <span className="truncate max-w-[120px] italic">{tx.notes}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0 pl-2">
        <p
          className={clsx(
            'text-sm font-extrabold tabular-nums',
            !isExpense && 'text-toko',
            isPengeluaran && 'text-amber-700',
            isJajan && 'text-jajan',
            isExpense && !isPengeluaran && !isJajan && 'text-purple-700'
          )}
        >
          {isExpense ? '-' : '+'} {rupiah(tx.amount)}
        </p>
        <span className="text-[10px] font-medium text-app-muted">
          {formatTypeDisplay(tx.type)}
        </span>
      </div>
    </div>
  );
}
