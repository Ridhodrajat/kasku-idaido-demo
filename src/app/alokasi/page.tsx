import { getDashboardData } from '@/actions/transactions';
import { getCurrentMonthYear } from '@/lib/date';
import { MonthSelector } from '@/components/MonthSelector';
import { AlokasiForm } from '@/components/AlokasiForm';
import { PieChart } from 'lucide-react';

interface AlokasiPageProps {
  searchParams: Promise<{ bulan?: string }>;
}

export default async function AlokasiPage({ searchParams }: AlokasiPageProps) {
  const resolvedParams = await searchParams;
  const currentYm = getCurrentMonthYear();
  const selectedMonth = resolvedParams.bulan || currentYm;

  const data = await getDashboardData(selectedMonth);

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 pb-6 gap-4">
      {/* Top Header */}
      <header className="flex items-center justify-between py-1">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-aksi tracking-wider uppercase">
            <PieChart className="w-3.5 h-3.5" />
            <span>Alokasi Finansial</span>
          </div>
          <h1 className="text-xl font-extrabold text-app-text tracking-tight">
            Alokasi & Evaluasi
          </h1>
        </div>

        <MonthSelector selectedMonth={selectedMonth} />
      </header>

      {/* Form Alokasi */}
      <AlokasiForm
        key={selectedMonth}
        monthYear={selectedMonth}
        profit={data.profit}
        initialAllocation={data.allocation}
      />
    </div>
  );
}
