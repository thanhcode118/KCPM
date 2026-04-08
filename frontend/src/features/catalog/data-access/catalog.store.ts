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
    // Pre-populate with mock data so the UI isn't empty if the API hangs
    this.categoryProducts.set(MOCK_CATEGORY_PRODUCTS);
    this.trendingProducts.set(MOCK_TRENDING_PRODUCTS);
    this.flashSaleProducts.set(MOCK_FLASH_SALE_PRODUCTS);
    this.newCollectionProducts.set(MOCK_NEW_COLLECTION_PRODUCTS);
    this.newArrivals.set(MOCK_NEW_ARRIVALS_PRODUCTS);

    this.apiService.getCategories()
      .pipe(takeUntilDestroyed())
      .subscribe(cats => {
        if (cats && cats.length > 0) {
          this.categories.set(cats);
        }
      });

    this.apiService.getProducts()
      .pipe(takeUntilDestroyed())
      .subscribe(products => {
        if (products && products.length > 0) {
          this.categoryProducts.set(products);
          this.trendingProducts.set(products.filter(p => p.tag === 'Best Seller' || p.tag === 'HOT'));
          this.newArrivals.set(products.filter(p => p.tag === 'NEW'));
          this.newCollectionProducts.set(products.slice(0, 10));
        }
      });

    this.apiService.getPromotions()
      .pipe(takeUntilDestroyed())
      .subscribe(products => {
        if (products && products.length > 0) {
          this.flashSaleProducts.set(products);
        }
      });
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
