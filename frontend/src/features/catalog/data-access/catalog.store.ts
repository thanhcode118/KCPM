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
  
  readonly categories = signal<Category[]>([]);
  readonly categoryProducts = signal<Product[]>([]);
  readonly trendingProducts = signal<Product[]>([]);
  readonly flashSaleProducts = signal<Product[]>([]);
  readonly newCollectionProducts = signal<Product[]>([]);
  readonly newArrivals = signal<Product[]>([]);

  constructor() {
    this.apiService.getCategories()
      .pipe(takeUntilDestroyed())
      .subscribe(cats => this.categories.set(cats));

    this.apiService.getProducts()
      .pipe(takeUntilDestroyed())
      .subscribe(products => {
        this.categoryProducts.set(products);
        this.trendingProducts.set(products.filter(p => p.tag === 'Best Seller' || p.tag === 'HOT'));
        this.newArrivals.set(products.filter(p => p.tag === 'NEW'));
        this.newCollectionProducts.set(products.slice(0, 10)); // just fallback logic
      });

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
