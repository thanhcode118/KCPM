import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    /* Bee fly animation - Slower (2.5s) and smoother */
    @keyframes beeFly {
      0%   { transform: translate(-80px, 60px) rotate(-15deg); opacity: 0; }
      20%  { opacity: 1; }
      45%  { transform: translate(30px, -25px) rotate(10deg); }
      70%  { transform: translate(-15px, 15px) rotate(-7deg); }
      100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
    }
    @keyframes beeHover {
      0%, 100% { transform: translateY(0px) rotate(-3deg); }
      50%       { transform: translateY(-15px) rotate(3deg); }
    }
    @keyframes wingFlap {
      0%, 100% { transform: scaleX(1) rotate(-15deg); }
      50%       { transform: scaleX(0.5) rotate(-35deg); }
    }
    @keyframes wingFlapR {
      0%, 100% { transform: scaleX(1) rotate(15deg); }
      50%       { transform: scaleX(0.5) rotate(35deg); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes overlayIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes countdownBar {
      from { width: 100%; }
      to   { width: 0%; }
    }
    @keyframes sparkle {
      0%,100% { opacity: 0; transform: scale(0); }
      50%     { opacity: 1; transform: scale(1); }
    }

    .bee-fly     { animation: beeFly 2.5s cubic-bezier(0.16,1,0.3,1) forwards; }
    .bee-hover   { animation: beeHover 2s ease-in-out infinite; }
    .wing-l      { animation: wingFlap 0.15s ease-in-out infinite; transform-origin: right center; }
    .wing-r      { animation: wingFlapR 0.15s ease-in-out infinite; transform-origin: left center; }
    .text-fadein { animation: fadeInUp 0.8s 1.5s ease both; }
    .overlay-in  { animation: overlayIn 0.5s ease forwards; }
    .bar-anim    { animation: countdownBar 5s linear forwards; }
    .sparkle-1   { animation: sparkle 1.5s 0.5s ease-in-out infinite; }
    .sparkle-2   { animation: sparkle 1.5s 1s ease-in-out infinite; }
    .sparkle-3   { animation: sparkle 1.5s 1.5s ease-in-out infinite; }
  `],
  template: `
    <!-- ===== SUCCESS OVERLAY ===== -->
    @if (showSuccess) {
      <div class="overlay-in fixed inset-0 z-50 flex flex-col items-center justify-center p-4 text-center"
           style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 70%, #0f3460 100%);">

        <!-- Sparkles -->
        <span class="sparkle-1 absolute text-3xl" style="top:15%; left:15%">✦</span>
        <span class="sparkle-2 absolute text-2xl" style="top:22%; right:22%; color:#d4a348;">✦</span>
        <span class="sparkle-3 absolute text-xl"  style="bottom:35%; left:25%; color:#e8c56a;">✦</span>
        <span class="sparkle-1 absolute text-2xl" style="bottom:20%; right:20%; color:#fff;">✦</span>

        <!-- Bee -->
        <div class="bee-fly">
          <div class="bee-hover relative flex items-center justify-center" style="width:140px;height:140px;">

            <!-- Wing Left -->
            <div class="wing-l absolute"
                 style="width:58px;height:34px;background:rgba(200,230,255,0.6);
                        border-radius:50%;top:22px;left:-18px;
                        border:1.8px solid rgba(150,200,255,0.5);
                        box-shadow:0 0 15px rgba(180,220,255,0.5);">
            </div>
            <!-- Wing Right -->
            <div class="wing-r absolute"
                 style="width:58px;height:34px;background:rgba(200,230,255,0.6);
                        border-radius:50%;top:22px;right:-18px;
                        border:1.8px solid rgba(150,200,255,0.5);
                        box-shadow:0 0 15px rgba(180,220,255,0.5);">
            </div>

            <!-- Bee Body -->
            <div class="relative z-10 flex flex-col items-center justify-center rounded-full shadow-2xl"
                 style="width:90px;height:90px;
                        background:linear-gradient(160deg,#f9d42a 0%,#e8a800 65%,#c17f00 100%);
                        box-shadow:0 10px 40px rgba(212,163,72,0.7), 0 0 0 5px rgba(255,210,50,0.2);">

              <!-- Bee stripes -->
              <div style="position:absolute;inset:0;border-radius:50%;overflow:hidden;opacity:0.4;">
                <div style="height:15px;background:#1a1a2e;margin-top:25px;"></div>
                <div style="height:15px;background:#1a1a2e;margin-top:10px;"></div>
              </div>

              <!-- Face -->
              <div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:3px;">
                <!-- Eyes -->
                <div style="display:flex;gap:12px;">
                  <div style="width:9px;height:9px;background:#1a1a2e;border-radius:50%;"></div>
                  <div style="width:9px;height:9px;background:#1a1a2e;border-radius:50%;"></div>
                </div>
                <!-- Smile -->
                <div style="width:24px;height:12px;border-bottom:3px solid #1a1a2e;border-radius:0 0 50% 50%;margin-top:3px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div class="text-fadein mt-8">
          <h2 class="text-white text-4xl md:text-5xl font-black mb-3">Đăng ký thành công! 🐝</h2>
          <p class="text-gray-400 text-lg">Chào mừng bạn đến với HomeDecor Shop!</p>
          <div class="mt-8 flex flex-col items-center">
            <!-- Progress Circle or Bar with Percentage -->
            <div class="relative flex items-center justify-center mb-4" style="width: 100px; height: 100px;">
              <svg class="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="8" fill="transparent"
                        class="text-gray-700" />
                <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="8" fill="transparent"
                        [attr.stroke-dasharray]="circumference"
                        [attr.stroke-dashoffset]="dashoffset"
                        class="text-honey transition-all duration-100 ease-linear" />
              </svg>
              <span class="absolute text-2xl font-bold text-white">{{ progressPercent }}%</span>
            </div>
            <p class="text-gray-300 text-sm">
              Đang quay lại trang chủ trong <b>{{ countdown }}</b> giây...
            </p>
          </div>

          <!-- Horizontal progress bar too -->
          <div class="mt-6 mx-auto rounded-full overflow-hidden bg-white/10" style="width:280px;height:6px;">
            <div class="bar-anim h-full rounded-full bg-honey shadow-[0_0_10px_rgba(212,163,72,0.8)]"></div>
          </div>
        </div>
      </div>
    }

    <!-- ===== REGISTER FORM ===== -->
    <section class="min-h-[70vh] bg-cream py-16">
      <div class="container mx-auto px-4 max-w-xl">
        <div class="bg-white rounded-2xl shadow p-8 border border-gray-100">
          <h1 class="text-3xl font-bold text-charcoal mb-6">Đăng ký</h1>

          <form class="space-y-4" (ngSubmit)="submitRegister()">
            <div>
              <label class="text-sm font-semibold text-charcoal">Họ tên</label>
              <input [(ngModel)]="fullName" name="fullName"
                     class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-honey outline-none"
                     type="text" required>
            </div>
            <div>
              <label class="text-sm font-semibold text-charcoal">Email</label>
              <input [(ngModel)]="email" name="email"
                     class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-honey outline-none"
                     type="email" required>
            </div>
            <div>
              <label class="text-sm font-semibold text-charcoal">Số điện thoại</label>
              <input [(ngModel)]="phone" name="phone"
                     class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-honey outline-none"
                     type="text">
            </div>
            <div>
              <label class="text-sm font-semibold text-charcoal">Mật khẩu</label>
              <input [(ngModel)]="password" name="password"
                     class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-honey outline-none"
                     type="password" required>
            </div>

            @if (authFacade.errorMessage()) {
              <div class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {{ authFacade.errorMessage() }}
              </div>
            }

            <button class="w-full bg-charcoal text-white py-3 rounded-lg font-bold
                           hover:bg-honey hover:text-charcoal transition-all
                           disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-95"
                    type="submit" [disabled]="isLoading">
              @if (isLoading) {
                <span class="inline-flex items-center justify-center gap-2">
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Đang đăng ký...
                </span>
              } @else {
                Đăng ký
              }
            </button>

            <p class="text-center text-sm text-gray-600 mt-4">
              Đã có tài khoản?
              <a routerLink="/login" class="text-charcoal font-bold hover:underline">Đăng nhập</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  `
})
export class RegisterComponent {
  authFacade = inject(AuthFacade);
  private router = inject(Router);

  fullName = '';
  email = '';
  phone = '';
  password = '';
  isLoading = false;
  showSuccess = false;
  countdown = 5;
  progressPercent = 0;

  // SVG parameters
  readonly radius = 45;
  readonly circumference = 2 * Math.PI * this.radius;

  get dashoffset(): number {
    return this.circumference - (this.progressPercent / 100) * this.circumference;
  }

  submitRegister(): void {
    if (!this.email || !this.password || !this.fullName) return;

    this.isLoading = true;
    this.authFacade.register({
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      password: this.password
    }).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.showSuccess = true;
          this.startSuccessFlow();
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private startSuccessFlow(): void {
    this.countdown = 5;
    this.progressPercent = 0;

    const totalDuration = 5000;
    const intervalTime = 50; // Update every 50ms for smooth progress
    const increment = (intervalTime / totalDuration) * 100;

    const progressInterval = setInterval(() => {
      this.progressPercent = Math.min(Math.round(this.progressPercent + increment), 100);
      if (this.progressPercent >= 100) {
        clearInterval(progressInterval);
      }
    }, intervalTime);

    const countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(countdownInterval);
        this.router.navigate(['/']);
      }
    }, 1000);
  }
}
