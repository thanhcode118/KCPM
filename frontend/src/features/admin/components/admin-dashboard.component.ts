import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminFacade } from '@/features/admin/data-access/admin.facade';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
                <span class="text-xs font-bold text-honey uppercase tracking-widest">DOANH THU TUẦN NÀY</span>
                <h3 class="text-4xl font-black text-white mt-2">124,500,000đ</h3>
                <p class="mt-4 text-xs font-bold text-green-400">+15% so với tuần trước</p>
              </div>
              <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">ĐƠN HÀNG MỚI (HÔM NAY)</span>
                  <h3 class="text-4xl font-black text-gray-900 mt-2">42</h3>
                </div>
                <p class="mt-4 text-xs font-bold text-gray-500">Đang chờ xác nhận: <span class="text-orange-500">12 đơn</span></p>
              </div>
              <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">KHÁCH HÀNG MỚI (THÁNG NÀY)</span>
                  <h3 class="text-4xl font-black text-gray-900 mt-2">286</h3>
                </div>
                <p class="mt-4 text-xs font-bold text-green-500">+Tăng trưởng đều</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-6">
              <!-- Biểu đồ Placeholder -->
              <div class="col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 h-80 flex flex-col">
                 <h3 class="font-black text-gray-900 mb-4">Biểu đồ Doanh thu & Sản phẩm bán chạy</h3>
                 <div class="flex-1 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                    <p class="text-gray-400 font-medium">[Khu vực render Biểu đồ Line/Bar Chart]</p>
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
                <button class="px-5 py-2 rounded-xl bg-white shadow-sm font-bold text-sm text-charcoal">Danh sách Sản phẩm</button>
                <button class="px-5 py-2 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100">Danh mục (Categories)</button>
                <button class="px-5 py-2 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100">Biến thể (Variants)</button>
             </div>
             
             <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="font-black text-xl text-gray-900">Tất cả sản phẩm (CRUD)</h2>
                  <button class="bg-charcoal text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-honey hover:text-charcoal transition-colors">+ Thêm Mới Sản Phẩm</button>
                </div>
                
                <table class="w-full text-left">
                  <thead>
                    <tr class="border-b border-gray-100 text-xs font-black text-gray-400 uppercase">
                      <th class="pb-4 pt-2 px-2">Media</th>
                      <th class="pb-4 pt-2">Thông tin (Tên / Mô tả)</th>
                      <th class="pb-4 pt-2">Danh mục</th>
                      <th class="pb-4 pt-2">Giá (Gốc / Bán)</th>
                      <th class="pb-4 pt-2">Kho (Kích thước/Màu)</th>
                      <th class="pb-4 pt-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody class="text-sm">
                    <tr class="border-b border-gray-50 hover:bg-gray-50/50">
                      <td class="py-4 px-2">
                         <div class="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 font-bold overflow-hidden relative">
                           <span class="z-10 bg-white/80 px-1 rounded text-[10px]">3 Photos</span>
                         </div>
                      </td>
                      <td class="py-4">
                         <p class="font-bold text-gray-900">Bình Gốm Cổ Điển</p>
                         <p class="text-xs text-gray-400 line-clamp-1">Trang trí phòng khách siêu đẹp...</p>
                      </td>
                      <td class="py-4 font-medium text-gray-600">Phòng khách, Bình hoa</td>
                      <td class="py-4">
                         <p class="text-gray-400 line-through text-xs">800,000đ</p>
                         <p class="font-black text-honey">650,000đ</p>
                      </td>
                      <td class="py-4">
                         <div class="flex flex-col gap-1 text-[11px] font-bold">
                            <span class="bg-gray-100 px-2 py-1 rounded">Size M - Trắng: 12 cái</span>
                            <span class="bg-gray-100 px-2 py-1 rounded">Size L - Vàng: 2 cái!</span>
                         </div>
                      </td>
                      <td class="py-4 text-right">
                         <button class="text-blue-600 font-bold text-xs mx-2 hover:underline">Sửa</button>
                         <button class="text-red-600 font-bold text-xs mx-2 hover:underline">Xóa</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                  <tr class="border-b border-gray-100 hover:bg-gray-50/50">
                    <td class="py-4 px-4">
                      <p class="font-black text-honey">#ORD-9992</p>
                      <p class="font-bold text-gray-800">Nguyễn Văn A</p>
                      <p class="text-xs text-gray-500">Quận 1, TP.HCM</p>
                    </td>
                    <td class="py-4 px-4">
                      <p class="font-medium text-gray-800">2x Bình Gốm, 1x Tranh Kính</p>
                      <p class="text-xs text-orange-600 italic">"Giao giờ hành chính, gọi trước 30p"</p>
                    </td>
                    <td class="py-4 px-4 text-gray-900">
                      <p class="font-black text-lg">2,450,000đ</p>
                      <p class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 inline-block rounded">Đã thanh toán (Momo)</p>
                    </td>
                    <td class="py-4 px-4">
                      <!-- Dropdown Cập nhật trạng thái -->
                      <select class="border border-gray-300 rounded-lg px-2 py-1.5 text-xs font-bold bg-white text-gray-700 outline-none w-full">
                        <option value="chuyen">Chờ xác nhận</option>
                        <option value="đóng gói" selected>Đang đóng gói</option>
                        <option value="giao">Đang giao hàng</option>
                        <option value="hoan_thanh">Hoàn thành</option>
                        <option value="huy">Đã hủy</option>
                      </select>
                    </td>
                    <td class="py-4 px-4 text-right flex flex-col gap-2 items-end">
                      <button class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 w-max">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        Chi tiết
                      </button>
                      <button class="bg-honey/20 hover:bg-honey/40 text-honey-dark font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 w-max">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        In Hóa Đơn
                      </button>
                    </td>
                  </tr>
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
                     <th class="pb-3 px-2">Lịch sử Mua hàng</th>
                     <th class="pb-3 px-2">Phân loại VIP</th>
                     <th class="pb-3 px-2 text-right">Bảo mật (Khóa ban)</th>
                   </tr>
                 </thead>
                 <tbody class="text-sm">
                   <tr class="border-b border-gray-50">
                      <td class="py-4 px-2">
                         <div class="flex items-center gap-3">
                           <div class="w-10 h-10 bg-blue-100 text-blue-600 font-black flex items-center justify-center rounded-full">L</div>
                           <div>
                              <p class="font-bold text-gray-900">Lê Thế Anh</p>
                              <p class="text-[11px] text-gray-400">theanh@gmail.com</p>
                           </div>
                         </div>
                      </td>
                      <td class="py-4 px-2">
                         <p class="font-black text-charcoal">Đã mua 15 đơn</p>
                         <p class="text-xs font-medium text-gray-500">Tổng chi tiêu: <span class="text-green-600 font-bold">45,800,000đ</span></p>
                      </td>
                      <td class="py-4 px-2">
                         <span class="bg-yellow-100 text-yellow-700 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-sm">Khách VIP (Vàng)</span>
                      </td>
                      <td class="py-4 px-2 text-right">
                         <button class="bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors font-bold text-xs px-4 py-2 rounded-xl">
                            Khóa (Ban)
                         </button>
                      </td>
                   </tr>
                   <tr class="border-b border-gray-50">
                      <td class="py-4 px-2">
                         <div class="flex items-center gap-3">
                           <div class="w-10 h-10 bg-gray-100 text-gray-600 font-black flex items-center justify-center rounded-full">S</div>
                           <div>
                              <p class="font-bold text-gray-900">Spammer123</p>
                              <p class="text-[11px] text-gray-400">fake.email@spam.com</p>
                           </div>
                         </div>
                      </td>
                      <td class="py-4 px-2">
                         <p class="font-bold text-gray-600">Đã mua 3 đơn</p>
                         <p class="text-xs font-bold text-red-500">Tỷ lệ bùng hàng: 100%</p>
                      </td>
                      <td class="py-4 px-2">
                         <span class="bg-gray-100 text-gray-500 font-black text-[10px] uppercase px-3 py-1 rounded-full">Khách mới</span>
                      </td>
                      <td class="py-4 px-2 text-right">
                         <button class="bg-red-100 text-red-600 border border-red-200 font-bold text-xs px-4 py-2 rounded-xl mr-2">
                            Mở Khóa
                         </button>
                         <span class="text-xs font-bold text-red-600 italic">Đã Ban</span>
                      </td>
                   </tr>
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
                   <button class="bg-honey text-charcoal font-bold text-xs px-3 py-1.5 rounded-lg">+ Tạo Mã</button>
                </div>
                <div class="flex-1 space-y-3">
                   <!-- Item -->
                   <div class="border border-dashed border-gray-300 rounded-2xl p-4 flex justify-between items-center bg-gray-50">
                     <div>
                       <h3 class="font-black text-honey text-lg uppercase tracking-wider">TET2026</h3>
                       <p class="text-xs font-bold text-gray-600">-20% cho Đơn từ 1 Triệu</p>
                       <p class="text-[10px] text-gray-400 mt-1">Hết hạn: 15/02/2026 (Còn 150 lượt)</p>
                     </div>
                     <button class="text-red-500 hover:text-red-700 font-bold text-xs"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                   </div>
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
                   <div class="h-24 bg-gray-200 rounded-xl flex items-center justify-center font-black text-gray-400 border border-gray-300 border-dashed relative overflow-hidden group">
                      <p class="z-10 bg-white/80 px-3 py-1 rounded-full text-sm">Banner_Tet_Main.jpg</p>
                      <div class="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="bg-white px-4 py-2 rounded-lg font-bold shadow text-sm">Thay đổi hình</button>
                      </div>
                   </div>
                </div>

                <!-- Blog -->
                <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex-1">
                   <div class="flex justify-between items-center mb-4">
                      <h2 class="font-black text-lg text-gray-900">Blog / Tin Mẹo (SEO)</h2>
                      <button class="bg-gray-100 text-charcoal font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200">Viết bài mới</button>
                   </div>
                   <ul class="space-y-2">
                     <li class="flex gap-4 items-center bg-gray-50 p-2 rounded-lg">
                        <div class="w-10 h-10 bg-gray-300 rounded"></div>
                        <div class="flex-1">
                           <p class="font-bold text-sm line-clamp-1">5 Mẹo trang trí phòng ngủ Minimalism</p>
                           <p class="text-[10px] text-gray-500">Người đăng: Content_B • Lượt xem: 2.1k</p>
                        </div>
                        <button class="text-blue-600 text-xs font-bold mr-2">Sửa</button>
                     </li>
                   </ul>
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
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs font-bold text-gray-500 mb-1">Tên cửa hàng (Logo text)</label>
                      <input type="text" value="BeeShop - Phụ Kiện Decor" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-honey">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-500 mb-1">Cấu hình Thuế (VAT %)</label>
                      <input type="number" value="10" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-honey">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-500 mb-1">Phí Giao Hàng Mặc Định (VNĐ)</label>
                      <input type="text" value="30,000" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-honey">
                    </div>
                    <button class="bg-charcoal text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-honey hover:text-charcoal w-full mt-2">Lưu Cấu Hình</button>
                  </div>
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
export class AdminDashboardComponent {
  activeTab = 'dashboard';

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
