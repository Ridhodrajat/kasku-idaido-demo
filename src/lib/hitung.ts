/**
 * Fungsi-fungsi murni kalkulasi finansial Kasku Idaido
 * Berdasarkan spesifikasi CODING_PROMPT.md
 */

import { getTransactionNature } from './constants';

export type StatusKuota = 'aman' | 'menipis' | 'over';

export interface AlokasiPersen {
  modal: number;
  tabungan: number;
  jajan: number;
  sedekah: number;
}

export interface AlokasiNominal {
  modal: number;
  tabungan: number;
  jajan: number;
  sedekah: number;
  total: number;
}

/**
 * profit = total Pemasukan Toko bulan itu - total Modal Toko bulan itu
 */
export function hitungProfit(pemasukanBulan: number, modalBulan: number): number {
  return (pemasukanBulan || 0) - (modalBulan || 0);
}

/**
 * kuota_jajan = target_jajan jika > 0, selain itu max(0, profit) * pct_jajan / 100
 */
export function hitungKuotaJajan(targetJajan: number, profit: number, pctJajan: number): number {
  if (targetJajan > 0) {
    return Math.round(targetJajan);
  }
  const basisProfit = Math.max(0, profit || 0);
  return Math.round((basisProfit * (pctJajan || 0)) / 100);
}

/**
 * sisa_kuota = kuota_jajan - jajan_terpakai (boleh negatif)
 */
export function hitungSisaKuota(kuotaJajan: number, jajanTerpakai: number): number {
  return (kuotaJajan || 0) - (jajanTerpakai || 0);
}

/**
 * status kuota jajan:
 * - Aman jika sisa >= 30% kuota (dan kuota > 0)
 * - Menipis jika 0 <= sisa < 30% (dan kuota > 0)
 * - Overbudget jika sisa < 0
 * - kuota 0 + ada jajan (> 0) = Overbudget
 * - kuota 0 + tidak ada jajan = Aman
 */
export function hitungStatusKuota(
  kuotaJajan: number,
  sisaKuota: number,
  jajanTerpakai: number = 0
): StatusKuota {
  if (sisaKuota < 0) {
    return 'over';
  }

  if (kuotaJajan <= 0) {
    return jajanTerpakai > 0 ? 'over' : 'aman';
  }

  const batasMenipis = kuotaJajan * 0.3;
  if (sisaKuota >= batasMenipis) {
    return 'aman';
  }

  return 'menipis';
}

/**
 * saldo_kas_aktif = semua Pemasukan - semua Modal - semua Jajan (kumulatif tanpa data terhapus)
 */
export function hitungSaldoKasAktif(
  totalPemasukanSemua: number,
  totalModalSemua: number,
  totalJajanSemua: number
): number {
  return (totalPemasukanSemua || 0) - (totalModalSemua || 0) - (totalJajanSemua || 0);
}

/**
 * saldo_kas_bulan_ini = total Pemasukan bulan ini - total Modal/Pengeluaran Toko bulan ini - total Jajan bulan ini
 * (Arus kas bersih khusus bulan berjalan, tidak kumulatif)
 */
export function hitungSaldoKasBulanIni(
  pemasukanBulan: number,
  modalBulan: number,
  jajanBulan: number
): number {
  return (pemasukanBulan || 0) - (modalBulan || 0) - (jajanBulan || 0);
}

/**
 * alokasi nominal = profit * pct / 100, dibulatkan;
 * selisih pembulatan masuk ke Tabungan; profit <= 0 maka semua Rp 0
 */
export function hitungAlokasiNominal(
  profit: number,
  persen: AlokasiPersen
): AlokasiNominal {
  if (profit <= 0) {
    return {
      modal: 0,
      tabungan: 0,
      jajan: 0,
      sedekah: 0,
      total: 0,
    };
  }

  const modal = Math.round((profit * (persen.modal || 0)) / 100);
  const jajan = Math.round((profit * (persen.jajan || 0)) / 100);
  const sedekah = Math.round((profit * (persen.sedekah || 0)) / 100);
  
  // Selisih pembulatan dialokasikan ke Tabungan agar total selalu tepat sama dengan profit
  const tabungan = profit - (modal + jajan + sedekah);

  return {
    modal,
    tabungan,
    jajan,
    sedekah,
    total: profit,
  };
}

export interface MonthTrendItem {
  monthYear: string;
  label: string;
  shortLabel: string;
  pemasukan: number;
  pengeluaran: number;
  jajan: number;
  totalPengeluaran: number;
  profit: number;
  saldoBersih: number;
}

const NAMA_BULAN_PENDEK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Menghitung tren bulanan selama N bulan ke belakang sampai endMonthYear (default 6 bulan)
 */
export function hitungTrendBulanan(
  transactions: { month_year: string; type: string; amount: number }[],
  endMonthYear: string,
  count: number = 6
): MonthTrendItem[] {
  const [endYearStr, endMonthStr] = endMonthYear.split('-');
  const endYear = parseInt(endYearStr, 10);
  const endMonth = parseInt(endMonthStr, 10);

  const months: { ym: string; label: string; shortLabel: string }[] = [];

  for (let i = count - 1; i >= 0; i--) {
    let y = endYear;
    let m = endMonth - i;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    const ym = `${y}-${m.toString().padStart(2, '0')}`;
    const shortLabel = NAMA_BULAN_PENDEK[m - 1];
    const label = `${shortLabel} '${y.toString().slice(-2)}`;
    months.push({ ym, label, shortLabel });
  }

  return months.map(({ ym, label, shortLabel }) => {
    let pemasukan = 0;
    let pengeluaran = 0;
    let jajan = 0;

    for (const tx of transactions) {
      if (tx.month_year !== ym) continue;
      const nature = getTransactionNature(tx.type);
      if (nature === 'pemasukan') pemasukan += tx.amount;
      else if (nature === 'pengeluaran') pengeluaran += tx.amount;
      else if (nature === 'jajan') jajan += tx.amount;
    }

    const profit = pemasukan - pengeluaran;
    const totalPengeluaran = pengeluaran + jajan;
    const saldoBersih = pemasukan - totalPengeluaran;

    return {
      monthYear: ym,
      label,
      shortLabel,
      pemasukan,
      pengeluaran,
      jajan,
      totalPengeluaran,
      profit,
      saldoBersih,
    };
  });
}
