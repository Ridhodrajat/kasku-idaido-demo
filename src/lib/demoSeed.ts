import { Transaction, MonthlyAllocation } from '@/types/database';
import { getCurrentMonthYear } from './date';

/**
 * Menghasilkan data seed demo realistis untuk 6 bulan terakhir.
 * Otomatis menyesuaikan dengan tanggal dan bulan saat ini sehingga selalu segar.
 */
export function generateDemoSeedData(): {
  transactions: Transaction[];
  allocations: MonthlyAllocation[];
} {
  const currentYm = getCurrentMonthYear();
  const [currY, currM] = currentYm.split('-').map(Number);
  const now = new Date();

  // Helper untuk mendapatkan YYYY-MM ke belakang
  const getPastYm = (subMonths: number) => {
    let y = currY;
    let m = currM - subMonths;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    return `${y}-${m.toString().padStart(2, '0')}`;
  };

  const ym0 = currentYm;
  const ym1 = getPastYm(1);
  const ym2 = getPastYm(2);
  const ym3 = getPastYm(3);
  const ym4 = getPastYm(4);
  const ym5 = getPastYm(5);

  const transactions: Transaction[] = [
    // --- Bulan Berjalan (ym0) ---
    {
      id: 'demo-tx-01',
      date: new Date(now.getTime() - 1 * 86400000).toISOString(),
      type: 'Pemasukan Toko',
      category: 'Penjualan Produk',
      amount: 750000,
      notes: 'Penjualan Template Digital Batch #1',
      month_year: ym0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-02',
      date: new Date(now.getTime() - 2 * 86400000).toISOString(),
      type: 'Pengeluaran Toko',
      category: 'Stok/Lisensi Produk',
      amount: 150000,
      notes: 'Lisensi aset grafis & font komersial',
      month_year: ym0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-03',
      date: new Date(now.getTime() - 3 * 86400000).toISOString(),
      type: 'Pemasukan Toko',
      category: 'Jasa/Order Custom',
      amount: 500000,
      notes: 'Kustomisasi landing page klien',
      month_year: ym0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-04',
      date: new Date(now.getTime() - 4 * 86400000).toISOString(),
      type: 'Pengeluaran Toko',
      category: 'Iklan/Promosi',
      amount: 100000,
      notes: 'Meta Ads campaign 3 hari',
      month_year: ym0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-05',
      date: new Date(now.getTime() - 5 * 86400000).toISOString(),
      type: 'Jajan Pribadi',
      category: 'Makan Berat',
      amount: 85000,
      notes: 'Makan siang bareng di resto Jepang',
      month_year: ym0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-06',
      date: new Date(now.getTime() - 6 * 86400000).toISOString(),
      type: 'Jajan Pribadi',
      category: 'Kopi/Minuman',
      amount: 45000,
      notes: 'Nongkrong matcha & latte kafe',
      month_year: ym0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },

    // --- Bulan 1 Lalu (ym1) ---
    {
      id: 'demo-tx-11',
      date: new Date(now.getTime() - 32 * 86400000).toISOString(),
      type: 'Pemasukan Toko',
      category: 'Penjualan Produk',
      amount: 950000,
      notes: 'Penjualan bundle template Canva',
      month_year: ym1,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-12',
      date: new Date(now.getTime() - 35 * 86400000).toISOString(),
      type: 'Pengeluaran Toko',
      category: 'Langganan Software',
      amount: 180000,
      notes: 'Langganan tool AI & hosting cloud',
      month_year: ym1,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-13',
      date: new Date(now.getTime() - 38 * 86400000).toISOString(),
      type: 'Jajan Pribadi',
      category: 'Nonton/Hiburan',
      amount: 95000,
      notes: 'Tiket nonton bioskop XXI berdua',
      month_year: ym1,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },

    // --- Bulan 2 Lalu (ym2) ---
    {
      id: 'demo-tx-21',
      date: new Date(now.getTime() - 62 * 86400000).toISOString(),
      type: 'Pemasukan Toko',
      category: 'Penjualan Produk',
      amount: 820000,
      notes: 'Ebook panduan bisnis digital',
      month_year: ym2,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-22',
      date: new Date(now.getTime() - 65 * 86400000).toISOString(),
      type: 'Pengeluaran Toko',
      category: 'Iklan/Promosi',
      amount: 140000,
      notes: 'Instagram Ads engagement',
      month_year: ym2,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-23',
      date: new Date(now.getTime() - 68 * 86400000).toISOString(),
      type: 'Jajan Pribadi',
      category: 'Makan Berat',
      amount: 70000,
      notes: 'Kuliner malam sate & es kelapa',
      month_year: ym2,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },

    // --- Bulan 3 Lalu (ym3) ---
    {
      id: 'demo-tx-31',
      date: new Date(now.getTime() - 95 * 86400000).toISOString(),
      type: 'Pemasukan Toko',
      category: 'Jasa/Order Custom',
      amount: 1100000,
      notes: 'Jasa setup bot otomatisasi',
      month_year: ym3,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-32',
      date: new Date(now.getTime() - 98 * 86400000).toISOString(),
      type: 'Pengeluaran Toko',
      category: 'Operasional & Alat',
      amount: 220000,
      notes: 'Upgrade mouse & keyboard kerja',
      month_year: ym3,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-33',
      date: new Date(now.getTime() - 100 * 86400000).toISOString(),
      type: 'Jajan Pribadi',
      category: 'Belanja Pribadi',
      amount: 110000,
      notes: 'Jajan camilan & kebutuhan bersama',
      month_year: ym3,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },

    // --- Bulan 4 Lalu (ym4) ---
    {
      id: 'demo-tx-41',
      date: new Date(now.getTime() - 125 * 86400000).toISOString(),
      type: 'Pemasukan Toko',
      category: 'Penjualan Produk',
      amount: 700000,
      notes: 'Preset Lightroom wedding & aesthetic',
      month_year: ym4,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-42',
      date: new Date(now.getTime() - 128 * 86400000).toISOString(),
      type: 'Pengeluaran Toko',
      category: 'Stok/Lisensi Produk',
      amount: 120000,
      notes: 'Stok lisensi plugin',
      month_year: ym4,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },

    // --- Bulan 5 Lalu (ym5) ---
    {
      id: 'demo-tx-51',
      date: new Date(now.getTime() - 155 * 86400000).toISOString(),
      type: 'Pemasukan Toko',
      category: 'Penjualan Produk',
      amount: 650000,
      notes: 'Peluncuran produk perdana toko',
      month_year: ym5,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
    {
      id: 'demo-tx-52',
      date: new Date(now.getTime() - 158 * 86400000).toISOString(),
      type: 'Pengeluaran Toko',
      category: 'Iklan/Promosi',
      amount: 110000,
      notes: 'Promosi awal pembukaan toko',
      month_year: ym5,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    },
  ];

  const allocations: MonthlyAllocation[] = [
    {
      id: ym0,
      target_jajan: 0,
      pct_modal: 40,
      pct_tabungan: 25,
      pct_jajan: 25,
      pct_sedekah: 10,
      evaluation_note: 'Bulan ini performa penjualan template sangat baik. Kuota jajan masih sangat aman.',
      is_closed: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: ym1,
      target_jajan: 0,
      pct_modal: 40,
      pct_tabungan: 25,
      pct_jajan: 25,
      pct_sedekah: 10,
      evaluation_note: 'Bulan ditutup dengan surplus profit yang memuaskan.',
      is_closed: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: ym2,
      target_jajan: 0,
      pct_modal: 40,
      pct_tabungan: 25,
      pct_jajan: 25,
      pct_sedekah: 10,
      evaluation_note: 'Tabungan bulanan berhasil disisihkan sesuai target alokasi.',
      is_closed: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: ym3,
      target_jajan: 0,
      pct_modal: 40,
      pct_tabungan: 25,
      pct_jajan: 25,
      pct_sedekah: 10,
      evaluation_note: 'Order custom mendominasi pemasukan bulan ini.',
      is_closed: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  return { transactions, allocations };
}
