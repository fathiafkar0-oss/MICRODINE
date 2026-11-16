/**
 * MICRODINE — Definisi Tipe Antarmuka Domain & Kontrak API
 * Selaras dengan API_CONTRACT.md dan ARCHITECTURE.md
 */

export type PaymentMethod = 'qris' | 'tunai';
export type PaymentStatus = 'menunggu_bayar' | 'diproses' | 'selesai' | 'dibatalkan' | 'kedaluwarsa';
export type KitchenStatus = 'queued' | 'cooking' | 'done' | 'served';
export type TableStatus = 'tersedia' | 'terisi';

export interface RestaurantSettings {
  name: string;
  address: string;
  phone?: string;
  taxEnabled: boolean;
  taxRatePercent: number;
  paymentDeadlineMinutes: number;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  category: string;
  name: string;
  description: string;
  price: number;
  hpp?: number;
  marginRp?: number;
  marginPercent?: number;
  image: string;
  isAvailable: boolean;
  showInCatalog: boolean;
}

export interface OrderItem {
  id?: number;
  menuId: number;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

export interface Order {
  id: number;
  code: string;
  table: string;
  customer: string;
  method: PaymentMethod;
  status: PaymentStatus;
  kitchenStatus?: KitchenStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAt?: string;
  createdAt: string;
  minutesAgo?: number;
}

export interface TableItem {
  id: number;
  number: string;
  barcode: string;
  capacity: number;
  status: TableStatus;
  activeSession?: {
    id: number;
    startedAt: string;
    durationMinutes: number;
    customerName?: string;
    orderCode?: string;
    unservedCount: number;
  };
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponseError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
