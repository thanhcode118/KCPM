import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from './icon.component';

export interface CartDrawerItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[140]">
      <button
        type="button"
        class="absolute inset-0 bg-charcoal/35 backdrop-blur-[2px]"
        aria-label="Đóng giỏ hàng"
        (click)="close.emit()"
      ></button>

      <aside
        class="cart-drawer-panel absolute right-0 top-0 flex h-full w-full max-w-full flex-col border-l border-black/5 bg-white shadow-2xl sm:w-[28rem] xl:w-[33vw]"
        aria-label="Giỏ hàng"
      >
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Giỏ hàng</p>
            <h2 class="mt-1 text-xl font-bold text-charcoal">
              {{ items.length }} sản phẩm
            </h2>
          </div>
          <button
            type="button"
            class="rounded-full border border-gray-200 p-2 text-gray-500 transition-colors hover:border-honey hover:text-honey"
            aria-label="Đóng giỏ hàng"
            (click)="close.emit()"
          >
            <app-icon name="close" class="h-5 w-5"></app-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-5">
          @if (items.length === 0) {
            <div class="flex h-full flex-col items-center justify-center text-center">
              <div class="rounded-full bg-cream p-4 text-honey">
                <app-icon name="shopping-bag" class="h-8 w-8"></app-icon>
              </div>
              <h3 class="mt-4 text-lg font-bold text-charcoal">Giỏ hàng đang trống</h3>
              <p class="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Chọn thêm sản phẩm bạn thích, rồi quay lại đây để xem nhanh trước khi thanh toán.
              </p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (item of items; track item.id) {
                <div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-sm font-bold leading-6 text-charcoal">{{ item.name }}</p>
                      <p class="mt-1 text-xs text-gray-500">
                        SL {{ item.quantity }} x {{ item.unitPrice | currency:'VND':'symbol':'1.0-0' }}
                      </p>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                       <button type="button" class="text-gray-400 hover:text-red-500 transition-colors" (click)="remove.emit(item.productId)">
                         <app-icon name="close" class="h-4 w-4"></app-icon>
                       </button>
                       <p class="whitespace-nowrap text-sm font-bold text-honey">
                         {{ item.lineTotal | currency:'VND':'symbol':'1.0-0' }}
                       </p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <div class="border-t border-gray-100 bg-[#fcfbf8] px-5 py-5 shadow-[0_-12px_30px_rgba(15,23,42,0.06)]">
          <div class="space-y-2 text-sm text-charcoal">
            <div class="flex items-center justify-between">
              <span>Tạm tính</span>
              <span class="font-semibold">{{ subtotal | currency:'VND':'symbol':'1.0-0' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Phí vận chuyển</span>
              <span class="font-semibold">
                @if (shippingFee === 0) {
                  Miễn phí
                } @else {
                  {{ shippingFee | currency:'VND':'symbol':'1.0-0' }}
                }
              </span>
            </div>
            <div class="flex items-center justify-between border-t border-dashed border-gray-200 pt-3 text-base font-bold">
              <span>Tổng cộng</span>
              <span class="text-honey">{{ grandTotal | currency:'VND':'symbol':'1.0-0' }}</span>
            </div>
          </div>

          <div class="mt-5 grid gap-3">
            <button
              type="button"
              class="rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-gray-50"
              (click)="close.emit()"
            >
              Tiếp tục mua sắm
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-honey hover:text-charcoal disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
              [disabled]="items.length === 0"
              (click)="checkout.emit()"
            >
              Thanh toán
              <app-icon name="arrow-right" class="h-4 w-4"></app-icon>
            </button>
          </div>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .cart-drawer-panel {
      animation: cartDrawerIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes cartDrawerIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class CartDrawerComponent {
  @Input({ required: true }) items: CartDrawerItem[] = [];
  @Input({ required: true }) subtotal = 0;
  @Input({ required: true }) shippingFee = 0;
  @Input({ required: true }) grandTotal = 0;

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly checkout = new EventEmitter<void>();
  @Output() readonly remove = new EventEmitter<number>();
}
