import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { TransactionProvider } from '@/components/TransactionContext';
import { BottomNav } from '@/components/BottomNav';
import { PwaRegister } from '@/components/PwaRegister';
import { DemoBanner } from '@/components/DemoBanner';
import { Suspense } from 'react';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kasku Idaido (Demo Portofolio)',
  description: 'Demo Portofolio PWA: Catat kas toko digital dan jajan pribadi berdua.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kasku Idaido Demo',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#2D6A4F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} font-sans`}>
      <body className="bg-[#E5ECE5] min-h-dvh flex justify-center text-app-text antialiased">
        <div className="w-full max-w-[480px] min-h-dvh bg-app-bg flex flex-col relative shadow-xl overflow-x-hidden">
          <DemoBanner />
          <Suspense fallback={null}>
            <TransactionProvider>
              <div className="flex-1 flex flex-col pb-20">{children}</div>
              <BottomNav />
              <PwaRegister />
            </TransactionProvider>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
