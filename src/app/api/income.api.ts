import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Income } from '../models/income.model';

export type CreateIncomeRequest = Omit<Income, 'id'>;

@Injectable({ providedIn: 'root' })
export class IncomeApi {
  private readonly incomeUrl = 'api/income';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Income[]> {
    return this.http.get<Income[]>(this.incomeUrl);
  }

  create(request: CreateIncomeRequest): Observable<Income> {
    return this.http.post<Income>(this.incomeUrl, request);
  }
}
