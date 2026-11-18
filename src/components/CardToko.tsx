import React from 'react';
import { rupiah } from '@/lib/format';
import { Store, TrendingUp, ArrowDownLeft, ArrowUpRight, Wallet, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface CardTokoProps {
  saldoKasAktif: number;
  saldoKasBulanIni: number;
  profit: number;
  pemasukan: number;
  modal: number;
  className?: string;
}

export function CardToko({
  saldoKasAktif,
  saldoKasBulanIni,
  profit,
  pemasukan,
  modal,
  className,
}: CardTokoProps) {
  const isProfitPositive = profit >= 0;
  const isBulanIniPositive = saldoKasBulanIni >= 0;

  return (
    <div
      className={clsx(
        'rounded-3xl p-5 bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white shadow-card relative overflow-hidden',
        className
      )}
    >
      {/* Background soft circle accent */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold tracking-wide uppercase text-white/90">
            Kas Toko Digital
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium bg-black/15 px-2.5 py-0.5 rounded-full text-white/90">
          <TrendingUp className="w-3 h-3" />
          <span>Profit {isProfitPositive ? '+' : ''}{rupiah(profit)}</span>
        </div>
      </div>

      {/* Saldo Kas Aktif (Kumulatif) & Saldo Kas Bulan Ini (2 Kolom) */}
      <div className="grid grid-cols-2 gap-2.5 my-2.5 relative z-10">
        {/* Kolom 1: Saldo Kas Aktif (Kumulatif) */}
        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-white/80">
              <Wallet className="w-3 h-3 text-emerald-200" />
              <span>Saldo Kas Aktif</span>
            </div>
            <p className="text-lg font-extrabold tracking-tight tabular-nums mt-0.5 text-white">
              {rupiah(saldoKasAktif)}
            </p>
          </div>
          <p className="text-[9px] text-emerald-100/70 mt-1.5 font-medium">
            Kumulatif semua waktu
          </p>
        </div>

        {/* Kolom 2: Saldo Kas Bulan Ini Saja */}
        <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-xs border border-white/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-100">
              <Calendar className="w-3 h-3 text-emerald-300" />
              <span>Saldo Kas Bulan Ini</span>
            </div>
            <p className="text-lg font-extrabold tracking-tight tabular-nums mt-0.5 text-white">
              {isBulanIniPositive ? '+' : ''}{rupiah(saldoKasBulanIni)}
            </p>
          </div>
          <p className="text-[9px] text-white/80 mt-1.5 font-medium">
            Khusus bulan ini saja
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/20 my-3 relative z-10" />

      {/* Breakdown Pemasukan vs Modal Bulan Ini */}
      <div className="grid grid-cols-2 gap-2.5 relative z-10 text-xs">
        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-2xl backdrop-blur-xs">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-emerald-200 shrink-0">
            <ArrowDownLeft className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-white/70">Pemasukan</p>
            <p className="font-bold tabular-nums truncate text-white">{rupiah(pemasukan)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-2xl backdrop-blur-xs">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-orange-200 shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-white/70">Pengeluaran Toko</p>
            <p className="font-bold tabular-nums truncate text-white">{rupiah(modal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
