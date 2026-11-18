'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Kasku PWA Service Worker terpasang:', reg.scope);
          })
          .catch((err) => {
            console.error('Kasku PWA SW registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
