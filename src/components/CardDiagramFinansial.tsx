'use client';

import React, { useState } from 'react';
import { MonthTrendItem } from '@/lib/hitung';
import { rupiah } from '@/lib/format';
import {
  BarChart3,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Coffee,
  PieChart,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

interface CardDiagramFinansialProps {
  monthYear: string;
  profitBulanIni: number;
  profitKeseluruhan: number;
  pemasukanBulan: number;
  modalBulan: number;
  jajanBulan: number;
  pemasukanSemua: number;
  modalSemua: number;
  jajanSemua: number;
  monthlyTrend: MonthTrendItem[];
  className?: string;
}

type TabMode = 'bulan' | 'semua' | 'tren';

export function CardDiagramFinansial({
  monthYear,
  profitBulanIni,
  profitKeseluruhan,
  pemasukanBulan,
  modalBulan,
  jajanBulan,
  pemasukanSemua,
  modalSemua,
  jajanSemua,
  monthlyTrend,
  className,
}: CardDiagramFinansialProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('bulan');
  const [selectedTrendIdx, setSelectedTrendIdx] = useState<number>(
    monthlyTrend.length - 1
  );

  // Data saat ini sesuai tab yang dipilih
  const isBulan = activeTab === 'bulan';
  const currPemasukan = isBulan ? pemasukanBulan : pemasukanSemua;
  const currModal = isBulan ? modalBulan : modalSemua;
  const currJajan = isBulan ? jajanBulan : jajanSemua;
  const currProfit = isBulan ? profitBulanIni : profitKeseluruhan;
  const totalPengeluaran = currModal + currJajan;

  // Persentase rasio terhadap pemasukan
  const pctModal =
    currPemasukan > 0
      ? Math.min(100, Math.round((currModal / currPemasukan) * 1000) / 10)
      : 0;
  const pctJajan =
    currPemasukan > 0
      ? Math.min(100, Math.round((currJajan / currPemasukan) * 1000) / 10)
      : 0;
  const pctProfit =
    currPemasukan > 0
      ? Math.round((currProfit / currPemasukan) * 1000) / 10
      : 0;

  // Nilai maksimum untuk skala grafik tren 6 bulan
  const maxTrendVal = Math.max(
    1,
    ...monthlyTrend.map((m) => Math.max(m.pemasukan, m.totalPengeluaran))
  );

  const selectedTrend = monthlyTrend[selectedTrendIdx] || monthlyTrend[monthlyTrend.length - 1];

  return (
    <div
      className={clsx(
        'p-5 bg-white rounded-3xl border border-app-line shadow-card flex flex-col gap-4',
        className
      )}
    >
      {/* 1. Header & Segmented Tab */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-aksi flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-app-text">
                Analisis & Diagram Kas
              </h2>
              <p className="text-[11px] text-app-muted">
                Perbandingan arus kas & total profit
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 tabular-nums">
            Margin {pctProfit > 0 ? `+${pctProfit}%` : `${pctProfit}%`}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-1 bg-[#FAF6F0] rounded-2xl border border-app-line text-xs font-bold text-app-muted select-none">
          <button
            type="button"
            onClick={() => setActiveTab('bulan')}
            className={clsx(
              'py-1.5 px-2 rounded-xl text-center transition-all duration-150 touch-press cursor-pointer truncate',
              activeTab === 'bulan'
                ? 'bg-white text-aksi shadow-xs font-extrabold'
                : 'hover:text-app-text'
            )}
          >
            Bulan Ini
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('semua')}
            className={clsx(
              'py-1.5 px-2 rounded-xl text-center transition-all duration-150 touch-press cursor-pointer truncate',
              activeTab === 'semua'
                ? 'bg-white text-aksi shadow-xs font-extrabold'
                : 'hover:text-app-text'
            )}
          >
            Keseluruhan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tren')}
            className={clsx(
              'py-1.5 px-2 rounded-xl text-center transition-all duration-150 touch-press cursor-pointer truncate',
              activeTab === 'tren'
                ? 'bg-white text-aksi shadow-xs font-extrabold'
                : 'hover:text-app-text'
            )}
          >
            Tren 6 Bulan
          </button>
        </div>
      </div>

      {/* 2. Kartu Perbandingan Total Profit (Bulan Ini vs Keseluruhan) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Kolom 1: Profit Bulan Ini */}
        <div
          className={clsx(
            'p-3.5 rounded-2xl border transition-all flex flex-col justify-between',
            activeTab === 'bulan'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/10'
              : 'bg-[#FAF6F0] border-app-line'
          )}
        >
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-toko uppercase tracking-wider">
              <Calendar className="w-3 h-3 text-aksi" />
              <span>Profit Bulan Ini</span>
            </div>
            <p className="text-base font-extrabold text-app-text tabular-nums mt-1 tracking-tight">
              {profitBulanIni >= 0 ? '+' : ''}{rupiah(profitBulanIni)}
            </p>
          </div>
          <p className="text-[10px] text-app-muted mt-2">
            Periode: <strong className="text-app-text">{monthYear}</strong>
          </p>
        </div>

        {/* Kolom 2: Profit Keseluruhan */}
        <div
          className={clsx(
            'p-3.5 rounded-2xl border transition-all flex flex-col justify-between',
            activeTab === 'semua'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/10'
              : 'bg-[#FAF6F0] border-app-line'
          )}
        >
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#1B4332] uppercase tracking-wider">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>Profit Keseluruhan</span>
            </div>
            <p className="text-base font-extrabold text-app-text tabular-nums mt-1 tracking-tight">
              {profitKeseluruhan >= 0 ? '+' : ''}{rupiah(profitKeseluruhan)}
            </p>
          </div>
          <p className="text-[10px] text-app-muted mt-2">
            Kumulatif toko semua waktu
          </p>
        </div>
      </div>

      {/* 3. TAMPILAN MODE: BULAN INI / KESELURUHAN */}
      {activeTab !== 'tren' && (
        <div className="flex flex-col gap-3.5 pt-1">
          {/* Visual Stacked Composition Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-app-text">
              <span>Komposisi Arus Kas</span>
              <span className="text-app-muted text-[11px] font-normal">
                Total Pemasukan: {rupiah(currPemasukan)}
              </span>
            </div>

            {/* Multi-segmented Progress Bar */}
            <div className="h-4 w-full bg-app-line/60 rounded-full overflow-hidden flex p-0.5 gap-0.5 shadow-inner">
              {/* Segmen Profit (Hijau Emerald) */}
              {pctProfit > 0 && (
                <div
                  style={{ width: `${Math.max(4, pctProfit)}%` }}
                  className="h-full bg-[#2D6A4F] rounded-full transition-all duration-500"
                  title={`Profit: ${rupiah(currProfit)} (${pctProfit}%)`}
                />
              )}
              {/* Segmen Pengeluaran Toko (Amber) */}
              {pctModal > 0 && (
                <div
                  style={{ width: `${Math.max(4, pctModal)}%` }}
                  className="h-full bg-[#D97706] rounded-full transition-all duration-500"
                  title={`Pengeluaran Toko: ${rupiah(currModal)} (${pctModal}%)`}
                />
              )}
              {/* Segmen Jajan (Olive) */}
              {pctJajan > 0 && (
                <div
                  style={{ width: `${Math.max(4, pctJajan)}%` }}
                  className="h-full bg-[#606C38] rounded-full transition-all duration-500"
                  title={`Jajan: ${rupiah(currJajan)} (${pctJajan}%)`}
                />
              )}
              {currPemasukan === 0 && (
                <div className="h-full w-full bg-app-line/80 rounded-full" />
              )}
            </div>

            {/* Legenda Komposisi */}
            <div className="flex items-center justify-between text-[10px] text-app-muted pt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                <span>Profit ({pctProfit}%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                <span>Pengeluaran ({pctModal}%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#606C38]" />
                <span>Jajan ({pctJajan}%)</span>
              </span>
            </div>
          </div>

          {/* 3 Kartu Komparasi Detail */}
          <div className="flex flex-col gap-2 pt-1">
            {/* 1. Pemasukan */}
            <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">Total Pemasukan</p>
                  <p className="text-[10px] text-emerald-800/80">
                    {isBulan ? 'Bulan berjalan' : 'Seluruh waktu'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-emerald-900 tabular-nums">
                  +{rupiah(currPemasukan)}
                </p>
                <span className="text-[10px] font-bold text-emerald-700">100% basis</span>
              </div>
            </div>

            {/* 2. Pengeluaran Toko */}
            <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950">Pengeluaran Toko</p>
                  <p className="text-[10px] text-amber-800/80">Stok, iklan, & lisensi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-amber-900 tabular-nums">
                  -{rupiah(currModal)}
                </p>
                <span className="text-[10px] font-bold text-amber-700">
                  {pctModal}% dari masuk
                </span>
              </div>
            </div>

            {/* 3. Jajan Pribadi */}
            <div className="flex items-center justify-between p-3 bg-[#F2F5E8] rounded-2xl border border-[#DFE6CA]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#E3EBCB] text-[#475528] flex items-center justify-center shrink-0">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2C3518]">Jajan Pribadi</p>
                  <p className="text-[10px] text-[#475528]/80">Makan & jajan berdua</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-[#38431F] tabular-nums">
                  -{rupiah(currJajan)}
                </p>
                <span className="text-[10px] font-bold text-[#475528]">
                  {pctJajan}% dari masuk
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAMPILAN MODE: TREN 6 BULAN (INTERACTIVE BAR CHART) */}
      {activeTab === 'tren' && (
        <div className="flex flex-col gap-3.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-app-text">Diagram Batang 6 Bulan</span>
            <span className="text-[10px] text-app-muted">Sentuh batang untuk detail</span>
          </div>

          {/* Area Diagram Batang */}
          <div className="h-44 w-full bg-[#FAF6F0] rounded-2xl p-3 border border-app-line flex items-end justify-between gap-2 select-none">
            {monthlyTrend.map((item, idx) => {
              const heightMasuk = Math.max(
                6,
                Math.round((item.pemasukan / maxTrendVal) * 110)
              );
              const heightKeluar = Math.max(
                item.totalPengeluaran > 0 ? 6 : 0,
                Math.round((item.totalPengeluaran / maxTrendVal) * 110)
              );
              const isSelected = selectedTrendIdx === idx;

              return (
                <div
                  key={item.monthYear}
                  onClick={() => setSelectedTrendIdx(idx)}
                  className={clsx(
                    'flex-1 flex flex-col items-center justify-end h-full cursor-pointer transition-all duration-150 p-1 rounded-xl',
                    isSelected
                      ? 'bg-emerald-100/70 ring-2 ring-emerald-500/20'
                      : 'hover:bg-app-line/30'
                  )}
                >
                  {/* Dua Batang Berdampingan */}
                  <div className="w-full flex items-end justify-center gap-1 h-28 pb-1">
                    {/* Batang Pemasukan (Hijau) */}
                    <div
                      style={{ height: `${heightMasuk}px` }}
                      className={clsx(
                        'w-2.5 rounded-t-md transition-all duration-300',
                        isSelected ? 'bg-[#2D6A4F] shadow-xs' : 'bg-[#40916C]/80'
                      )}
                      title={`Pemasukan: ${rupiah(item.pemasukan)}`}
                    />
                    {/* Batang Total Pengeluaran (Amber) */}
                    <div
                      style={{ height: `${heightKeluar}px` }}
                      className={clsx(
                        'w-2.5 rounded-t-md transition-all duration-300',
                        isSelected ? 'bg-[#D97706] shadow-xs' : 'bg-[#F59E0B]/70'
                      )}
                      title={`Pengeluaran: ${rupiah(item.totalPengeluaran)}`}
                    />
                  </div>

                  {/* Label Nama Bulan */}
                  <span
                    className={clsx(
                      'text-[10px] font-bold mt-1 tracking-tight',
                      isSelected ? 'text-aksi underline' : 'text-app-muted'
                    )}
                  >
                    {item.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legenda Diagram */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-app-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#2D6A4F]" />
              <span className="font-semibold text-app-text">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#D97706]" />
              <span className="font-semibold text-app-text">Total Pengeluaran</span>
            </div>
          </div>

          {/* Detail Bulan yang Sedang Disentuh / Dipilih */}
          {selectedTrend && (
            <div className="p-3 bg-white rounded-2xl border border-app-line flex flex-col gap-1.5 text-xs shadow-2xs">
              <div className="flex items-center justify-between pb-1 border-b border-app-line">
                <span className="font-bold text-app-text">
                  Rincian Bulan {selectedTrend.label}
                </span>
                <span className="font-extrabold text-aksi tabular-nums">
                  Profit: {selectedTrend.profit >= 0 ? '+' : ''}{rupiah(selectedTrend.profit)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div>
                  <p className="text-app-muted">Pemasukan</p>
                  <p className="font-bold text-emerald-900 tabular-nums">
                    {rupiah(selectedTrend.pemasukan)}
                  </p>
                </div>
                <div>
                  <p className="text-app-muted">Pengeluaran Toko</p>
                  <p className="font-bold text-amber-900 tabular-nums">
                    {rupiah(selectedTrend.pengeluaran)}
                  </p>
                </div>
                <div>
                  <p className="text-app-muted">Jajan Pribadi</p>
                  <p className="font-bold text-[#475528] tabular-nums">
                    {rupiah(selectedTrend.jajan)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
