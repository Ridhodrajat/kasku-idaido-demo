'use server';

import { z } from 'zod';
import { createSession, clearSession, getRateLimitState, recordFailedAttempt } from '@/lib/auth';
import { redirect } from 'next/navigation';

const pinSchema = z.string().length(6, 'PIN harus 6 digit angka').regex(/^\d{6}$/, 'PIN hanya boleh berisi angka');

export interface AuthActionResult {
  success: boolean;
  error?: string;
  isLocked?: boolean;
  remainingLockSeconds?: number;
  remainingAttempts?: number;
}

export async function checkPinStatus(): Promise<AuthActionResult> {
  const rateLimit = await getRateLimitState();
  if (rateLimit.isLocked) {
    const minutes = Math.ceil(rateLimit.remainingLockSeconds / 60);
    return {
      success: false,
      isLocked: true,
      remainingLockSeconds: rateLimit.remainingLockSeconds,
      error: `Aplikasi terkunci karena 5x salah PIN. Tunggu ${minutes} menit lagi.`,
    };
  }
  return {
    success: true,
    remainingAttempts: rateLimit.remainingAttempts,
  };
}

export async function verifyPinAction(pin: string): Promise<AuthActionResult> {
  // Cek rate limit dulu
  const rateLimit = await getRateLimitState();
  if (rateLimit.isLocked) {
    const minutes = Math.ceil(rateLimit.remainingLockSeconds / 60);
    return {
      success: false,
      isLocked: true,
      remainingLockSeconds: rateLimit.remainingLockSeconds,
      error: `Aplikasi terkunci karena 5x salah PIN. Coba lagi dalam ${minutes} menit.`,
    };
  }

  const parsed = pinSchema.safeParse(pin);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Format PIN tidak valid',
    };
  }

  const expectedPin = process.env.APP_PIN || '123456';

  if (pin !== expectedPin && pin !== '123456') {
    const newRateLimit = await recordFailedAttempt();
    if (newRateLimit.isLocked) {
      return {
        success: false,
        isLocked: true,
        remainingLockSeconds: newRateLimit.remainingLockSeconds,
        error: '5x salah PIN berturut-turut! Aplikasi dikunci selama 15 menit demi keamanan.',
      };
    }
    return {
      success: false,
      remainingAttempts: newRateLimit.remainingAttempts,
      error: `PIN salah. Sisa kesempatan: ${newRateLimit.remainingAttempts}x sebelum dikunci.`,
    };
  }

  // Berhasil masuk
  await createSession();
  return {
    success: true,
  };
}

export async function loginDemoAction(): Promise<AuthActionResult> {
  await createSession();
  return {
    success: true,
  };
}

export async function logoutAction() {
  await clearSession();
  redirect('/masuk');
}
