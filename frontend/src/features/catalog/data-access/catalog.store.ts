import { Injectable, computed, signal, inject } from '@angular/core';
import { Category, Product } from '@/core/models';
import {
  MOCK_CATEGORIES,
  MOCK_CATEGORY_PRODUCTS,
  MOCK_FLASH_SALE_PRODUCTS,
  MOCK_NEW_ARRIVALS_PRODUCTS,
  MOCK_NEW_COLLECTION_PRODUCTS,
  MOCK_TRENDING_PRODUCTS
} from '@/core/mock-data/ecommerce.mock';

import { ApiService } from '@/core/services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private apiService = inject(ApiService);
  
  readonly categories = signal<Category[]>(MOCK_CATEGORIES);
  readonly categoryProducts = signal<Product[]>(MOCK_CATEGORY_PRODUCTS);
  readonly trendingProducts = signal<Product[]>(MOCK_TRENDING_PRODUCTS);
  readonly flashSaleProducts = signal<Product[]>([]);
  readonly newCollectionProducts = signal<Product[]>(MOCK_NEW_COLLECTION_PRODUCTS);
  readonly newArrivals = signal<Product[]>(MOCK_NEW_ARRIVALS_PRODUCTS);

  constructor() {
    this.apiService.getPromotions()
      .pipe(takeUntilDestroyed())
      .subscribe(products => this.flashSaleProducts.set(products));
  }

  readonly allProducts = computed(() => {
    const uniqueById = new Map<number, Product>();

    [
      ...this.categoryProducts(),
      ...this.newCollectionProducts(),
      ...this.trendingProducts(),
      ...this.flashSaleProducts(),
      ...this.newArrivals()
    ].forEach((product) => {
      if (product.isActive) {
        uniqueById.set(product.id, product);
      }
    });

    return Array.from(uniqueById.values()).sort((a, b) => a.id - b.id);
  });

  findProductById(productId: number): Product | undefined {
    return this.allProducts().find((product) => product.id === productId);
  }
}
