import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeFacade } from '@/features/home/data-access/home.facade';
import { IconComponent } from '@/shared/components/icon.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-new-arrivals',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 bg-white overflow-hidden">
      <div class="container mx-auto px-4">
        
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-charcoal">Mới Về Tổ</h2>
          <div class="flex gap-2">
            <button (click)="prev()" class="p-2 border border-gray-200 rounded-full hover:bg-honey hover:border-honey hover:text-white transition-colors">
              <app-icon name="chevron-left" class="w-5 h-5"></app-icon>
            </button>
            <button (click)="next()" class="p-2 border border-gray-200 rounded-full hover:bg-honey hover:border-honey hover:text-white transition-colors">
              <app-icon name="chevron-right" class="w-5 h-5"></app-icon>
            </button>
          </div>
        </div>

        <div class="relative">
          <div 
            class="flex gap-6 transition-transform duration-500 ease-out"
            [style.transform]="'translateX(-' + currentIndex() * (100 / itemsPerPage()) + '%)'"
          >
            @for (product of homeFacade.newArrivals(); track product.id) {
              <div class="min-w-[100%] sm:min-w-[50%] md:min-w-[33.333%] lg:min-w-[25%] flex-shrink-0 px-2"
                   [routerLink]="['/product', product.id]">
                <div class="group cursor-pointer">
                  <div class="relative overflow-hidden rounded-lg mb-3 aspect-[3/4] bg-gray-50">
                     <!-- Images -->
                     <img [src]="product.image" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0">
                     <img [src]="product.hoverImage" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                     
                     <!-- New Tag -->
                     <div class="absolute top-3 left-3 bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-3 py-1 rounded-sm shadow-sm">
                       NEW
                     </div>
                  </div>
                  
                  <div class="space-y-1">
                    <p class="text-xs text-gray-500 uppercase">{{ product.category }}</p>
                    <h3 class="font-bold text-charcoal group-hover:text-honey transition-colors">{{ product.name }}</h3>
                    
                    <div class="flex items-center gap-1.5 py-0.5">
                      <div class="flex text-yellow-400 gap-1 mt-0.5">
                        <app-icon name="star-filled" class="w-3.5 h-3.5"></app-icon>
                        <app-icon name="star-filled" class="w-3.5 h-3.5"></app-icon>
                        <app-icon name="star-filled" class="w-3.5 h-3.5"></app-icon>
                        <app-icon name="star-filled" class="w-3.5 h-3.5"></app-icon>
                        <app-icon name="star-filled" class="w-3.5 h-3.5"></app-icon>
                      </div>
                      <span class="text-[10px] text-gray-400 font-medium">(10)</span>
                    </div>

                    <p class="text-charcoal font-bold">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

      </div>
    </section>
  `
})
export class NewArrivalsComponent {
  homeFacade = inject(HomeFacade);
  currentIndex = signal(0);
  itemsPerPage = signal(4); // Ideally responsive, kept simple for now

  next() {
    // Simple loop logic
    const total = this.homeFacade.newArrivals().length;
    this.currentIndex.update(i => (i + 1) % total);
  }

  prev() {
    const total = this.homeFacade.newArrivals().length;
    this.currentIndex.update(i => (i - 1 + total) % total);
  }
}
