'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction } from '@/types/database';
import { TransactionModal } from './TransactionModal';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface TransactionContextType {
  openCatat: (tx?: Transaction) => void;
  closeCatat: () => void;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Dukungan untuk shortcut PWA /?catat=1
  useEffect(() => {
    if (searchParams?.get('catat') === '1') {
      setIsOpen(true);
      setEditingTransaction(null);
    }
  }, [searchParams]);

  const openCatat = (tx?: Transaction) => {
    setEditingTransaction(tx || null);
    setIsOpen(true);
  };

  const closeCatat = () => {
    setIsOpen(false);
    setEditingTransaction(null);
    if (searchParams?.get('catat') === '1') {
      router.replace(pathname);
    }
  };

  return (
    <TransactionContext.Provider value={{ openCatat, closeCatat }}>
      {children}
      <TransactionModal
        isOpen={isOpen}
        onClose={closeCatat}
        editingTransaction={editingTransaction}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </TransactionContext.Provider>
  );
}

export function useTransactionModal() {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error('useTransactionModal harus dipakai di dalam TransactionProvider');
  }
  return ctx;
}
