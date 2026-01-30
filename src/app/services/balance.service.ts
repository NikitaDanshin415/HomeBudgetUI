import { Injectable, computed, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BalanceApi } from '../api/balance.api';
import { Balance } from '../models/balance.model';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private readonly _balance = signal<Balance | null>(null);
  private readonly _state = signal<LoadState>('idle');
  private readonly _error = signal<string | null>(null);

  readonly balance = computed(() => this._balance());
  readonly state = computed(() => this._state());
  readonly error = computed(() => this._error());

  constructor(private readonly api: BalanceApi) {}

  async load(): Promise<void> {
    this._state.set('loading');
    this._error.set(null);

    try {
      const balance = await firstValueFrom(this.api.getCurrent());
      this._balance.set(balance);
      this._state.set('ready');
    } catch (e) {
      this._state.set('error');
      this._error.set(this.getErrorMessage(e, 'Не удалось загрузить баланс'));
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
