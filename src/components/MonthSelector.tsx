'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getDaftarBulanPilihan } from '@/lib/date';
import { Calendar, ChevronDown } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string;
}

export function MonthSelector({ selectedMonth }: MonthSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const months = getDaftarBulanPilihan(12);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMonth = e.target.value;
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('bulan', nextMonth);
    // Pertahankan pathname saat ini (misal /alokasi atau /riwayat atau /)
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-app-line text-xs font-bold text-app-text shadow-xs hover:border-aksi/30 transition-all cursor-pointer">
        <Calendar className="w-3.5 h-3.5 text-aksi" />
        <select
          value={selectedMonth}
          onChange={handleChange}
          className="appearance-none bg-transparent pr-4 font-bold text-xs text-app-text focus:outline-hidden cursor-pointer"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-app-muted pointer-events-none -ml-3" />
      </div>
    </div>
  );
}
