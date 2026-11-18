'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { verifyPinAction, checkPinStatus } from '@/actions/auth';
import { Lock, Delete, ShieldAlert, Sparkles } from 'lucide-react';

export default function MasukPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Cek status lock awal
  useEffect(() => {
    checkPinStatus().then((res) => {
      if (res.isLocked && res.remainingLockSeconds) {
        setIsLocked(true);
        setLockSeconds(res.remainingLockSeconds);
        setError(res.error || 'Aplikasi terkunci');
      }
    });
  }, []);

  // Hitung mundur jika terkunci
  useEffect(() => {
    if (!isLocked || lockSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setError(null);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLocked, lockSeconds]);

  const handleKeyPress = (num: string) => {
    if (isLocked || isPending) return;
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(null);

      if (nextPin.length === 6) {
        submitPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (isLocked || isPending) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    if (isLocked || isPending) return;
    setPin('');
    setError(null);
  };

  const handleAutoFillDemo = () => {
    if (isPending || isLocked) return;
    setError(null);
    const demoPin = '123456';
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setPin(demoPin.slice(0, i));
      if (i === 6) {
        clearInterval(interval);
        submitPin(demoPin);
      }
    }, 70);
  };

  const submitPin = (pinToSubmit: string) => {
    startTransition(async () => {
      const res = await verifyPinAction(pinToSubmit);
      if (res.success) {
        window.location.href = '/';
      } else {
        setPin('');
        if (res.isLocked && res.remainingLockSeconds) {
          setIsLocked(true);
          setLockSeconds(res.remainingLockSeconds);
        }
        setError(res.error || 'PIN salah');
      }
    });
  };

  // Dukungan input keyboard fisik untuk desktop / laptop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked || isPending) return;
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isLocked, isPending]);

  const formatLockTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className="flex-1 flex flex-col justify-between px-6 py-8 min-h-dvh">
      {/* Header & Logo */}
      <div className="flex flex-col items-center text-center mt-6">
        <div className="w-16 h-16 rounded-3xl bg-aksi/10 flex items-center justify-center text-aksi shadow-aksi mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-toko-soft text-toko text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Keuangan Berdua</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-app-text">Kasku Idaido</h1>
        <p className="text-xs text-app-muted mt-1 max-w-[260px]">
          Masukkan 6 digit PIN untuk membuka kas toko dan jajan pribadi
        </p>
      </div>

      {/* PIN Dots & Error */}
      <div className="flex flex-col items-center my-6">
        <div className="flex items-center gap-3 mb-4">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-aksi scale-110 shadow-sm'
                    : 'bg-app-line border-2 border-[#E2D8C7]'
                }`}
              />
            );
          })}
        </div>

        {/* Error / Locked Alert */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-status-over/10 text-status-over text-xs font-medium text-center animate-shake max-w-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {error} {isLocked && `(${formatLockTime(lockSeconds)})`}
            </span>
          </div>
        )}

        {isPending && (
          <p className="text-xs font-medium text-app-muted mt-2 animate-pulse">
            Memverifikasi PIN...
          </p>
        )}

        {/* Tombol 1-Klik Masuk Mode Demo Portofolio */}
        <div className="mt-4 w-full max-w-[320px] bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
            <Sparkles className="w-3.5 h-3.5 text-aksi" />
            <span>Versi Portofolio Demo</span>
          </div>
          <p className="text-[11px] text-emerald-800 text-center">
            Coba langsung aplikasi tanpa repot memasukkan PIN manual.
          </p>
          <button
            type="button"
            onClick={handleAutoFillDemo}
            disabled={isPending || isLocked}
            className="w-full mt-1 py-2.5 px-3 rounded-xl bg-aksi hover:bg-aksi-hover text-white text-xs font-bold shadow-aksi flex items-center justify-center gap-1.5 active:scale-95 transition-all touch-press cursor-pointer"
          >
            <span>🚀 Masuk Seketika (Auto PIN: 123456)</span>
          </button>
        </div>
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-[320px] mx-auto pb-4">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isLocked || isPending}
              onClick={() => handleKeyPress(digit)}
              className="h-16 rounded-full bg-white text-xl font-bold text-app-text shadow-sm border border-app-line active:bg-aksi/15 active:text-aksi active:border-aksi/40 active:scale-90 transition-all duration-100 disabled:opacity-40 select-none flex items-center justify-center cursor-pointer touch-press"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            disabled={isLocked || isPending || pin.length === 0}
            onClick={handleClear}
            className="h-16 rounded-full text-xs font-semibold text-app-muted active:scale-90 active:bg-app-line/60 transition-all duration-100 disabled:opacity-20 select-none flex items-center justify-center cursor-pointer touch-press"
          >
            Hapus
          </button>

          <button
            type="button"
            disabled={isLocked || isPending}
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-full bg-white text-xl font-bold text-app-text shadow-sm border border-app-line active:bg-aksi/15 active:text-aksi active:border-aksi/40 active:scale-90 transition-all duration-100 disabled:opacity-40 select-none flex items-center justify-center cursor-pointer touch-press"
          >
            0
          </button>

          <button
            type="button"
            disabled={isLocked || isPending || pin.length === 0}
            onClick={handleDelete}
            className="h-16 rounded-full text-app-text active:scale-90 active:bg-app-line/60 transition-all duration-100 disabled:opacity-20 select-none flex items-center justify-center cursor-pointer touch-press"
            aria-label="Hapus satu angka"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </main>
  );
}
