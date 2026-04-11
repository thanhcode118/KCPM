import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminFacade } from '@/features/admin/data-access/admin.facade';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styles: []
})
export class AdminDashboardComponent {
  readonly adminFacade = inject(AdminFacade);
  activeTab = 'dashboard';

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
}
