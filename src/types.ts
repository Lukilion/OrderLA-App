export interface WholesaleItem {
  id: number;
  name: string;
  cat: string;
  rate: number;
  stock: string;
  demand: number;
  status: string;
}

export type UserRole = 'admin' | 'purchaser' | 'auditor';

export type Language = 'ur' | 'en';

export interface NavRoute {
  id: string;
  labelUrdu: string;
  labelEnglish: string;
  icon: string;
  badge?: string;
  roles: UserRole[];
}

export type FilterType = 'all' | 'demand' | 'lowstock' | 'shalmi' | 'kashif';

export type SortKey = 'id' | 'name' | 'cat' | 'rate' | 'stock' | 'demand' | 'cost';

export type SortDirection = 'asc' | 'desc';
