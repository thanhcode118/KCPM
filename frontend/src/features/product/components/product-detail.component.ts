import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailFacade } from '@/features/product/data-access/product-detail.facade';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';
import { IconComponent } from '@/shared/components/icon.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white min-h-screen py-10">
      @if (productFacade.isLoading()) {
        <div class="container mx-auto px-4 py-20 text-center">
          <app-icon name="loader" class="w-8 h-8 animate-spin mx-auto mb-4 text-honey"></app-icon>
          <p class="text-xl text-gray-600">Dang tai thong tin san pham...</p>
        </div>
      } @else if (productFacade.hasError()) {
        <div class="container mx-auto px-4 py-20 text-center">
          <div class="max-w-xl mx-auto rounded-2xl border border-red-200 bg-red-50 px-6 py-10">
            <h1 class="text-2xl font-bold text-charcoal mb-3">Khong the tai san pham</h1>
            <p class="text-gray-600 mb-6">{{ productFacade.errorMessage() ?? 'Da xay ra loi khi tai du lieu.' }}</p>
            <button
              class="bg-charcoal text-white px-5 py-3 rounded-lg font-bold hover:bg-honey hover:text-charcoal transition-colors"
              (click)="reloadProduct()"
            >
              Thu lai
            </button>
          </div>
        </div>
      } @else if (productFacade.selectedProduct()) {
        <div class="container mx-auto px-4 grid lg:grid-cols-2 gap-8">
          <div>
            <img [src]="selectedImage" class="w-full rounded-xl border border-gray-200 h-[420px] object-cover">
            <div class="grid grid-cols-4 gap-2 mt-3">
              @for (image of productFacade.productImages(); track image; let i = $index) {
                <button class="border rounded-lg overflow-hidden" (click)="selectedImage = image">
                  <img [src]="image" class="w-full h-20 object-cover">
                </button>
              }
            </div>
          </div>

          <div class="space-y-4">
            <h1 class="text-3xl font-bold text-charcoal">{{ productFacade.selectedProduct()?.name }}</h1>
            <div class="flex items-center gap-2 text-yellow-500">
              @for (star of [1,2,3,4,5]; track star) {
                <app-icon name="star-filled" class="w-4 h-4"></app-icon>
              }
              <span class="text-sm text-gray-500">({{ productFacade.reviews().length }} đánh giá)</span>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold text-honey">{{ productFacade.selectedProduct()?.price | currency:'VND':'symbol':'1.0-0' }}</span>
              @if (productFacade.selectedProduct()?.originalPrice) {
                <span class="text-sm text-gray-400 line-through">{{ productFacade.selectedProduct()?.originalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
              }
            </div>

            <button class="bg-charcoal text-white px-5 py-3 rounded-lg font-bold hover:bg-honey hover:text-charcoal transition-colors" (click)="checkoutFacade.addToCart(productFacade.selectedProduct()!.id)">
              Thêm vào giỏ
            </button>

            <div class="bg-cream rounded-xl p-4">
              <h2 class="font-bold mb-2">Khuyến mãi</h2>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Giảm 10% khi nhập mã: BEE10</li>
                <li>• Freeship cho đơn từ 500k</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 mt-10 grid lg:grid-cols-2 gap-8">
          <div class="bg-cream p-5 rounded-xl">
            <h2 class="text-xl font-bold mb-4">Đánh giá & bình luận</h2>
            <div class="space-y-3 mb-4">
              @for (review of productFacade.reviews(); track review.id) {
                <div class="bg-white p-3 rounded-lg border">
                  <p class="font-semibold">{{ review.author }} - {{ review.rating }}/5</p>
                  <p class="text-sm text-gray-700">{{ review.comment }}</p>
                  <p class="text-xs text-gray-500">{{ review.createdAt }}</p>
                </div>
              }
              @if (productFacade.reviews().length === 0) {
                <p class="text-gray-500 text-sm">Chưa có đánh giá nào.</p>
              }
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border">
            <h2 class="text-xl font-bold mb-4">Viết bình luận</h2>
            <form class="space-y-3" (ngSubmit)="submitComment()">
              <input [(ngModel)]="author" name="author" class="w-full border rounded px-3 py-2" placeholder="Tên của bạn" required>
              <select [(ngModel)]="rating" name="rating" class="w-full border rounded px-3 py-2">
                <option [ngValue]="5">5 sao</option>
                <option [ngValue]="4">4 sao</option>
                <option [ngValue]="3">3 sao</option>
              </select>
              <textarea [(ngModel)]="comment" name="comment" class="w-full border rounded px-3 py-2 h-28" placeholder="Nội dung bình luận" required></textarea>
              <button class="bg-honey text-charcoal px-4 py-2 rounded font-semibold" type="submit">Gửi</button>
            </form>
          </div>
        </div>
      } @else {
        <div class="container mx-auto px-4 py-20 text-center">
          <h1 class="text-2xl font-bold text-charcoal mb-3">Khong tim thay san pham</h1>
          <p class="text-gray-600">San pham nay khong ton tai hoac da ngung hien thi.</p>
        </div>
      }
    </section>
  `
})
export class ProductDetailComponent {
  productFacade = inject(ProductDetailFacade);
  checkoutFacade = inject(CheckoutFacade);
  route = inject(ActivatedRoute);

  selectedImage = '';
  author = '';
  rating = 5;
  comment = '';

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id') ?? '101');
    this.productFacade.selectProductById(id);

    effect(() => {
      const images = this.productFacade.productImages();
      if (images && images.length > 0 && !this.selectedImage) {
        this.selectedImage = images[0];
      }
    });
  }

  submitComment(): void {
    this.productFacade.addComment(this.author, this.rating, this.comment);
    this.author = '';
    this.rating = 5;
    this.comment = '';
  }

  reloadProduct(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') ?? '101');
    this.productFacade.selectProductById(id);
  }
}

