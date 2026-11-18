'use client';

import React from 'react';
import Link from 'next/link';
import { Transaction } from '@/types/database';
import { TransactionItem } from './TransactionItem';
import { EmptyState } from './EmptyState';
import { useTransactionModal } from './TransactionContext';
import { ArrowRight } from 'lucide-react';

interface DashboardRecentTransactionsProps {
  transactions: Transaction[];
}

export function DashboardRecentTransactions({
  transactions,
}: DashboardRecentTransactionsProps) {
  const { openCatat } = useTransactionModal();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-app-text tracking-tight">
          Transaksi Terbaru
        </h2>
        {transactions.length > 0 && (
          <Link
            href="/riwayat"
            prefetch={true}
            className="text-xs font-semibold text-aksi hover:underline flex items-center gap-1 cursor-pointer touch-press"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {transactions.length === 0 ? (
        <EmptyState onAction={() => openCatat()} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {transactions.map((tx) => (
            <TransactionItem key={tx.id} tx={tx} onEdit={openCatat} />
          ))}
        </div>
      )}
    </div>
  );
}
