import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Income } from '../models/income.model';

export type CreateIncomeRequest = Omit<Income, 'id'>;

@Injectable({ providedIn: 'root' })
export class IncomeApi {
  private readonly incomeUrl = 'api/income';

  constructor(private readonly http: HttpClient) {}

  getAll(year: number, month: number): Observable<Income[]> {
    const params = new HttpParams({ fromObject: { year: String(year), month: String(month) } });
    return this.http.get<Income[]>(this.incomeUrl, { params });
  }

  create(request: CreateIncomeRequest): Observable<Income> {
    return this.http.post<Income>(this.incomeUrl, request);
  }
}
