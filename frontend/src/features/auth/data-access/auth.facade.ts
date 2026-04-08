import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, delay } from 'rxjs';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'customer';
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5020/api/auth';

  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private readonly errorSignal = signal('');

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  readonly errorMessage = computed(() => this.errorSignal());

  login(email: string, password: string): Observable<boolean> {
    this.errorSignal.set('');
    return of(true).pipe(
      delay(800), // Simulate network latency
      tap(() => {
        const authUser: AuthUser = {
          id: 1,
          email: email,
          fullName: 'Người Dùng Khách',
          role: email.includes('admin') ? 'admin' : 'customer',
          token: 'mock-jwt-token-123'
        };
        this.currentUserSignal.set(authUser);
        localStorage.setItem('token', authUser.token);
      })
    );
  }

  register(data: any): Observable<boolean> {
    this.errorSignal.set('');
    return of(true).pipe(
      delay(1500), // Simulate longer registration process
      tap(() => {
        const authUser: AuthUser = {
          id: Date.now(),
          email: data.email,
          fullName: data.fullName,
          role: 'customer',
          token: 'mock-jwt-token-new'
        };
        this.currentUserSignal.set(authUser);
        localStorage.setItem('token', authUser.token);
      })
    );
  }

  confirmEmail(token: string): Observable<string> {
    return of('Xác nhận thành công!').pipe(delay(500));
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('token');
  }
}