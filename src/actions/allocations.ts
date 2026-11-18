'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { fetchMonthlyAllocation, fetchLatestPriorAllocation, upsertMonthlyAllocation } from '@/lib/db';
import { MonthlyAllocation } from '@/types/database';

const allocationSchema = z
  .object({
    id: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Format ID bulan harus YYYY-MM'),
    target_jajan: z.number().int().min(0, 'Target jajan tidak boleh negatif'),
    pct_modal: z.number().min(0).max(100),
    pct_tabungan: z.number().min(0).max(100),
    pct_jajan: z.number().min(0).max(100),
    pct_sedekah: z.number().min(0).max(100),
    evaluation_note: z.string().optional().nullable(),
    is_closed: z.boolean().default(false),
  })
  .refine(
    (data) => {
      const sum = data.pct_modal + data.pct_tabungan + data.pct_jajan + data.pct_sedekah;
      return Math.abs(sum - 100) < 0.01;
    },
    {
      message: 'Total persentase alokasi harus tepat 100%',
      path: ['pct_total'],
    }
  );

export async function saveAllocationAction(data: {
  id: string;
  target_jajan: number;
  pct_modal: number;
  pct_tabungan: number;
  pct_jajan: number;
  pct_sedekah: number;
  evaluation_note?: string | null;
  is_closed?: boolean;
}) {
  const parsed = allocationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input alokasi tidak valid',
    };
  }

  try {
    const saved = await upsertMonthlyAllocation({
      id: parsed.data.id,
      target_jajan: parsed.data.target_jajan,
      pct_modal: parsed.data.pct_modal,
      pct_tabungan: parsed.data.pct_tabungan,
      pct_jajan: parsed.data.pct_jajan,
      pct_sedekah: parsed.data.pct_sedekah,
      evaluation_note: parsed.data.evaluation_note || null,
      is_closed: parsed.data.is_closed,
    });

    revalidatePath('/');
    revalidatePath('/alokasi');
    return { success: true, data: saved };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan alokasi' };
  }
}

/**
 * Tutup Bulan: mengunci alokasi bulan ini
 */
export async function closeMonthAction(monthYear: string, note?: string) {
  try {
    const existing = await fetchMonthlyAllocation(monthYear);
    if (!existing) {
      return { success: false, error: 'Data alokasi belum ada untuk bulan ini' };
    }

    const saved = await upsertMonthlyAllocation({
      ...existing,
      evaluation_note: note !== undefined ? note : existing.evaluation_note,
      is_closed: true,
    });

    revalidatePath('/');
    revalidatePath('/alokasi');
    return { success: true, data: saved };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menutup bulan' };
  }
}

/**
 * Mengambil alokasi bulan sebelumnya untuk fitur "Pakai bulan lalu"
 */
export async function getLastMonthAllocation(currentMonthYear: string): Promise<MonthlyAllocation | null> {
  const [year, month] = currentMonthYear.split('-').map(Number);
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  const prevYm = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;

  // 1. Coba ambil alokasi bulan tepat sebelumnya
  const directPrev = await fetchMonthlyAllocation(prevYm);
  if (directPrev) return directPrev;

  // 2. Coba ambil alokasi tersimpan paling akhir sebelum bulan ini
  const latestPrior = await fetchLatestPriorAllocation(currentMonthYear);
  if (latestPrior) return latestPrior;

  // 3. Fallback standar jika belum pernah ada alokasi tersimpan di database
  return {
    id: prevYm,
    target_jajan: 0,
    pct_modal: 40,
    pct_tabungan: 25,
    pct_jajan: 25,
    pct_sedekah: 10,
    evaluation_note: null,
    is_closed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
