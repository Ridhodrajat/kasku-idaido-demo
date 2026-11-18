# 🌿 Kasku Idaido (Portfolio Demo Version)

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Mobile--First-green?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Excel](https://img.shields.io/badge/Export-Excel_(.xlsx)-107c41?logo=microsoftexcel)](https://sheetjs.com/)

> **Aplikasi PWA Mobile-First Finansial:** Memisahkan arus kas toko digital (*Kas Toko*) dan pengeluaran personal berdua (*Jajan Pribadi*) secara cerdas, aman, dan proporsional.

---

## 🌟 Latar Belakang & Masalah
Banyak pebisnis digital dan pasangan muda mencampurkan uang modal toko online dengan uang jajan harian. Akibatnya:
- Modal usaha tidak sengaja terpakai untuk konsumsi pribadi.
- Laba bersih sulit diketahui secara pasti.
- Tabungan dan sedekah tidak pernah teralokasikan secara disiplin.

**Kasku Idaido** hadir sebagai solusi berbasis web mobile yang dapat diinstal langsung di layar utama smartphone (PWA) tanpa perlu mengunduh dari App Store / Play Store.

---

## ✨ Fitur-Fitur Utama

### 1. 🏪 Kas Toko Digital vs ☕ Jajan Pribadi
- **Kartu Kas Toko:** Memantau Saldo Kas Aktif (kumulatif), Saldo Kas Bulan Ini (bersih), total pemasukan, dan pengeluaran toko.
- **Kartu Jajan Berdua:** Kuota jajan dinamis yang dihitung dari persentase profit toko. Dilengkapi indikator pintar (**Aman**, **Menipis**, atau **Overbudget**).

### 2. 📊 Diagram Analisis Finansial & Tren 6 Bulan
- **Komposisi Arus Kas:** Diagram batang multi-segmen proporsional yang memvisualisasikan porsi Pemasukan yang berubah menjadi Profit vs Pengeluaran Toko vs Jajan.
- **Grafik Batang 6 Bulan:** Diagram batang komparatif interaktif yang membandingkan Pemasukan vs Pengeluaran dari bulan ke bulan.

### 3. 🥧 Alokasi Profit 4 Pos (Financial Planning)
- Membagi laba bersih ke dalam 4 pos finansial:
  1. **Pengeluaran Toko** (Stok/Re-investasi)
  2. **Tabungan Masa Depan**
  3. **Jajan Pribadi Berdua**
  4. **Sedekah / Berbagi**
- Dilengkapi mekanisme penampung selisih pembulatan otomatis ke pos Tabungan sehingga total persentase selalu tepat 100%.

### 4. 📑 Ekspor Cadangan Data (.xlsx & .csv)
- **Microsoft Excel Asli (.xlsx):** Format rapi per kolom dengan auto-fit column widths, format angka murni (bisa langsung menggunakan rumus `=SUM`), dan baris ringkasan otomatis.
- **File CSV (.csv):** Menggunakan UTF-8 BOM dan pemisah titik koma (`;`) standar Excel Windows di Indonesia.

### 5. 🔒 Keamanan Sesi PIN & Mode Demo 1-Klik
- Otentikasi PIN 6 digit dengan session cookie terenkripsi (`jose` JWT) dan rate limiting (5x salah berturut-turut mengunci aplikasi selama 15 menit).
- **Mode Demo Portofolio:** Pengunjung dapat menggunakan tombol 1-klik **"🚀 Masuk Seketika (Auto PIN: 123456)"** dan memiliki sandbox data pribadi yang bebas diuji coba tanpa saling menimpa data pengunjung lain.
- Terdapat tombol **"🔄 Reset Data Contoh"** untuk mengembalikan simulasi ke kondisi awal kapan saja.

---

## 🛠️ Tech Stack & Arsitektur

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Bahasa** | TypeScript |
| **Styling** | Tailwind CSS v4 (Multi-tone Pastel Green Theme) |
| **Otentikasi** | Signed JWT HTTP-Only Cookies via `jose` |
| **Spreadsheet Engine** | SheetJS (`xlsx`) |
| **Waktu & Kalender** | `date-fns` & `date-fns-tz` (WITA / Asia/Makassar) |
| **PWA Support** | Service Worker, Web App Manifest, Cache App Shell |
| **Icons** | Lucide React |

---

## 🚀 Menjalankan Secara Lokal (Quick Start)

Versi demo ini didesain **100% standalone dan zero-configuration** (tidak memerlukan setup database eksternal untuk menjalankannya):

```bash
# 1. Clone repositori ini
git clone https://github.com/Ridhodrajat/kasku-idaido-demo.git

# 2. Masuk ke direktori proyek
cd kasku-idaido-demo

# 3. Instal dependensi
npm install

# 4. Jalankan server pengembangan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda. Klik tombol **"🚀 Masuk Seketika (Auto PIN: 123456)"** untuk langsung menjelajahi dashboard!

---

## 📱 Panduan PWA di HP
- **Android (Chrome):** Tekan tombol titik tiga di pojok kanan atas browser > pilih **"Instal aplikasi"** / **"Tambahkan ke Layar Utama"**.
- **iPhone / iPad (Safari):** Tekan tombol **Bagikan (Share)** > pilih **"Tambah ke Layar Utama"**.

---

## 👨‍💻 Pengembang
Dibuat dengan ❤️ oleh **[Ridho Drajat](https://github.com/Ridhodrajat)**  
*Full-Stack Web & Mobile Developer*
