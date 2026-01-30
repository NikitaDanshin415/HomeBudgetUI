import { Injectable } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Spend } from '../models/spend.model';

export type CreateSpendRequest = Omit<Spend, 'id'>;
export type RemoveSpendRequest = Omit<Spend, 'id'>;

@Injectable({ providedIn: 'root' })
export class SpendApi {
  private readonly spendUrl = 'api/spend';

  constructor(private readonly http: HttpClient) {}

  getAll(year: number, month: number): Observable<Spend[]> {
    const params = new HttpParams({ fromObject: { year: String(year), month: String(month) } });
    return this.http.get<Spend[]>(this.spendUrl, { params });
  }

  create(request: CreateSpendRequest): Observable<Spend> {
    return this.http.post<Spend>(this.spendUrl, request);
  }
}
