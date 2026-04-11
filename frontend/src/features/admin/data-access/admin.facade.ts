import { Injectable, computed, inject, signal } from '@angular/core';
import { ADMIN_DATA_SOURCE, type AdminDashboardSnapshot } from './admin.data-source';

const createEmptySnapshot = (): AdminDashboardSnapshot => ({
  products: [],
  orders: [],
  users: [],
  feedback: []
});

@Injectable({ providedIn: 'root' })
export class AdminFacade {
  private readonly dataSource = inject(ADMIN_DATA_SOURCE);
  private readonly snapshotSignal = signal<AdminDashboardSnapshot>(createEmptySnapshot());
  private readonly hasErrorSignal = signal(false);

  readonly products = computed(() => this.snapshotSignal().products);
  readonly orders = computed(() => this.snapshotSignal().orders);
  readonly users = computed(() => this.snapshotSignal().users);
  readonly feedback = computed(() => this.snapshotSignal().feedback);
  readonly hasError = computed(() => this.hasErrorSignal());

  readonly totalRevenue = computed(() => {
    return this.orders().reduce((sum, order) => sum + order.totalAmount, 0);
  });

  readonly pendingOrders = computed(() => {
    return this.orders().filter((order) => order.status === 'pending').length;
  });

  constructor() {
    this.loadSnapshot();
  }

  private loadSnapshot(): void {
    this.dataSource.loadSnapshot().subscribe({
      next: (snapshot) => {
        this.snapshotSignal.set(snapshot);
        this.hasErrorSignal.set(false);
      },
      error: () => {
        this.snapshotSignal.set(createEmptySnapshot());
        this.hasErrorSignal.set(true);
      }
    });
  }
}
