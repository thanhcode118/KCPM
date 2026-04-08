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
        image: product?.image ?? 'https://picsum.photos/id/10/50/50',
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        isSelected: this.commerceStore.selectedProductIds().has(item.productId)
      };
    });
  });

  readonly selectedItems = computed(() => this.cartItemsDetailed().filter(i => i.isSelected));

  readonly subtotal = computed(() => {
    return this.selectedItems().reduce((sum, item) => sum + item.lineTotal, 0);
  });

  readonly totalCartCount = computed(() => {
    return this.cartItemsDetailed().reduce((total, item) => total + item.quantity, 0);
  });

  readonly selectedCount = computed(() => {
    return this.selectedItems().reduce((total, item) => total + item.quantity, 0);
  });

  readonly shippingFee = computed(() => {
    const subTotalVal = this.subtotal();
    if (subTotalVal === 0) return 0;
    return subTotalVal >= 500000 ? 0 : 30000;
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

  toggleItemSelection(productId: number): void {
    this.commerceStore.toggleItemSelection(productId);
  }

  toggleSelectAll(selected: boolean): void {
    this.commerceStore.toggleSelectAll(selected);
  }

  isAllSelected = computed(() => {
    const total = this.cartItemsDetailed().length;
    return total > 0 && this.selectedItems().length === total;
  });

  placeOrder(input: any) {
    return this.commerceStore.placeOrder(input);
  }
}
