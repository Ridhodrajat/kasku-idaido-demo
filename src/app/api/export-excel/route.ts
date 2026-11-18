import { NextRequest, NextResponse } from 'next/server';
import { fetchTransactions } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { toZonedTime } from '@/lib/date';
import { format } from 'date-fns';
import { getTransactionNature } from '@/lib/constants';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  // Verifikasi otentikasi sesi
  const isAuth = await getSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthYear = searchParams.get('bulan');

  const transactions = await fetchTransactions(
    monthYear ? { monthYear } : undefined
  );

  // Urutkan transaksi dari yang paling baru ke terlama
  transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let totalMasuk = 0;
  let totalKeluarToko = 0;
  let totalJajan = 0;

  // Header tabel Excel
  const rows: (string | number)[][] = [
    [
      'No',
      'Tanggal & Waktu (WITA)',
      'Jenis Transaksi',
      'Kategori',
      'Arus Kas',
      'Nominal (Rp)',
      'Bulan',
      'Catatan',
    ],
  ];

  transactions.forEach((t, idx) => {
    const zoned = toZonedTime(new Date(t.date), 'Asia/Makassar');
    const formattedDate = format(zoned, 'dd/MM/yyyy HH:mm:ss');
    const nature = getTransactionNature(t.type);

    let arusKas = 'Keluar';
    if (nature === 'pemasukan') {
      arusKas = 'Masuk';
      totalMasuk += t.amount;
    } else if (nature === 'jajan') {
      arusKas = 'Jajan (Keluar)';
      totalJajan += t.amount;
    } else {
      arusKas = 'Pengeluaran Toko';
      totalKeluarToko += t.amount;
    }

    rows.push([
      idx + 1,
      formattedDate,
      t.type,
      t.category,
      arusKas,
      t.amount,
      t.month_year,
      t.notes || '',
    ]);
  });

  // Baris pemisah dan Ringkasan Total
  const profitToko = totalMasuk - totalKeluarToko;
  const saldoBersih = totalMasuk - totalKeluarToko - totalJajan;

  rows.push([]);
  rows.push(['', '', '', '', 'TOTAL PEMASUKAN:', totalMasuk, '', '']);
  rows.push(['', '', '', '', 'TOTAL PENGELUARAN TOKO:', totalKeluarToko, '', '']);
  rows.push(['', '', '', '', 'TOTAL JAJAN PRIBADI:', totalJajan, '', '']);
  rows.push(['', '', '', '', 'PROFIT TOKO BERSIH:', profitToko, '', '']);
  rows.push(['', '', '', '', 'SISA KAS BERSIH (NET):', saldoBersih, '', '']);

  // Buat workbook & sheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Atur lebar kolom otomatis agar rapi saat dibuka di Excel
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 22 }, // Tanggal & Waktu
    { wch: 20 }, // Jenis Transaksi
    { wch: 24 }, // Kategori
    { wch: 22 }, // Arus Kas
    { wch: 18 }, // Nominal (Rp)
    { wch: 12 }, // Bulan
    { wch: 35 }, // Catatan
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');

  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const filename = monthYear
    ? `kasku-transaksi-${monthYear}.xlsx`
    : `kasku-semua-transaksi.xlsx`;

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
