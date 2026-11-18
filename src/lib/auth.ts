import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'kasku_session';
const ATTEMPTS_COOKIE_NAME = 'kasku_pin_attempts';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 hari dalam detik

function getSecretKey() {
  const secret = process.env.SESSION_SECRET || 'kasku-idaido-portfolio-demo-session-secret-key-32chars!';
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  auth: boolean;
  iat?: number;
  exp?: number;
}

export interface AttemptState {
  attempts: number;
  firstFailAt: number;
  lockedUntil: number;
}

/**
 * Buat session cookie 30 hari bertanda tangan
 */
export async function createSession() {
  const key = getSecretKey();
  const token = await new SignJWT({ auth: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  // Hapus cookie hitungan salah saat berhasil masuk
  cookieStore.delete(ATTEMPTS_COOKIE_NAME);
  return token;
}

/**
 * Verifikasi token sesi
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key);
    return Boolean(payload.auth);
  } catch {
    return false;
  }
}

/**
 * Cek apakah request saat ini memiliki sesi aktif
 */
export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/**
 * Hapus sesi (Logout)
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Baca status rate limit percobaan PIN
 */
export async function getRateLimitState(): Promise<{
  isLocked: boolean;
  remainingLockSeconds: number;
  remainingAttempts: number;
}> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ATTEMPTS_COOKIE_NAME)?.value;
  if (!raw) {
    return { isLocked: false, remainingLockSeconds: 0, remainingAttempts: 5 };
  }

  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(raw, key);
    const data = payload as unknown as AttemptState;
    const now = Date.now();

    if (data.lockedUntil && now < data.lockedUntil) {
      const remainingSecs = Math.ceil((data.lockedUntil - now) / 1000);
      return { isLocked: true, remainingLockSeconds: remainingSecs, remainingAttempts: 0 };
    }

    // Jendela 10 menit
    if (now - data.firstFailAt > 10 * 60 * 1000) {
      return { isLocked: false, remainingLockSeconds: 0, remainingAttempts: 5 };
    }

    const remaining = Math.max(0, 5 - data.attempts);
    return { isLocked: false, remainingLockSeconds: 0, remainingAttempts: remaining };
  } catch {
    return { isLocked: false, remainingLockSeconds: 0, remainingAttempts: 5 };
  }
}

/**
 * Catat kegagalan input PIN (5 salah / 10 menit -> kunci 15 menit)
 */
export async function recordFailedAttempt(): Promise<{
  isLocked: boolean;
  remainingLockSeconds: number;
  remainingAttempts: number;
}> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ATTEMPTS_COOKIE_NAME)?.value;
  const now = Date.now();
  let state: AttemptState = { attempts: 0, firstFailAt: now, lockedUntil: 0 };

  if (raw) {
    try {
      const key = getSecretKey();
      const { payload } = await jwtVerify(raw, key);
      const parsed = payload as unknown as AttemptState;

      // Jika masih dalam jendela 10 menit
      if (now - parsed.firstFailAt <= 10 * 60 * 1000) {
        state = {
          attempts: parsed.attempts,
          firstFailAt: parsed.firstFailAt,
          lockedUntil: parsed.lockedUntil,
        };
      }
    } catch {
      // Abaikan jika token rusak
    }
  }

  state.attempts += 1;
  let isLocked = false;
  let remainingLockSeconds = 0;

  if (state.attempts >= 5) {
    state.lockedUntil = now + 15 * 60 * 1000; // Kunci 15 menit
    isLocked = true;
    remainingLockSeconds = 15 * 60;
  }

  const key = getSecretKey();
  const token = await new SignJWT(state as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(key);

  cookieStore.set(ATTEMPTS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 60,
    path: '/',
  });

  return {
    isLocked,
    remainingLockSeconds,
    remainingAttempts: isLocked ? 0 : Math.max(0, 5 - state.attempts),
  };
}
