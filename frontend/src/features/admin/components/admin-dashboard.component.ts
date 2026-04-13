import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminFacade } from '@/features/admin/data-access/admin.facade';
import { DashboardService, DashboardStats } from '@/features/admin/data-access/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  readonly adminFacade = inject(AdminFacade);
  private readonly dashboardService = inject(DashboardService);
  activeTab = 'dashboard';

  readonly stats = signal<DashboardStats | null>(null);
  readonly statsLoading = signal(false);

  ngOnInit(): void {
    this.adminFacade.loadRealOrders();
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.statsLoading.set(true);
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.statsLoading.set(false);
      },
      error: () => {
        this.statsLoading.set(false);
      }
    });
  }

  getTitle(): string {
    switch (this.activeTab) {
      case 'dashboard': return 'Tổng quan Hệ thống';
      case 'products': return 'Quản lý Sản phẩm';
      case 'orders': return 'Quản lý Đơn hàng';
      case 'customers': return 'Tài khoản & Khách hàng';
      case 'marketing': return 'Marketing & Content';
      case 'settings': return 'Cài đặt Phân quyền';
      default: return 'Admin Home';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  }

  getChartMaxRevenue(): number {
    const chart = this.stats()?.revenueChart ?? [];
    if (chart.length === 0) return 1;
    return Math.max(...chart.map(c => c.revenue), 1);
  }

  getBarHeight(revenue: number): number {
    const max = this.getChartMaxRevenue();
    return Math.max((revenue / max) * 100, 2);
  }

  formatChartDate(dateStr: string): string {
    return dateStr;
  }

  // Computed values from real orders
  get paidOrdersCount(): number {
    return this.adminFacade.orders().filter((o: any) => o.paymentStatus?.toLowerCase() === 'paid').length;
  }

  get totalPaidRevenue(): number {
    return this.adminFacade.orders()
      .filter((o: any) => o.paymentStatus?.toLowerCase() === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }

  get processingOrdersCount(): number {
    return this.adminFacade.orders().filter((o: any) => o.status?.toLowerCase() === 'processing').length;
  }

  get shippingOrdersCount(): number {
    return this.adminFacade.orders().filter((o: any) => o.status?.toLowerCase() === 'shipping' || o.status?.toLowerCase() === 'shipped').length;
  }

  get completedOrdersCount(): number {
    return this.adminFacade.orders().filter((o: any) => o.status?.toLowerCase() === 'completed').length;
  }

  get cancelledOrdersCount(): number {
    return this.adminFacade.orders().filter((o: any) => o.status?.toLowerCase() === 'cancelled').length;
  }
}
