import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Balance } from '../models/balance.model';

@Injectable({ providedIn: 'root' })
export class BalanceApi {
  private readonly balanceUrl = 'api/balance';

  constructor(private readonly http: HttpClient) {}

  getCurrent(): Observable<Balance> {
    return this.http.get<Balance>(this.balanceUrl);
  }
}
