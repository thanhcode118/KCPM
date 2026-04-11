export type OrderStatus = 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
export type OrderPaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  productSku?: string;
  productImage?: string;
  lineTotal?: number;
}

export interface Order {
  id: number;
  orderCode: string;
  userId: number;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  fullName?: string;
  phone?: string;
  line1?: string;
  ward?: string;
  district?: string;
  city?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
