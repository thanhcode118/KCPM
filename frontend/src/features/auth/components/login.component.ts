import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  // Removed OnPush to fix async change detection
  template: `
    <section class="min-h-[70vh] bg-cream py-16">
      <div class="container mx-auto px-4 max-w-xl">
        <div class="bg-white rounded-2xl shadow p-8 border border-gray-100">
          <h1 class="text-3xl font-bold text-charcoal mb-6">Đăng nhập</h1>

          @if (!authFacade.isAuthenticated()) {
            <form class="space-y-4" (ngSubmit)="submitLogin()">
              <div>
                <label class="text-sm font-semibold text-charcoal">Gmail</label>
                <input [(ngModel)]="email" name="email" class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2" type="text" required>
              </div>
              <div>
                <label class="text-sm font-semibold text-charcoal">Mật khẩu</label>
                <input [(ngModel)]="password" name="password" class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2" type="password" required>
              </div>

              @if (authFacade.errorMessage()) {
                <div class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {{ authFacade.errorMessage() }}
                </div>
              }

              <button class="w-full bg-charcoal text-white py-3 rounded-lg font-bold hover:bg-honey hover:text-charcoal transition-colors" type="submit" [disabled]="isLoading">
                {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
              </button>
              
              <p class="text-center text-sm text-gray-600 mt-4">
                Chưa có tài khoản? <a routerLink="/register" class="text-charcoal font-bold hover:underline">Đăng ký ngay</a>
              </p>
            </form>
          } @else {
            <div class="space-y-4">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <p class="font-semibold text-green-700">Xin chào, {{ authFacade.currentUser()?.fullName }}</p>
                <p class="text-sm text-green-600">Vai trò: {{ authFacade.currentUser()?.role }}</p>
              </div>

              <div class="flex gap-3">
                <a routerLink="/admin" class="flex-1 text-center bg-honey text-charcoal py-2 rounded-lg font-semibold">Vào admin</a>
                <button class="flex-1 bg-gray-800 text-white py-2 rounded-lg font-semibold" (click)="logout()">Đăng xuất</button>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class LoginComponent {
  authFacade = inject(AuthFacade);
  private router = inject(Router);

  email = '';
  password = '';
  isLoading = false;

  submitLogin(): void {
    if (!this.email || !this.password) return;
    
    this.isLoading = true;
    this.authFacade.login(this.email, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          const user = this.authFacade.currentUser();
          if (user?.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authFacade.logout();
  }
}