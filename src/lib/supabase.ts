import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Membersihkan dan memvalidasi URL Supabase dari berbagai format input:
 * - Menghilangkan trailing slash (/)
 * - Menghapus subpath bawaan yang sering salah disertakan (/rest/v1, /rest, /v1)
 * - Mengubah URL Dashboard (supabase.com/dashboard/project/...) menjadi URL API (.supabase.co)
 * - Menangani bare project ref
 */
export function sanitizeSupabaseUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  let url = rawUrl.trim();
  if (!url || url.includes('placeholder')) return null;

  // Jika berupa token JWT (biasanya diawali eyJ)
  if (url.startsWith('eyJ')) return null;

  // Jika pengguna menyalin URL browser Dashboard Supabase:
  // Contoh: https://supabase.com/dashboard/project/toqqwsstuftsfujvwzwh
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Jika pengguna hanya memasukkan ID Project (20 karakter alfanumerik)
  if (/^[a-z0-9]{20}$/i.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // Pastikan memiliki awalan protokol http:// atau https://
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Bersihkan trailing slash dan path yang tidak sengaja terbawa (/rest/v1, /rest, /v1)
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/rest\/?$/i, '');
  url = url.replace(/\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');

  return url;
}

/**
 * Mengambil dan menormalkan kredensial Supabase dari Environment Variables.
 * Otomatis mendeteksi jika URL dan Service Key tertukar posisi di Vercel.
 */
export function getSupabaseCredentials() {
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  let rawKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();

  // Deteksi jika pengguna tanpa sengaja menukar URL dan Key
  if (rawUrl && rawUrl.startsWith('eyJ') && rawKey && rawKey.startsWith('http')) {
    const temp = rawUrl;
    rawUrl = rawKey;
    rawKey = temp;
  }

  const url = sanitizeSupabaseUrl(rawUrl);
  const key = rawKey && !rawKey.includes('placeholder') ? rawKey : null;

  return { url, key };
}

let cachedClient: SupabaseClient<any> | null = null;
let lastUrl: string | null = null;
let lastKey: string | null = null;

export function getSupabaseServerClient(): SupabaseClient<any> | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return null;
  }

  // Jika variabel berubah saat runtime, update cache client
  if (!cachedClient || lastUrl !== url || lastKey !== key) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastUrl = url;
    lastKey = key;
  }

  return cachedClient;
}

/**
 * Format pesan error Supabase agar ramah dan memberikan instruksi langsung
 */
export function formatSupabaseError(error: any): string {
  if (!error) return 'Terjadi kesalahan sistem yang tidak diketahui';
  const msg = error.message || (typeof error === 'string' ? error : JSON.stringify(error));

  if (
    msg.includes('Invalid path specified in request URL') ||
    msg.includes('PGRST125') ||
    msg.includes('requested path is invalid')
  ) {
    return 'Database Supabase belum siap! Tabel "transactions" belum dibuat di database Supabase Anda. Buka menu Pengaturan > "Cek Status Database" atau jalankan script "supabase/schema.sql" di SQL Editor Supabase.';
  }

  if (
    msg.includes('relation "public.transactions" does not exist') ||
    msg.includes('PGRST205') ||
    msg.includes('Could not find the table')
  ) {
    return 'Tabel "transactions" tidak ditemukan di Supabase. Silakan jalankan script schema.sql di SQL Editor Supabase.';
  }

  if (
    msg.includes('JWT') ||
    msg.includes('apikey') ||
    msg.includes('UNAUTHORIZED') ||
    msg.includes('unauthorized') ||
    msg.includes('Invalid API key')
  ) {
    return 'Kunci Supabase ditolak! Pastikan nilai SUPABASE_SERVICE_ROLE_KEY di Vercel diisi dengan "service_role" secret dari Supabase (Project Settings > API).';
  }

  return msg;
}

/**
 * Diagnostic koneksi database Supabase
 */
export async function testSupabaseConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  tableExists: boolean;
  message: string;
  projectUrl: string | null;
  details?: string;
}> {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return {
      configured: false,
      connected: false,
      tableExists: false,
      projectUrl: null,
      message: 'Variabel Supabase belum diatur (NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY). Aplikasi saat ini menggunakan penyimpanan lokal.',
    };
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return {
      configured: false,
      connected: false,
      tableExists: false,
      projectUrl: url,
      message: 'Gagal membuat Supabase client.',
    };
  }

  try {
    const { error } = await client
      .from('transactions')
      .select('id')
      .limit(1);

    if (error) {
      const formatted = formatSupabaseError(error);
      return {
        configured: true,
        connected: false,
        tableExists: false,
        projectUrl: url,
        message: formatted,
        details: error.message || String(error),
      };
    }

    return {
      configured: true,
      connected: true,
      tableExists: true,
      projectUrl: url,
      message: 'Koneksi database Supabase normal! Tabel "transactions" aktif dan siap digunakan.',
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      tableExists: false,
      projectUrl: url,
      message: formatSupabaseError(err),
      details: err.message || String(err),
    };
  }
}
