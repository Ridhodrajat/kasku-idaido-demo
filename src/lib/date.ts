import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { id } from 'date-fns/locale';

export { toZonedTime };

export const TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Makassar';

/**
 * Mendapatkan tanggal saat ini di zona waktu WITA / Asia/Makassar
 */
export function getNowZoned(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Mendapatkan string YYYY-MM bulan saat ini di zona waktu WITA
 */
export function getCurrentMonthYear(): string {
  const now = getNowZoned();
  return format(now, 'yyyy-MM');
}

/**
 * Format string YYYY-MM menjadi "Oktober 2026"
 */
export function formatBulanTahun(monthYear: string): string {
  try {
    const [year, month] = monthYear.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(date, 'MMMM yyyy', { locale: id });
  } catch {
    return monthYear;
  }
}

/**
 * Format tanggal transaksi untuk label grouping di daftar riwayat
 */
export function formatTanggalGroup(dateStr: string): string {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    const zoned = toZonedTime(date, TIMEZONE);

    if (isToday(zoned)) {
      return 'Hari Ini';
    }
    if (isYesterday(zoned)) {
      return 'Kemarin';
    }
    return format(zoned, 'EEEE, d MMMM yyyy', { locale: id });
  } catch {
    return dateStr;
  }
}

/**
 * Format tanggal pendek untuk item transaksi ("25 Okt")
 */
export function formatTanggalPendek(dateStr: string): string {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    const zoned = toZonedTime(date, TIMEZONE);
    return format(zoned, 'd MMM yyyy, HH:mm', { locale: id });
  } catch {
    return dateStr;
  }
}

/**
 * Mendapatkan daftar 12 bulan terakhir untuk dropdown selektor bulan
 */
export function getDaftarBulanPilihan(count = 12): { value: string; label: string }[] {
  const list = [];
  const now = getNowZoned();

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = format(d, 'yyyy-MM');
    const label = format(d, 'MMMM yyyy', { locale: id });
    list.push({ value: val, label });
  }
  return list;
}
