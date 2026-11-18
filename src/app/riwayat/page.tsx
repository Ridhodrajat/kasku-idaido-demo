import { fetchTransactions } from '@/lib/db';
import { getCurrentMonthYear } from '@/lib/date';
import { MonthSelector } from '@/components/MonthSelector';
import { RiwayatView } from '@/components/RiwayatView';
import { History } from 'lucide-react';

interface RiwayatPageProps {
  searchParams: Promise<{ bulan?: string }>;
}

export default async function RiwayatPage({ searchParams }: RiwayatPageProps) {
  const resolvedParams = await searchParams;
  const currentYm = getCurrentMonthYear();
  const selectedMonth = resolvedParams.bulan || currentYm;

  const transactions = await fetchTransactions({ monthYear: selectedMonth });

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 pb-6 gap-4">
      {/* Top Header */}
      <header className="flex items-center justify-between py-1">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-aksi tracking-wider uppercase">
            <History className="w-3.5 h-3.5" />
            <span>Catatan Transaksi</span>
          </div>
          <h1 className="text-xl font-extrabold text-app-text tracking-tight">
            Riwayat Kas
          </h1>
        </div>

        <MonthSelector selectedMonth={selectedMonth} />
      </header>

      {/* View Transaksi */}
      <RiwayatView key={selectedMonth} initialTransactions={transactions} />
    </div>
  );
}
