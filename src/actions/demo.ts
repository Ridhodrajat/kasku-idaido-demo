'use server';

import { resetDemoStorage } from '@/lib/demoStore';
import { revalidatePath } from 'next/cache';

export async function resetDemoAction() {
  await resetDemoStorage();
  revalidatePath('/');
  revalidatePath('/riwayat');
  revalidatePath('/alokasi');
  revalidatePath('/pengaturan');
  return { success: true, message: 'Data contoh berhasil di-reset ke kondisi awal!' };
}
