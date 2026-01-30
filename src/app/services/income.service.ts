import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { IncomeApi, CreateIncomeRequest } from '../api/income.api';
import { Income } from '../models/income.model';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private readonly _incomes = signal<Income[]>([]);
  private readonly _state = signal<LoadState>('idle');
  private readonly _error = signal<string | null>(null);

  readonly incomes = computed(() => this._incomes());
  readonly state = computed(() => this._state());
  readonly error = computed(() => this._error());

  constructor(private readonly api: IncomeApi) {}

  async load(year: number, month: number): Promise<void> {
    this._state.set('loading');
    this._error.set(null);

    try {
      const incomes = await firstValueFrom(this.api.getAll(year, month));
      this._incomes.set(incomes);
      this._state.set('ready');
    } catch (e) {
      this._state.set('error');
      this._error.set(this.getErrorMessage(e, 'Не удалось загрузить доходы'));
    }
  }

  async add(request: CreateIncomeRequest): Promise<void> {
    this._error.set(null);

    try {
      const created = await firstValueFrom(this.api.create(request));
      this._incomes.update(list => [created, ...list]);
    } catch (e) {
      this._state.set('error');
      this._error.set(this.getErrorMessage(e, 'Не удалось создать доход'));
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
