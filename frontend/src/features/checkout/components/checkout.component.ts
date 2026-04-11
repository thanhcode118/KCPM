import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { CheckoutFacade, type CheckoutPaymentMethod } from '@/features/checkout/data-access/checkout.facade';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-[70vh] bg-cream py-12">
      <div class="container mx-auto px-4 grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white rounded-xl shadow p-6 space-y-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold text-charcoal">Thanh toan</h1>
              <p class="text-sm text-gray-500 mt-2">Hoan tat thong tin giao hang va chon phuong thuc thanh toan phu hop.</p>
            </div>
            @if (!authFacade.isAuthenticated()) {
              <a routerLink="/login" class="text-sm font-semibold text-honey hover:underline">Dang nhap de dat hang</a>
            }
          </div>

          <div class="space-y-4">
            <h2 class="text-lg font-bold">Thong tin giao hang</h2>

            @if (savedAddresses().length > 0) {
              <div class="rounded-lg border border-gray-200 bg-[#fcfbf8] p-4 space-y-3">
                <label class="block text-sm font-semibold text-charcoal">Dia chi da luu</label>
                <select [(ngModel)]="selectedAddressId" class="w-full border rounded-lg px-3 py-2">
                  <option value="">Nhap dia chi moi</option>
                  @for (address of savedAddresses(); track address.id) {
                    <option [value]="address.id">
                      {{ address.fullName }} - {{ address.phone }} - {{ formatAddress(address) }}
                    </option>
                  }
                </select>

                @if (selectedAddress()) {
                  <div class="rounded-lg border border-honey/30 bg-white p-3 text-sm text-gray-700">
                    <p class="font-semibold text-charcoal">{{ selectedAddress()?.fullName }} - {{ selectedAddress()?.phone }}</p>
                    <p class="mt-1">{{ selectedAddressLabel() }}</p>
                  </div>
                }
              </div>
            }

            @if (!usingSavedAddress()) {
              <div class="grid md:grid-cols-2 gap-3">
                <input [(ngModel)]="fullName" placeholder="Ho ten nguoi nhan" class="border rounded-lg px-3 py-2">
                <input [(ngModel)]="phone" placeholder="So dien thoai" class="border rounded-lg px-3 py-2">
                <input [(ngModel)]="line1" placeholder="Dia chi" class="border rounded-lg px-3 py-2 md:col-span-2">
                <input [(ngModel)]="ward" placeholder="Phuong / Xa" class="border rounded-lg px-3 py-2">
                <input [(ngModel)]="district" placeholder="Quan / Huyen" class="border rounded-lg px-3 py-2">
                <input [(ngModel)]="city" placeholder="Tinh / Thanh pho" class="border rounded-lg px-3 py-2 md:col-span-2">
              </div>
            }

            <textarea [(ngModel)]="notes" rows="3" placeholder="Ghi chu giao hang (khong bat buoc)" class="border rounded-lg px-3 py-2 w-full"></textarea>
          </div>

          <div>
            <h2 class="text-lg font-bold mb-3">San pham trong gio</h2>
            @if (cartItemsDetailed().length === 0) {
              <p class="text-sm text-gray-500">Gio hang hien dang trong.</p>
            } @else {
              <div class="space-y-2">
                @for (item of cartItemsDetailed(); track item.id) {
                  <div class="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p class="font-semibold">{{ item.name }}</p>
                      <p class="text-sm text-gray-500">SL: {{ item.quantity }}</p>
                    </div>
                    <p class="font-bold">{{ item.lineTotal | currency:'VND':'symbol':'1.0-0' }}</p>
                  </div>
                }
              </div>
            }
          </div>

          <div>
            <h2 class="text-lg font-bold mb-3">Phuong thuc thanh toan</h2>
            <div class="flex flex-col gap-2">
              <label class="border rounded-lg p-3 cursor-pointer"><input type="radio" name="payment" [(ngModel)]="paymentMethod" value="vnpay"> Thanh toan VNPay</label>
              <label class="border rounded-lg p-3 cursor-pointer"><input type="radio" name="payment" [(ngModel)]="paymentMethod" value="cod"> Thanh toan khi nhan hang (COD)</label>
              <label class="border rounded-lg p-3 cursor-pointer"><input type="radio" name="payment" [(ngModel)]="paymentMethod" value="bank"> Chuyen khoan ngan hang</label>
            </div>
          </div>
        </div>

        <aside class="bg-white rounded-xl shadow p-6 h-fit space-y-4">
          <h2 class="text-xl font-bold">Tom tat don hang</h2>

          <div class="space-y-1 text-sm">
            <div class="flex justify-between"><span>Tam tinh</span><span>{{ subtotal() | currency:'VND':'symbol':'1.0-0' }}</span></div>
            <div class="flex justify-between"><span>Phi ship</span><span>{{ shippingFee() | currency:'VND':'symbol':'1.0-0' }}</span></div>
            <hr>
            <div class="flex justify-between text-base font-bold"><span>Tong cong</span><span>{{ grandTotal() | currency:'VND':'symbol':'1.0-0' }}</span></div>
          </div>

          <button
            class="w-full bg-honey text-charcoal font-bold py-3 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
            [disabled]="isSubmitting() || cartItemsDetailed().length === 0"
            (click)="placeOrder()">
            {{ isSubmitting() ? 'Dang xu ly...' : 'Dat hang' }}
          </button>

          <a routerLink="/orders" class="block text-center text-sm text-gray-500 hover:text-charcoal">Xem va theo doi don hang</a>

          @if (statusMessage()) {
            <p class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">{{ statusMessage() }}</p>
          }

          @if (errorMessage()) {
            <p class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">{{ errorMessage() }}</p>
          }
        </aside>
      </div>
    </section>
  `
})
export class CheckoutComponent {
  readonly authFacade = inject(AuthFacade);
  private readonly checkoutFacade = inject(CheckoutFacade);
  private readonly router = inject(Router);

  readonly cartItemsDetailed = this.checkoutFacade.cartItemsDetailed;
  readonly subtotal = this.checkoutFacade.subtotal;
  readonly shippingFee = this.checkoutFacade.shippingFee;
  readonly savedAddresses = this.authFacade.addresses;
  readonly selectedAddress = computed(() => {
    const selectedId = Number(this.selectedAddressId);
    return this.savedAddresses().find((address) => address.id === selectedId) ?? null;
  });

  fullName = '';
  phone = '';
  line1 = '';
  ward = '';
  district = '';
  city = '';
  notes = '';
  paymentMethod: CheckoutPaymentMethod = 'vnpay';
  selectedAddressId = '';

  statusMessage = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);
  readonly grandTotal = computed(() => this.subtotal() + this.shippingFee());

  usingSavedAddress(): boolean {
    return this.selectedAddress() !== null;
  }

  formatAddress(address: {
    line1: string;
    ward: string;
    district: string;
    city: string;
  }): string {
    return [address.line1, address.ward, address.district, address.city].filter(Boolean).join(', ');
  }

  selectedAddressLabel(): string {
    return this.selectedAddress() ? this.formatAddress(this.selectedAddress()!) : '';
  }

  placeOrder(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (!this.authFacade.isAuthenticated()) {
      this.errorMessage.set('Vui long dang nhap truoc khi dat hang.');
      this.statusMessage.set('');
      return;
    }

    if (!this.hasShippingInformation()) {
      this.errorMessage.set('Vui long nhap day du thong tin giao hang hoac chon dia chi da luu.');
      this.statusMessage.set('');
      return;
    }

    this.errorMessage.set('');
    this.statusMessage.set('');
    this.isSubmitting.set(true);

    this.checkoutFacade.placeOrder({
      addressId: this.selectedAddress() ? Number(this.selectedAddressId) : null,
      fullName: this.fullName,
      phone: this.phone,
      line1: this.line1,
      ward: this.ward,
      district: this.district,
      city: this.city,
      notes: this.notes,
      paymentMethod: this.paymentMethod
    }).subscribe({
      next: (result) => {
        this.isSubmitting.set(false);

        if (result.kind === 'redirect') {
          this.statusMessage.set('Dang chuyen sang VNPay...');
          window.location.assign(result.redirectUrl);
          return;
        }

        if (result.kind === 'success') {
          this.statusMessage.set(result.message);
          this.errorMessage.set('');
          this.router.navigate(['/orders'], {
            queryParams: {
              payment: 'processed'
            }
          });
          return;
        }

        this.errorMessage.set(result.message);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Khong the dat hang luc nay.');
      }
    });
  }

  private hasShippingInformation(): boolean {
    if (this.usingSavedAddress()) {
      return true;
    }

    return [this.fullName, this.phone, this.line1, this.ward, this.district, this.city]
      .every((value) => value.trim().length > 0);
  }
}
