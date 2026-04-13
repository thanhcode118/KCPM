import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';
import type { Order } from '@/core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-[70vh] bg-cream py-12">
      <div class="container mx-auto px-4 max-w-5xl space-y-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-charcoal">Theo dõi đơn hàng</h1>
            <p class="text-sm text-gray-500 mt-2">Xem trạng thái thanh toán, địa chỉ giao hàng và thao tác với đơn chờ xử lý.</p>
          </div>
          <a routerLink="/checkout" class="text-sm font-semibold text-honey hover:underline">Quay lại thanh toán</a>
        </div>

        @if (!authFacade.isAuthenticated() && !authFacade.isRestoring()) {
          <div class="rounded-xl bg-white shadow p-6 text-center space-y-3">
            <p class="text-charcoal font-semibold">Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
            <a routerLink="/login" class="inline-flex items-center justify-center rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white hover:bg-honey hover:text-charcoal">
              Đăng nhập
            </a>
          </div>
        } @else {
          @if (statusMessage()) {
            <div class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{{ statusMessage() }}</div>
          }

          @if (errorMessage()) {
            <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage() }}</div>
          }

          @if (isLoading()) {
            <div class="rounded-xl bg-white shadow p-6 text-sm text-gray-500">Đang tải đơn hàng...</div>
          } @else if (orders().length === 0) {
            <div class="rounded-xl bg-white shadow p-6 text-center space-y-3">
              <p class="text-charcoal font-semibold">Chưa có đơn hàng nào.</p>
              <a routerLink="/" class="inline-flex items-center justify-center rounded-full bg-honey px-5 py-3 text-sm font-semibold text-charcoal">
                Tiếp tục mua sắm
              </a>
            </div>
          } @else {
            <div class="space-y-4">
              @for (order of orders(); track order.id) {
                <article class="rounded-xl bg-white shadow p-5 space-y-4">
                  <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p class="text-xs uppercase tracking-[0.2em] text-gray-500">Đơn hàng</p>
                      <h2 class="text-xl font-bold text-charcoal mt-1">{{ order.orderCode }}</h2>
                      <p class="text-sm text-gray-500 mt-1">Đặt lúc {{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <span class="rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="statusClass(order.status)">
                        {{ statusLabel(order.status) }}
                      </span>
                      <span class="rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="paymentStatusClass(order.paymentStatus ?? 'pending')">
                        {{ paymentStatusLabel(order.paymentStatus ?? 'pending') }}
                      </span>
                    </div>
                  </div>

                  <div class="grid md:grid-cols-3 gap-3 text-sm">
                    <div class="rounded-lg border border-gray-100 bg-[#fcfbf8] p-3">
                      <p class="text-gray-500">Tổng tiền</p>
                      <p class="mt-1 font-bold text-charcoal">{{ order.totalAmount | currency:'VND':'symbol':'1.0-0' }}</p>
                    </div>
                    <div class="rounded-lg border border-gray-100 bg-[#fcfbf8] p-3">
                      <p class="text-gray-500">Người nhận</p>
                      <p class="mt-1 font-semibold text-charcoal">{{ order.fullName || '-' }}</p>
                    </div>
                    <div class="rounded-lg border border-gray-100 bg-[#fcfbf8] p-3">
                      <p class="text-gray-500">Điện thoại</p>
                      <p class="mt-1 font-semibold text-charcoal">{{ order.phone || '-' }}</p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    @if (canRetryVnPay(order)) {
                      <button
                        type="button"
                        class="rounded-full bg-honey px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-60"
                        [disabled]="isActionRunning()"
                        (click)="retryVnPay(order.id)">
                        Thanh toán VNPay
                      </button>
                    }

                    @if (canCancel(order)) {
                      <button
                        type="button"
                        class="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-60"
                        [disabled]="isActionRunning()"
                        (click)="cancelOrder(order.id)">
                        Huỷ đơn
                      </button>
                    }

                    <button
                      type="button"
                      class="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-charcoal"
                      (click)="toggleExpanded(order.id)">
                      {{ expandedOrderId() === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết' }}
                    </button>
                  </div>

                  @if (expandedOrderId() === order.id) {
                    <div class="border-t border-gray-100 pt-4 space-y-4">
                      <div class="text-sm">
                        <p class="font-semibold text-charcoal">Địa chỉ giao hàng</p>
                        <p class="mt-1 text-gray-600">{{ formatOrderAddress(order) }}</p>
                        @if (order.notes) {
                          <p class="mt-2 text-gray-500">Ghi chú: {{ order.notes }}</p>
                        }
                      </div>

                      <div class="space-y-2">
                        @for (item of order.items; track item.id) {
                          <div class="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
                            <div>
                              <p class="font-semibold text-charcoal">{{ item.productName }}</p>
                              <p class="text-gray-500">SL {{ item.quantity }}</p>
                            </div>
                            <p class="font-bold text-charcoal">{{ (item.lineTotal ?? (item.unitPrice * item.quantity)) | currency:'VND':'symbol':'1.0-0' }}</p>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </article>
              }
            </div>
          }
        }
      </div>
    </section>
  `
})
export class OrdersComponent implements OnInit {
  readonly authFacade = inject(AuthFacade);
  private readonly checkoutFacade = inject(CheckoutFacade);
  private readonly route = inject(ActivatedRoute);

  readonly orders = computed(() => this.checkoutFacade.orders());
  readonly expandedOrderId = signal<number | null>(null);
  readonly isLoading = signal(false);
  readonly isActionRunning = signal(false);
  readonly statusMessage = signal('');
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.readCallbackMessage();
    if (this.authFacade.isAuthenticated() || this.authFacade.isRestoring() || !!localStorage.getItem('token')) {
      this.loadOrders();
    }
  }

  toggleExpanded(orderId: number): void {
    this.expandedOrderId.update((current) => current === orderId ? null : orderId);
  }

  retryVnPay(orderId: number): void {
    this.isActionRunning.set(true);
    this.errorMessage.set('');

    this.checkoutFacade.createVnPayUrl(orderId).subscribe({
      next: (result) => {
        this.isActionRunning.set(false);
        if (result.kind === 'redirect') {
          window.location.assign(result.redirectUrl);
          return;
        }

        if (result.kind === 'error') {
          this.errorMessage.set(result.message);
        }
      },
      error: () => {
        this.isActionRunning.set(false);
        this.errorMessage.set('Không tạo được liên kết VNPay.');
      }
    });
  }

  cancelOrder(orderId: number): void {
    this.isActionRunning.set(true);
    this.errorMessage.set('');
    this.statusMessage.set('');

    this.checkoutFacade.cancelOrder(orderId).subscribe({
      next: (result) => {
        this.isActionRunning.set(false);
        if (result.kind === 'success') {
          this.statusMessage.set(result.message);
          return;
        }

        if (result.kind === 'error') {
          this.errorMessage.set(result.message);
        }
      },
      error: () => {
        this.isActionRunning.set(false);
        this.errorMessage.set('Không thể huỷ đơn hàng lúc này.');
      }
    });
  }

  canCancel(order: Order): boolean {
    return order.status === 'pending' && order.paymentStatus === 'pending';
  }

  canRetryVnPay(order: Order): boolean {
    return order.status === 'pending' && order.paymentStatus === 'pending';
  }

  formatOrderAddress(order: Order): string {
    return [order.line1, order.ward, order.district, order.city].filter(Boolean).join(', ') || '-';
  }

  statusLabel(status: Order['status']): string {
    switch (status) {
      case 'processing':
        return 'Đang xử lý';
      case 'shipping':
        return 'Đang giao hàng';
      case 'completed':
        return 'Hoàn tất';
      case 'cancelled':
        return 'Đã huỷ';
      default:
        return 'Chờ thanh toán';
    }
  }

  paymentStatusLabel(status: NonNullable<Order['paymentStatus']>): string {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'failed':
        return 'Thanh toán lỗi';
      case 'cancelled':
        return 'Thanh toán huỷ';
      default:
        return 'Chờ thanh toán';
    }
  }

  statusClass(status: Order['status']): string {
    switch (status) {
      case 'processing':
      case 'shipping':
        return 'bg-blue-50 text-blue-700';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-amber-50 text-amber-700';
    }
  }

  paymentStatusClass(status: NonNullable<Order['paymentStatus']>): string {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-amber-50 text-amber-700';
    }
  }

  private loadOrders(): void {
    this.isLoading.set(true);
    this.checkoutFacade.refreshOrders().subscribe({
      next: (success) => {
        this.isLoading.set(false);
        if (!success) {
          this.errorMessage.set('Không tải được danh sách đơn hàng.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Không tải được danh sách đơn hàng.');
      }
    });
  }

  private readCallbackMessage(): void {
    const payment = this.route.snapshot.queryParamMap.get('payment');
    const orderNumber = this.route.snapshot.queryParamMap.get('orderNumber');

    if (payment === 'processed') {
      this.statusMessage.set('Đơn hàng đã được tạo và xử lý thanh toán thành công.');
      return;
    }

    if (payment === 'success') {
      this.statusMessage.set(orderNumber ? `Thanh toán VNPay thành công cho đơn ${orderNumber}.` : 'Thanh toán VNPay thành công.');
      return;
    }

    if (payment === 'failed') {
      this.errorMessage.set(orderNumber ? `Thanh toán VNPay không thành công cho đơn ${orderNumber}.` : 'Thanh toán VNPay không thành công.');
    }
  }
}
