import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HomeFacade } from '@/features/home/data-access/home.facade';

@Component({
  selector: 'app-flash-sale',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 bg-[#FFF9C4]">
      <div class="container mx-auto px-4">
        
        <!-- Header & Timer -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <div class="flex items-center gap-4">
            <h2 class="text-2xl md:text-3xl font-bold text-charcoal flex items-center gap-2">
              <span class="text-honey-600">⚡</span> Deal Mật Ngọt
            </h2>
            <div class="hidden md:block h-6 w-px bg-gray-400"></div>
            <p class="text-charcoal-light italic hidden md:block">Chốt ngay kẻo lỡ</p>
          </div>

          <!-- Countdown -->
          <div class="flex items-center gap-2 text-white font-bold text-lg md:text-xl">
            <span class="text-charcoal-light text-sm mr-2 uppercase tracking-wider font-semibold">Kết thúc sau</span>
            <div class="bg-charcoal px-3 py-1 rounded shadow">{{ hours() }}</div>
            <span class="text-charcoal font-bold">:</span>
            <div class="bg-charcoal px-3 py-1 rounded shadow">{{ minutes() }}</div>
            <span class="text-charcoal font-bold">:</span>
            <div class="bg-charcoal px-3 py-1 rounded shadow">{{ seconds() }}</div>
          </div>
        </div>

        @if (homeFacade.flashSaleProductsState().isLoading) {
          <div class="rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500">
            Dang tai san pham flash sale...
          </div>
        } @else if (homeFacade.flashSaleProductsState().hasError) {
          <div class="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
            <p class="font-semibold text-charcoal mb-2">Khong tai duoc san pham flash sale.</p>
            <p class="text-sm text-gray-600">{{ homeFacade.flashSaleProductsState().errorMessage }}</p>
          </div>
        } @else if (homeFacade.flashSaleProducts().length === 0) {
          <div class="rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500">
            Chua co san pham dang giam gia.
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (product of homeFacade.flashSaleProducts(); track product.id) {
              <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer" [routerLink]="['/product', product.id]">
                <!-- Image -->
                <div class="relative aspect-square overflow-hidden">
                   <img [src]="product.image" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                   <div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                     -{{ calculateDiscount(product.price, product.originalPrice!) }}%
                   </div>
                </div>

                <!-- Info -->
                <div class="p-4">
                  <h3 class="text-charcoal font-semibold mb-1 truncate">{{ product.name }}</h3>
                  <div class="flex items-baseline gap-2 mb-3">
                    <span class="text-honey-600 font-bold text-lg">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
                    <span class="text-gray-400 text-sm line-through">{{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
                  </div>

                  <!-- Progress Bar -->
                  <div class="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-red-400" 
                      [style.width.%]="product.soldPercentage"
                    ></div>
                    <div class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      Đã bán {{ product.soldPercentage }}%
                    </div>
                  </div>
                  <p class="text-xs text-center mt-1 text-gray-500">Chỉ còn {{ product.stockLeft }} sản phẩm</p>
                </div>
              </div>
            }
          </div>
        }

      </div>
    </section>
  `
})
export class FlashSaleComponent implements OnInit, OnDestroy {
  homeFacade = inject(HomeFacade);
  
  hours = signal('02');
  minutes = signal('45');
  seconds = signal('30');
  
  private timer: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
    }
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  startTimer() {
    let duration = 3600 * 2 + 60 * 45 + 30; // 2h 45m 30s
    this.timer = setInterval(() => {
      duration--;
      if (duration < 0) duration = 3600 * 3; // Reset loop

      const h = Math.floor(duration / 3600);
      const m = Math.floor((duration % 3600) / 60);
      const s = duration % 60;

      this.hours.set(h.toString().padStart(2, '0'));
      this.minutes.set(m.toString().padStart(2, '0'));
      this.seconds.set(s.toString().padStart(2, '0'));
    }, 1000);
  }

  calculateDiscount(price: number, original: number): number {
    return Math.round(((original - price) / original) * 100);
  }
}
