export interface Category {
  id: number;
  name: string;
  archived: boolean;
}

export type CategoryType = 'income' | 'spend';
