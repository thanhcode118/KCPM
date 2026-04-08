import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeFacade } from '@/features/home/data-access/home.facade';
import { IconComponent } from '@/shared/components/icon.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        
        <!-- Header -->
        <div class="flex items-center justify-center gap-3 mb-10">
          <span class="text-honey">
            <app-icon name="crown"></app-icon>
          </span>
          <h2 class="text-3xl font-bold text-charcoal">Góc Tổ Ong</h2>
          <span class="text-honey">
            <app-icon name="crown"></app-icon>
          </span>
        </div>
 
        <!-- Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          @for (product of homeFacade.trendingProducts(); track product.id) {
            <div class="group relative">
              
              <!-- Image Container -->
              <div class="relative w-full aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden mb-4 cursor-pointer"
                   [routerLink]="['/product', product.id]">
                <!-- Main Image -->
                <img [src]="product.image" [alt]="product.name" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0">
                
                <!-- Hover Image -->
                <img [src]="product.hoverImage" [alt]="product.name" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100">

                <!-- Tags -->
                @if (product.tag) {
                  <div class="absolute top-3 left-3 bg-honey text-charcoal text-xs font-bold px-3 py-1 rounded-sm shadow-sm z-10">
                    {{ product.tag }}
                  </div>
                }

                <!-- Add to Cart Slide Up -->
                <div class="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20"
                     (click)="$event.stopPropagation()">
                  <button (click)="homeFacade.addToCart(product.id)" class="w-full bg-charcoal text-white py-3 font-semibold rounded shadow-lg hover:bg-honey hover:text-charcoal transition-colors flex items-center justify-center gap-2">
                    <app-icon name="plus"></app-icon> Thêm vào giỏ
                  </button>
                </div>
              </div>

              <!-- Info -->
              <div class="space-y-1" [routerLink]="['/product', product.id]">
                <p class="text-xs text-gray-500 uppercase tracking-wide">{{ product.category }}</p>
                <h3 class="text-lg font-semibold text-charcoal group-hover:text-honey transition-colors cursor-pointer">{{ product.name }}</h3>
                
                <div class="flex items-center gap-1.5 py-0.5">
                  <div class="flex text-yellow-400 gap-1.5 mt-0.5">
                    <app-icon name="star-filled" class="w-3.5 h-3.5"></app-icon>
                    <app-icon name="star-filled" class="w-3.5 h-3.5"></app-icon>
                    <app-icon name="star-filled" class="w-3.5 h-3.5"></app-icon>
                    <app-icon name="star-filled" class="w-3.5 h-3.5"></app-icon>
                    <app-icon name="star-filled" class="w-3.5 h-3.5"></app-icon>
                  </div>
                  <span class="text-[10px] text-gray-400 font-medium">(25)</span>
                </div>

                <p class="text-honey font-bold text-lg">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</p>
              </div>

            </div>
          }
        </div>
        
        <div class="text-center mt-12">
            <a href="#" class="inline-flex items-center gap-2 text-charcoal font-bold border-b-2 border-honey pb-1 hover:text-honey transition-colors">
                Xem tất cả sản phẩm
                <app-icon name="arrow-right"></app-icon>
            </a>
        </div>

      </div>
    </section>
  `
})
export class TrendingComponent {
  homeFacade = inject(HomeFacade);
}
