import {Component, computed, inject, OnInit} from '@angular/core';
import {ReactiveFormsModule, FormControl, FormGroup, Validators} from '@angular/forms';
import {WalletsService} from '../../services/wallets.service';

type WalletForm = FormGroup<{
  name: FormControl<string>;
  balance: FormControl<number>;
  currency: FormControl<'RUB' | 'USD' | 'EUR'>;
}>;

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './wallets.html',
  styleUrl: './wallets.css',
})
export class Wallets implements OnInit {
  private readonly walletsService = inject(WalletsService);

  readonly wallets = this.walletsService.wallets;
  readonly state = this.walletsService.state;
  readonly error = this.walletsService.error;
  readonly activeWallets = computed(() => this.wallets().filter(wallet => !wallet.archived));
  readonly archivedWallets = computed(() => this.wallets().filter(wallet => wallet.archived));

  readonly form: WalletForm = new FormGroup({
    name: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.minLength(2)]}),
    balance: new FormControl(0, {nonNullable: true, validators: [Validators.required, Validators.min(0)]}),
    currency: new FormControl<'RUB' | 'USD' | 'EUR'>('RUB', {nonNullable: true, validators: [Validators.required]}),
  });

  ngOnInit(): void {
    // загрузка при открытии страницы
    void this.walletsService.load();
  }

  async add(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {name, balance, currency} = this.form.getRawValue();
    await this.walletsService.add({name: name.trim(), balance, currency});

    this.form.reset({name: '', currency: 'RUB'});
  }

  async archive(walletId: number): Promise<void> {
    await this.walletsService.archive(walletId);
  }
}
