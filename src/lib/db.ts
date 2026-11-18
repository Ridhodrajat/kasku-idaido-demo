import { Transaction, MonthlyAllocation } from '@/types/database';
import { getTransactionNature } from './constants';
import { getCurrentMonthYear, toZonedTime } from './date';
import { format } from 'date-fns';
import { getDemoStorage, saveDemoStorage } from './demoStore';

function normalizeTx(tx: Transaction): Transaction {
  if (tx.type === 'Modal Toko') {
    const match = (tx.category || '').match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return { ...tx, type: match[1], category: match[2] || tx.category };
    }
    return { ...tx, type: 'Pengeluaran Toko' };
  }
  return tx;
}

// -------------------------------------------------------------
// TRANSACTIONS
// -------------------------------------------------------------

export async function fetchTransactions(options?: {
  monthYear?: string;
  type?: string;
  search?: string;
  limit?: number;
}): Promise<Transaction[]> {
  const store = await getDemoStorage();
  let list = store.transactions.filter((tx) => !tx.deleted_at).map(normalizeTx);

  if (options?.monthYear) {
    list = list.filter((tx) => tx.month_year === options.monthYear);
  }
  if (options?.type) {
    if (options.type === 'Pengeluaran Toko' || options.type === 'Pengeluaran') {
      list = list.filter((tx) => tx.type === 'Pengeluaran Toko' || tx.type === 'Modal Toko');
    } else {
      list = list.filter((tx) => tx.type === options.type);
    }
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (tx) =>
        tx.category.toLowerCase().includes(q) ||
        (tx.notes && tx.notes.toLowerCase().includes(q))
    );
  }

  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (options?.limit) {
    list = list.slice(0, options.limit);
  }
  return list;
}

export async function insertTransaction(tx: {
  date: string;
  type: string;
  category: string;
  amount: number;
  notes?: string | null;
}): Promise<Transaction> {
  const zonedDate = toZonedTime(new Date(tx.date), 'Asia/Makassar');
  const monthYear = format(zonedDate, 'yyyy-MM');

  const store = await getDemoStorage();
  const newTx: Transaction = {
    id: `demo-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: tx.date,
    type: tx.type === 'Modal Toko' ? 'Pengeluaran Toko' : tx.type,
    category: tx.category,
    amount: tx.amount,
    notes: tx.notes || null,
    month_year: monthYear,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };
  store.transactions.unshift(newTx);
  await saveDemoStorage(store);
  return newTx;
}

export async function updateTransactionInDb(
  id: string,
  tx: {
    date: string;
    type: string;
    category: string;
    amount: number;
    notes?: string | null;
  }
): Promise<Transaction> {
  const zonedDate = toZonedTime(new Date(tx.date), 'Asia/Makassar');
  const monthYear = format(zonedDate, 'yyyy-MM');

  const store = await getDemoStorage();
  const idx = store.transactions.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Transaksi tidak ditemukan');

  const updated: Transaction = {
    ...store.transactions[idx],
    date: tx.date,
    type: tx.type === 'Modal Toko' ? 'Pengeluaran Toko' : tx.type,
    category: tx.category,
    amount: tx.amount,
    notes: tx.notes || null,
    month_year: monthYear,
    updated_at: new Date().toISOString(),
  };
  store.transactions[idx] = updated;
  await saveDemoStorage(store);
  return updated;
}

export async function softDeleteTransaction(id: string): Promise<boolean> {
  const store = await getDemoStorage();
  const item = store.transactions.find((t) => t.id === id);
  if (item) {
    item.deleted_at = new Date().toISOString();
    await saveDemoStorage(store);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// MONTHLY ALLOCATIONS
// -------------------------------------------------------------

export async function fetchMonthlyAllocation(monthYear: string): Promise<MonthlyAllocation | null> {
  const store = await getDemoStorage();
  return store.allocations.find((a) => a.id === monthYear) || null;
}

export async function fetchLatestPriorAllocation(beforeMonthYear: string): Promise<MonthlyAllocation | null> {
  const store = await getDemoStorage();
  const sorted = [...store.allocations]
    .filter((a) => a.id < beforeMonthYear)
    .sort((a, b) => b.id.localeCompare(a.id));
  return sorted[0] || null;
}

export async function upsertMonthlyAllocation(
  allocation: Omit<MonthlyAllocation, 'created_at' | 'updated_at'>
): Promise<MonthlyAllocation> {
  const store = await getDemoStorage();
  const idx = store.allocations.findIndex((a) => a.id === allocation.id);
  const now = new Date().toISOString();

  if (idx >= 0) {
    const updated: MonthlyAllocation = {
      ...store.allocations[idx],
      ...allocation,
      updated_at: now,
    };
    store.allocations[idx] = updated;
    await saveDemoStorage(store);
    return updated;
  } else {
    const created: MonthlyAllocation = {
      ...allocation,
      created_at: now,
      updated_at: now,
    };
    store.allocations.push(created);
    await saveDemoStorage(store);
    return created;
  }
}

// -------------------------------------------------------------
// SUMMARY & CALCULATIONS DATA FETCH
// -------------------------------------------------------------

export async function fetchSummaryData(monthYear: string) {
  const [allActiveTransactions, fetchedAllocation] = await Promise.all([
    fetchTransactions(),
    fetchMonthlyAllocation(monthYear),
  ]);

  const monthlyTransactions = allActiveTransactions.filter(
    (tx) => tx.month_year === monthYear
  );

  let allocation = fetchedAllocation;

  if (!allocation) {
    allocation = {
      id: monthYear,
      target_jajan: 0,
      pct_modal: 40,
      pct_tabungan: 25,
      pct_jajan: 25,
      pct_sedekah: 10,
      evaluation_note: null,
      is_closed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Ringkasan transaksi bulan berjalan
  let pemasukanBulan = 0;
  let modalBulan = 0;
  let jajanBulan = 0;

  for (const tx of monthlyTransactions) {
    const nature = getTransactionNature(tx.type);
    if (nature === 'pemasukan') pemasukanBulan += tx.amount;
    else if (nature === 'pengeluaran') modalBulan += tx.amount;
    else if (nature === 'jajan') jajanBulan += tx.amount;
  }

  // Kumulatif semua waktu (untuk Saldo Kas Aktif)
  let totalMasukSemua = 0;
  let totalModalSemua = 0;
  let totalJajanSemua = 0;

  for (const tx of allActiveTransactions) {
    const nature = getTransactionNature(tx.type);
    if (nature === 'pemasukan') totalMasukSemua += tx.amount;
    else if (nature === 'pengeluaran') totalModalSemua += tx.amount;
    else if (nature === 'jajan') totalJajanSemua += tx.amount;
  }

  return {
    monthYear,
    allActiveTransactions,
    monthlyTransactions,
    allocation,
    monthly: {
      pemasukan: pemasukanBulan,
      modal: modalBulan,
      jajan: jajanBulan,
    },
    cumulative: {
      totalMasuk: totalMasukSemua,
      totalModal: totalModalSemua,
      totalJajan: totalJajanSemua,
    },
  };
}
