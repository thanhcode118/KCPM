import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderView } from '@/features/admin/data-access/admin-order.service';

export interface PlaceOrderInput {
  addressId?: number;
  fullName?: string;
  phone?: string;
  line1?: string;
  ward?: string;
  district?: string;
  city?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class CommerceOrderService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5020/api/orders';

  getMyOrders(): Observable<OrderView[]> {
    return this.http.get<OrderView[]>(this.baseUrl);
  }

  getOrderById(id: number): Observable<OrderView> {
    return this.http.get<OrderView>(`${this.baseUrl}/${id}`);
  }

  placeOrder(input: PlaceOrderInput): Observable<OrderView> {
    return this.http.post<OrderView>(this.baseUrl, input);
  }

  cancelOrder(id: number): Observable<OrderView> {
    return this.http.post<OrderView>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
