import { Injectable, computed, signal, inject } from '@angular/core';
import { Product } from '@/core/models';
import { ApiService } from '@/core/services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface ProductReview {
  id: number;
  productId: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductDetailFacade {
  private apiService = inject(ApiService);

  private readonly selectedProductSignal = signal<Product | null>(null);
  private readonly reviewsSignal = signal<ProductReview[]>([]);

  readonly selectedProduct = computed(() => {
    return this.selectedProductSignal() || {
      id: 0,
      name: 'Loading...',
      price: 0,
      image: '',
      hoverImage: '',
      description: 'Đang tải dữ liệu...',
      isActive: true,
      categoryId: 0,
      category: '',
      sku: '',
      slug: '',
      createdAt: ''
    } as Product;
  });

  readonly productImages = computed(() => {
    const product = this.selectedProduct();
    if (!product.image) return [];
    return [product.image, product.hoverImage, product.image, product.hoverImage].filter(img => !!img);
  });

  readonly reviews = computed(() => this.reviewsSignal());

  selectProductById(id: number): void {
    this.apiService.getProductById(id).subscribe(product => {
      this.selectedProductSignal.set(product);
    });

    this.apiService.getProductReviews(id).subscribe(reviews => {
      this.reviewsSignal.set(reviews);
    });
  }

  addComment(author: string, rating: number, comment: string): void {
    const productId = this.selectedProduct().id;
    if (productId === 0) return;

    const reviewInput = {
      productId: productId,
      author,
      rating,
      comment
    };

    this.apiService.postProductReview(productId, reviewInput).subscribe(newReview => {
      this.reviewsSignal.update(list => [newReview, ...list]);
      // Re-fetch product to get updated average rating and review count
      this.apiService.getProductById(productId).subscribe(product => {
        this.selectedProductSignal.set(product);
      });
    });
  }
}
