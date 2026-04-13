import { Injectable, computed, signal, inject } from '@angular/core';
import { Product, ProductViewDto, mapProductViewDtoToProduct } from '@/core/models';
import { HttpClient } from '@angular/common/http';
import { apiEndpoints } from '@/core/api/api-endpoints';
import { tap } from 'rxjs';

export interface ProductReview {
  id: number;
  productId: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductDetailFacade {
  private readonly http = inject(HttpClient);

  readonly selectedProduct = signal<Product | null>(null);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private readonly reviewsSignal = signal<ProductReview[]>([]);

  readonly productImages = computed(() => {
    const product = this.selectedProduct();
    if (!product) return [];
    return [product.image, product.hoverImage, product.image, product.hoverImage];
  });

  readonly reviews = computed(() => this.reviewsSignal());

  selectProductById(id: number): void {
    this.selectedProduct.set(null);
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);

    // Load product detail
    this.http.get<ProductViewDto>(apiEndpoints.products.detail(id))
      .subscribe({
        next: (dto) => {
          this.selectedProduct.set(mapProductViewDtoToProduct(dto));
          this.isLoading.set(false);
          this.loadReviews(id); // Load reviews after product is loaded
        },
        error: (err) => {
          console.error('Failed to load product', err);
          this.selectedProduct.set(null);
          this.isLoading.set(false);
          this.hasError.set(true);
          this.errorMessage.set('Không tải được thông tin sản phẩm.');
        }
      });
  }

  loadReviews(productId: number): void {
    this.http.get<ProductReview[]>(apiEndpoints.products.reviews(productId))
      .subscribe({
        next: (reviews) => {
          // Sort by newest first
          const sorted = [...reviews].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.reviewsSignal.set(sorted);
        },
        error: (err) => console.error('Failed to load reviews', err)
      });
  }

  addComment(author: string, rating: number, comment: string): void {
    const p = this.selectedProduct();
    if (!p) return;

    const payload = {
      productId: p.id,
      author,
      rating,
      comment
    };

    this.http.post<ProductReview>(apiEndpoints.products.reviews(p.id), payload)
      .subscribe({
        next: () => {
          // Refresh reviews and product details to update rating/counts
          this.loadReviews(p.id);
          this.refreshProduct(p.id);
        },
        error: (err) => console.error('Failed to add review', err)
      });
  }

  private refreshProduct(id: number): void {
    this.http.get<ProductViewDto>(apiEndpoints.products.detail(id))
      .subscribe(dto => this.selectedProduct.set(mapProductViewDtoToProduct(dto)));
  }
}

