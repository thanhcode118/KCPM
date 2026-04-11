import { Component, ChangeDetectionStrategy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@/shared/components/header.component';
import { FooterComponent } from '@/shared/components/footer.component';
import { FloatingActionsComponent } from '@/shared/components/floating-actions.component';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    FloatingActionsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);
  private readonly checkoutFacade = inject(CheckoutFacade);

  constructor() {
    this.authFacade.restoreSession();

    effect(() => {
      const token = this.authFacade.currentUser()?.token ?? '';
      if (!token) {
        return;
      }

      this.checkoutFacade.bootstrapAuthenticatedState({ mergeGuestCart: true });
    });
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '/home';
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
