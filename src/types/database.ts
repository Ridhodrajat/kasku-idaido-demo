export type TransactionType =
  | 'Pemasukan Toko'
  | 'Pengeluaran Toko'
  | 'Modal Toko'
  | 'Jajan Pribadi'
  | string;

export interface CustomTransactionType {
  id: string;
  name: string;
  direction: 'in' | 'out'; // 'in' = menambah kas (+), 'out' = mengurangi kas (-)
  color?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  notes: string | null;
  month_year: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MonthlyAllocation {
  id: string; // YYYY-MM
  target_jajan: number;
  pct_modal: number;
  pct_tabungan: number;
  pct_jajan: number;
  pct_sedekah: number;
  evaluation_note: string | null;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlySummary {
  month_year: string;
  total_masuk: number;
  total_modal: number;
  jajan_terpakai: number;
  profit: number;
}
