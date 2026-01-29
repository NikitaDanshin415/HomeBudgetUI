import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Spend } from '../models/spend.model';

export type CreateSpendRequest = Omit<Spend, 'id'>;

@Injectable({ providedIn: 'root' })
export class SpendApi {
  private readonly spendUrl = 'api/spend';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Spend[]> {
    return this.http.get<Spend[]>(this.spendUrl);
  }

  create(request: CreateSpendRequest): Observable<Spend> {
    return this.http.post<Spend>(this.spendUrl, request);
  }
}
