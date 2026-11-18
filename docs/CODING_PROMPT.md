# Prompt untuk Coding Gem / AI Coding Assistant

Salin seluruh isi di bawah garis ini ke Coding Gem. Lampirkan juga PRD, `supabase/schema.sql`, dan `docs/design-tokens.md`.

---

Kamu adalah senior full-stack engineer. Bangun **Kasku Idaido**, PWA mobile-first untuk mencatat kas toko digital dan jajan pribadi berdua, mengikuti PRD terlampir secara ketat. Antarmuka berbahasa Indonesia.

## Tech stack (wajib, semua gratis)
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (PostgreSQL) diakses HANYA dari server memakai `SUPABASE_SERVICE_ROLE_KEY`
- Vercel untuk hosting
- Zod (validasi), date-fns + date-fns-tz (zona waktu Asia/Makassar), lucide-react (ikon), Serwist atau next-pwa (PWA)

## Urutan kerja (selesaikan satu fase, tunjukkan hasil, lalu lanjut)
1. **Fondasi:** inisialisasi proyek, Tailwind dengan design tokens dari `docs/design-tokens.md`, font Plus Jakarta Sans, layout mobile (max-w 480px) dengan Bottom Navigation 5 tab (Beranda, Riwayat, + Catat menonjol di tengah, Alokasi, Pengaturan).
2. **Auth PIN:** halaman PIN 6 digit; verifikasi di server terhadap `APP_PIN`; cookie sesi httpOnly+secure+sameSite=lax bertanda tangan (`SESSION_SECRET`), 30 hari; rate limit 5 salah/10 menit lalu kunci 15 menit; `middleware.ts` memproteksi semua rute dan API selain halaman PIN.
3. **Transaksi:** bottom sheet form dinamis (Tipe via segmented chips, Nominal dengan format ribuan + tombol cepat +10rb/+50rb/+100rb, Kategori dinamis menurut Tipe dengan opsi "Lainnya" = input text maks 40 karakter, Tanggal, Catatan). API CRUD dengan soft delete (`deleted_at`). `month_year` diisi trigger database.
4. **Dashboard:** selektor bulan; Kartu Toko (Saldo Kas Aktif, Profit Berjalan, Total Masuk vs Keluar); Kartu Jajan (Sisa Kuota, progress bar, badge Aman/Menipis/Overbudget); 5 transaksi terbaru; empty state dan skeleton.
5. **Alokasi bulanan:** 4 input persen (wajib total 100, tampilkan selisih), Target Jajan opsional, nominal otomatis, tombol "Pakai bulan lalu", catatan evaluasi, Tutup Bulan.
6. **Riwayat:** daftar per tanggal, filter tipe, pencarian, edit/hapus.
7. **Pengaturan & PWA:** ekspor CSV, keluar, manifest (`public/manifest.json`), service worker (cache app shell, halaman offline), ikon.

## Rumus (tulis sebagai fungsi murni di `lib/hitung.ts` dan beri unit test)
- profit = total Pemasukan Toko bulan itu - total Modal Toko bulan itu
- jajan_terpakai = total Jajan Pribadi bulan itu
- kuota_jajan = target_jajan jika > 0, selain itu max(0, profit) * pct_jajan / 100
- sisa_kuota = kuota_jajan - jajan_terpakai (boleh negatif)
- saldo_kas_aktif = semua Pemasukan - semua Modal - semua Jajan (kumulatif, tanpa data terhapus)
- status: Aman jika sisa >= 30% kuota; Menipis jika 0 <= sisa < 30%; Overbudget jika sisa < 0; kuota 0 + ada jajan = Overbudget
- alokasi nominal = profit * pct / 100, dibulatkan; selisih pembulatan masuk ke Tabungan; profit <= 0 maka semua Rp 0

## Aturan kualitas
- Semua nominal bilangan bulat rupiah, tampil `Rp 1.250.000` (locale id-ID).
- Validasi dengan Zod di klien dan server; jangan percaya input klien.
- Tidak ada secret di bundle klien (hanya `NEXT_PUBLIC_*` yang boleh).
- Target sentuh >= 44px, kontras WCAG AA, status ditandai ikon + teks (bukan hanya warna).
- Setelah mutasi, dashboard langsung terbarui (revalidate).
- Tulis unit test untuk `lib/hitung.ts` (profit negatif, pembulatan, batas 30%, kuota 0).
- Jelaskan setiap keputusan yang menyimpang dari PRD sebelum menerapkannya.

## Hasil akhir
Kode lengkap + `README.md` langkah deploy ke Vercel + daftar variabel lingkungan sesuai `.env.example`.
