'use client';

import React, { useState, useTransition } from 'react';
import { logoutAction } from '@/actions/auth';
import { resetDemoAction } from '@/actions/demo';
import { getCurrentMonthYear } from '@/lib/date';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Download,
  LogOut,
  Smartphone,
  Shield,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  HeartHandshake,
  Code2,
  Layers,
  Cpu,
} from 'lucide-react';

export default function PengaturanPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const currentYm = getCurrentMonthYear();

  const handleResetDemo = () => {
    if (!confirm('Kembalikan seluruh data transaksi ke kondisi awal (6 bulan data realistis)?')) {
      return;
    }
    setIsResetting(true);
    startTransition(async () => {
      const res = await resetDemoAction();
      setIsResetting(false);
      setResetMessage(res.message);
      router.refresh();
      setTimeout(() => setResetMessage(null), 3500);
    });
  };

  const handleLogout = () => {
    if (!confirm('Keluar dari aplikasi demo Kasku Idaido?')) return;
    startTransition(async () => {
      await logoutAction();
    });
  };

  const handleExportExcelMonth = () => {
    window.open(`/api/export-excel?bulan=${currentYm}`, '_blank');
  };

  const handleExportExcelAll = () => {
    window.open('/api/export-excel', '_blank');
  };

  const handleExportCsvMonth = () => {
    window.open(`/api/export-csv?bulan=${currentYm}`, '_blank');
  };

  const handleExportCsvAll = () => {
    window.open('/api/export-csv', '_blank');
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 pb-6 gap-4">
      {/* Top Header */}
      <header className="py-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-aksi tracking-wider uppercase">
          <Settings className="w-3.5 h-3.5" />
          <span>Pengaturan</span>
        </div>
        <h1 className="text-xl font-extrabold text-app-text tracking-tight">
          Sistem & Portofolio
        </h1>
      </header>

      {/* 1. Mode Demo & Info Portofolio */}
      <div className="p-5 bg-white rounded-3xl border border-app-line shadow-card flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-aksi flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-app-text">Versi Demo Portofolio</h2>
              <p className="text-[11px] text-app-muted">
                Dibuat oleh <strong>Ridho Drajat</strong>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            v2.0 Demo
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-app-line text-xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sandbox Mandiri Aktif</span>
          </div>
          <p className="text-[11px] text-app-muted leading-relaxed">
            Data transaksi disimpan di browser/sesi perangkat Anda secara terisolasi. Pengunjung lain tidak akan melihat atau mengubah data yang Anda masukkan.
          </p>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Next.js 16', 'TypeScript', 'Tailwind CSS v4', 'PWA Mobile-First', 'SheetJS (.xlsx)', 'Jose JWT'].map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-app-line text-app-text"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Tombol Reset Data Contoh */}
          <div className="pt-2 border-t border-app-line/70 flex items-center justify-between gap-2">
            <span className="text-[11px] text-app-muted">Ingin mengulang simulasi?</span>
            <button
              type="button"
              onClick={handleResetDemo}
              disabled={isResetting || isPending}
              className="py-1.5 px-3 rounded-xl bg-aksi hover:bg-aksi-hover text-white text-xs font-bold shadow-aksi flex items-center gap-1.5 active:scale-95 transition-all touch-press cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Mereset...' : 'Reset Data Contoh'}</span>
            </button>
          </div>

          {resetMessage && (
            <p className="text-[11px] text-status-aman font-bold text-center mt-1 animate-pulse">
              ✓ {resetMessage}
            </p>
          )}
        </div>
      </div>

      {/* 2. Ekspor & Cadangan Data */}
      <div className="p-5 bg-white rounded-3xl border border-app-line shadow-card flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-status-aman flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-app-text">Cadangan Data (Excel & CSV)</h2>
            <p className="text-[11px] text-app-muted">
              Ekspor transaksi rapi per kolom dengan ringkasan otomatis
            </p>
          </div>
        </div>

        {/* Pilihan 1: Excel Asli (.xlsx) - Rekomendasi */}
        <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <span>📊 Microsoft Excel (.xlsx)</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded-md font-extrabold">
                Rekomendasi
              </span>
            </span>
            <span className="text-[10px] text-emerald-700">Rapi per kolom</span>
          </div>
          <p className="text-[11px] text-emerald-800/80">
            Kolom terpisah otomatis, format angka asli (bisa di-SUM), & rumus ringkasan.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={handleExportExcelMonth}
              className="py-2.5 px-3 bg-white hover:bg-emerald-100/60 rounded-xl text-xs font-bold text-emerald-950 border border-emerald-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all duration-100 touch-press cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bulan Ini ({currentYm})</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcelAll}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all duration-100 touch-press cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Semua Transaksi</span>
            </button>
          </div>
        </div>

        {/* Pilihan 2: CSV Terformat */}
        <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#FAF6F0] border border-app-line">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-text">📄 File CSV (.csv)</span>
            <span className="text-[10px] text-app-muted">Pemisah Titik Koma (;)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <button
              type="button"
              onClick={handleExportCsvMonth}
              className="py-2 px-3 bg-white hover:bg-[#F0E8DC] rounded-xl text-xs font-bold text-app-text border border-app-line flex items-center justify-center gap-1.5 active:scale-95 transition-all duration-100 touch-press cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-aksi" />
              <span>Bulan Ini</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsvAll}
              className="py-2 px-3 bg-white hover:bg-[#F0E8DC] rounded-xl text-xs font-bold text-app-text border border-app-line flex items-center justify-center gap-1.5 active:scale-95 transition-all duration-100 touch-press cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-app-muted" />
              <span>Semua Transaksi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Panduan Pasang PWA di Ponsel */}
      <div className="p-5 bg-white rounded-3xl border border-app-line shadow-card flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-aksi/10 text-aksi flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-app-text">Pasang di Layar Utama HP</h2>
            <p className="text-[11px] text-app-muted">
              Aplikasi PWA dapat dibuka tanpa bilah URL browser
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-1 text-xs">
          <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-app-line">
            <p className="font-bold text-app-text mb-0.5">📱 Android (Google Chrome)</p>
            <p className="text-app-muted text-[11px]">
              Buka menu titik tiga di pojok kanan atas browser &gt; pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-app-line">
            <p className="font-bold text-app-text mb-0.5">🍏 iPhone / iPad (Safari)</p>
            <p className="text-app-muted text-[11px]">
              Tekan tombol <strong>Bagikan (Share)</strong> di bagian bawah &gt; gulir ke bawah lalu pilih <strong>"Tambah ke Layar Utama"</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Keamanan & Akun */}
      <div className="p-5 bg-white rounded-3xl border border-app-line shadow-card flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-app-text">Keamanan Sesi Demo</h2>
            <p className="text-[11px] text-app-muted">
              PIN Akses Demo: <strong className="text-app-text">123456</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="mt-1 w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-status-over text-xs font-bold flex items-center justify-center gap-2 transition-all duration-100 touch-press active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{isPending ? 'Keluar...' : 'Kunci / Keluar dari Demo'}</span>
        </button>
      </div>

      {/* 5. Footer Info */}
      <div className="flex flex-col items-center justify-center text-center mt-2 pb-4 text-app-muted">
        <div className="flex items-center gap-1 text-xs font-bold text-app-text mb-1">
          <HeartHandshake className="w-4 h-4 text-jajan" />
          <span>Kasku Idaido v2.0 (Demo Portofolio)</span>
        </div>
        <p className="text-[11px] max-w-[260px]">
          Kas Toko Digital & Jajan Pribadi Berdua. Portofolio Full-Stack Web App.
        </p>
      </div>
    </div>
  );
}
