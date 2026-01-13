import { Injectable, computed, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CategoriesApi, CreateCategoryRequest } from '../api/categories.api';
import { Category, CategoryType } from '../models/category.model';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

interface AddCategoryRequest extends CreateCategoryRequest {
  type: CategoryType;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly _income = signal<Category[]>([]);
  private readonly _spend = signal<Category[]>([]);
  private readonly _state = signal<LoadState>('idle');
  private readonly _error = signal<string | null>(null);

  readonly income = computed(() => this._income());
  readonly spend = computed(() => this._spend());
  readonly state = computed(() => this._state());
  readonly error = computed(() => this._error());

  constructor(private readonly api: CategoriesApi) {}

  async load(): Promise<void> {
    this._state.set('loading');
    this._error.set(null);

    try {
      const [income, spend] = await Promise.all([
        firstValueFrom(this.api.getIncome()),
        firstValueFrom(this.api.getSpend()),
      ]);
      this._income.set(income);
      this._spend.set(spend);
      this._state.set('ready');
    } catch (e) {
      this._state.set('error');
      this._error.set(this.getErrorMessage(e, 'Не удалось загрузить категории'));
    }
  }

  async add(request: AddCategoryRequest): Promise<void> {
    this._error.set(null);

    try {
      const created = await firstValueFrom(
        request.type === 'income'
          ? this.api.createIncome({ name: request.name })
          : this.api.createSpend({ name: request.name })
      );

      if (request.type === 'income') {
        this._income.update(list => [created, ...list]);
      } else {
        this._spend.update(list => [created, ...list]);
      }
    } catch (e) {
      this._state.set('error');
      this._error.set(this.getErrorMessage(e, 'Не удалось создать категорию'));
    }
  }

  async archive(type: CategoryType, id: number): Promise<void> {
    this._error.set(null);

    try {
      const updated = await firstValueFrom(
        type === 'income' ? this.api.archiveIncome(id) : this.api.archiveSpend(id)
      );

      if (type === 'income') {
        this._income.update(list =>
          list.map(category => (category.id === id ? updated : category))
        );
      } else {
        this._spend.update(list =>
          list.map(category => (category.id === id ? updated : category))
        );
      }
    } catch (e) {
      this._state.set('error');
      this._error.set(this.getErrorMessage(e, 'Не удалось архивировать категорию'));
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    return fallback;
  }
}
