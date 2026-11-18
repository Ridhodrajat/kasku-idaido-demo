import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'kasku_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati file statis, aset PWA, manifest, ikon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/api/pwa') ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico' ||
    pathname === '/sw.js'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token && process.env.SESSION_SECRET) {
    try {
      const key = new TextEncoder().encode(process.env.SESSION_SECRET);
      const { payload } = await jwtVerify(token, key);
      isAuthenticated = Boolean(payload.auth);
    } catch {
      isAuthenticated = false;
    }
  }

  // Jika belum login dan bukan di halaman /masuk
  if (!isAuthenticated && pathname !== '/masuk') {
    const loginUrl = new URL('/masuk', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan mencoba ke /masuk, redirect ke /
  if (isAuthenticated && pathname === '/masuk') {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
