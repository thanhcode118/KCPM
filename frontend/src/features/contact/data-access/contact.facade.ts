import { Injectable, computed, signal, inject } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface FeedbackItem {
  feedbackId: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ContactFacade {
  private apiService = inject(ApiService);
  private readonly feedbackSignal = signal<FeedbackItem[]>([]);

  readonly feedbackList = computed(() => this.feedbackSignal());

  constructor() {
    this.loadFeedbacks();
  }

  private loadFeedbacks(): void {
    this.apiService.getFeedbacks()
      .pipe(takeUntilDestroyed())
      .subscribe(list => this.feedbackSignal.set(list));
  }

  submitFeedback(name: string, email: string, message: string): void {
    const newFeedback = { name, email, message, createdAt: new Date().toISOString() };
    this.apiService.postFeedback(newFeedback)
      .subscribe(() => this.loadFeedbacks());
  }
}
