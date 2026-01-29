import {Injectable, computed, signal} from '@angular/core';
import {Wallet} from '../models/wallet.model';
import {CreateWalletRequest, WalletsApi} from '../api/wallets.api';
import {firstValueFrom} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

@Injectable({providedIn: 'root'})
export class WalletsService {
  //Состояния всех полей
  private readonly _wallets = signal<Wallet[]>([]);
  private readonly _state = signal<LoadState>('idle');
  private readonly _error = signal<string | null>(null);

  //Публичные геттыеры, через которое можно получить состояние всех полей
  //обновляются на UI автоматически в случае изменения
  readonly wallets = computed(() => this._wallets());
  readonly state = computed(() => this._state());
  readonly error = computed(() => this._error());

  constructor(private readonly api: WalletsApi) {
  }

  async load(): Promise<void> {
    this._state.set('loading');
    this._error.set(null);

    try {
      const wallets = await firstValueFrom(this.api.getAll());
      this._wallets.set(wallets);
      this._state.set('ready');
    } catch (e) {
      this._state.set('error');
      this._error.set(this.getErrorMessage(e, 'Не удалось загрузить кошельки'));
    }
  }

  async add(wallet: CreateWalletRequest): Promise<void> {
    try {
      const created = await firstValueFrom(this.api.create(wallet));
      this._wallets.update(list => [created, ...list]);
    } catch (e) {
      this._error.set(this.getErrorMessage(e, 'Не удалось создать кошелёк'));
      this._state.set('error');
    }
  }

  async archive(walletId: number): Promise<void> {
    this._error.set(null);

    try {
      const archivedWallet = await firstValueFrom(this.api.archive(walletId));

      this._wallets.update(list =>
        list.map(w =>
          w.id === walletId ? archivedWallet : w
        )
      );
    } catch (e) {
      this._error.set(this.getErrorMessage(e, 'Не удалось архивировать кошелёк'));
      this._state.set('error');
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
