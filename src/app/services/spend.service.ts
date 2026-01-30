import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SpendApi, CreateSpendRequest } from '../api/spend.api';
import { Spend } from '../models/spend.model';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

@Injectable({ providedIn: 'root' })
export class SpendService {
  private readonly _spends = signal<Spend[]>([]);
  private readonly _state = signal<LoadState>('idle');
  private readonly _error = signal<string | null>(null);

  readonly spends = computed(() => this._spends());
  readonly state = computed(() => this._state());
  readonly error = computed(() => this._error());

  constructor(private readonly api: SpendApi) {}

  async load(year: number, month: number): Promise<void> {
    this._state.set('loading');
    this._error.set(null);

    try {
      const spends = await firstValueFrom(this.api.getAll(year, month));
      this._spends.set(spends);
      this._state.set('ready');
    } catch (e) {
      this._state.set('error');
      this._error.set(this.getErrorMessage(e, 'Не удалось загрузить расходы'));
    }
  }

  async remove(id: number): Promise<void> {
    this._error.set(null);

    try {
      await firstValueFrom(this.api.remove(id));
      this._spends.update(list => list.filter(item => item.id !== id));
    } catch (e) {
      this._state.set('error');
      this._error.set(this.getErrorMessage(e, 'Не удалось удалить расход'));
    }
  }

  async add(request: CreateSpendRequest): Promise<void> {
    this._error.set(null);

    try {
      const created = await firstValueFrom(this.api.create(request));
      this._spends.update(list => [created, ...list]);
    } catch (e) {
      this._state.set('error');
      this._error.set(this.getErrorMessage(e, 'Не удалось создать расход'));
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
