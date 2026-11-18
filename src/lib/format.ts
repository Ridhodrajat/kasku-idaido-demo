/**
 * Format helpers for Indonesian Rupiah & Numbers
 */

export const rupiah = (n: number): string => {
  if (isNaN(n)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
};

export const formatAngka = (n: number): string => {
  if (isNaN(n)) return '0';
  return new Intl.NumberFormat('id-ID').format(n);
};

export const parseAngka = (str: string): number => {
  const clean = str.replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
};
