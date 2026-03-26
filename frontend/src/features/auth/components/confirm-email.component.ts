import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-[70vh] bg-cream py-16 flex items-center justify-center">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        
        @if (isLoading()) {
          <div class="space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-honey mx-auto"></div>
            <p class="text-gray-600 font-medium">Đang xác thực tài khoản...</p>
          </div>
        } @else {
          <div class="space-y-5">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                 [ngClass]="isSuccess() ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
              @if (isSuccess()) {
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 8"></path></svg>
              } @else {
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              }
            </div>

            <h1 class="text-2xl font-black text-charcoal">{{ isSuccess() ? 'Thành công!' : 'Thất bại!' }}</h1>
            <p class="text-gray-600 font-medium">{{ message() }}</p>

            <div class="pt-4">
              <a routerLink="/login" class="inline-block bg-honey text-charcoal px-6 py-3 rounded-xl font-bold hover:bg-charcoal hover:text-white transition-all shadow-md">
                Đến trang Đăng nhập
              </a>
            </div>
          </div>
        }

      </div>
    </section>
  `
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authFacade = inject(AuthFacade);

  isLoading = signal(true);
  isSuccess = signal(false);
  message = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    
    if (!token) {
      this.isLoading.set(false);
      this.isSuccess.set(false);
      this.message.set('Mã xác nhận không hợp lệ.');
      return;
    }

    this.authFacade.confirmEmail(token).subscribe({
      next: (resMessage) => {
        this.isLoading.set(false);
        const success = !resMessage.toLowerCase().includes('lỗi') && !resMessage.toLowerCase().includes('không hợp lệ');
        this.isSuccess.set(success);
        this.message.set(resMessage);
      },
      error: () => {
        this.isLoading.set(false);
        this.isSuccess.set(false);
        this.message.set('Đã có lỗi xảy ra khi gọi máy chủ.');
      }
    });
  }
}
