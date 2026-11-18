'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Transaction, CustomTransactionType } from '@/types/database';
import {
  BASE_TRANSACTION_TYPES,
  CATEGORIES_BY_TYPE,
  QUICK_NOMINALS,
  formatTypeDisplay,
} from '@/lib/constants';
import { rupiah, formatAngka, parseAngka } from '@/lib/format';
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
} from '@/actions/transactions';
import {
  getStoredCustomTypes,
  saveCustomType,
  removeCustomType,
} from '@/lib/customTypes';
import { X, Plus, Trash2, Tag, Check, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
  onSuccess?: () => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  editingTransaction,
  onSuccess,
}: TransactionModalProps) {
  const [type, setType] = useState<string>('Pemasukan Toko');
  const [amountInput, setAmountInput] = useState('');
  const [category, setCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Custom types management
  const [customTypes, setCustomTypes] = useState<CustomTransactionType[]>([]);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDirection, setNewTypeDirection] = useState<'in' | 'out'>('out');

  useEffect(() => {
    setCustomTypes(getStoredCustomTypes());

    const handleUpdate = () => {
      setCustomTypes(getStoredCustomTypes());
    };
    window.addEventListener('kasku-custom-types-changed', handleUpdate);
    return () => window.removeEventListener('kasku-custom-types-changed', handleUpdate);
  }, []);

  // Inisialisasi form saat modal terbuka atau saat editingTransaction berubah
  useEffect(() => {
    if (editingTransaction) {
      const currentType =
        editingTransaction.type === 'Modal Toko'
          ? 'Pengeluaran Toko'
          : editingTransaction.type;

      setType(currentType);
      setAmountInput(formatAngka(editingTransaction.amount));

      const defaultCategories = CATEGORIES_BY_TYPE[currentType] || ['Umum', 'Lainnya'];
      if (
        defaultCategories.includes(editingTransaction.category) &&
        editingTransaction.category !== 'Lainnya'
      ) {
        setCategory(editingTransaction.category);
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setCategory('Lainnya');
        setIsCustomCategory(true);
        setCustomCategory(editingTransaction.category);
      }

      const d = new Date(editingTransaction.date);
      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDate(localIso);
      setNotes(editingTransaction.notes || '');
    } else {
      setType('Pemasukan Toko');
      setAmountInput('');
      const defaultCat = CATEGORIES_BY_TYPE['Pemasukan Toko'][0];
      setCategory(defaultCat);
      setIsCustomCategory(false);
      setCustomCategory('');
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDate(localIso);
      setNotes('');
    }
    setError(null);
    setShowAddTypeModal(false);
  }, [editingTransaction, isOpen]);

  // Saat tipe berubah, sesuaikan kategori default
  const handleTypeChange = (newType: string) => {
    setType(newType);
    const availableCategories = CATEGORIES_BY_TYPE[newType] || ['Umum', 'Lainnya'];
    const firstCat = availableCategories[0];
    setCategory(firstCat);
    setIsCustomCategory(false);
    setCustomCategory('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseAngka(raw);
    setAmountInput(num > 0 ? formatAngka(num) : '');
  };

  const handleQuickAdd = (addition: number) => {
    const current = parseAngka(amountInput);
    setAmountInput(formatAngka(current + addition));
  };

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    if (cat === 'Lainnya') {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
      setCustomCategory('');
    }
  };

  const handleSaveNewCustomType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    const created = saveCustomType(newTypeName, newTypeDirection);
    setNewTypeName('');
    setShowAddTypeModal(false);
    handleTypeChange(created.name);
  };

  const handleDeleteCustomType = (id: string, name: string) => {
    if (!confirm(`Hapus kategori/tipe "${name}"?`)) return;
    removeCustomType(id);
    if (type === name) {
      handleTypeChange('Pemasukan Toko');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nominal = parseAngka(amountInput);
    if (nominal <= 0) {
      setError('Nominal harus lebih dari Rp 0');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Kategori tidak boleh kosong');
      return;
    }
    if (finalCategory.length > 40) {
      setError('Kategori maksimal 40 karakter');
      return;
    }

    startTransition(async () => {
      setError(null);
      const isoDate = new Date(date).toISOString();

      if (editingTransaction) {
        const res = await updateTransactionAction(editingTransaction.id, {
          type,
          category: finalCategory,
          amount: nominal,
          date: isoDate,
          notes: notes || null,
        });

        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error || 'Gagal mengubah transaksi');
        }
      } else {
        const res = await createTransactionAction({
          type,
          category: finalCategory,
          amount: nominal,
          date: isoDate,
          notes: notes || null,
        });

        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error || 'Gagal menyimpan transaksi');
        }
      }
    });
  };

  const handleDelete = () => {
    if (!editingTransaction) return;
    if (!confirm('Hapus transaksi ini?')) return;

    startTransition(async () => {
      const res = await deleteTransactionAction(editingTransaction.id);
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || 'Gagal menghapus');
      }
    });
  };

  if (!isOpen) return null;

  // Daftar semua pilihan tipe (bawaan + kustom)
  const allTypes: {
    label: string;
    value: string;
    color: string;
    isCustom?: boolean;
    id?: string;
  }[] = [
    { label: 'Pemasukan', value: 'Pemasukan Toko', color: 'bg-toko', isCustom: false },
    { label: 'Pengeluaran', value: 'Pengeluaran Toko', color: 'bg-[#52796F]', isCustom: false },
    { label: 'Jajan', value: 'Jajan Pribadi', color: 'bg-jajan', isCustom: false },
    ...customTypes.map((c) => ({
      label: c.name,
      value: c.name,
      color: c.direction === 'in' ? 'bg-[#40916C]' : 'bg-[#475528]',
      isCustom: true,
      id: c.id,
    })),
  ];

  const currentCategories = CATEGORIES_BY_TYPE[type] || ['Umum', 'Lainnya'];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Modal Container */}
      <div
        className="w-full max-w-[480px] bg-white rounded-t-3xl p-5 shadow-2xl max-h-[90dvh] flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <div className="w-12 h-1 bg-app-line rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-app-line">
          <h2 className="text-lg font-bold text-app-text">
            {editingTransaction ? 'Ubah Transaksi' : 'Catat Transaksi'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-app-line/60 flex items-center justify-center text-app-muted hover:text-app-text touch-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 rounded-2xl bg-status-over/10 text-status-over text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {/* Segmented Chips Tipe Transaksi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-app-muted uppercase tracking-wider">
                Jenis Transaksi
              </label>
              <button
                type="button"
                onClick={() => setShowAddTypeModal(!showAddTypeModal)}
                className="text-xs font-bold text-aksi hover:underline flex items-center gap-1 touch-press"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tipe</span>
              </button>
            </div>

            {/* Kotak Tambah Tipe Kustom */}
            {showAddTypeModal && (
              <div className="mb-3 p-3.5 bg-[#EAF2F0] rounded-2xl border border-[#52796F]/30 flex flex-col gap-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#192E21] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-aksi" />
                    Buat Kategori / Tipe Baru
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddTypeModal(false)}
                    className="text-[#5C7364] hover:text-[#192E21]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Contoh: Sedekah, Tabungan, Piutang..."
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-[#DFE8E0] focus:outline-hidden focus:ring-2 focus:ring-aksi"
                  />

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#192E21] font-medium">Sifat:</span>
                    <button
                      type="button"
                      onClick={() => setNewTypeDirection('out')}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg font-bold transition-all',
                        newTypeDirection === 'out'
                          ? 'bg-[#606C38] text-white shadow-xs'
                          : 'bg-white text-app-muted border border-[#DFE8E0]'
                      )}
                    >
                      Pengeluaran (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTypeDirection('in')}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg font-bold transition-all',
                        newTypeDirection === 'in'
                          ? 'bg-toko text-white shadow-xs'
                          : 'bg-white text-app-muted border border-[#DFE8E0]'
                      )}
                    >
                      Pemasukan (+)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveNewCustomType}
                    disabled={!newTypeName.trim()}
                    className="py-2 bg-aksi text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-40 touch-press"
                  >
                    Simpan Tipe Baru
                  </button>
                </div>
              </div>
            )}

            {/* Deretan Chips Tipe Transaksi */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F5EFE6] rounded-2xl overflow-x-auto no-scrollbar">
              {allTypes.map((t) => {
                const isSelected = type === t.value;
                return (
                  <div key={t.value} className="relative shrink-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => handleTypeChange(t.value)}
                      className={clsx(
                        'py-2 px-3 text-xs font-bold rounded-xl transition-all duration-100 cursor-pointer truncate touch-press',
                        isSelected
                          ? `${t.color} text-white shadow-xs`
                          : 'text-app-muted hover:text-app-text'
                      )}
                    >
                      {t.label}
                    </button>
                    {t.isCustom && isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomType(t.id!, t.label);
                        }}
                        className="w-4 h-4 ml-1 mr-1 text-red-500 hover:text-red-700"
                        title="Hapus tipe kustom ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input Nominal */}
          <div>
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider block mb-1">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-app-muted">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountInput}
                onChange={handleAmountChange}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-[#FAF6F0] rounded-2xl text-2xl font-extrabold text-app-text tabular-nums focus:outline-hidden focus:ring-2 focus:ring-aksi border border-app-line"
              />
            </div>

            {/* Quick Nominal Chips */}
            <div className="flex gap-2 mt-2">
              {QUICK_NOMINALS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickAdd(q)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#F1E9DD] hover:bg-[#E5DBCB] text-app-text active:scale-95 transition-all duration-100 cursor-pointer touch-press"
                >
                  +{formatAngka(q / 1000)}rb
                </button>
              ))}
            </div>
          </div>

          {/* Kategori Chips */}
          <div>
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider block mb-2">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {currentCategories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={clsx(
                      'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-100 cursor-pointer touch-press',
                      isSelected
                        ? 'bg-app-text text-white shadow-xs'
                        : 'bg-white border border-app-line text-app-text hover:bg-app-line/40'
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Jika opsi Lainnya dipilih */}
            {isCustomCategory && (
              <div className="mt-2.5">
                <input
                  type="text"
                  maxLength={40}
                  placeholder="Ketik nama kategori (maks 40 karakter)..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] border border-app-line rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-aksi"
                />
              </div>
            )}
          </div>

          {/* Tanggal & Waktu */}
          <div>
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider block mb-1">
              Tanggal & Jam
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#FAF6F0] border border-app-line rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-aksi"
            />
          </div>

          {/* Catatan (Opsional) */}
          <div>
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider block mb-1">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Belanja bahan, order custom..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#FAF6F0] border border-app-line rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-aksi"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {editingTransaction && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="w-12 h-12 rounded-2xl bg-red-50 hover:bg-red-100 text-status-over flex items-center justify-center shrink-0 transition-all duration-100 touch-press cursor-pointer"
                title="Hapus Transaksi"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3.5 rounded-2xl bg-aksi hover:bg-aksi-hover text-white text-sm font-bold shadow-aksi transition-all duration-100 touch-press disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending ? 'Menyimpan...' : editingTransaction ? 'Simpan Perubahan' : 'Catat Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
