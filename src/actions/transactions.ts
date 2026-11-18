'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  fetchTransactions,
  insertTransaction,
  updateTransactionInDb,
  softDeleteTransaction,
  fetchSummaryData,
} from '@/lib/db';
import { TransactionType } from '@/types/database';
import {
  hitungProfit,
  hitungKuotaJajan,
  hitungSisaKuota,
  hitungStatusKuota,
  hitungSaldoKasAktif,
  hitungSaldoKasBulanIni,
  hitungAlokasiNominal,
  hitungTrendBulanan,
  MonthTrendItem,
} from '@/lib/hitung';

const transactionSchema = z.object({
  type: z.string().min(1, 'Pilih jenis transaksi'),
  category: z
    .string()
    .min(1, 'Kategori wajib diisi')
    .max(40, 'Kategori maksimal 40 karakter'),
  amount: z.number().int().positive('Nominal harus lebih dari 0'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  notes: z.string().optional().nullable(),
});

export async function createTransactionAction(formData: {
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  notes?: string | null;
}) {
  const parsed = transactionSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input transaksi tidak valid',
    };
  }

  try {
    const created = await insertTransaction({
      type: parsed.data.type,
      category: parsed.data.category.trim(),
      amount: parsed.data.amount,
      date: parsed.data.date,
      notes: parsed.data.notes?.trim() || null,
    });

    revalidatePath('/');
    revalidatePath('/riwayat');
    revalidatePath('/alokasi');
    return { success: true, data: created };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan transaksi' };
  }
}

export async function updateTransactionAction(
  id: string,
  formData: {
    type: TransactionType;
    category: string;
    amount: number;
    date: string;
    notes?: string | null;
  }
) {
  const parsed = transactionSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input transaksi tidak valid',
    };
  }

  try {
    const updated = await updateTransactionInDb(id, {
      type: parsed.data.type,
      category: parsed.data.category.trim(),
      amount: parsed.data.amount,
      date: parsed.data.date,
      notes: parsed.data.notes?.trim() || null,
    });

    revalidatePath('/');
    revalidatePath('/riwayat');
    revalidatePath('/alokasi');
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengubah transaksi' };
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    await softDeleteTransaction(id);
    revalidatePath('/');
    revalidatePath('/riwayat');
    revalidatePath('/alokasi');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus transaksi' };
  }
}

export async function getDashboardData(monthYear: string) {
  const data = await fetchSummaryData(monthYear);

  const profit = hitungProfit(data.monthly.pemasukan, data.monthly.modal);
  const kuotaJajan = hitungKuotaJajan(
    data.allocation.target_jajan,
    profit,
    data.allocation.pct_jajan
  );
  const sisaKuota = hitungSisaKuota(kuotaJajan, data.monthly.jajan);
  const statusKuota = hitungStatusKuota(kuotaJajan, sisaKuota, data.monthly.jajan);
  const saldoKasAktif = hitungSaldoKasAktif(
    data.cumulative.totalMasuk,
    data.cumulative.totalModal,
    data.cumulative.totalJajan
  );
  const saldoKasBulanIni = hitungSaldoKasBulanIni(
    data.monthly.pemasukan,
    data.monthly.modal,
    data.monthly.jajan
  );
  const nominalAlokasi = hitungAlokasiNominal(profit, {
    modal: data.allocation.pct_modal,
    tabungan: data.allocation.pct_tabungan,
    jajan: data.allocation.pct_jajan,
    sedekah: data.allocation.pct_sedekah,
  });

  const profitKeseluruhan = hitungProfit(
    data.cumulative.totalMasuk,
    data.cumulative.totalModal
  );

  const monthlyTrend = hitungTrendBulanan(
    data.allActiveTransactions,
    monthYear,
    6
  );

  // 5 transaksi terbaru bulan ini
  const recentTransactions = data.monthlyTransactions.slice(0, 5);

  return {
    monthYear,
    saldoKasAktif,
    saldoKasBulanIni,
    profit,
    profitKeseluruhan,
    pemasukanBulan: data.monthly.pemasukan,
    modalBulan: data.monthly.modal,
    jajanBulan: data.monthly.jajan,
    pemasukanSemua: data.cumulative.totalMasuk,
    modalSemua: data.cumulative.totalModal,
    jajanSemua: data.cumulative.totalJajan,
    monthlyTrend,
    kuotaJajan,
    sisaKuota,
    statusKuota,
    allocation: data.allocation,
    nominalAlokasi,
    recentTransactions,
  };
}

export async function getHistoryData(options?: {
  monthYear?: string;
  type?: TransactionType;
  search?: string;
}) {
  return await fetchTransactions(options);
}

export async function checkDatabaseStatusAction() {
  return {
    configured: true,
    connected: true,
    tableExists: true,
    projectUrl: 'Sandbox Demo (Tersimpan Lokal di Browser)',
    message: 'Mode Demo Portofolio aktif! Data tersimpan mandiri di perangkat pengunjung.',
  };
}
