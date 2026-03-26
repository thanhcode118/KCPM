import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@/shared/components/header.component';
import { FooterComponent } from '@/shared/components/footer.component';
import { FloatingActionsComponent } from '@/shared/components/floating-actions.component';

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

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '/home';
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
