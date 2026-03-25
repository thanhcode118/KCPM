import { Injectable, computed, inject, signal } from '@angular/core';
import { Cart, Order, User } from '@/core/models';
import { MOCK_CARTS, MOCK_ORDERS, MOCK_USERS } from '@/core/mock-data/ecommerce.mock';
import { CatalogStore } from '@/features/catalog/data-access/catalog.store';

@Injectable({ providedIn: 'root' })
export class CommerceStore {
  private readonly catalogStore = inject(CatalogStore);

  readonly users = signal<User[]>(MOCK_USERS);
  readonly orders = signal<Order[]>(MOCK_ORDERS);
  readonly activeCart = signal<Cart>({
    id: 0,
    userId: 0,
    items: [],
    updatedAt: new Date().toISOString()
  });

  readonly cartCount = computed(() => {
    return this.activeCart().items.reduce((total, item) => total + item.quantity, 0);
  });

  addToCart(productId: number, quantity = 1): void {
    if (quantity <= 0) {
      return;
    }

    const product = this.catalogStore.findProductById(productId);
    if (!product) {
      return;
    }

    this.activeCart.update((cart) => {
      const existingItem = cart.items.find((item) => item.productId === productId);
      if (existingItem) {
        return {
          ...cart,
          items: cart.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
          updatedAt: new Date().toISOString()
        };
      }

      return {
        ...cart,
        items: [
          ...cart.items,
          {
            id: Date.now(),
            productId,
            quantity,
            unitPrice: product.price
          }
        ],
        updatedAt: new Date().toISOString()
      };
    });
  }

  removeFromCart(productId: number): void {
    this.activeCart.update((cart) => {
      return {
        ...cart,
        items: cart.items.filter((item) => item.productId !== productId),
        updatedAt: new Date().toISOString()
      };
    });
  }
}

