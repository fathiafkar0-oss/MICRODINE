import { useCallback, useMemo } from 'react';

import { restaurant as defaultRestaurant } from '@/Data/mock/restaurant';
import { calculateBill, formatCurrency, formatPercent } from '@/Utils/formatCurrency';

/**
 * Format uang + hitung tagihan sesuai pengaturan pajak restoran.
 *
 *   const { format, bill, taxRate, taxLabel } = useCurrency(restaurant);
 *   bill(items) -> { subtotal, tax, total }
 */
export default function useCurrency(restaurant = defaultRestaurant) {
    const taxRate = restaurant.taxEnabled ? restaurant.taxRate : 0;

    const bill = useCallback((items) => calculateBill(items, taxRate), [taxRate]);

    return useMemo(
        () => ({
            format: formatCurrency,
            percent: formatPercent,
            bill,
            taxRate,
            taxLabel: `${restaurant.taxLabel} ${Math.round(taxRate * 100)}%`,
        }),
        [bill, taxRate, restaurant.taxLabel],
    );
}
