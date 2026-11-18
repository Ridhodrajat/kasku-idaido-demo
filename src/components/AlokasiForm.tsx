'use client';

import React, { useState, useTransition } from 'react';
import { MonthlyAllocation } from '@/types/database';
import { rupiah, formatAngka, parseAngka } from '@/lib/format';
import { hitungAlokasiNominal } from '@/lib/hitung';
import {
  saveAllocationAction,
  closeMonthAction,
  getLastMonthAllocation,
} from '@/actions/allocations';
import {
  PieChart,
  Lock,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

interface AlokasiFormProps {
  monthYear: string;
  profit: number;
  initialAllocation: MonthlyAllocation;
}

export function AlokasiForm({
  monthYear,
  profit,
  initialAllocation,
}: AlokasiFormProps) {
  const router = useRouter();
  const [pctModal, setPctModal] = useState<number>(initialAllocation.pct_modal);
  const [pctTabungan, setPctTabungan] = useState<number>(initialAllocation.pct_tabungan);
  const [pctJajan, setPctJajan] = useState<number>(initialAllocation.pct_jajan);
  const [pctSedekah, setPctSedekah] = useState<number>(initialAllocation.pct_sedekah);
  const [targetJajanInput, setTargetJajanInput] = useState<string>(
    initialAllocation.target_jajan > 0 ? formatAngka(initialAllocation.target_jajan) : ''
  );
  const [evaluationNote, setEvaluationNote] = useState<string>(
    initialAllocation.evaluation_note || ''
  );
  const [isClosed, setIsClosed] = useState<boolean>(initialAllocation.is_closed);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalPct = Math.round((pctModal + pctTabungan + pctJajan + pctSedekah) * 100) / 100;
  const isTotal100 = totalPct === 100;
  const selisih = Math.round((100 - totalPct) * 100) / 100;

  // Hitung live nominal alokasi
  const nominal = hitungAlokasiNominal(profit, {
    modal: pctModal,
    tabungan: pctTabungan,
    jajan: pctJajan,
    sedekah: pctSedekah,
  });

  const handleCopyLastMonth = () => {
    startTransition(async () => {
      setMessage(null);
      const prev = await getLastMonthAllocation(monthYear);
      if (!prev) {
        setMessage({
          type: 'error',
          text: 'Data alokasi bulan sebelumnya tidak ditemukan.',
        });
        return;
      }
      setPctModal(prev.pct_modal);
      setPctTabungan(prev.pct_tabungan);
      setPctJajan(prev.pct_jajan);
      setPctSedekah(prev.pct_sedekah);
      setTargetJajanInput(prev.target_jajan > 0 ? formatAngka(prev.target_jajan) : '');
      setMessage({
        type: 'success',
        text: 'Berhasil memuat pengaturan dari bulan lalu!',
      });
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTotal100) {
      setMessage({
        type: 'error',
        text: `Total persentase harus tepat 100%. Saat ini: ${totalPct}%`,
      });
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const res = await saveAllocationAction({
        id: monthYear,
        pct_modal: pctModal,
        pct_tabungan: pctTabungan,
        pct_jajan: pctJajan,
        pct_sedekah: pctSedekah,
        target_jajan: parseAngka(targetJajanInput),
        evaluation_note: evaluationNote || null,
        is_closed: isClosed,
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Pengaturan alokasi berhasil disimpan!' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: res.error || 'Gagal menyimpan alokasi' });
      }
    });
  };

  const handleCloseMonth = () => {
    if (!confirm('Apakah Anda yakin ingin menutup dan mengunci bulan ini?')) return;

    startTransition(async () => {
      setMessage(null);
      const res = await closeMonthAction(monthYear, evaluationNote);
      if (res.success) {
        setIsClosed(true);
        setMessage({ type: 'success', text: 'Bulan berhasil ditutup!' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: res.error || 'Gagal menutup bulan' });
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      {/* Alert Banner jika sudah ditutup */}
      {isClosed && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Bulan ini telah ditutup & dievaluasi. Data alokasi telah dikunci.
          </span>
        </div>
      )}

      {/* Pesan status */}
      {message && (
        <div
          className={clsx(
            'flex items-center gap-2 p-3 rounded-2xl text-xs font-semibold',
            message.type === 'success'
              ? 'bg-emerald-50 text-status-aman'
              : 'bg-red-50 text-status-over'
          )}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Info Profit Bulan Ini */}
      <div className="p-4 bg-white rounded-3xl border border-app-line shadow-card flex items-center justify-between">
        <div>
          <p className="text-xs text-app-muted">Dasar Alokasi (Profit Berjalan)</p>
          <p className="text-xl font-extrabold text-toko tabular-nums">
            {rupiah(profit)}
          </p>
        </div>
        {!isClosed && (
          <button
            type="button"
            onClick={handleCopyLastMonth}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6F0] hover:bg-[#F0E8DC] text-app-text text-xs font-bold border border-app-line active:scale-95 transition-all duration-100 touch-press cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-aksi" />
            <span>Pakai Bulan Lalu</span>
          </button>
        )}
      </div>

      {/* Card Form 4 Pos Persentase */}
      <div className="p-5 bg-white rounded-3xl border border-app-line shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-app-text">Persentase Alokasi</h2>
          <span
            className={clsx(
              'px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums',
              isTotal100
                ? 'bg-emerald-100 text-status-aman'
                : 'bg-red-100 text-status-over'
            )}
          >
            Total {totalPct}% {selisih > 0 ? `(Kurang ${selisih}%)` : selisih < 0 ? `(Lebih ${Math.abs(selisih)}%)` : ''}
          </span>
        </div>

        {/* 1. Pengeluaran Toko */}
        <div className="flex items-center justify-between gap-3 p-3 bg-toko-soft rounded-2xl">
          <div>
            <p className="text-xs font-bold text-toko">Pengeluaran Toko</p>
            <p className="text-xs font-extrabold text-app-text tabular-nums">
              {rupiah(nominal.modal)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={100}
              disabled={isClosed || isPending}
              value={pctModal}
              onChange={(e) => setPctModal(Number(e.target.value))}
              className="w-16 py-1 px-2 text-right bg-white rounded-xl border border-toko/30 text-sm font-bold text-app-text tabular-nums focus:outline-hidden focus:ring-2 focus:ring-toko"
            />
            <span className="text-xs font-bold text-toko">%</span>
          </div>
        </div>

        {/* 2. Tabungan */}
        <div className="flex items-center justify-between gap-3 p-3 bg-[#EAF2F0] rounded-2xl">
          <div>
            <p className="text-xs font-bold text-[#3D665D]">Tabungan</p>
            <p className="text-xs font-extrabold text-app-text tabular-nums">
              {rupiah(nominal.tabungan)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={100}
              disabled={isClosed || isPending}
              value={pctTabungan}
              onChange={(e) => setPctTabungan(Number(e.target.value))}
              className="w-16 py-1 px-2 text-right bg-white rounded-xl border border-[#3D665D]/30 text-sm font-bold text-app-text tabular-nums focus:outline-hidden focus:ring-2 focus:ring-[#3D665D]"
            />
            <span className="text-xs font-bold text-[#3D665D]">%</span>
          </div>
        </div>

        {/* 3. Jajan */}
        <div className="flex items-center justify-between gap-3 p-3 bg-jajan-soft rounded-2xl">
          <div>
            <p className="text-xs font-bold text-jajan">Jajan Berdua</p>
            <p className="text-xs font-extrabold text-app-text tabular-nums">
              {rupiah(nominal.jajan)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={100}
              disabled={isClosed || isPending}
              value={pctJajan}
              onChange={(e) => setPctJajan(Number(e.target.value))}
              className="w-16 py-1 px-2 text-right bg-white rounded-xl border border-jajan/30 text-sm font-bold text-app-text tabular-nums focus:outline-hidden focus:ring-2 focus:ring-jajan"
            />
            <span className="text-xs font-bold text-jajan">%</span>
          </div>
        </div>

        {/* 4. Sedekah */}
        <div className="flex items-center justify-between gap-3 p-3 bg-[#E8F3E8] rounded-2xl">
          <div>
            <p className="text-xs font-bold text-[#2A603B]">Sedekah</p>
            <p className="text-xs font-extrabold text-app-text tabular-nums">
              {rupiah(nominal.sedekah)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={100}
              disabled={isClosed || isPending}
              value={pctSedekah}
              onChange={(e) => setPctSedekah(Number(e.target.value))}
              className="w-16 py-1 px-2 text-right bg-white rounded-xl border border-[#2A603B]/30 text-sm font-bold text-app-text tabular-nums focus:outline-hidden focus:ring-2 focus:ring-[#2A603B]"
            />
            <span className="text-xs font-bold text-[#2A603B]">%</span>
          </div>
        </div>
      </div>

      {/* Target Jajan Opsional */}
      <div className="p-5 bg-white rounded-3xl border border-app-line shadow-card flex flex-col gap-2">
        <label className="text-xs font-bold text-app-text">
          Target Jajan Tertentu (Opsional)
        </label>
        <p className="text-[11px] text-app-muted">
          Jika diisi nominal pasti (misal Rp 1.500.000), kuota jajan akan memakai target ini, bukan persentase profit.
        </p>
        <div className="relative mt-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-app-muted">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0 (pakai persentase)"
            disabled={isClosed || isPending}
            value={targetJajanInput}
            onChange={(e) => {
              const num = parseAngka(e.target.value);
              setTargetJajanInput(num > 0 ? formatAngka(num) : '');
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F0] rounded-xl text-sm font-bold text-app-text tabular-nums focus:outline-hidden focus:ring-2 focus:ring-aksi border border-app-line"
          />
        </div>
      </div>

      {/* Catatan Evaluasi Bulanan */}
      <div className="p-5 bg-white rounded-3xl border border-app-line shadow-card flex flex-col gap-2">
        <label className="text-xs font-bold text-app-text">
          Catatan Evaluasi Bulan Ini
        </label>
        <textarea
          rows={3}
          placeholder="Tuliskan evaluasi pengeluaran, omset toko, atau rencana bulan depan..."
          disabled={isClosed || isPending}
          value={evaluationNote}
          onChange={(e) => setEvaluationNote(e.target.value)}
          className="w-full p-3 bg-[#FAF6F0] rounded-xl text-xs text-app-text focus:outline-hidden focus:ring-2 focus:ring-aksi border border-app-line resize-none"
        />
      </div>

      {/* Tombol Simpan & Tutup Bulan */}
      {!isClosed && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCloseMonth}
            disabled={isPending || !isTotal100}
            className="px-4 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-100 touch-press active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Tutup Bulan</span>
          </button>

          <button
            type="submit"
            disabled={isPending || !isTotal100}
            className="flex-1 py-3.5 rounded-2xl bg-aksi hover:bg-aksi-hover text-white text-sm font-bold shadow-aksi flex items-center justify-center gap-2 transition-all duration-100 touch-press active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isPending ? 'Menyimpan...' : 'Simpan Alokasi'}</span>
          </button>
        </div>
      )}
    </form>
  );
}
