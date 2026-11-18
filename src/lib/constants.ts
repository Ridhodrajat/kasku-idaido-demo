import { TransactionType } from '@/types/database';

export const BASE_TRANSACTION_TYPES: string[] = [
  'Pemasukan Toko',
  'Pengeluaran Toko',
  'Jajan Pribadi',
];

export const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  'Pemasukan Toko': [
    'Penjualan Produk',
    'Jasa/Order Custom',
    'Bonus/Tips',
    'Lainnya',
  ],
  'Pengeluaran Toko': [
    'Stok/Lisensi Produk',
    'Iklan/Promosi',
    'Operasional & Alat',
    'Langganan Software',
    'Lainnya',
  ],
  // Dukungan untuk data lama
  'Modal Toko': [
    'Stok/Lisensi Produk',
    'Iklan/Promosi',
    'Operasional & Alat',
    'Langganan Software',
    'Lainnya',
  ],
  'Jajan Pribadi': [
    'Makan Berat',
    'Kopi/Minuman',
    'Snack/Camilan',
    'Nonton/Hiburan',
    'Belanja Pribadi',
    'Transport/Bensin',
    'Lainnya',
  ],
};

export const QUICK_NOMINALS = [10_000, 50_000, 100_000];

export const DEFAULT_ALLOCATION = {
  pct_modal: 40,
  pct_tabungan: 25,
  pct_jajan: 25,
  pct_sedekah: 10,
};

/**
 * Format nama tipe untuk tampilan ringkas di tombol & chip
 */
export function formatTypeDisplay(type: string): string {
  if (type === 'Modal Toko' || type === 'Pengeluaran Toko' || type === 'Pengeluaran') {
    return 'Pengeluaran';
  }
  if (type === 'Pemasukan Toko' || type === 'Pemasukan') {
    return 'Pemasukan';
  }
  if (type === 'Jajan Pribadi' || type === 'Jajan') {
    return 'Jajan';
  }
  return type;
}

/**
 * Menentukan sifat dasar transaksi: pemasukan, pengeluaran toko, atau jajan pribadi
 */
export function getTransactionNature(type: string): 'pemasukan' | 'pengeluaran' | 'jajan' {
  const t = (type || '').trim().toLowerCase();
  if (t === 'pemasukan toko' || t === 'pemasukan' || t.includes('masuk') || t.includes('income')) {
    return 'pemasukan';
  }
  if (t === 'jajan pribadi' || t === 'jajan' || t.includes('jajan')) {
    return 'jajan';
  }
  return 'pengeluaran';
}

/**
 * Cek apakah sebuah tipe adalah pengeluaran (mengurangi kas)
 */
export function isExpenseType(type: string): boolean {
  return getTransactionNature(type) !== 'pemasukan';
}
