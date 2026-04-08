import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Product } from '@/core/models';
import { HEADER_NAVIGATION_STRUCTURE, HeaderNavCategory, HeaderSubItem } from '@/core/mock-data/header-navigation.mock';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';
import { SearchFacade } from '@/features/search/data-access/search.facade';
import { CartDrawerComponent } from './cart-drawer.component';
import { MobileMenuComponent } from './mobile-menu.component';
import { HeaderActionsComponent } from './header-actions.component';
import { HeaderNavigationComponent } from './header-navigation.component';
import { HeaderSearchComponent } from './header-search.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    CartDrawerComponent,
    HeaderNavigationComponent,
    HeaderSearchComponent,
    HeaderActionsComponent,
    MobileMenuComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses()' },
  template: `
    <div class="top-bar bg-black/40 backdrop-blur-sm text-white text-[11px] md:text-xs font-semibold py-1 text-center tracking-[0.12em] uppercase relative overflow-hidden transition-all duration-500"
         [class.max-h-0]="isScrolled()"
         [class.py-0]="isScrolled()"
         [class.opacity-0]="isScrolled()"
         [class.overflow-hidden]="true">
      <div class="top-bar-shimmer"></div>
      <span class="relative z-10">100% ORIGINAL PRODUCTS</span>
    </div>

    <nav class="header-main group/header transition-all duration-500 hover:bg-white hover:shadow-md"
         [class.bg-transparent]="useTransparentHeader()"
         [class.bg-white]="!useTransparentHeader()"
         [class.shadow-md]="useSolidHeaderStyle()"
         [class.scrolled]="useSolidHeaderStyle()">
      <div class="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4 relative">
        <a href="#"
           (click)="goHome($event)"
           class="logo-link flex items-center group flex-shrink-0 z-[101] transition-all duration-500"
           [class.opacity-0]="isScrolled()"
           [class.w-0]="isScrolled()"
           [class.overflow-hidden]="isScrolled()"
           [class.gap-0]="isScrolled()">
          <img src="/assets/images/logo.png" alt="BeeShop - Phụ kiện decor" class="logo-img h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-md mt-1">
        </a>

        <app-header-navigation
          [navigationStructure]="navigationStructure"
          [solidStyle]="useSolidHeaderStyle()"
          (navigate)="navigateTo($event)"
          (navigateSub)="navigateToSub($event.category, $event.item)"
        />

        <div class="flex items-center gap-3 flex-shrink-0 z-[101]">
          <app-header-search
            [query]="searchFacade.query()"
            [isFocused]="isSearchFocused()"
            [keywordSuggestions]="searchFacade.keywordSuggestions()"
            [suggestions]="searchFacade.suggestions()"
            [solidStyle]="useSolidHeaderStyle()"
            (queryChange)="onSearchQueryChange($event)"
            (searchFocus)="onSearchFocus()"
            (searchBlur)="onSearchBlur()"
            (searchEnter)="onSearchEnter()"
            (clearSearch)="clearSearch()"
            (selectKeyword)="selectKeyword($event)"
            (selectProduct)="selectProduct($event)"
          />

          <app-header-actions
            [solidStyle]="useSolidHeaderStyle()"
            [userMenuOpen]="userMenuOpen()"
            [isAuthenticated]="authFacade.isAuthenticated()"
            [isAdmin]="authFacade.isAdmin()"
            [currentUserName]="authFacade.currentUser()?.fullName ?? null"
            [currentUserEmail]="authFacade.currentUser()?.email ?? null"
            [cartCount]="checkoutFacade.cartCount()"
            (toggleUserMenu)="toggleUserMenu()"
            (goToLogin)="goToLogin()"
            (goToMyOrders)="goToMyOrders()"
            (goToAdmin)="goToAdmin()"
            (logout)="doLogout()"
            (openCart)="openCartDrawer()"
            (toggleMobileMenu)="mobileMenuOpen.set(true)"
          />
        </div>
      </div>
    </nav>

    @if (cartDrawerOpen()) {
      <app-cart-drawer
        [items]="checkoutFacade.cartItemsDetailed()"
        [subtotal]="checkoutFacade.subtotal()"
        [shippingFee]="checkoutFacade.shippingFee()"
        [grandTotal]="cartGrandTotal()"
        [isAllSelected]="checkoutFacade.isAllSelected()"
        [selectedCount]="checkoutFacade.selectedCount()"
        (close)="closeCartDrawer()"
        (checkout)="goToCheckout()"
        (remove)="checkoutFacade.removeFromCart($event)"
        (toggleSelection)="checkoutFacade.toggleItemSelection($event)"
        (toggleSelectAll)="checkoutFacade.toggleSelectAll($event)"
      />
    }

    <app-mobile-menu
      [isOpen]="mobileMenuOpen()"
      [navigationStructure]="navigationStructure"
      (close)="mobileMenuOpen.set(false)"
      (navigate)="navigateTo($event)"
      (navigateSub)="navigateToSub($event.category, $event.item)"
    />
  `,
  styles: [`
    .top-bar {
      position: relative;
    }

    .top-bar-shimmer {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmer 4s ease-in-out infinite;
    }

    @keyframes shimmer {
      0% { left: -100%; }
      50% { left: 100%; }
      100% { left: 100%; }
    }

    .header-main {
      transition: background-color 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
    }

    .header-main:not(.scrolled):not(:hover) {
      background-color: transparent !important;
      box-shadow: none;
    }

    .header-main:hover,
    .header-main.scrolled {
      background-color: #fff;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly searchFacade = inject(SearchFacade);
  readonly checkoutFacade = inject(CheckoutFacade);
  readonly authFacade = inject(AuthFacade);

  private readonly router = inject(Router);

  readonly isScrolled = signal(false);
  readonly isHomeRoute = signal(true);
  readonly isSearchFocused = signal(false);
  readonly userMenuOpen = signal(false);
  readonly cartDrawerOpen = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly cartGrandTotal = computed(() => this.checkoutFacade.subtotal() + this.checkoutFacade.shippingFee());

  private scrollCleanup: (() => void) | null = null;
  private routeCleanup: (() => void) | null = null;
  private searchBlurTimer: ReturnType<typeof setTimeout> | null = null;

  readonly navigationStructure = HEADER_NAVIGATION_STRUCTURE;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) { }

  readonly hostClasses = () => {
    return this.useSolidHeaderStyle()
      ? 'block fixed top-0 left-0 right-0 z-[100]'
      : 'block absolute top-0 left-0 right-0 z-[100]';
  };

  readonly useTransparentHeader = () => this.isHomeRoute() && !this.isScrolled();
  readonly useSolidHeaderStyle = () => !this.isHomeRoute() || this.isScrolled();

  ngOnInit() {
    this.updateRouteState();
    const routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeTransientUi();
        this.updateRouteState();
      }
    });
    this.routeCleanup = () => routeSub.unsubscribe();

    if (isPlatformBrowser(this.platformId)) {
      const onScroll = () => {
        this.isScrolled.set(window.scrollY > 50);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      this.scrollCleanup = () => window.removeEventListener('scroll', onScroll);
    }
  }

  ngOnDestroy() {
    this.scrollCleanup?.();
    this.routeCleanup?.();
    if (this.searchBlurTimer) {
      clearTimeout(this.searchBlurTimer);
    }
  }

  // =====================================================
  // PHẦN CỦA BẠN: Hỗ trợ điều hướng menu Khuyến mại & Liên hệ
  // Ưu tiên dùng cat.link nếu có (type: 'link')
  // Hỗ trợ anchor fragment ví dụ: '/#flash-sale'
  // =====================================================
  navigateTo(cat: HeaderNavCategory) {
    this.closeTransientUi();

    if (cat.link) {
      const [path, fragment] = cat.link.split('#');
      if (fragment) {
        this.router.navigate([path || '/'], { fragment });
      } else {
        this.router.navigate([path]);
      }
      if (!fragment) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Use specific category from Nav Structure if available (e.g. 'Decor,Lighting')
      const categoryFilter = cat.category;

      if (categoryFilter) {
        this.router.navigate(['/search'], { queryParams: { category: categoryFilter } });
      } else if (cat.slug) {
        this.router.navigate(['/collections', cat.slug]);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  navigateToSub(cat: HeaderNavCategory, item: HeaderSubItem) {
    this.closeTransientUi();

    // If sub-item has a specific category, filter by it.
    // Otherwise, search by its label (text search).
    if (item.category) {
      this.router.navigate(['/search'], {
        queryParams: {
          category: item.category,
          q: item.label !== item.category ? item.label : undefined
        }
      });
    } else {
      this.router.navigate(['/search'], {
        queryParams: {
          q: item.label
        }
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goHome(event: Event) {
    event.preventDefault();
    this.closeTransientUi();
    this.router.navigate(['/']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchQueryChange(query: string) {
    this.searchFacade.setQuery(query);
  }

  onSearchFocus() {
    if (this.searchBlurTimer) {
      clearTimeout(this.searchBlurTimer);
      this.searchBlurTimer = null;
    }
    this.isSearchFocused.set(true);
  }

  onSearchBlur() {
    this.searchBlurTimer = setTimeout(() => {
      this.isSearchFocused.set(false);
    }, 150);
  }

  onSearchEnter() {
    const query = this.searchFacade.query();
    if (query) {
      this.closeTransientUi();
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

  clearSearch() {
    this.searchFacade.clearQuery();
  }

  selectProduct(product: Product) {
    this.searchFacade.setQuery(product.name);
    this.isSearchFocused.set(false);
    this.closeTransientUi();
    this.router.navigate(['/search'], { queryParams: { q: product.name } });
  }

  selectKeyword(keyword: string) {
    this.searchFacade.applySuggestedKeyword(keyword);
    this.isSearchFocused.set(false);
    this.closeTransientUi();
    this.router.navigate(['/search'], { queryParams: { q: keyword } });
  }

  toggleUserMenu() {
    this.cartDrawerOpen.set(false);
    this.userMenuOpen.update((value) => !value);
  }

  openCartDrawer() {
    this.userMenuOpen.set(false);
    this.cartDrawerOpen.set(true);
  }

  closeCartDrawer() {
    this.cartDrawerOpen.set(false);
  }

  goToLogin() {
    this.closeTransientUi();
    this.router.navigate(['/login']);
  }

  goToMyOrders() {
    this.closeTransientUi();
    this.router.navigate(['/my-orders']);
  }

  goToAdmin() {
    this.closeTransientUi();
    this.router.navigate(['/admin']);
  }

  doLogout() {
    this.authFacade.logout();
    this.closeTransientUi();
    this.router.navigate(['/']);
  }

  goToCheckout() {
    this.closeTransientUi();
    this.router.navigate(['/checkout']);
  }

  private updateRouteState() {
    const currentPath = this.router.url.split('?')[0];
    this.isHomeRoute.set(currentPath === '' || currentPath === '/' || currentPath === '/home');
  }

  private closeTransientUi() {
    this.userMenuOpen.set(false);
    this.cartDrawerOpen.set(false);
    this.mobileMenuOpen.set(false);
  }
}
