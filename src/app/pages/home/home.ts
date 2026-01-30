import {CommonModule} from '@angular/common';
import {Component, OnInit, computed, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CategoriesService} from '../../services/categories.service';
import {WalletsService} from '../../services/wallets.service';
import {SpendService} from '../../services/spend.service';
import {IncomeService} from '../../services/income.service';
import {BalanceService} from '../../services/balance.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [CommonModule, FormsModule],
})
export class Home implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly walletsService = inject(WalletsService);
  private readonly spendService = inject(SpendService);
  private readonly incomeService = inject(IncomeService);
  private readonly balanceService = inject(BalanceService);
  readonly monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];
  selectedMonthIndex = new Date().getMonth();
  selectedYear = new Date().getFullYear();
  incomeAmount: number | null = null;
  incomeDate = '';
  incomeCategoryId: number | null = null;
  incomeWalletId: number | null = null;

  expenseDescription = '';
  expenseAmount: number | null = null;
  expenseDate = '';
  expenseCategoryId: number | null = null;
  expenseWalletId: number | null = null;

  readonly incomes = this.incomeService.incomes;
  readonly expenses = this.spendService.spends;
  readonly balance = this.balanceService.balance;
  readonly incomeCategories = this.categoriesService.income;
  readonly spendCategories = this.categoriesService.spend;
  readonly wallets = this.walletsService.wallets;
  readonly activeIncomeCategories = computed(() =>
    this.incomeCategories().filter(category => !category.archived)
  );
  readonly activeSpendCategories = computed(() =>
    this.spendCategories().filter(category => !category.archived)
  );
  readonly totalIncome = computed(() =>
    this.incomes().reduce((total, income) => total + income.amount, 0)
  );
  readonly totalExpense = computed(() =>
    this.expenses().reduce((total, expense) => total + expense.amount, 0)
  );
  readonly activeWallets = computed(() => this.wallets().filter(wallet => !wallet.archived));
  readonly errorMessage = computed(
    () =>
      this.categoriesService.error() ??
      this.walletsService.error() ??
      this.incomeService.error() ??
      this.spendService.error() ??
      this.balanceService.error()
  );

  get monthLabel(): string {
    return `${this.monthNames[this.selectedMonthIndex]} ${this.selectedYear}`;
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.categoriesService.load(),
      this.walletsService.load(),
      this.loadEntries(),
      this.balanceService.load(),
    ]);

    this.ensureDefaults();
  }

  async changeMonth(delta: number): Promise<void> {
    const nextDate = new Date(this.selectedYear, this.selectedMonthIndex + delta, 1);
    this.selectedYear = nextDate.getFullYear();
    this.selectedMonthIndex = nextDate.getMonth();
    await this.loadEntries();
  }

  async addIncome(): Promise<void> {
    if (
      this.incomeAmount === null ||
      !this.incomeDate ||
      this.incomeCategoryId === null ||
      this.incomeWalletId === null
    ) {
      return;
    }

    await this.incomeService.add({
      amount: this.incomeAmount,
      incomeDate: this.incomeDate,
      incomeCategoryId: this.incomeCategoryId,
      walletId: this.incomeWalletId,
    });

    await this.refreshBalance();
    this.incomeAmount = null;
    this.incomeDate = '';
  }



  async addExpense(): Promise<void> {
    if (
      !this.expenseDescription ||
      this.expenseAmount === null ||
      !this.expenseDate ||
      this.expenseCategoryId === null ||
      this.expenseWalletId === null
    ) {
      return;
    }

    await this.spendService.add({
      description: this.expenseDescription,
      amount: this.expenseAmount,
      date: this.expenseDate,
      spendCategoryId: this.expenseCategoryId,
      walletId: this.expenseWalletId,
    });

    await this.refreshBalance();
    this.expenseDescription = '';
    this.expenseAmount = null;
    this.expenseDate = '';
  }

  async deleteIncome(id: number): Promise<void> {
    await this.incomeService.remove(id);
    await this.refreshBalance();
  }

  async deleteExpense(id: number): Promise<void> {
    await this.spendService.remove(id);
    await this.refreshBalance();
  }

  getIncomeCategoryName(id: number): string {
    return this.incomeCategories().find(category => category.id === id)?.name ?? '—';
  }

  getSpendCategoryName(id: number): string {
    return this.spendCategories().find(category => category.id === id)?.name ?? '—';
  }

  getWalletName(id: number): string {
    return this.wallets().find(wallet => wallet.id === id)?.name ?? '—';
  }

  getCurrencySymbol(currency: string | null | undefined): string {
    if (!currency) {
      return '₽';
    }
    if (currency.toUpperCase() === 'RUB') {
      return '₽';
    }
    return currency.toUpperCase();
  }

  private ensureDefaults(): void {
    const incomeCategory = this.activeIncomeCategories()[0];
    const spendCategory = this.activeSpendCategories()[0];
    const wallet = this.activeWallets()[0];

    if (incomeCategory && this.incomeCategoryId === null) {
      this.incomeCategoryId = incomeCategory.id;
    }
    if (spendCategory && this.expenseCategoryId === null) {
      this.expenseCategoryId = spendCategory.id;
    }
    if (wallet) {
      if (this.incomeWalletId === null) {
        this.incomeWalletId = wallet.id;
      }
      if (this.expenseWalletId === null) {
        this.expenseWalletId = wallet.id;
      }
    }
  }

  private async loadEntries(): Promise<void> {
    const month = this.selectedMonthIndex + 1;
    const year = this.selectedYear;
    await Promise.all([this.incomeService.load(year, month), this.spendService.load(year, month)]);
  }

  private async refreshBalance(): Promise<void> {
    await this.balanceService.load();
  }
}
