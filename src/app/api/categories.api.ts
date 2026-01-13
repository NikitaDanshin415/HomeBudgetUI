import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

export type CreateCategoryRequest = Pick<Category, 'name'>;
export type ArchiveCategoryRequest = Pick<Category, 'id'>;

@Injectable({ providedIn: 'root' })
export class CategoriesApi {
  private readonly incomeUrl = 'api/income-categories';
  private readonly spendUrl = 'api/spend-categories';

  constructor(private readonly http: HttpClient) {}

  getIncome(): Observable<Category[]> {
    return this.http.get<Category[]>(this.incomeUrl);
  }

  getSpend(): Observable<Category[]> {
    return this.http.get<Category[]>(this.spendUrl);
  }

  createIncome(req: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.incomeUrl, req);
  }

  createSpend(req: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.spendUrl, req);
  }

  archiveIncome(id: number): Observable<Category> {
    return this.http.patch<Category>(`${this.incomeUrl}/${id}/archived`, {});
  }

  archiveSpend(id: number): Observable<Category> {
    return this.http.patch<Category>(`${this.spendUrl}/${id}/archived`, {});
  }
}
