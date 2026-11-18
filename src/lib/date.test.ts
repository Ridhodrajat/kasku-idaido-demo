import { describe, it, expect } from 'vitest';
import { getCurrentMonthYear, formatBulanTahun, getDaftarBulanPilihan } from './date';

describe('date.ts helper', () => {
  it('menghasilkan format YYYY-MM untuk bulan saat ini', () => {
    const ym = getCurrentMonthYear();
    expect(ym).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
  });

  it('memformat YYYY-MM ke nama bulan bahasa Indonesia', () => {
    expect(formatBulanTahun('2026-10')).toBe('Oktober 2026');
    expect(formatBulanTahun('2026-01')).toBe('Januari 2026');
  });

  it('menghasilkan 12 pilihan bulan terakhir', () => {
    const list = getDaftarBulanPilihan(12);
    expect(list.length).toBe(12);
    expect(list[0].value).toMatch(/^\d{4}-\d{2}$/);
  });
});
