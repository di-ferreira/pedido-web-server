export type tTypeSearch = 'eq' | 'like';

export type tTypeCondition = 'and' | 'or';
export interface iFilterQuery<T> {
  key: keyof T;
  value: string | number;
  typeSearch?: tTypeSearch;
  typeCondition?: tTypeCondition;
}

export interface iFilter<T> {
  filter?: iFilterQuery<T>[];
  orderBy?: keyof T;
  top?: number;
  skip?: number;
}

