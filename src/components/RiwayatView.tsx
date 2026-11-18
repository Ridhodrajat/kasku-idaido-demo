'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, CustomTransactionType } from '@/types/database';
import { TransactionItem } from './TransactionItem';
import { EmptyState } from './EmptyState';
import { useTransactionModal } from './TransactionContext';
import { formatTanggalGroup } from '@/lib/date';
import { getStoredCustomTypes } from '@/lib/customTypes';
import { Search, X, Plus } from 'lucide-react';
import clsx from 'clsx';

interface RiwayatViewProps {
  initialTransactions: Transaction[];
}

export function RiwayatView({ initialTransactions }: RiwayatViewProps) {
  const { openCatat } = useTransactionModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [customTypes, setCustomTypes] = useState<CustomTransactionType[]>([]);

  useEffect(() => {
    setCustomTypes(getStoredCustomTypes());

    const handleUpdate = () => {
      setCustomTypes(getStoredCustomTypes());
    };
    window.addEventListener('kasku-custom-types-changed', handleUpdate);
    return () => window.removeEventListener('kasku-custom-types-changed', handleUpdate);
  }, []);

  const filtered = useMemo(() => {
    return initialTransactions.filter((tx) => {
      // Filter tipe
      if (selectedType !== 'all') {
        if (selectedType === 'Pengeluaran') {
          if (
            tx.type !== 'Pengeluaran Toko' &&
            tx.type !== 'Modal Toko' &&
            tx.type !== 'Pengeluaran'
          ) {
            return false;
          }
        } else if (selectedType === 'Pemasukan') {
          if (tx.type !== 'Pemasukan Toko' && tx.type !== 'Pemasukan') {
            return false;
          }
        } else if (selectedType === 'Jajan') {
          if (tx.type !== 'Jajan Pribadi' && tx.type !== 'Jajan') {
            return false;
          }
        } else {
          // Tipe kustom
          if (tx.type !== selectedType) {
            return false;
          }
        }
      }

      // Filter search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const catMatch = tx.category.toLowerCase().includes(q);
        const noteMatch = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
        const typeMatch = tx.type.toLowerCase().includes(q);
        if (!catMatch && !noteMatch && !typeMatch) return false;
      }
      return true;
    });
  }, [initialTransactions, selectedType, searchTerm]);

  // Kelompokkan per tanggal
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const groupKey = formatTanggalGroup(tx.date);
      if (!map.has(groupKey)) {
        map.set(groupKey, []);
      }
      map.get(groupKey)!.push(tx);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Daftar filter bawaan + kustom
  const filterList = [
    { label: 'Semua', value: 'all' },
    { label: 'Pemasukan', value: 'Pemasukan' },
    { label: 'Pengeluaran', value: 'Pengeluaran' },
    { label: 'Jajan', value: 'Jajan' },
    ...customTypes.map((c) => ({ label: c.name, value: c.name })),
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-app-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari kategori, tipe, atau catatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-app-line rounded-2xl text-xs font-medium text-app-text focus:outline-hidden focus:ring-2 focus:ring-aksi shadow-xs"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-text"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips Tipe */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {filterList.map((f) => {
          const isSelected = selectedType === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setSelectedType(f.value)}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-100 shrink-0 cursor-pointer touch-press select-none',
                isSelected
                  ? 'bg-app-text text-white shadow-xs'
                  : 'bg-white border border-app-line text-app-muted hover:text-app-text'
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Hasil Riwayat Transaksi */}
      {grouped.length === 0 ? (
        <EmptyState
          title="Tidak Ada Transaksi"
          description={
            searchTerm || selectedType !== 'all'
              ? 'Tidak ada transaksi yang cocok dengan filter atau kata kunci.'
              : 'Belum ada catatan transaksi di bulan ini.'
          }
          actionText="Catat Transaksi"
          onAction={() => openCatat()}
        />
      ) : (
        <div className="flex flex-col gap-4 mt-1">
          {grouped.map(([groupLabel, txList]) => (
            <div key={groupLabel} className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-app-muted px-1 uppercase tracking-wider">
                {groupLabel}
              </h3>
              <div className="flex flex-col gap-2">
                {txList.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} onEdit={openCatat} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
