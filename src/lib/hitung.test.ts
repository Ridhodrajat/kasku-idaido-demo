import { describe, it, expect } from 'vitest';
import {
  hitungProfit,
  hitungKuotaJajan,
  hitungSisaKuota,
  hitungStatusKuota,
  hitungSaldoKasAktif,
  hitungSaldoKasBulanIni,
  hitungAlokasiNominal,
  hitungTrendBulanan,
} from './hitung';
import { getTransactionNature, isExpenseType } from './constants';

describe('hitung.ts - Rumus Finansial Kasku Idaido', () => {
  describe('hitungProfit', () => {
    it('menghitung profit positif dengan benar', () => {
      expect(hitungProfit(5_000_000, 2_000_000)).toBe(3_000_000);
    });

    it('menghitung profit bernilai 0', () => {
      expect(hitungProfit(2_000_000, 2_000_000)).toBe(0);
    });

    it('menangani profit negatif (rugi)', () => {
      expect(hitungProfit(1_000_000, 3_000_000)).toBe(-2_000_000);
    });

    it('menangani parameter bernilai 0 atau falsy', () => {
      expect(hitungProfit(0, 0)).toBe(0);
    });
  });

  describe('hitungKuotaJajan', () => {
    it('mengutamakan target_jajan jika target_jajan > 0', () => {
      const target = 1_500_000;
      const profit = 10_000_000;
      const pctJajan = 25; // Seharusnya 2.5jt jika dari persen, tapi target diset 1.5jt
      expect(hitungKuotaJajan(target, profit, pctJajan)).toBe(1_500_000);
    });

    it('menghitung dari persentase profit jika target_jajan 0', () => {
      expect(hitungKuotaJajan(0, 4_000_000, 25)).toBe(1_000_000);
    });

    it('menghasilkan kuota 0 jika profit negatif dan tanpa target jajan', () => {
      expect(hitungKuotaJajan(0, -1_000_000, 25)).toBe(0);
    });

    it('membulatkan hasil kalkulasi kuota', () => {
      expect(hitungKuotaJajan(0, 333_333, 25)).toBe(83_333);
    });
  });

  describe('hitungSisaKuota', () => {
    it('menghitung sisa kuota positif', () => {
      expect(hitungSisaKuota(1_000_000, 400_000)).toBe(600_000);
    });

    it('menghasilkan sisa kuota tepat 0', () => {
      expect(hitungSisaKuota(1_000_000, 1_000_000)).toBe(0);
    });

    it('menghasilkan sisa kuota negatif saat overbudget', () => {
      expect(hitungSisaKuota(1_000_000, 1_250_000)).toBe(-250_000);
    });
  });

  describe('hitungStatusKuota', () => {
    it('berstatus aman saat sisa >= 30% kuota', () => {
      const kuota = 1_000_000;
      expect(hitungStatusKuota(kuota, 300_000, 700_000)).toBe('aman'); // tepat 30%
      expect(hitungStatusKuota(kuota, 500_000, 500_000)).toBe('aman'); // 50%
    });

    it('berstatus menipis saat 0 <= sisa < 30% kuota', () => {
      const kuota = 1_000_000;
      expect(hitungStatusKuota(kuota, 299_999, 700_001)).toBe('menipis'); // tepat di bawah 30%
      expect(hitungStatusKuota(kuota, 0, 1_000_000)).toBe('menipis'); // tepat 0%
    });

    it('berstatus over saat sisa < 0 (overbudget)', () => {
      const kuota = 1_000_000;
      expect(hitungStatusKuota(kuota, -1, 1_000_001)).toBe('over');
      expect(hitungStatusKuota(kuota, -100_000, 1_100_000)).toBe('over');
    });

    it('berstatus over saat kuota 0 dan ada pengeluaran jajan > 0', () => {
      expect(hitungStatusKuota(0, 0, 50_000)).toBe('over');
    });

    it('berstatus aman saat kuota 0 dan belum ada pengeluaran jajan', () => {
      expect(hitungStatusKuota(0, 0, 0)).toBe('aman');
    });
  });

  describe('hitungSaldoKasAktif', () => {
    it('menghitung saldo kumulatif toko dan jajan', () => {
      const totalMasuk = 10_000_000;
      const totalModal = 4_000_000;
      const totalJajan = 2_000_000;
      expect(hitungSaldoKasAktif(totalMasuk, totalModal, totalJajan)).toBe(4_000_000);
    });

    it('menghitung saldo saat semua 0', () => {
      expect(hitungSaldoKasAktif(0, 0, 0)).toBe(0);
    });
  });

  describe('hitungSaldoKasBulanIni', () => {
    it('menghitung saldo kas bersih bulan ini (tidak kumulatif)', () => {
      const masukBulan = 5_000_000;
      const modalBulan = 2_000_000;
      const jajanBulan = 1_000_000;
      expect(hitungSaldoKasBulanIni(masukBulan, modalBulan, jajanBulan)).toBe(2_000_000);
    });

    it('menghitung saat ada defisit / minus bulan ini', () => {
      const masukBulan = 1_000_000;
      const modalBulan = 2_000_000;
      const jajanBulan = 500_000;
      expect(hitungSaldoKasBulanIni(masukBulan, modalBulan, jajanBulan)).toBe(-1_500_000);
    });
  });

  describe('hitungAlokasiNominal', () => {
    const persen = { modal: 40, tabungan: 25, jajan: 25, sedekah: 10 };

    it('mengembalikan semua 0 jika profit <= 0', () => {
      const hasil = hitungAlokasiNominal(0, persen);
      expect(hasil).toEqual({ modal: 0, tabungan: 0, jajan: 0, sedekah: 0, total: 0 });

      const hasilNegatif = hitungAlokasiNominal(-500_000, persen);
      expect(hasilNegatif).toEqual({ modal: 0, tabungan: 0, jajan: 0, sedekah: 0, total: 0 });
    });

    it('menghitung pembagian nominal alokasi normal', () => {
      const profit = 2_000_000;
      const hasil = hitungAlokasiNominal(profit, persen);
      expect(hasil.modal).toBe(800_000);
      expect(hasil.tabungan).toBe(500_000);
      expect(hasil.jajan).toBe(500_000);
      expect(hasil.sedekah).toBe(200_000);
      expect(hasil.total).toBe(2_000_000);
      expect(hasil.modal + hasil.tabungan + hasil.jajan + hasil.sedekah).toBe(profit);
    });

    it('mengalirkan selisih pembulatan ke Tabungan agar total selalu tepat', () => {
      // 100.001 dibagi:
      // modal (40%): 40.000,4 -> 40.000
      // jajan (25%): 25.000,25 -> 25.000
      // sedekah (10%): 10.000,1 -> 10.000
      // modal + jajan + sedekah = 75.000
      // tabungan = 100.001 - 75.000 = 25.001 (menampung selisih pembulatan)
      const profit = 100_001;
      const hasil = hitungAlokasiNominal(profit, persen);
      expect(hasil.modal).toBe(40_000);
      expect(hasil.jajan).toBe(25_000);
      expect(hasil.sedekah).toBe(10_000);
      expect(hasil.tabungan).toBe(25_001);
      expect(hasil.modal + hasil.tabungan + hasil.jajan + hasil.sedekah).toBe(profit);
    });
  });

  describe('getTransactionNature & isExpenseType', () => {
    it('mengklasifikasikan Pemasukan dengan benar', () => {
      expect(getTransactionNature('Pemasukan Toko')).toBe('pemasukan');
      expect(getTransactionNature('Pemasukan')).toBe('pemasukan');
      expect(isExpenseType('Pemasukan Toko')).toBe(false);
    });

    it('mengklasifikasikan Pengeluaran Toko / Modal Toko dengan benar', () => {
      expect(getTransactionNature('Pengeluaran Toko')).toBe('pengeluaran');
      expect(getTransactionNature('Modal Toko')).toBe('pengeluaran');
      expect(getTransactionNature('Pengeluaran')).toBe('pengeluaran');
      expect(isExpenseType('Pengeluaran Toko')).toBe(true);
    });

    it('mengklasifikasikan Jajan Pribadi dengan benar', () => {
      expect(getTransactionNature('Jajan Pribadi')).toBe('jajan');
      expect(getTransactionNature('Jajan')).toBe('jajan');
      expect(isExpenseType('Jajan Pribadi')).toBe(true);
    });

    it('menghitung skenario transaksi November 2026 pengguna (hasil 500.586)', () => {
      const txs = [
        { type: 'Pemasukan Toko', amount: 75_000 },
        { type: 'Pengeluaran Toko', amount: 16_400 },
        { type: 'Pengeluaran Toko', amount: 2_562 },
        { type: 'Pemasukan Toko', amount: 444_548 },
      ];

      let masuk = 0;
      let keluar = 0;
      let jajan = 0;

      for (const t of txs) {
        const nature = getTransactionNature(t.type);
        if (nature === 'pemasukan') masuk += t.amount;
        else if (nature === 'pengeluaran') keluar += t.amount;
        else if (nature === 'jajan') jajan += t.amount;
      }

      expect(masuk).toBe(519_548);
      expect(keluar).toBe(18_962);
      expect(jajan).toBe(0);

      const profit = hitungProfit(masuk, keluar);
      expect(profit).toBe(500_586);

      const saldoBulanIni = hitungSaldoKasBulanIni(masuk, keluar, jajan);
      expect(saldoBulanIni).toBe(500_586);
    });

    it('menghitung trend 6 bulan dengan benar', () => {
      const txs = [
        { month_year: '2026-11', type: 'Pemasukan Toko', amount: 500_000 },
        { month_year: '2026-11', type: 'Pengeluaran Toko', amount: 100_000 },
        { month_year: '2026-11', type: 'Jajan Pribadi', amount: 50_000 },
        { month_year: '2026-10', type: 'Pemasukan Toko', amount: 400_000 },
        { month_year: '2026-10', type: 'Pengeluaran Toko', amount: 200_000 },
      ];

      const trend = hitungTrendBulanan(txs, '2026-11', 6);
      expect(trend.length).toBe(6);
      expect(trend[5].monthYear).toBe('2026-11');
      expect(trend[5].pemasukan).toBe(500_000);
      expect(trend[5].pengeluaran).toBe(100_000);
      expect(trend[5].jajan).toBe(50_000);
      expect(trend[5].profit).toBe(400_000);
      expect(trend[5].saldoBersih).toBe(350_000);

      expect(trend[4].monthYear).toBe('2026-10');
      expect(trend[4].pemasukan).toBe(400_000);
      expect(trend[4].pengeluaran).toBe(200_000);
      expect(trend[4].profit).toBe(200_000);

      // Bulan yang tidak ada transaksi harus bernilai 0
      expect(trend[0].pemasukan).toBe(0);
      expect(trend[0].profit).toBe(0);
    });
  });
});
