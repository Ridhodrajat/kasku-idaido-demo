import { getDashboardData } from '@/actions/transactions';
import { getCurrentMonthYear } from '@/lib/date';
import { CardToko } from '@/components/CardToko';
import { CardJajan } from '@/components/CardJajan';
import { CardDiagramFinansial } from '@/components/CardDiagramFinansial';
import { MonthSelector } from '@/components/MonthSelector';
import { DashboardRecentTransactions } from '@/components/DashboardRecentTransactions';
import { rupiah } from '@/lib/format';
import Link from 'next/link';
import { Sparkles, PieChart, ChevronRight } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{ bulan?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kasku Idaido</span>
          </div>
          <h1 className="text-xl font-extrabold text-app-text tracking-tight">
            Ringkasan Kas
          </h1>
        </div>

        <MonthSelector selectedMonth={selectedMonth} />
      </header>

      {/* Kartu Toko (Kas Toko Digital) */}
      <CardToko
        saldoKasAktif={data.saldoKasAktif}
        saldoKasBulanIni={data.saldoKasBulanIni}
        profit={data.profit}
        pemasukan={data.pemasukanBulan}
        modal={data.modalBulan}
      />

      {/* Kartu Jajan (Jajan Pribadi Berdua) */}
      <CardJajan
        kuotaJajan={data.kuotaJajan}
        jajanTerpakai={data.jajanBulan}
        sisaKuota={data.sisaKuota}
        status={data.statusKuota}
      />

      {/* Diagram Perbandingan & Analisis Kas */}
      <CardDiagramFinansial
        monthYear={selectedMonth}
        profitBulanIni={data.profit}
        profitKeseluruhan={data.profitKeseluruhan}
        pemasukanBulan={data.pemasukanBulan}
        modalBulan={data.modalBulan}
        jajanBulan={data.jajanBulan}
        pemasukanSemua={data.pemasukanSemua}
        modalSemua={data.modalSemua}
        jajanSemua={data.jajanSemua}
        monthlyTrend={data.monthlyTrend}
      />

      {/* Mini Bar Alokasi Bulanan */}
      <Link
        href={`/alokasi?bulan=${selectedMonth}`}
        prefetch={true}
        className="p-3.5 bg-white rounded-2xl border border-app-line shadow-xs hover:border-aksi/30 transition-all duration-100 touch-press-subtle flex flex-col gap-2 cursor-pointer select-none"
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-app-text">
            <PieChart className="w-4 h-4 text-aksi" />
            <span>Alokasi Profit Bulan Ini</span>
          </div>
          <span className="text-[11px] font-semibold text-aksi flex items-center gap-0.5">
            Atur <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* 4 Pos Alokasi */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="p-2 rounded-xl bg-toko-soft">
            <p className="text-[9px] font-bold text-toko truncate">Pengeluaran</p>
            <p className="text-[11px] font-extrabold text-toko tabular-nums">
              {data.allocation.pct_modal}%
            </p>
            <p className="text-[9px] text-app-muted truncate">
              {rupiah(data.nominalAlokasi.modal)}
            </p>
          </div>

          <div className="p-2 rounded-xl bg-[#EAF2F0]">
            <p className="text-[9px] font-bold text-[#3D665D] truncate">Tabungan</p>
            <p className="text-[11px] font-extrabold text-[#3D665D] tabular-nums">
              {data.allocation.pct_tabungan}%
            </p>
            <p className="text-[9px] text-app-muted truncate">
              {rupiah(data.nominalAlokasi.tabungan)}
            </p>
          </div>

          <div className="p-2 rounded-xl bg-jajan-soft">
            <p className="text-[9px] font-bold text-jajan truncate">Jajan</p>
            <p className="text-[11px] font-extrabold text-jajan tabular-nums">
              {data.allocation.pct_jajan}%
            </p>
            <p className="text-[9px] text-app-muted truncate">
              {rupiah(data.nominalAlokasi.jajan)}
            </p>
          </div>

          <div className="p-2 rounded-xl bg-[#E8F3E8]">
            <p className="text-[9px] font-bold text-[#2A603B] truncate">Sedekah</p>
            <p className="text-[11px] font-extrabold text-[#2A603B] tabular-nums">
              {data.allocation.pct_sedekah}%
            </p>
            <p className="text-[9px] text-app-muted truncate">
              {rupiah(data.nominalAlokasi.sedekah)}
            </p>
          </div>
        </div>
      </Link>

      {/* Transaksi Terbaru */}
      <DashboardRecentTransactions transactions={data.recentTransactions} />
    </div>
  );
}
