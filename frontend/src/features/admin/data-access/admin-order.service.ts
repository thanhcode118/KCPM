import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItemView {
  id: number;
  productId?: number;
  productName: string;
  productSku: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderView {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  fullName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemView[];
}

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5020/api/admin/orders';

  getOrders(): Observable<OrderView[]> {
    return this.http.get<OrderView[]>(this.baseUrl);
  }

  updateOrderStatus(id: number, status: string): Observable<OrderView> {
    return this.http.patch<OrderView>(`${this.baseUrl}/${id}/status?status=${status}`, {});
  }
}
