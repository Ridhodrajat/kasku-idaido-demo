-- Data contoh (opsional) untuk uji tampilan. Hapus setelah selesai uji.
insert into public.monthly_allocations (id, target_jajan, pct_modal, pct_tabungan, pct_jajan, pct_sedekah)
values (to_char(now() at time zone 'Asia/Makassar','YYYY-MM'), 0, 40, 25, 25, 10)
on conflict (id) do nothing;

insert into public.transactions (date, type, category, amount, notes) values
  (now() - interval '5 days', 'Pemasukan Toko', 'Penjualan Produk',     750000, 'Order batch 1'),
  (now() - interval '4 days', 'Modal Toko',     'Stok/Lisensi Produk',  300000, 'Restock'),
  (now() - interval '3 days', 'Pemasukan Toko', 'Jasa/Order Custom',    500000, null),
  (now() - interval '2 days', 'Jajan Pribadi',  'Makan Berat',           85000, 'Makan berdua'),
  (now() - interval '1 days', 'Jajan Pribadi',  'Kopi/Minuman',          45000, null),
  (now(),                     'Modal Toko',     'Iklan/Promosi',        100000, 'Iklan IG');
