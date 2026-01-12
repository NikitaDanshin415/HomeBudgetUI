export interface Wallet {
  id: number;
  name: string;
  balance: number;
  currency: 'RUB' | 'USD' | 'EUR';
  archived: boolean;
}
