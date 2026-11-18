'use client';

import { CustomTransactionType } from '@/types/database';

const STORAGE_KEY = 'kasku_custom_types';

export function getStoredCustomTypes(): CustomTransactionType[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomType(name: string, direction: 'in' | 'out'): CustomTransactionType {
  const current = getStoredCustomTypes();
  const cleanName = name.trim();

  // Cek jika sudah ada
  const existing = current.find((t) => t.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) return existing;

  const newType: CustomTransactionType = {
    id: `custom-${Date.now()}`,
    name: cleanName,
    direction,
  };

  const updated = [...current, newType];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  // Dispatch custom event agar komponen lain tahu ada update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('kasku-custom-types-changed'));
  }

  return newType;
}

export function removeCustomType(id: string) {
  const current = getStoredCustomTypes();
  const updated = current.filter((t) => t.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('kasku-custom-types-changed'));
  }
}
