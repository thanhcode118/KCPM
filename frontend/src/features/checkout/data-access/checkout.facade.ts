import { Injectable, computed, inject } from '@angular/core';
import { CatalogStore } from '@/features/catalog/data-access/catalog.store';
import { CommerceStore } from '@/features/commerce/data-access/commerce.store';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CheckoutFacade {
  private readonly commerceStore = inject(CommerceStore);
  private readonly catalogStore = inject(CatalogStore);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  readonly users = this.commerceStore.users;
  readonly orders = this.commerceStore.orders;
  readonly activeCart = this.commerceStore.activeCart;
  readonly cartCount = this.commerceStore.cartCount;
  readonly cartItemsDetailed = computed(() => {
    return this.activeCart().items.map((item) => {
      const product = this.catalogStore.findProductById(item.productId);
      const unitPrice = product?.price ?? item.unitPrice;

      return {
        id: item.id,
        productId: item.productId,
        name: product?.name ?? `Sản phẩm #${item.productId}`,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity
      };
    });
  });
  readonly subtotal = computed(() => {
    return this.cartItemsDetailed().reduce((sum, item) => sum + item.lineTotal, 0);
  });
  readonly shippingFee = computed(() => {
    return this.subtotal() >= 500000 ? 0 : 30000;
  });

  addToCart(productId: number, quantity = 1): void {
    if (!this.authFacade.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.commerceStore.addToCart(productId, quantity);
  }

  removeFromCart(productId: number): void {
    this.commerceStore.removeFromCart(productId);
  }
}
