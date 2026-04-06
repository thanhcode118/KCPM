import { Injectable, computed, signal, inject } from '@angular/core';
import { DashboardService, DashboardStats } from './dashboard.service';
import { AdminProductService, ProductView, ProductUpsertInput, CategoryView } from './admin-product.service';
import { AdminOrderService, OrderView } from './admin-order.service';
import { AdminUserService, UserView } from './admin-user.service';
import { AdminMarketingService, CouponView, BannerView, BlogPostView, CreateCouponInput, UpdateBannerInput, CreateBlogPostInput } from './admin-marketing.service';
import { AdminSettingsService, SystemSetting } from './admin-settings.service';
import { tap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminFacade {
  private dashboardService = inject(DashboardService);
  private productService = inject(AdminProductService);
  private orderService = inject(AdminOrderService);
  private userService = inject(AdminUserService);
  private marketingService = inject(AdminMarketingService);
  private settingsService = inject(AdminSettingsService);

  readonly products = signal<ProductView[]>([]);
  readonly categories = signal<CategoryView[]>([]);
  readonly orders = signal<OrderView[]>([]);
  readonly users = signal<UserView[]>([]);
  readonly coupons = signal<CouponView[]>([]);
  readonly banners = signal<BannerView[]>([]);
  readonly blogs = signal<BlogPostView[]>([]);
  readonly settings = signal<SystemSetting | null>(null);
  readonly stats = signal<DashboardStats | null>(null);

  readonly feedback = signal([
    { id: 1, name: 'Linh Trần', content: 'Cần thêm mẫu mới cho danh mục đèn.' },
    { id: 2, name: 'Khánh', content: 'Checkout mượt và dễ sử dụng.' }
  ]);

  readonly totalRevenue = computed(() => {
    return this.stats()?.totalRevenue ?? 0;
  });

  readonly pendingOrders = computed(() => {
    return this.stats()?.pendingOrdersCount ?? 0;
  });

  fetchStats() {
    this.dashboardService.getStats().pipe(
      tap(res => this.stats.set(res)),
      catchError(() => of(null))
    ).subscribe();
  }

  loadProducts() {
    this.productService.getProducts().pipe(
      tap(res => this.products.set(res.products))
    ).subscribe();
  }

  loadCategories() {
    this.productService.getCategories().pipe(
      tap(res => this.categories.set(res))
    ).subscribe();
  }

  loadOrders() {
    this.orderService.getOrders().pipe(
      tap(res => this.orders.set(res))
    ).subscribe();
  }

  loadUsers() {
    this.userService.getUsers().pipe(
      tap(res => this.users.set(res)),
      catchError(() => of([]))
    ).subscribe();
  }

  loadMarketing() {
    this.marketingService.getCoupons().subscribe(res => this.coupons.set(res));
    this.marketingService.getBanners().subscribe(res => this.banners.set(res));
    this.marketingService.getBlogPosts().subscribe(res => this.blogs.set(res));
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe(res => this.settings.set(res));
  }

  updateSettings(settings: SystemSetting) {
    return this.settingsService.updateSettings(settings).pipe(
      tap(res => this.settings.set(res))
    );
  }

  addProduct(product: ProductUpsertInput) {
    return this.productService.createProduct(product).pipe(
      tap(() => this.loadProducts())
    );
  }

  updateProduct(id: number, product: ProductUpsertInput) {
    return this.productService.updateProduct(id, product).pipe(
      tap(() => this.loadProducts())
    );
  }

  deleteProduct(id: number) {
    return this.productService.deleteProduct(id).pipe(
      tap(() => this.loadProducts())
    );
  }

  updateOrderStatus(id: number, status: string) {
    return this.orderService.updateOrderStatus(id, status).pipe(
      tap(() => {
        this.loadOrders();
        this.fetchStats(); // Update dashboard stats if order status changed
      })
    );
  }

  toggleUserStatus(userId: number) {
    return this.userService.toggleUserStatus(userId).pipe(
      tap(() => this.loadUsers())
    );
  }

  deleteUser(userId: number) {
    return this.userService.deleteUser(userId).pipe(
      tap(() => this.loadUsers())
    );
  }

  // Marketing methods
  addCoupon(input: CreateCouponInput) {
    return this.marketingService.createCoupon(input).pipe(
      tap(() => this.marketingService.getCoupons().subscribe(res => this.coupons.set(res)))
    );
  }

  deleteCoupon(id: number) {
    return this.marketingService.deleteCoupon(id).pipe(
      tap(() => this.marketingService.getCoupons().subscribe(res => this.coupons.set(res)))
    );
  }

  updateBanner(id: number | null, input: UpdateBannerInput) {
    return this.marketingService.updateBanner(id, input).pipe(
      tap(() => this.marketingService.getBanners().subscribe(res => this.banners.set(res)))
    );
  }

  addBlogPost(input: CreateBlogPostInput) {
    return this.marketingService.createBlogPost(input).pipe(
      tap(() => this.marketingService.getBlogPosts().subscribe(res => this.blogs.set(res)))
    );
  }

  deleteBlogPost(id: number) {
    return this.marketingService.deleteBlogPost(id).pipe(
      tap(() => this.marketingService.getBlogPosts().subscribe(res => this.blogs.set(res)))
    );
  }
}
