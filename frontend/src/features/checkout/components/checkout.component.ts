import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen bg-[#FDFCF8] py-16 font-sans">
      <div class="container mx-auto px-4 max-w-6xl">
        <header class="mb-12">
          <h1 class="text-4xl font-black text-[#2D2D2D] tracking-tight">Thanh toán</h1>
          <p class="text-[#888888] mt-2 font-medium">Hoàn tất thông tin để nhận hàng siêu tốc từ BeeShop</p>
        </header>

        <div class="grid lg:grid-cols-3 gap-12">
          <div class="lg:col-span-2 space-y-10">
            <!-- Delivery Info -->
            <div class="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-[#F0F0EE] p-8">
              <h2 class="text-xl font-black text-[#2D2D2D] mb-8 flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-[#FFC107] text-[#2D2D2D] flex items-center justify-center text-sm">1</span>
                Thông tin nhận hàng
              </h2>
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-[#888888] uppercase tracking-widest px-1">Họ và tên</label>
                  <input [(ngModel)]="fullName" placeholder="Nguyễn Văn A" class="w-full bg-[#FDFCF8] border border-[#F0F0EE] rounded-2xl px-5 py-3.5 outline-none focus:border-[#FFC107] font-bold text-[#2D2D2D] transition-all">
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-[#888888] uppercase tracking-widest px-1">Số điện thoại</label>
                  <input [(ngModel)]="phone" placeholder="0123 456 789" class="w-full bg-[#FDFCF8] border border-[#F0F0EE] rounded-2xl px-5 py-3.5 outline-none focus:border-[#FFC107] font-bold text-[#2D2D2D] transition-all">
                </div>
                <div class="md:col-span-2 space-y-2">
                  <label class="text-[10px] font-black text-[#888888] uppercase tracking-widest px-1">Địa chỉ (Số nhà, Tên đường, Phường/Xã...)</label>
                  <input [(ngModel)]="address" placeholder="123 Đường ABC, Phường X, Quận Y, TP. HCM" class="w-full bg-[#FDFCF8] border border-[#F0F0EE] rounded-2xl px-5 py-3.5 outline-none focus:border-[#FFC107] font-bold text-[#2D2D2D] transition-all">
                </div>
                <div class="md:col-span-2 space-y-2">
                  <label class="text-[10px] font-black text-[#888888] uppercase tracking-widest px-1">Ghi chú cho shipper</label>
                  <textarea [(ngModel)]="notes" placeholder="Ví dụ: Gửi bảo vệ nếu không ở nhà" class="w-full bg-[#FDFCF8] border border-[#F0F0EE] rounded-2xl px-5 py-3.5 outline-none focus:border-[#FFC107] font-bold text-[#2D2D2D] transition-all h-24 resize-none"></textarea>
                </div>
              </div>
            </div>

            <!-- Cart Items Summary -->
            <div class="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-[#F0F0EE] p-8">
              <h2 class="text-xl font-black text-[#2D2D2D] mb-8 flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-[#FFC107] text-[#2D2D2D] flex items-center justify-center text-sm">2</span>
                Sản phẩm trong giỏ
              </h2>
              <div class="space-y-4">
                @for (item of cartItemsDetailed(); track item.id) {
                  <div class="flex items-center gap-4 bg-[#FDFCF8] p-4 rounded-2xl border border-[#F0F0EE]">
                    <div class="w-16 h-16 bg-white border border-[#F0F0EE] rounded-xl overflow-hidden flex-shrink-0">
                       <img [src]="item.productImage" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-[#2D2D2D] truncate">{{ item.name }}</p>
                      <p class="text-xs text-[#888888] font-medium">SL: {{ item.quantity }}</p>
                    </div>
                    <p class="font-black text-[#2D2D2D] px-2">{{ item.lineTotal | number:'1.0-0' }}đ</p>
                  </div>
                }
              </div>
            </div>

            <!-- Payment Method -->
            <div class="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-[#F0F0EE] p-8">
              <h2 class="text-xl font-black text-[#2D2D2D] mb-8 flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-[#FFC107] text-[#2D2D2D] flex items-center justify-center text-sm">3</span>
                Phương thức thanh toán
              </h2>
              <div class="grid md:grid-cols-2 gap-4">
                <label class="relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group"
                  [ngClass]="paymentMethod === 'cod' ? 'border-[#FFC107] bg-yellow-50/30' : 'border-[#F0F0EE] hover:border-[#E0E0E0]'">
                  <input type="radio" name="payment" [(ngModel)]="paymentMethod" value="cod" class="w-5 h-5 accent-[#FFC107]">
                  <div>
                    <p class="font-black text-sm text-[#2D2D2D]">Thanh toán (COD)</p>
                    <p class="text-[10px] text-[#888888] font-bold">Thanh toán khi nhận hàng</p>
                  </div>
                </label>
                <label class="relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer opacity-50 grayscale pointer-events-none border-[#F0F0EE]">
                  <input type="radio" name="payment" disabled value="bank" class="w-5 h-5 accent-[#FFC107]">
                  <div>
                    <p class="font-black text-sm text-[#2D2D2D]">Chuyển khoản</p>
                    <p class="text-[10px] text-[#888888] font-bold">Đang bảo trì ứng dụng</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Order Summary Sticky Sidebar -->
          <aside class="lg:sticky lg:top-24 space-y-6 h-fit">
            <div class="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#F0F0EE] p-8 overflow-hidden relative">
              <div class="absolute -right-4 -top-4 w-24 h-24 bg-[#FFC107]/10 rounded-full blur-2xl"></div>
              
              <h2 class="text-xl font-black text-[#2D2D2D] mb-8">Tóm tắt đơn hàng</h2>

              <div class="space-y-4 mb-8">
                <div class="flex justify-between text-sm font-medium text-[#888888]">
                  <span>Tạm tính</span>
                  <span class="text-[#2D2D2D]">{{ subtotal() | number:'1.0-0' }}đ</span>
                </div>
                <div class="flex justify-between text-sm font-medium text-[#888888]">
                  <span>Phí vận chuyển</span>
                  <span class="text-[#2D2D2D]">{{ shippingFee() | number:'1.0-0' }}đ</span>
                </div>
                <div class="pt-4 border-t border-dashed border-[#F0F0EE] flex justify-between items-center">
                  <span class="font-black text-[#2D2D2D]">Tổng thanh toán</span>
                  <span class="text-3xl font-black text-[#2D2D2D]">{{ grandTotal() | number:'1.0-0' }}đ</span>
                </div>
              </div>

              <button 
                class="w-full bg-[#2D2D2D] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#2D2D2D]/20 hover:bg-[#FFC107] hover:text-[#2D2D2D] transition-all duration-500 flex items-center justify-center gap-3 group disabled:opacity-50"
                [disabled]="isLoading()"
                (click)="placeOrder()">
                @if (isLoading()) {
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ĐANG XỬ LÝ...
                } @else {
                  XÁC NHẬN ĐẶT HÀNG
                  <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                }
              </button>

              @if (errorMessage()) {
                <div class="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
                  <svg class="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p class="text-xs font-bold text-red-600">{{ errorMessage() }}</p>
                </div>
              }

              <p class="text-[10px] text-center text-[#888888] font-bold mt-6 uppercase tracking-wider">
                Đảm bảo an toàn thông tin 100%
              </p>
            </div>
            
            <a routerLink="/" class="flex items-center justify-center gap-2 text-sm font-bold text-[#888888] hover:text-[#2D2D2D] transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
              Quay lại cửa hàng
            </a>
          </aside>
        </div>
      </div>
    </section>
  `
})
export class CheckoutComponent {
  private readonly checkoutFacade = inject(CheckoutFacade);
  private readonly router = inject(Router);

  readonly cartItemsDetailed = this.checkoutFacade.cartItemsDetailed;
  readonly subtotal = this.checkoutFacade.subtotal;
  readonly shippingFee = this.checkoutFacade.shippingFee;

  fullName = '';
  phone = '';
  address = '';
  notes = '';
  paymentMethod = 'cod';
  
  isLoading = signal(false);
  errorMessage = signal('');

  grandTotal = computed(() => {
    return this.subtotal() + this.shippingFee();
  });

  placeOrder(): void {
    if (!this.fullName || !this.phone || !this.address) {
      this.errorMessage.set('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const input = {
      fullName: this.fullName,
      phone: this.phone,
      line1: this.address,
      ward: 'Ward', // Placeholder as UI doesn't have split fields yet
      district: 'District',
      city: 'Hồ Chí Minh',
      notes: this.notes
    };

    this.checkoutFacade.placeOrder(input).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/my-orders']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.detail || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      }
    });
  }
}
