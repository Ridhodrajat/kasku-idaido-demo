import { NextRequest, NextResponse } from 'next/server';
import { fetchTransactions } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { toZonedTime } from '@/lib/date';
import { format } from 'date-fns';
import { getTransactionNature } from '@/lib/constants';

export async function GET(request: NextRequest) {
  // Verifikasi otentikasi
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

  // Buat header CSV dengan pemisah titik koma (;) standar Excel Windows di Indonesia
  const header = [
    'No',
    'Tanggal & Waktu (WITA)',
    'Jenis Transaksi',
    'Kategori',
    'Arus Kas',
    'Nominal (Rp)',
    'Bulan',
    'Catatan',
  ];

  let totalMasuk = 0;
  let totalKeluarToko = 0;
  let totalJajan = 0;

  const rows = transactions.map((t, idx) => {
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

    return [
      idx + 1,
      `"${formattedDate}"`,
      `"${t.type.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${arusKas}"`,
      t.amount,
      `"${t.month_year}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ].join(';');
  });

  const profitToko = totalMasuk - totalKeluarToko;
  const saldoBersih = totalMasuk - totalKeluarToko - totalJajan;

  const summaryRows = [
    '',
    `;;;;TOTAL PEMASUKAN;${totalMasuk};;`,
    `;;;;TOTAL PENGELUARAN TOKO;${totalKeluarToko};;`,
    `;;;;TOTAL JAJAN PRIBADI;${totalJajan};;`,
    `;;;;PROFIT TOKO BERSIH;${profitToko};;`,
    `;;;;SISA KAS BERSIH (NET);${saldoBersih};;`,
  ];

  // \uFEFF adalah UTF-8 BOM agar Excel Windows langsung mengenali encoding UTF-8
  // sep=; memberitahu Excel untuk menggunakan pemisah titik koma antar kolom
  const csvContent =
    '\uFEFFsep=;\r\n' +
    header.join(';') +
    '\r\n' +
    rows.join('\r\n') +
    '\r\n' +
    summaryRows.join('\r\n');

  const filename = monthYear
    ? `kasku-transaksi-${monthYear}.csv`
    : `kasku-semua-transaksi.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
