import { cookies } from 'next/headers';
import { Transaction, MonthlyAllocation } from '@/types/database';
import { generateDemoSeedData } from './demoSeed';
import fs from 'fs';
import path from 'path';

const DEMO_COOKIE_NAME = 'kasku_demo_store';
const DEV_STORAGE_FILE = path.join(process.cwd(), '.dev-storage.json');

/**
 * Mengambil data demo untuk sesi pengunjung saat ini.
 * Membaca dari cookie sesi (agar tiap pengunjung di Vercel terisolasi)
 * dengan fallback ke file lokal (.dev-storage.json) atau generate data baru.
 */
export async function getDemoStorage(): Promise<{
  transactions: Transaction[];
  allocations: MonthlyAllocation[];
}> {
  // 1. Coba baca dari cookie pengunjung
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(DEMO_COOKIE_NAME)?.value;
    if (raw) {
      const parsed = JSON.parse(decodeURIComponent(raw));
      if (Array.isArray(parsed.transactions) && Array.isArray(parsed.allocations)) {
        return parsed;
      }
    }
  } catch {
    // Lewati jika di luar context request
  }

  // 2. Coba baca dari file lokal .dev-storage.json
  try {
    if (fs.existsSync(DEV_STORAGE_FILE)) {
      const content = fs.readFileSync(DEV_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.transactions) && Array.isArray(parsed.allocations)) {
        return parsed;
      }
    }
  } catch {}

  // 3. Fallback: buat data seed demo awal yang lengkap
  const initial = generateDemoSeedData();
  try {
    fs.writeFileSync(DEV_STORAGE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  } catch {}
  return initial;
}

/**
 * Menyimpan data demo ke cookie sesi pengunjung & file lokal.
 */
export async function saveDemoStorage(data: {
  transactions: Transaction[];
  allocations: MonthlyAllocation[];
}) {
  // Jaga ukuran cookie agar tidak melebihi batas 4KB
  const safeTransactions = data.transactions.slice(0, 25);
  const safeData = {
    transactions: safeTransactions,
    allocations: data.allocations,
  };

  // 1. Simpan ke cookie pengunjung
  try {
    const cookieStore = await cookies();
    const jsonStr = JSON.stringify(safeData);
    cookieStore.set(DEMO_COOKIE_NAME, encodeURIComponent(jsonStr), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 86400, // 30 hari
      path: '/',
    });
  } catch {}

  // 2. Simpan ke file lokal untuk dev
  try {
    fs.writeFileSync(DEV_STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

/**
 * Reset data demo kembali ke kondisi awal (6 bulan data realistis)
 */
export async function resetDemoStorage(): Promise<{
  transactions: Transaction[];
  allocations: MonthlyAllocation[];
}> {
  const fresh = generateDemoSeedData();
  await saveDemoStorage(fresh);
  return fresh;
}
