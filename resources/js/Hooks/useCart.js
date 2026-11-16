import { useCallback, useEffect, useState } from 'react';

/**
 * Keranjang pelanggan per meja, disimpan di localStorage browser pelanggan.
 * Bentuk item: { menuId, name, price, hpp, qty, note }
 *
 * Catatan backend: saat pesanan dikirim, harga & HPP wajib diambil ulang dari
 * database (jangan percaya harga dari browser), lalu disimpan sebagai snapshot
 * di tabel item pesanan.
 */
const storageKey = (table) => `microdine.cart.${table}`;

function read(table) {
    try {
        return JSON.parse(window.localStorage.getItem(storageKey(table))) ?? [];
    } catch {
        return [];
    }
}

export default function useCart(table) {
    const [items, setItems] = useState(() => (typeof window === 'undefined' ? [] : read(table)));

    useEffect(() => {
        try {
            window.localStorage.setItem(storageKey(table), JSON.stringify(items));
        } catch {
            // Penyimpanan browser tidak tersedia (mode privat): keranjang tetap jalan di memori.
        }
    }, [table, items]);

    const qtyOf = useCallback((menuId) => items.find((item) => item.menuId === menuId)?.qty ?? 0, [items]);

    const add = useCallback((menu) => {
        setItems((prev) => {
            if (prev.some((item) => item.menuId === menu.id)) {
                return prev.map((item) => (item.menuId === menu.id ? { ...item, qty: item.qty + 1 } : item));
            }
            return [...prev, { menuId: menu.id, name: menu.name, price: menu.price, hpp: menu.hpp, qty: 1, note: '' }];
        });
    }, []);

    const decrease = useCallback((menuId) => {
        setItems((prev) => prev.flatMap((item) => (item.menuId !== menuId ? [item] : item.qty > 1 ? [{ ...item, qty: item.qty - 1 }] : [])));
    }, []);

    const remove = useCallback((menuId) => setItems((prev) => prev.filter((item) => item.menuId !== menuId)), []);

    const setNote = useCallback((menuId, note) => {
        setItems((prev) => prev.map((item) => (item.menuId === menuId ? { ...item, note } : item)));
    }, []);

    const clear = useCallback(() => setItems([]), []);

    return { items, qtyOf, add, decrease, remove, setNote, clear };
}
