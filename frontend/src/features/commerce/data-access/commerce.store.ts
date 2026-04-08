import { Injectable, computed, inject, signal } from '@angular/core';
import { Cart, Order, User } from '@/core/models';
import { MOCK_CARTS, MOCK_ORDERS, MOCK_USERS } from '@/core/mock-data/ecommerce.mock';
import { CatalogStore } from '@/features/catalog/data-access/catalog.store';
import { CommerceOrderService, PlaceOrderInput } from './order.service';
import { OrderView } from '@/features/admin/data-access/admin-order.service';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommerceStore {
  private readonly catalogStore = inject(CatalogStore);
  private readonly orderService = inject(CommerceOrderService);

  readonly users = signal<User[]>(MOCK_USERS);
  readonly orders = signal<OrderView[]>([]);
  readonly activeCart = signal<Cart>({
    id: 0,
    userId: 0,
    items: [],
    updatedAt: new Date().toISOString()
  });
  readonly selectedProductIds = signal<Set<number>>(new Set());

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

    // Automatically select newly added items
    this.selectedProductIds.update(set => {
      const newSet = new Set(set);
      newSet.add(productId);
      return newSet;
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

    // Remove from selection if deleted
    this.selectedProductIds.update(set => {
      const newSet = new Set(set);
      newSet.delete(productId);
      return newSet;
    });
  }

  toggleItemSelection(productId: number): void {
    this.selectedProductIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }

  toggleSelectAll(selected: boolean): void {
    if (selected) {
      const allIds = this.activeCart().items.map(i => i.productId);
      this.selectedProductIds.set(new Set(allIds));
    } else {
      this.selectedProductIds.set(new Set());
    }
  }

  clearCart(): void {
    this.activeCart.update((cart) => ({
      ...cart,
      items: [],
      updatedAt: new Date().toISOString()
    }));
  }

  fetchMyOrders(): void {
    this.orderService.getMyOrders().subscribe((orders) => this.orders.set(orders));
  }

  placeOrder(input: PlaceOrderInput): Observable<OrderView> {
    return this.orderService.placeOrder(input).pipe(
      tap((newOrder) => {
        this.orders.update((list) => [newOrder, ...list]);
        this.clearCart();
      })
    );
  }
}

