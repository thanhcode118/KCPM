import { Component, inject, OnInit, AfterViewInit, effect, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminFacade } from '@/features/admin/data-access/admin.facade';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex font-sans text-charcoal">
      <!-- Sidebar -->
      <aside class="w-72 bg-charcoal text-white fixed h-full shadow-2xl z-20 flex flex-col">
        <div class="p-6 border-b border-gray-800 flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-honey to-yellow-400 flex items-center justify-center font-black text-charcoal text-xl shadow-lg shadow-honey/30">
            B
          </div>
          <div>
            <h2 class="text-xl font-black text-white tracking-wider">BeeAdmin</h2>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Management</p>
          </div>
        </div>
        
        <nav class="p-4 space-y-1 flex-1 mt-4 overflow-y-auto">
          <!-- Nav Item Dashboard -->
          <button (click)="activeTab = 'dashboard'"
            [ngClass]="activeTab === 'dashboard' ? 'bg-honey text-charcoal font-bold shadow-honey/30 shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
            class="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group">
            <i class="w-5 h-5 flex items-center justify-center font-black">1</i>
            Tổng quan
          </button>

          <!-- Nav Item Products -->
          <button (click)="activeTab = 'products'"
            [ngClass]="activeTab === 'products' ? 'bg-honey text-charcoal font-bold shadow-honey/30 shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
            class="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group">
            <i class="w-5 h-5 flex items-center justify-center font-black">2</i>
            Sản phẩm
          </button>

          <!-- Nav Item Orders -->
          <button (click)="activeTab = 'orders'"
            [ngClass]="activeTab === 'orders' ? 'bg-honey text-charcoal font-bold shadow-honey/30 shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
            class="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group">
            <i class="w-5 h-5 flex items-center justify-center font-black">3</i>
            Đơn hàng
          </button>

          <!-- Nav Item Customers -->
          <button (click)="activeTab = 'customers'"
            [ngClass]="activeTab === 'customers' ? 'bg-honey text-charcoal font-bold shadow-honey/30 shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
            class="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group">
            <i class="w-5 h-5 flex items-center justify-center font-black">4</i>
            Khách hàng
          </button>

          <!-- Nav Item Marketing -->
          <button (click)="activeTab = 'marketing'"
            [ngClass]="activeTab === 'marketing' ? 'bg-honey text-charcoal font-bold shadow-honey/30 shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
            class="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group">
            <i class="w-5 h-5 flex items-center justify-center font-black">5</i>
            Content & PR
          </button>

          <!-- Nav Item Settings -->
          <button (click)="activeTab = 'settings'"
            [ngClass]="activeTab === 'settings' ? 'bg-honey text-charcoal font-bold shadow-honey/30 shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
            class="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group">
            <i class="w-5 h-5 flex items-center justify-center font-black">6</i>
            Hệ thống
          </button>
        </nav>
        
        <div class="mt-auto p-4 border-t border-gray-800">
          <a routerLink="/" class="flex items-center gap-3 px-5 py-3.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-2xl font-medium transition-all group cursor-pointer">
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Về trang chủ
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="ml-72 flex-1 p-8 overflow-y-auto min-h-screen">
        <!-- Top Header -->
        <header class="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-xl px-8 py-5 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-white/40 sticky top-0 z-10">
          <div>
            <h1 class="text-3xl font-black tracking-tight capitalize text-gray-900">
              {{ getTitle() }}
            </h1>
            <p class="text-gray-400 text-sm mt-0.5 font-medium">Phiên làm việc Admin BeeShop 2026</p>
          </div>
          <div class="flex items-center gap-5">
            <div class="h-10 w-px bg-gray-200"></div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-sm font-black text-gray-900">Quản trị viên</p>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Toàn quyền</p>
              </div>
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-honey to-yellow-300 shadow-lg shadow-honey/30 flex items-center justify-center font-black text-charcoal">
                A
              </div>
            </div>
          </div>
        </header>

        <!-- ==============================
             TAB 1: TỔNG QUAN (DASHBOARD)
             ============================== -->
        @if (activeTab === 'dashboard') {
          <div class="space-y-6">
            <!-- Thống kê -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-charcoal text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                <div class="absolute -right-10 -top-10 w-32 h-32 bg-honey/20 rounded-full blur-3xl"></div>
                <span class="text-xs font-bold text-honey uppercase tracking-widest">DOANH THU THỰC TẾ</span>
                <h3 class="text-4xl font-black text-white mt-2">{{ (facade.stats()?.totalRevenue ?? 0) | number:'1.0-0' }}đ</h3>
                <p class="mt-4 text-xs font-bold" [ngClass]="(facade.stats()?.revenueGrowthPercentage ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'">
                  {{ (facade.stats()?.revenueGrowthPercentage ?? 0) >= 0 ? '+' : '' }}{{ facade.stats()?.revenueGrowthPercentage }}% so với tuần trước
                </p>
              </div>
              <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">ĐƠN HÀNG MỚI (HÔM NAY)</span>
                  <h3 class="text-4xl font-black text-gray-900 mt-2">{{ facade.stats()?.newOrdersToday ?? 0 }}</h3>
                </div>
                <p class="mt-4 text-xs font-bold text-gray-500">Đang chờ xác nhận: <span class="text-orange-500">{{ facade.stats()?.pendingOrdersCount ?? 0 }} đơn</span></p>
              </div>
              <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">KHÁCH HÀNG MỚI (THÁNG NÀY)</span>
                  <h3 class="text-4xl font-black text-gray-900 mt-2">{{ facade.stats()?.newCustomersMonth ?? 0 }}</h3>
                </div>
                <p class="mt-4 text-xs font-bold text-green-500">+Tăng trưởng đều</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-6">
              <!-- Biểu đồ -->
              <div class="col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 h-80 flex flex-col">
                 <h3 class="font-black text-gray-900 mb-4">Biểu đồ Doanh thu (7 ngày gần nhất)</h3>
                 <div class="flex-1 relative">
                    <canvas #revenueChart></canvas>
                 </div>
              </div>
              <!-- Cảnh báo hệ thống -->
              <div class="col-span-1 bg-red-50 rounded-[2rem] p-6 shadow-sm border border-red-100 flex flex-col">
                 <h3 class="font-black text-red-700 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Cảnh báo Hệ thống
                 </h3>
                 <ul class="space-y-3 flex-1 overflow-y-auto pr-2">
                    <li class="bg-white p-3 rounded-xl shadow-sm text-sm">
                       <p class="font-bold text-gray-900">Sắp hết hàng</p>
                       <p class="text-xs text-gray-500">Decor Bình Gốm Cao Cấp (còn 2 SP)</p>
                    </li>
                    <li class="bg-white p-3 rounded-xl shadow-sm text-sm">
                       <p class="font-bold text-gray-900">Sắp hết hàng</p>
                       <p class="text-xs text-gray-500">Khung Tranh Minimalism (còn 5 SP)</p>
                    </li>
                    <li class="bg-orange-100 p-3 rounded-xl shadow-sm text-sm">
                       <p class="font-bold text-orange-800">Giao hàng trễ</p>
                       <p class="text-xs text-orange-600">Đơn #ORD-2091 quá 48h chưa gửi đi!</p>
                    </li>
                 </ul>
              </div>
            </div>
          </div>
        }

        <!-- ==============================
             TAB 2: QUẢN LÝ SẢN PHẨM
             ============================== -->
        @if (activeTab === 'products') {
          <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
             <!-- Sub-tabs -->
             <div class="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-2">
                <button (click)="productSubTab = 'list'" [ngClass]="productSubTab === 'list' ? 'bg-white shadow-sm text-charcoal' : 'text-gray-500 hover:bg-gray-100'" class="px-5 py-2 rounded-xl font-bold text-sm transition-all">Danh sách Sản phẩm</button>
                <button (click)="productSubTab = 'categories'" [ngClass]="productSubTab === 'categories' ? 'bg-white shadow-sm text-charcoal' : 'text-gray-500 hover:bg-gray-100'" class="px-5 py-2 rounded-xl font-bold text-sm transition-all">Danh mục (Categories)</button>
             </div>
             
             <div class="p-6">
                <!-- Product Form Overlay -->
                @if (isProductFormVisible) {
                  <div class="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-200 shadow-inner">
                    <div class="flex justify-between items-center mb-6">
                      <h3 class="font-black text-xl text-gray-900">{{ isEditMode ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới' }}</h3>
                      <button (click)="onCancelProductForm()" class="text-gray-400 hover:text-gray-600 font-bold text-sm">Hủy bỏ</button>
                    </div>
                    
                    <form [formGroup]="productForm" (ngSubmit)="onSaveProduct()" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div class="space-y-4">
                        <div>
                          <label class="block text-xs font-black text-gray-400 uppercase mb-1">Tên Sản phẩm *</label>
                          <input formControlName="name" type="text" placeholder="Ví dụ: Bình Gốm Minimalism" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-honey font-bold">
                        </div>
                        <div>
                          <label class="block text-xs font-black text-gray-400 uppercase mb-1">SKU *</label>
                          <input formControlName="sku" type="text" placeholder="Ví dụ: BG-001" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-honey font-bold">
                        </div>
                        <div>
                          <label class="block text-xs font-black text-gray-400 uppercase mb-1">Danh mục *</label>
                          <select formControlName="categoryId" (change)="onCategoryChange($event)" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-honey font-bold">
                            <option [value]="0">Chọn danh mục</option>
                            @for (cat of facade.categories(); track cat.id) {
                              <option [value]="cat.id">{{ cat.name }}</option>
                            }
                          </select>
                        </div>
                      </div>

                      <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="block text-xs font-black text-gray-400 uppercase mb-1">Giá bán *</label>
                            <input formControlName="price" type="number" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-honey font-bold">
                          </div>
                          <div>
                            <label class="block text-xs font-black text-gray-400 uppercase mb-1">Giá gốc</label>
                            <input formControlName="originalPrice" type="number" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-honey font-bold">
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs font-black text-gray-400 uppercase mb-1">Tồn kho *</label>
                          <input formControlName="stockLeft" type="number" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-honey font-bold">
                        </div>
                        <div>
                          <label class="block text-xs font-black text-gray-400 uppercase mb-1">Link Ảnh Chính *</label>
                          <input formControlName="image" type="text" placeholder="https://..." class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-honey font-bold">
                        </div>
                      </div>

                      <div class="space-y-4">
                        <div>
                          <label class="block text-xs font-black text-gray-400 uppercase mb-1">Thương hiệu</label>
                          <input formControlName="brand" type="text" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-honey font-bold">
                        </div>
                        <div>
                          <label class="block text-xs font-black text-gray-400 uppercase mb-1">Chất liệu / Màu sắc</label>
                          <div class="grid grid-cols-2 gap-2">
                             <input formControlName="material" type="text" placeholder="Gốm" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-honey font-bold">
                             <input formControlName="color" type="text" placeholder="Trắng" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-honey font-bold">
                          </div>
                        </div>
                        <div class="pt-2 flex gap-4">
                           <label class="flex items-center gap-2 cursor-pointer">
                              <input formControlName="isActive" type="checkbox" class="w-5 h-5 rounded-lg border-gray-300 text-honey focus:ring-honey">
                              <span class="text-sm font-bold text-gray-700">Hiển thị</span>
                           </label>
                           <label class="flex items-center gap-2 cursor-pointer">
                              <input formControlName="inStock" type="checkbox" class="w-5 h-5 rounded-lg border-gray-300 text-honey focus:ring-honey">
                              <span class="text-sm font-bold text-gray-700">Còn hàng</span>
                           </label>
                        </div>
                        <button type="submit" [disabled]="!productForm.valid" class="w-full bg-charcoal text-white font-black py-3 rounded-2xl shadow-lg hover:bg-honey hover:text-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          {{ isEditMode ? 'Cập nhật Sản phẩm' : 'Lưu Sản phẩm' }}
                        </button>
                      </div>
                    </form>
                  </div>
                }

                <div class="flex justify-between items-center mb-6">
                  <h2 class="font-black text-xl text-gray-900">Tất cả sản phẩm ({{ facade.products().length }})</h2>
                  @if (!isProductFormVisible) {
                    <button (click)="onAddProduct()" class="bg-charcoal text-white font-black text-sm px-6 py-3 rounded-2xl hover:bg-honey hover:text-charcoal transition-all shadow-lg hover:shadow-honey/20">
                      + Thêm Sản Phẩm
                    </button>
                  }
                </div>
                
                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="border-b border-gray-100 text-xs font-black text-gray-400 uppercase">
                        <th class="pb-4 pt-2 px-2">Ảnh</th>
                        <th class="pb-4 pt-2">Thông tin</th>
                        <th class="pb-4 pt-2">Danh mục</th>
                        <th class="pb-4 pt-2">Giá (Bán / Gốc)</th>
                        <th class="pb-4 pt-2">Kho / Trạng thái</th>
                        <th class="pb-4 pt-2 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody class="text-sm">
                      @for (prod of facade.products(); track prod.productId) {
                        <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                          <td class="py-4 px-2">
                             <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                               <img [src]="prod.image" class="w-full h-full object-cover" [alt]="prod.productName">
                             </div>
                          </td>
                          <td class="py-4">
                             <p class="font-black text-gray-900">{{ prod.productName }}</p>
                             <p class="text-[10px] text-gray-400 font-bold uppercase">{{ prod.sku }}</p>
                          </td>
                          <td class="py-4 font-bold text-gray-500">
                             {{ prod.category }}
                          </td>
                          <td class="py-4">
                             <p class="font-black text-honey">{{ prod.price | number:'1.0-0' }}đ</p>
                             @if (prod.oldPrice) {
                               <p class="text-gray-400 line-through text-[10px] font-bold">{{ prod.oldPrice | number:'1.0-0' }}đ</p>
                             }
                          </td>
                          <td class="py-4">
                             <div class="flex flex-col gap-1">
                                <span class="font-bold" [ngClass]="prod.stockLeft > 5 ? 'text-gray-700' : 'text-red-500'">
                                  {{ prod.stockLeft }} cái
                                </span>
                                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-max shadow-sm" [ngClass]="prod.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                                  {{ prod.isActive ? 'Công khai' : 'Nháp' }}
                                </span>
                             </div>
                          </td>
                          <td class="py-4 text-right">
                             <button (click)="onEditProduct(prod)" class="text-charcoal bg-gray-100 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all font-bold text-xs mx-1">
                                Sửa
                             </button>
                             <button (click)="onDeleteProduct(prod.productId)" class="text-charcoal bg-gray-100 p-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all font-bold text-xs mx-1">
                                Xóa
                             </button>
                          </td>
                        </tr>
                      }
                      @if (facade.products().length === 0) {
                        <tr>
                          <td colspan="6" class="py-12 text-center text-gray-400 font-bold">Không tìm thấy sản phẩm nào. Hãy thêm mới!</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        }

        <!-- ==============================
             TAB 3: QUẢN LÝ ĐƠN HÀNG
             ============================== -->
        @if (activeTab === 'orders') {
          <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
            <h2 class="font-black text-xl text-gray-900 mb-6">Trạng thái Xử lý & Đơn hàng</h2>
            
             <div class="overflow-x-auto">
               <table class="w-full text-left bg-white">
                 <thead>
                   <tr class="bg-gray-50 text-xs font-black text-gray-500 uppercase rounded-t-xl">
                     <th class="py-3 px-4">Đơn hàng / Khách</th>
                     <th class="py-3 px-4">Sản phẩm & Ghi chú</th>
                     <th class="py-3 px-4">Thanh toán (Tổng x Phương thức)</th>
                     <th class="py-3 px-4">Trạng thái (Cập nhật)</th>
                     <th class="py-3 px-4 text-right">Hành động</th>
                   </tr>
                 </thead>
                 <tbody class="text-sm">
                   @for (order of facade.orders(); track order.id) {
                     <tr class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                       <td class="py-4 px-4">
                         <p class="font-black text-honey">#{{ order.orderNumber }}</p>
                         <p class="font-black text-gray-800">{{ order.fullName }}</p>
                         <p class="text-[10px] text-gray-400 font-bold uppercase">{{ order.city }}</p>
                         <p class="text-[10px] text-gray-400">{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                       </td>
                       <td class="py-4 px-4">
                         <p class="font-bold text-gray-800 line-clamp-1">
                           {{ order.items.length }} sản phẩm: {{ order.items[0].productName }}...
                         </p>
                         @if (order.notes) {
                           <p class="text-xs text-orange-600 italic">"{{ order.notes }}"</p>
                         }
                       </td>
                       <td class="py-4 px-4 text-gray-900">
                         <p class="font-black text-lg">{{ order.totalAmount | number:'1.0-0' }}đ</p>
                         <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm"
                           [ngClass]="order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'">
                           {{ order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán' }}
                         </span>
                       </td>
                       <td class="py-4 px-4">
                         <select (change)="onStatusChange(order.id, $event)" [value]="order.status"
                           class="border border-gray-200 rounded-xl px-2 py-2 text-xs font-black bg-white text-gray-700 outline-none w-full focus:border-honey transition-all">
                           <option value="pending_payment">Chờ thanh toán</option>
                           <option value="processing">Đang xử lý</option>
                           <option value="shipped">Đang giao hàng</option>
                           <option value="completed">Hoàn thành</option>
                           <option value="cancelled">Đã hủy</option>
                         </select>
                       </td>
                       <td class="py-4 px-4 text-right flex flex-col gap-2 items-end">
                         <button (click)="toggleOrderDetails(order.id)" class="bg-gray-100 hover:bg-gray-200 text-charcoal font-black text-[10px] px-3 py-2 rounded-xl flex items-center gap-1 transition-all">
                           {{ expandedOrderId() === order.id ? 'Thu gọn' : 'Chi tiết' }}
                         </button>
                       </td>
                     </tr>
                     <!-- Detail Row -->
                     @if (expandedOrderId() === order.id) {
                       <tr class="bg-gray-50/50">
                         <td colspan="5" class="p-6">
                           <div class="bg-white rounded-2xl p-4 shadow-inner border border-gray-100">
                             <h4 class="font-black text-xs text-gray-400 uppercase mb-4 tracking-widest">Danh sách sản phẩm trong đơn</h4>
                             <div class="space-y-3">
                               @for (item of order.items; track item.id) {
                                 <div class="flex items-center gap-4">
                                   <img [src]="item.productImage" class="w-10 h-10 rounded-lg object-cover bg-gray-100">
                                   <div class="flex-1">
                                     <p class="font-bold text-gray-900">{{ item.productName }}</p>
                                     <p class="text-[10px] text-gray-400 font-bold uppercase">{{ item.productSku }} x {{ item.quantity }}</p>
                                   </div>
                                   <p class="font-black text-gray-900">{{ item.lineTotal | number:'1.0-0' }}đ</p>
                                 </div>
                               }
                             </div>
                             <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                               <div>
                                 <p class="text-xs font-bold text-gray-500">Người nhận: <span class="text-gray-900">{{ order.fullName }}</span></p>
                                 <p class="text-xs font-bold text-gray-500">SĐT: <span class="text-gray-900">{{ order.phone }}</span></p>
                                 <p class="text-xs font-bold text-gray-500">Địa chỉ: <span class="text-gray-900">{{ order.line1 }}, {{ order.ward }}, {{ order.district }}, {{ order.city }}</span></p>
                               </div>
                               <div class="text-right">
                                  <p class="text-xs font-bold text-gray-500">Tạm tính: {{ order.subtotal | number:'1.0-0' }}đ</p>
                                  <p class="text-xs font-bold text-gray-500">Phí ship: {{ order.shippingFee | number:'1.0-0' }}đ</p>
                                  <p class="text-lg font-black text-honey">Tổng: {{ order.totalAmount | number:'1.0-0' }}đ</p>
                               </div>
                             </div>
                           </div>
                         </td>
                       </tr>
                     }
                   }
                   @if (facade.orders().length === 0) {
                     <tr>
                       <td colspan="5" class="py-12 text-center text-gray-400 font-bold">Chưa có đơn hàng nào được đặt.</td>
                     </tr>
                   }
                 </tbody>
               </table>
             </div>
          </div>
        }

        <!-- ==============================
             TAB 4: QUẢN LÝ KHÁCH HÀNG
             ============================== -->
        @if (activeTab === 'customers') {
          <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
             <h2 class="font-black text-xl text-gray-900 mb-6">Tài khoản & Lịch sử Khách hàng</h2>
             <div class="overflow-x-auto">
               <table class="w-full text-left">
                 <thead>
                   <tr class="border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">
                     <th class="pb-3 px-2">Khách hàng</th>
                     <th class="pb-3 px-2 text-center">Vai trò</th>
                     <th class="pb-3 px-2 text-center">Ngày tham gia</th>
                     <th class="pb-3 px-2 text-right">Trạng thái / Thao tác</th>
                   </tr>
                 </thead>
                 <tbody class="text-sm">
                   @for (user of facade.users(); track user.userId) {
                     <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                       <td class="py-4 px-2">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-100 text-blue-600 font-black flex items-center justify-center rounded-2xl shadow-sm uppercase">
                              {{ user.fullName.charAt(0) }}
                            </div>
                            <div>
                               <p class="font-black text-gray-900">{{ user.fullName }}</p>
                               <p class="text-[11px] text-gray-400 font-medium tracking-tight">{{ user.email }}</p>
                            </div>
                          </div>
                       </td>
                       <td class="py-4 px-2 text-center">
                          <span class="text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm"
                            [ngClass]="user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'">
                            {{ user.role }}
                          </span>
                       </td>
                       <td class="py-4 px-2 text-center text-gray-500 font-bold">
                          {{ user.createdAt | date:'dd/MM/yyyy' }}
                       </td>
                       <td class="py-4 px-2 text-right">
                          <div class="flex items-center justify-end gap-3">
                            @if (!user.isActive) {
                              <span class="text-[10px] font-black text-red-600 italic uppercase bg-red-100 px-2 py-1 rounded">Bị khóa</span>
                            }
                            <button (click)="onToggleUserStatus(user.userId)" 
                              [ngClass]="user.isActive ? 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-700' : 'bg-green-100 text-green-700 hover:bg-green-200'"
                              class="transition-all font-black text-[10px] uppercase px-4 py-2 rounded-xl shadow-sm">
                               {{ user.isActive ? 'Khóa (Ban)' : 'Mở Khóa' }}
                            </button>
                            <button (click)="onDeleteUser(user.userId)" 
                              class="bg-gray-100 text-gray-400 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase px-3 py-2 rounded-xl">
                               Xóa
                            </button>
                          </div>
                       </td>
                     </tr>
                   }
                   @if (facade.users().length === 0) {
                     <tr>
                       <td colspan="4" class="py-12 text-center text-gray-400 font-bold">Không có khách hàng nào trong hệ thống.</td>
                     </tr>
                   }
                 </tbody>
               </table>
             </div>
          </div>
        }

        <!-- ==============================
             TAB 5: CONTENT & MARKETING
             ============================== -->
        @if (activeTab === 'marketing') {
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
             <!-- Mã giảm giá -->
             <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-col">
                <div class="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                   <h2 class="font-black text-xl text-gray-900">Mã giảm giá (Coupons)</h2>
                   <button (click)="onAddCoupon()" class="bg-honey text-charcoal font-bold text-xs px-3 py-1.5 rounded-lg">
                     {{ isCouponFormVisible ? 'Hủy' : '+ Tạo Mã' }}
                   </button>
                </div>

                @if (isCouponFormVisible) {
                  <form [formGroup]="couponForm" (ngSubmit)="onSaveCoupon()" class="mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                      <input formControlName="code" placeholder="CODE (Vd: TET2026)" class="bg-white border p-2 rounded-lg text-sm font-bold uppercase">
                      <input formControlName="discountPercentage" type="number" placeholder="% Giảm" class="bg-white border p-2 rounded-lg text-sm font-bold">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <input formControlName="expiryDate" type="date" class="bg-white border p-2 rounded-lg text-sm font-bold">
                      <input formControlName="maxUsage" type="number" placeholder="Lượt dùng tối đa" class="bg-white border p-2 rounded-lg text-sm font-bold">
                    </div>
                    <button type="submit" [disabled]="couponForm.invalid" class="w-full bg-charcoal text-white py-2 rounded-lg font-black text-xs hover:bg-honey hover:text-charcoal transition-all">Lưu mã giảm giá</button>
                  </form>
                }

                <div class="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2">
                   @for (coupon of facade.coupons(); track coupon.id) {
                     <div class="border border-dashed border-gray-300 rounded-2xl p-4 flex justify-between items-center bg-gray-50 group hover:border-honey transition-all">
                       <div>
                         <h3 class="font-black text-honey text-lg uppercase tracking-wider">{{ coupon.code }}</h3>
                         <p class="text-xs font-bold text-gray-600">-{{ coupon.discountPercentage }}% | {{ coupon.currentUsage }}/{{ coupon.maxUsage }} lượt</p>
                         <p class="text-[10px] text-gray-400 mt-1">Hết hạn: {{ coupon.expiryDate | date:'dd/MM/yyyy' }}</p>
                       </div>
                       <button (click)="onDeleteCoupon(coupon.id)" class="text-gray-300 hover:text-red-500 transition-colors p-2">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                     </div>
                   }
                   @if (facade.coupons().length === 0) {
                     <p class="text-center py-8 text-gray-400 font-bold text-sm">Chưa có mã giảm giá nào.</p>
                   }
                </div>
             </div>

             <!-- Banner & Blog -->
             <div class="space-y-6 flex flex-col">
                <!-- Banner -->
                <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
                   <div class="flex justify-between items-center mb-4">
                      <h2 class="font-black text-lg text-gray-900">Quản lý Banner/Slider</h2>
                      <button class="text-blue-600 font-bold text-xs hover:underline">Chỉnh sửa Homepage</button>
                   </div>
                   @for (banner of facade.banners(); track banner.id) {
                     <div class="h-24 bg-gray-100 rounded-xl flex items-center gap-4 px-4 mb-3 border border-gray-100 overflow-hidden group hover:border-honey transition-all">
                        <img [src]="banner.imageUrl" class="w-20 h-16 object-cover rounded-lg shadow-sm">
                        <div class="flex-1">
                          <p class="font-black text-sm line-clamp-1">{{ banner.title }}</p>
                          <p class="text-[10px] text-gray-400 font-bold uppercase">Vị trí: {{ banner.position }} | {{ banner.isActive ? 'Hiện' : 'Ẩn' }}</p>
                        </div>
                     </div>
                   }
                   @if (facade.banners().length === 0) {
                      <div class="h-24 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200">
                        <p class="text-gray-400 font-bold text-xs italic">Sắp có tính năng upload ảnh Banner...</p>
                      </div>
                   }
                </div>

                <!-- Blog -->
                <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex-1">
                   <div class="flex justify-between items-center mb-4">
                      <h2 class="font-black text-lg text-gray-900">Blog / Tin Mẹo (SEO)</h2>
                      <button class="bg-gray-100 text-charcoal font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200">Viết bài mới</button>
                   </div>
                   <div class="space-y-2 overflow-y-auto max-h-[300px] pr-2">
                     @for (post of facade.blogs(); track post.id) {
                       <div class="flex gap-4 items-center bg-gray-50 p-3 rounded-2xl border border-gray-50 hover:border-honey/30 transition-all group">
                          <img [src]="post.imageUrl" class="w-12 h-12 rounded-xl object-cover bg-gray-200 shadow-sm">
                          <div class="flex-1">
                             <p class="font-black text-sm text-gray-900 line-clamp-1">{{ post.title }}</p>
                             <p class="text-[10px] text-gray-400 font-bold uppercase">Tác giả: {{ post.author }} • {{ post.views }} lượt xem</p>
                          </div>
                          <button (click)="onDeleteBlogPost(post.id)" class="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                       </div>
                     }
                     @if (facade.blogs().length === 0) {
                        <p class="text-center py-8 text-gray-400 font-bold text-sm italic">Chưa có bài viết nào.</p>
                     }
                   </div>
                </div>
             </div>
          </div>
        }

        <!-- ==============================
             TAB 6: TÙY CHỈNH HỆ THỐNG
             ============================== -->
        @if (activeTab === 'settings') {
          <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
             <h2 class="font-black text-2xl text-gray-900 mb-6">Cài đặt Hệ thống & Phân Quyền</h2>

             <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <!-- Cấu hình chung -->
                <div>
                  <h3 class="font-bold text-lg text-charcoal mb-4 border-b border-gray-100 pb-2">Cấu hình Cửa hàng</h3>
                  <form [formGroup]="settingsForm" (ngSubmit)="onSaveSettings()" class="space-y-4">
                    <div>
                      <label class="block text-xs font-bold text-gray-500 mb-1">Tên cửa hàng (Logo text)</label>
                      <input formControlName="storeName" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-honey">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-500 mb-1">Cấu hình Thuế (VAT %)</label>
                      <input formControlName="vatPercentage" type="number" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-honey">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-500 mb-1">Phí Giao Hàng Mặc Định (VNĐ)</label>
                      <input formControlName="defaultShippingFee" type="number" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-honey">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-500 mb-1">Email Liên Hệ</label>
                      <input formControlName="contactEmail" type="email" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-honey">
                    </div>
                    <button type="submit" [disabled]="settingsForm.invalid" class="bg-charcoal text-white font-black text-sm px-5 py-3 rounded-xl hover:bg-honey hover:text-charcoal w-full mt-2 transition-all shadow-lg active:scale-95">
                      Lưu Cấu Hình
                    </button>
                    @if (facade.settings()) {
                      <p class="text-[10px] text-gray-400 text-center italic mt-2">Cập nhật lần cuối: {{ facade.settings()?.updatedAt | date:'dd/MM/yyyy HH:mm' }}</p>
                    }
                  </form>
                </div>

                <!-- Phân quyền hiển thị Info -->
                <div class="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h3 class="font-bold text-lg text-charcoal mb-4">Các Quyền Quản Trị (Role-based)</h3>
                  <ul class="space-y-4">
                    <li class="flex gap-3 items-start">
                       <span class="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0"></span>
                       <div>
                         <p class="font-black text-sm">Admin (Toàn quyền)</p>
                         <p class="text-xs text-gray-600 mt-0.5">Truy cập tất cả 6 tab. Quản trị được Doanh thu, Khách hàng, Cài đặt Hệ thống.</p>
                       </div>
                    </li>
                    <li class="flex gap-3 items-start">
                       <span class="w-3 h-3 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                       <div>
                         <p class="font-black text-sm">Sale (Nhân viên Sale)</p>
                         <p class="text-xs text-gray-600 mt-0.5">Chỉ được xem Dashboard (ẩn doanh thu), và full quyền xử lý Đơn hàng.</p>
                       </div>
                    </li>
                    <li class="flex gap-3 items-start">
                       <span class="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0"></span>
                       <div>
                         <p class="font-black text-sm">Content (Nhãn viên Content)</p>
                         <p class="text-xs text-gray-600 mt-0.5">Chỉ được phép vào tab Sản Phẩm (Thêm sửa ảnh/mô tả) và tab Content & Marketing.</p>
                       </div>
                    </li>
                  </ul>
                  <div class="mt-6 pt-4 border-t border-gray-200 text-center">
                    <p class="text-xs text-gray-400 font-bold italic">Việc phân quyền cụ thể đang được xử lý bằng Backend/Guard của Angular.</p>
                  </div>
                </div>
             </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  facade = inject(AdminFacade);
  private fb = inject(FormBuilder);
  activeTab = 'dashboard';
  productSubTab = 'list';

  // Product CRUD State
  isProductFormVisible = false;
  isEditMode = false;
  currentEditingProductId: number | null = null;
  productForm = this.fb.group({
    sku: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    originalPrice: [null as number | null, [Validators.min(0)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    category: ['', [Validators.required]],
    image: ['', [Validators.required]],
    hoverImage: [''],
    stockLeft: [0, [Validators.required, Validators.min(0)]],
    brand: ['BeeShop'],
    material: [''],
    color: [''],
    style: ['Modern'],
    isActive: [true],
    inStock: [true],
    rating: [5],
    reviews: [0]
  });

  // Order state
  expandedOrderId = signal<number | null>(null);

  @ViewChild('revenueChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  constructor() {
    effect(() => {
      const stats = this.facade.stats();
      if (stats && this.activeTab === 'dashboard') {
        this.renderChart(stats);
      }
    });
  }

  ngOnInit() {
    this.facade.fetchStats();
    this.facade.loadProducts();
    this.facade.loadCategories();
    this.facade.loadOrders();
    this.facade.loadUsers();
    this.facade.loadMarketing();
    this.facade.loadSettings();

    // Listen for settings changes to patch the form
    effect(() => {
      const s = this.facade.settings();
      if (s) {
        this.settingsForm.patchValue(s);
      }
    });
  }

  // --- Product CRUD Actions ---
  onAddProduct() {
    this.isEditMode = false;
    this.currentEditingProductId = null;
    this.isProductFormVisible = true;
    this.productForm.reset({
      brand: 'BeeShop',
      style: 'Modern',
      isActive: true,
      inStock: true,
      rating: 5,
      reviews: 0,
      categoryId: 0,
      stockLeft: 0,
      price: 0
    });
  }

  onEditProduct(product: any) {
    this.isEditMode = true;
    this.currentEditingProductId = product.productId;
    this.isProductFormVisible = true;
    this.productForm.patchValue({
      sku: product.sku,
      name: product.productName,
      slug: product.slug,
      price: product.price,
      originalPrice: product.oldPrice,
      categoryId: product.categoryId,
      category: product.category,
      image: product.image,
      hoverImage: product.hoverImage,
      stockLeft: product.stockLeft,
      brand: product.brand,
      material: product.material,
      color: product.color,
      style: product.style,
      isActive: product.isActive,
      inStock: product.inStock,
      rating: product.rating,
      reviews: product.reviews
    });
  }

  onCategoryChange(event: any) {
    const categoryId = +event.target.value;
    const cat = this.facade.categories().find(c => c.id === categoryId);
    if (cat) {
      this.productForm.patchValue({ category: cat.name });
    }
  }

  onSaveProduct() {
    if (this.productForm.invalid) return;

    const formValue = this.productForm.value as any;
    // Generate slug from name if empty
    if (!formValue.slug) {
      formValue.slug = formValue.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    if (this.isEditMode && this.currentEditingProductId) {
      this.facade.updateProduct(this.currentEditingProductId, formValue).subscribe(() => {
        this.isProductFormVisible = false;
      });
    } else {
      this.facade.addProduct(formValue).subscribe(() => {
        this.isProductFormVisible = false;
      });
    }
  }

  onDeleteProduct(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      this.facade.deleteProduct(id).subscribe();
    }
  }

  onCancelProductForm() {
    this.isProductFormVisible = false;
  }

  // --- Order Actions ---
  onStatusChange(orderId: number, event: any) {
    const newStatus = event.target.value;
    this.facade.updateOrderStatus(orderId, newStatus).subscribe();
  }

  toggleOrderDetails(orderId: number) {
    if (this.expandedOrderId() === orderId) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(orderId);
    }
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'pending_payment': return 'Chờ thanh toán';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao hàng';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  }

  // --- Customer Actions ---
  onToggleUserStatus(userId: number) {
    if (confirm('Bạn có chắc chắn muốn thay đổi trạng thái hoạt động của người dùng này?')) {
      this.facade.toggleUserStatus(userId).subscribe();
    }
  }

  onDeleteUser(userId: number) {
    if (confirm('CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn tài khoản người dùng! Bạn có chắc chắn muốn xóa không?')) {
      this.facade.deleteUser(userId).subscribe();
    }
  }

  // --- Marketing Actions ---
  couponForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    discountPercentage: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    expiryDate: ['', [Validators.required]],
    maxUsage: [100, [Validators.required, Validators.min(1)]]
  });

  isCouponFormVisible = false;

  onAddCoupon() {
    this.isCouponFormVisible = !this.isCouponFormVisible;
  }

  onSaveCoupon() {
    if (this.couponForm.invalid) return;
    const val = this.couponForm.value as any;
    this.facade.addCoupon(val).subscribe(() => {
      this.isCouponFormVisible = false;
      this.couponForm.reset({ discountPercentage: 10, maxUsage: 100 });
    });
  }

  onDeleteCoupon(id: number) {
    if (confirm('Xóa mã giảm giá này?')) {
      this.facade.deleteCoupon(id).subscribe();
    }
  }

  onDeleteBlogPost(id: number) {
    if (confirm('Xóa bài viết này?')) {
      this.facade.deleteBlogPost(id).subscribe();
    }
  }

  // --- Settings Actions ---
  settingsForm = this.fb.group({
    id: [1],
    storeName: ['', [Validators.required]],
    vatPercentage: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
    defaultShippingFee: [30000, [Validators.required, Validators.min(0)]],
    contactEmail: [''],
    contactPhone: [''],
    address: ['']
  });

  onSaveSettings() {
    if (this.settingsForm.invalid) return;
    const val = this.settingsForm.value as any;
    this.facade.updateSettings(val).subscribe({
      next: () => alert('Đã cập nhật cấu hình hệ thống thành công!'),
      error: () => alert('Lỗi khi cập nhật cấu hình.')
    });
  }

  renderChart(stats: any) {
    if (!this.chartCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: stats.revenueChart.map((d: any) => d.date),
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: stats.revenueChart.map((d: any) => d.revenue),
          borderColor: '#FBBF24', // honey color
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#FBBF24',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1F2937',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 14 },
            padding: 12,
            cornerRadius: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { size: 10, weight: 600 },
              callback: (value) => value.toLocaleString('vi-VN') + 'đ'
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, weight: 600 } }
          }
        }
      }
    });
  }

  getTitle() {
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
