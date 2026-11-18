'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, History, Plus, PieChart, Settings } from 'lucide-react';
import { useTransactionModal } from './TransactionContext';
import clsx from 'clsx';

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openCatat } = useTransactionModal();
  const [activeTab, setActiveTab] = useState(pathname);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  // Sembunyikan bottom nav di halaman login/masuk
  if (pathname === '/masuk') {
    return null;
  }

  const currentBulan = searchParams?.get('bulan');

  const navItems = [
    { label: 'Beranda', href: '/', icon: Home, keepBulan: true },
    { label: 'Riwayat', href: '/riwayat', icon: History, keepBulan: true },
    { label: 'Catat', isAksi: true, icon: Plus },
    { label: 'Alokasi', href: '/alokasi', icon: PieChart, keepBulan: true },
    { label: 'Pengaturan', href: '/pengaturan', icon: Settings, keepBulan: false },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-app-line z-40 px-3 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-safe">
      <div className="flex items-center justify-between">
        {navItems.map((item, idx) => {
          if (item.isAksi) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => openCatat()}
                className="-mt-7 w-14 h-14 rounded-full bg-aksi hover:bg-aksi-hover text-white shadow-aksi flex flex-col items-center justify-center transition-all duration-150 touch-bounce cursor-pointer ring-4 ring-app-bg select-none"
                aria-label="Catat Transaksi"
              >
                <Plus className="w-7 h-7 stroke-[2.8]" />
              </button>
            );
          }

          const isActive = activeTab === item.href;
          const Icon = item.icon;
          const destinationHref =
            item.keepBulan && currentBulan
              ? `${item.href}?bulan=${currentBulan}`
              : item.href!;

          return (
            <Link
              key={item.href}
              href={destinationHref}
              prefetch={true}
              onClick={() => setActiveTab(item.href!)}
              className={clsx(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 touch-press select-none',
                isActive
                  ? 'text-aksi font-bold bg-aksi/10 scale-105'
                  : 'text-app-muted hover:text-app-text'
              )}
            >
              <Icon
                className={clsx(
                  'w-5 h-5 mb-0.5 transition-transform duration-150',
                  isActive ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'
                )}
              />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
