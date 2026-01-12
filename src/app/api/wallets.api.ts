import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Wallet } from '../models/wallet.model';

export type CreateWalletRequest = Omit<Wallet, 'id' | 'archived'>;

@Injectable({ providedIn: 'root' })
export class WalletsApi {
  // потом вынесем в environment, сейчас проще так
  private readonly baseUrl = 'api/wallets';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(this.baseUrl);
  }

  create(req: CreateWalletRequest): Observable<Wallet> {
    return this.http.post<Wallet>(this.baseUrl, req);
  }

  archive(id: number): Observable<Wallet> {
    return this.http.patch<Wallet>(`${this.baseUrl}/${id}/archived`, {});
  }
}
