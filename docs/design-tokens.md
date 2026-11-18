# Design Tokens - Kasku Idaido

## Warna (Tailwind `theme.extend.colors`)
```ts
colors: {
  toko:   { DEFAULT: '#0EA5A4', alt: '#2563EB', soft: '#E6FAF9' },
  jajan:  { DEFAULT: '#F43F8E', alt: '#FB923C', soft: '#FFF0F6' },
  status: { aman: '#22C55E', menipis: '#F59E0B', over: '#EF4444' },
  aksi:   '#7C3AED',          // tombol Catat (+)
  app:    { bg: '#FFFBF5', text: '#1E293B', muted: '#64748B', line: '#F1E9DD' },
}
```

## Bentuk & Ukuran
- Radius kartu: `rounded-3xl` (24px); tombol/chip: `rounded-full`
- Target sentuh minimal 44x44px
- Bayangan: `shadow-[0_8px_24px_-8px_rgba(124,58,237,0.25)]`
- Lebar maksimum konten: `max-w-[480px] mx-auto`

## Tipografi
- Font: **Plus Jakarta Sans** (Google Fonts via `next/font`)
- Angka nominal: `font-extrabold tabular-nums`
- Skala: judul 20/28, nominal besar 32/36, body 14/20, caption 12/16

## Status Kuota Jajan
| Status | Syarat | Warna | Ikon (lucide) |
|---|---|---|---|
| Aman | sisa >= 30% kuota | status.aman | `CheckCircle2` |
| Menipis | 0 <= sisa < 30% | status.menipis | `AlertTriangle` |
| Overbudget | sisa < 0 | status.over | `Flame` |

## Komponen
Card Toko, Card Jajan, ProgressBar, StatusBadge, SegmentedChips, BottomSheet, Toast, EmptyState, Skeleton, BottomNav (tombol tengah menonjol).

## Format Angka
```ts
export const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
```
